const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createCardServer } = require('../src/server');

describe('DOKRA-VITALITY-STEP2-001: Vitality & Energy Score Domain Tests', () => {
  let app;
  let serverPort;

  function httpRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
      const fullOptions = {
        hostname: '127.0.0.1',
        port: serverPort,
        headers: {
          'Accept': 'application/json',
          'X-Actor-Id': 'super_admin',
          ...(postData ? { 'Content-Type': 'application/json' } : {})
        },
        ...options
      };

      const req = http.request(fullOptions, (res) => {
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

  before(async () => {
    app = createCardServer({
      dbPath: ':memory:',
      requireAuth: false
    });
    await app.listen(0);
    serverPort = app.server.address().port;
  });

  after(async () => {
    await app.close();
  });

  // Test 1: Discover all Vitality domain screens
  test('Test 1: GET /admin/v2/screens?domain=vitality returns all seeded Vitality screens', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens?domain=vitality', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length >= 8, `Expected at least 8 Vitality screens, got ${res.body.length}`);

    const screenIds = res.body.map(s => s.id);
    assert.ok(screenIds.includes('scr_vitality_energy_score'));
    assert.ok(screenIds.includes('scr_vitality_score_factors'));
    assert.ok(screenIds.includes('scr_vitality_trends_chart'));
    assert.ok(screenIds.includes('scr_vitality_hrv_deep'));
    assert.ok(screenIds.includes('scr_vitality_sleep_debt'));
    assert.ok(screenIds.includes('scr_vitality_ai_coach_guidance'));
    assert.ok(screenIds.includes('scr_vitality_onboarding_getstarted'));
    assert.ok(screenIds.includes('scr_vitality_rewards_streaks'));
    assert.ok(screenIds.includes('scr_vitality_home_widget_settings'));
  });

  // Test 2: Search vitality screens by keyword
  test('Test 2: GET /admin/v2/screens?search=Readiness finds Vitality screens', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens?search=Readiness', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.some(s => s.screen_name.includes('Readiness') || s.id.includes('vitality')));
  });

  // Test 3: Search for HRV and Sleep Debt
  test('Test 3: Search finds HRV and Sleep Debt screens', async () => {
    const resHrv = await httpRequest({ path: '/admin/v2/screens?search=HRV', method: 'GET' });
    assert.equal(resHrv.statusCode, 200);
    assert.ok(resHrv.body.some(s => s.id === 'scr_vitality_hrv_deep' || s.screen_name.includes('HRV')));

    const resDebt = await httpRequest({ path: '/admin/v2/screens?search=Sleep%20Debt', method: 'GET' });
    assert.equal(resDebt.statusCode, 200);
    assert.ok(resDebt.body.some(s => s.id === 'scr_vitality_sleep_debt' || s.screen_name.includes('Sleep Debt')));
  });

  // Test 4: Retrieve deep layout, style, config, and scoring weights for Readiness score
  test('Test 4: GET /admin/v2/screens/scr_vitality_energy_score returns complete scoring weights and HRV telemetry', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens/scr_vitality_energy_score', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.id, 'scr_vitality_energy_score');
    assert.equal(res.body.domain_id, 'vitality');

    const config = res.body.config;
    assert.equal(config.current_score, 86);
    assert.equal(config.weights.nocturnal_hrv_weight, 0.45);
    assert.equal(config.weights.sleep_debt_weight, 0.35);
    assert.equal(config.weights.prior_day_strain_weight, 0.20);
    assert.equal(config.hrv_telemetry.current_ms, 64);
    assert.equal(config.sleep_debt.debt_minutes, 18);
    assert.ok(Array.isArray(config.ai_coach_rules));
  });

  // Test 5: Update Readiness score weights and AI Coach guidance (Creates Version 2)
  test('Test 5: PUT /admin/v2/screens/scr_vitality_energy_score creates Version 2 revision', async () => {
    const updatePayload = {
      change_summary: 'Admin adjusted HRV weight to 0.50 and updated optimal guidance',
      config: {
        current_score: 92,
        weights: {
          nocturnal_hrv_weight: 0.50,
          sleep_debt_weight: 0.30,
          prior_day_strain_weight: 0.20
        },
        coach_advice: 'Exceptional parasympathetic recovery. Peak window for marathon training.'
      }
    };

    const res = await httpRequest(
      { path: '/admin/v2/screens/scr_vitality_energy_score', method: 'PUT' },
      updatePayload
    );

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.version, 2);
    assert.equal(res.body.config.weights.nocturnal_hrv_weight, 0.50);
    assert.equal(res.body.config.current_score, 92);
  });

  // Test 6: Verify immutable revision history
  test('Test 6: GET /admin/v2/screens/scr_vitality_energy_score/revisions returns snapshots for v1 and v2', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens/scr_vitality_energy_score/revisions', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.equal(res.body.length, 2);
    assert.equal(res.body[0].version, 2);
    assert.equal(res.body[1].version, 1);
  });

  // Test 7: Rollback to Version 1
  test('Test 7: POST /admin/v2/screens/scr_vitality_energy_score/rollback restores Version 1 state', async () => {
    const revs = await httpRequest({ path: '/admin/v2/screens/scr_vitality_energy_score/revisions', method: 'GET' });
    const v1RevId = revs.body.find(r => r.version === 1).revision_id;

    const res = await httpRequest(
      { path: '/admin/v2/screens/scr_vitality_energy_score/rollback', method: 'POST' },
      { revision_id: v1RevId, reason: 'Restored baseline scoring weights' }
    );

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.version, 3);
    assert.equal(res.body.config.weights.nocturnal_hrv_weight, 0.45);
  });

  // Test 8: Soft Delete Vitality widget settings screen to Recycle Bin
  test('Test 8: DELETE /admin/v2/screens/scr_vitality_home_widget_settings soft-deletes screen', async () => {
    const res = await httpRequest({
      path: '/admin/v2/screens/scr_vitality_home_widget_settings',
      method: 'DELETE'
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.status, 'trashed');

    // Confirm it appears in recycle bin
    const binRes = await httpRequest({ path: '/admin/v2/recycle-bin', method: 'GET' });
    assert.equal(binRes.statusCode, 200);
    assert.ok(binRes.body.some(item => item.item_id === 'scr_vitality_home_widget_settings'));
  });

  // Test 9: Restore screen from Recycle Bin
  test('Test 9: POST /admin/v2/screens/scr_vitality_home_widget_settings/restore recovers screen', async () => {
    const res = await httpRequest({
      path: '/admin/v2/screens/scr_vitality_home_widget_settings/restore',
      method: 'POST'
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.status, 'active');

    // Verify it is back in active screens
    const detailRes = await httpRequest({ path: '/admin/v2/screens/scr_vitality_home_widget_settings', method: 'GET' });
    assert.equal(detailRes.statusCode, 200);
    assert.equal(detailRes.body.status, 'active');
  });

  // Test 10: Step 1 screens remain completely functional and intact
  test('Test 10: Step 1 (Home & Daily Activity) screens remain 100% functional', async () => {
    const resRing = await httpRequest({ path: '/admin/v2/screens/scr_daily_activity_ring', method: 'GET' });
    assert.equal(resRing.statusCode, 200);
    assert.equal(resRing.body.domain_id, 'home_daily');
    assert.equal(resRing.body.config.goals.step_goal, 10000);

    const resDash = await httpRequest({ path: '/admin/v2/screens/scr_home_main_dashboard', method: 'GET' });
    assert.equal(resDash.statusCode, 200);
    assert.equal(resDash.body.domain_id, 'home_daily');
  });
});
