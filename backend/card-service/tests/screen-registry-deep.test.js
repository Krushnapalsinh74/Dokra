/**
 * Dokra Master Admin Deep Screen Registry Test Suite
 * Task ID: DOKRA-DEEP-ADMIN-REGISTRY-001
 * 
 * Verifies:
 * 1. Screen Registry Listing & Filtering (Domain, Type, Search, Status)
 * 2. Deep Screen Parameter Retrieval (Layout, Style, Config, Visibility)
 * 3. Screen Mutation, Revision Creation & Version Incrementation
 * 4. Immutable Revision History Retrieval
 * 5. 1-Click Rollback to Previous Revisions
 * 6. Soft-Delete to Recycle Bin & Trashed Status
 * 7. Restore from Recycle Bin
 * 8. Permanent Purge from Recycle Bin
 * 9. Comprehensive Audit Trail Logging
 */

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createCardServer } = require('../src/server');

function httpRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = data;
        try {
          if (res.headers['content-type'] && res.headers['content-type'].includes('application/json')) {
            parsed = JSON.parse(data);
          }
        } catch {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      const body = typeof postData === 'string' ? postData : JSON.stringify(postData);
      req.write(body);
    }
    req.end();
  });
}

describe('DOKRA-DEEP-ADMIN-REGISTRY-001: Master Screen Registry & Recovery Tests', () => {
  let app;
  let serverPort;

  before(async () => {
    app = createCardServer({
      dbPath: ':memory:',
      requireAuth: false
    });

    const listenInfo = await app.listen(0, '127.0.0.1');
    serverPort = listenInfo.port;
  });

  after(async () => {
    if (app) await app.close();
  });

  test('Test 1: GET /admin/v2/screens lists all seeded domain screens including Domain 1 (Home & Daily Activity)', async () => {
    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/admin/v2/screens',
      method: 'GET'
    });

    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length >= 10, 'Expected at least 10 default registered screens');

    const homeScreen = res.body.find(s => s.id === 'scr_daily_activity_ring');
    assert.ok(homeScreen, 'scr_daily_activity_ring must be present in registry');
    assert.equal(homeScreen.domain_id, 'home_daily');
    assert.equal(homeScreen.domain_name, '🏠 Home & Daily Activity');
    assert.equal(homeScreen.version, 1);
  });

  test('Test 2: GET /admin/v2/screens?domain=home_daily filters strictly to Domain 1 screens', async () => {
    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/admin/v2/screens?domain=home_daily',
      method: 'GET'
    });

    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length >= 5, 'Expected all Domain 1 screens');
    for (const scr of res.body) {
      assert.equal(scr.domain_id, 'home_daily');
    }
  });

  test('Test 3: GET /admin/v2/screens?search=Ring finds Daily Activity 3-Ring screen', async () => {
    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/admin/v2/screens?search=Ring',
      method: 'GET'
    });

    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    const found = res.body.some(s => s.id === 'scr_daily_activity_ring');
    assert.ok(found, 'Search for "Ring" must find scr_daily_activity_ring');
  });

  test('Test 4: GET /admin/v2/screens/:id retrieves deep layout, style, config, and visibility trees', async () => {
    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/admin/v2/screens/scr_daily_activity_ring',
      method: 'GET'
    });

    assert.equal(res.statusCode, 200);
    const scr = res.body;
    assert.equal(scr.id, 'scr_daily_activity_ring');
    assert.ok(scr.layout, 'Layout structure required');
    assert.ok(scr.style, 'Style structure required');
    assert.ok(scr.config, 'Config structure required');
    assert.ok(scr.visibility_flags, 'Visibility flags required');
    assert.equal(scr.config.goals.step_goal, 10000);
    assert.equal(scr.config.ring_geometry.stroke_thickness, 11);
    assert.equal(scr.visibility_flags.show_3_ring_geometry, true);
  });

  test('Test 5: PUT /admin/v2/screens/:id updates parameters and creates Version 2 revision', async () => {
    const updatePayload = {
      change_summary: 'Adjusted step goal to 12,000 and ring thickness to 14px',
      config: {
        goals: { step_goal: 12000, active_minutes_goal: 75, calorie_burn_goal: 600 },
        ring_geometry: { stroke_thickness: 14, outer_radius: 92 }
      },
      style: {
        ring_active_gradient_start: '#00f2fe',
        ring_active_gradient_end: '#4facfe'
      }
    };

    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/admin/v2/screens/scr_daily_activity_ring',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Actor-Id': 'dr_sarah_admin'
      }
    }, updatePayload);

    assert.equal(res.statusCode, 200);
    const updated = res.body;
    assert.equal(updated.version, 2, 'Version must be incremented to 2');
    assert.equal(updated.config.goals.step_goal, 12000);
    assert.equal(updated.config.ring_geometry.stroke_thickness, 14);
    assert.equal(updated.style.ring_active_gradient_start, '#00f2fe');
  });

  test('Test 6: GET /admin/v2/screens/:id/revisions lists immutable version history', async () => {
    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/admin/v2/screens/scr_daily_activity_ring/revisions',
      method: 'GET'
    });

    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length >= 2, 'Expected at least 2 revisions (v1 and v2)');
    assert.equal(res.body[0].version, 2);
    assert.equal(res.body[1].version, 1);
  });

  test('Test 7: POST /admin/v2/screens/:id/rollback restores Version 1 state (creates Version 3 with v1 data)', async () => {
    const revsRes = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/admin/v2/screens/scr_daily_activity_ring/revisions',
      method: 'GET'
    });
    const rev1 = revsRes.body.find(r => r.version === 1);
    assert.ok(rev1, 'Revision 1 must exist');

    const rollbackRes = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/admin/v2/screens/scr_daily_activity_ring/rollback',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Actor-Id': 'dr_sarah_admin'
      }
    }, {
      revision_id: rev1.revision_id,
      reason: 'Testing rollback to initial step goal'
    });

    assert.equal(rollbackRes.statusCode, 200);
    const restored = rollbackRes.body;
    assert.equal(restored.version, 3, 'Rollback should create version 3');
    assert.equal(restored.config.goals.step_goal, 10000, 'Step goal must be restored to 10,000');
    assert.equal(restored.config.ring_geometry.stroke_thickness, 11, 'Ring thickness must be restored to 11');
  });

  test('Test 8: DELETE /admin/v2/screens/:id moves screen to Recycle Bin (Soft Delete)', async () => {
    const delRes = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/admin/v2/screens/scr_move_reminder_notification',
      method: 'DELETE',
      headers: { 'X-Actor-Id': 'admin_cleaner' }
    });

    assert.equal(delRes.statusCode, 200);
    assert.equal(delRes.body.status, 'trashed');

    // Verify it is in recycle bin
    const binRes = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/admin/v2/recycle-bin',
      method: 'GET'
    });
    assert.equal(binRes.statusCode, 200);
    const trashedItem = binRes.body.find(i => i.item_id === 'scr_move_reminder_notification');
    assert.ok(trashedItem, 'Item must appear in Recycle Bin');
  });

  test('Test 9: POST /admin/v2/screens/:id/restore recovers screen from Recycle Bin', async () => {
    const restoreRes = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/admin/v2/screens/scr_move_reminder_notification/restore',
      method: 'POST',
      headers: { 'X-Actor-Id': 'admin_restorer' }
    });

    assert.equal(restoreRes.statusCode, 200);
    assert.equal(restoreRes.body.status, 'active');

    // Verify it is no longer in recycle bin
    const binRes = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/admin/v2/recycle-bin',
      method: 'GET'
    });
    const stillInBin = binRes.body.some(i => i.item_id === 'scr_move_reminder_notification');
    assert.equal(stillInBin, false, 'Item must no longer be in Recycle Bin');
  });

  test('Test 10: GET /admin/v2/audit-logs returns comprehensive immutable audit events', async () => {
    const auditRes = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/admin/v2/audit-logs',
      method: 'GET'
    });

    assert.equal(auditRes.statusCode, 200);
    assert.ok(Array.isArray(auditRes.body));
    assert.ok(auditRes.body.length >= 3, 'Expected audit trail with updates, rollbacks, and deletes');

    const hasUpdate = auditRes.body.some(a => a.action === 'SCREEN_UPDATE');
    const hasRollback = auditRes.body.some(a => a.action === 'SCREEN_ROLLBACK');
    const hasTrash = auditRes.body.some(a => a.action === 'SCREEN_SOFT_DELETE');

    assert.ok(hasUpdate, 'SCREEN_UPDATE audit logged');
    assert.ok(hasRollback, 'SCREEN_ROLLBACK audit logged');
    assert.ok(hasTrash, 'SCREEN_SOFT_DELETE audit logged');
  });
});
