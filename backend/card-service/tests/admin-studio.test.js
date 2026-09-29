/**
 * Dokra Master Admin Card Studio Test Suite
 * Task ID: DOKRA-ADMIN-STUDIO-001
 * 
 * Verifies all Admin Studio endpoints, RBAC authorization,
 * draft mutations, publishing, unpublishing, revisions, rollbacks, and Web UI.
 */

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createCardServer } = require('../src/server');
const { AuthService } = require('../src/auth-service');

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

describe('DOKRA-ADMIN-STUDIO-001: Master Admin Card Studio Tests', () => {
  let app;
  let serverPort;
  let authService;
  let superAdminToken;
  let adminToken;
  let authorToken;
  let readOnlyToken;
  let createdCardId;
  let rev1Id;

  before(async () => {
    authService = new AuthService({
      issuer: 'dokra-staging-auth',
      audience: 'dokra-api-staging',
      environment: 'staging',
      ttlSeconds: 3600,
      signingKey: 'admin_studio_test_secret_key_2026'
    });

    app = createCardServer({
      dbPath: ':memory:',
      requireAuth: true,
      authService
    });

    const listenInfo = await app.listen(0, '127.0.0.1');
    serverPort = listenInfo.port;

    // Issue tokens for different RBAC roles
    superAdminToken = authService.issueStagingToken({
      client_id: 'dokra-android-dev',
      client_flavor: 'staging',
      app_version: '7.00.6.011',
      device_id: 'super-admin-001',
      scope: 'cards:all'
    }).access_token;

    adminToken = authService.issueStagingToken({
      client_id: 'dokra-android-dev',
      client_flavor: 'staging',
      app_version: '7.00.6.011',
      device_id: 'admin-001',
      scope: 'cards:admin'
    }).access_token;

    authorToken = authService.issueStagingToken({
      client_id: 'dokra-android-dev',
      client_flavor: 'staging',
      app_version: '7.00.6.011',
      device_id: 'author-001',
      scope: 'cards:author'
    }).access_token;

    readOnlyToken = authService.issueStagingToken({
      client_id: 'dokra-android-dev',
      client_flavor: 'staging',
      app_version: '7.00.6.011',
      device_id: 'readonly-001',
      scope: 'cards:read'
    }).access_token;
  });

  after(async () => {
    if (app) {
      await app.close();
    }
  });

  // Test 1: Card Studio Web UI Route
  test('Test 1: GET /admin/studio serves rich HTML Studio interface', async () => {
    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/admin/studio',
      method: 'GET'
    });

    assert.equal(res.statusCode, 200);
    assert.ok(res.headers['content-type'].includes('text/html'));
    assert.ok(typeof res.body === 'string');
    assert.ok(res.body.includes('Dokra Health — Master Admin Card Studio'));
    assert.ok(res.body.includes('One UI Mobile Simulator'));
  });

  // Test 2: Create Draft with Content Author Role
  test('Test 2: POST /admin/v1/cards creates a canonical card draft', async () => {
    const newCard = {
      slug: 'dokra-admin-card-001',
      priority: 150,
      metadata: {
        providerId: 'com.dokra.health',
        partnerName: 'Dokra Studio Clinical'
      },
      content: {
        templateType: 0,
        title: 'Dokra Admin Controlled Card',
        description: 'This card was created and published from Dokra Master Admin.',
        iconUrl: 'https://cdn.dokrahealth.com/icons/admin_card.png',
        contentUrl: 'file:///android_asset/service_card_test_update.html'
      },
      actions: [
        {
          id: 'act-admin-01',
          title: 'View Analysis',
          actionUrl: 'dokrahealth://vitality/detail'
        }
      ],
      targeting: {
        countries: ['US', 'KR']
      }
    };

    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/admin/v1/cards',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authorToken}`
      }
    }, newCard);

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.slug, 'dokra-admin-card-001');
    assert.equal(res.body.status, 'DRAFT');
    assert.equal(res.body.version, 1);
    createdCardId = res.body.id;
  });

  // Test 3: Read-Only role cannot create cards (RBAC 403 Forbidden)
  test('Test 3: Read-Only role is rejected with 403 Forbidden on POST /admin/v1/cards', async () => {
    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/admin/v1/cards',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${readOnlyToken}`
      }
    }, { slug: 'unauthorized-card', content: { title: 'Test' } });

    assert.equal(res.statusCode, 403);
    assert.ok(res.body.error.includes('Insufficient token scope'));
  });

  // Test 4: List cards with Read-Only role
  test('Test 4: GET /admin/v1/cards lists all managed cards for authorized users', async () => {
    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/admin/v1/cards',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${readOnlyToken}`
      }
    });

    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].slug, 'dokra-admin-card-001');
  });

  // Test 5: Draft Isolation (Unpublished draft does not appear in active mobile feed)
  test('Test 5: Draft Isolation: Draft card is NOT emitted on mobile feed /v2/servicecard/list', async () => {
    const feedRes = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v2/servicecard/list',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${readOnlyToken}`
      }
    });

    assert.equal(feedRes.statusCode, 200);
    assert.ok(Array.isArray(feedRes.body));
    assert.equal(feedRes.body.length, 0); // 0 active published cards
  });

  // Test 6: Author cannot publish (requires cards:admin)
  test('Test 6: Author role cannot publish card -> 403 Forbidden', async () => {
    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: `/admin/v1/cards/${createdCardId}/publish`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authorToken}`
      }
    }, { changeSummary: 'Unauthorized publish attempt' });

    assert.equal(res.statusCode, 403);
    assert.ok(res.body.error.includes('Insufficient token scope'));
  });

  // Test 7: Publish card with Content Admin Role
  test('Test 7: POST /admin/v1/cards/:id/publish publishes card and updates active feed', async () => {
    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: `/admin/v1/cards/${createdCardId}/publish`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { changeSummary: 'First official publish from Studio' });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.status, 'PUBLISHED');
    assert.equal(res.body.version, 1);
    rev1Id = res.body.audit.revisionId;
    assert.ok(rev1Id);

    // Verify it is now live on the mobile feed
    const feedRes = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v2/servicecard/list?country=US',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${readOnlyToken}`
      }
    });

    assert.equal(feedRes.statusCode, 200);
    assert.equal(feedRes.body.length, 1);
    assert.equal(feedRes.body[0].serviceId, 'dokra-admin-card-001');
    assert.equal(feedRes.body[0].serviceInfo.resourceInfo.data.serviceName, 'Dokra Admin Controlled Card');
  });

  // Test 8: Draft Mutation Invariance (Modifying working draft does not alter published feed)
  test('Test 8: Draft Mutation Invariance: Editing draft does NOT change active published feed or ETag', async () => {
    // 1. Get current feed ETag
    const feedBefore = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v2/servicecard/list?country=US',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${readOnlyToken}` }
    });
    const etagBefore = feedBefore.headers.etag;

    // 2. Update draft title
    const updateRes = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: `/admin/v1/cards/${createdCardId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authorToken}`
      }
    }, {
      content: {
        title: 'Draft Mutation - Not Yet Published'
      }
    });
    assert.equal(updateRes.statusCode, 200);

    // 3. Query feed again -> active title and ETag must be 100% UNCHANGED
    const feedAfter = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v2/servicecard/list?country=US',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${readOnlyToken}`,
        'If-None-Match': etagBefore
      }
    });

    assert.equal(feedAfter.statusCode, 304); // Not modified
  });

  // Test 9: Publish Revision 2 -> Updates Feed and changes ETag
  test('Test 9: Publishing updated draft emits Revision 2 with new title and new ETag', async () => {
    const publishRes = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: `/admin/v1/cards/${createdCardId}/publish`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { changeSummary: 'Published Version 2' });

    assert.equal(publishRes.statusCode, 200);
    assert.equal(publishRes.body.version, 2);

    // Check feed now shows updated title
    const feedRes = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v2/servicecard/list?country=US',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${readOnlyToken}` }
    });

    assert.equal(feedRes.statusCode, 200);
    assert.equal(feedRes.body[0].serviceInfo.resourceInfo.data.serviceName, 'Draft Mutation - Not Yet Published');
  });

  // Test 10: Revision History Listing
  test('Test 10: GET /admin/v1/cards/:id/revisions returns immutable version history', async () => {
    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: `/admin/v1/cards/${createdCardId}/revisions`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${readOnlyToken}` }
    });

    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.equal(res.body.length, 2);
    assert.equal(res.body[0].version, 2);
    assert.equal(res.body[1].version, 1);
  });

  // Test 11: 1-Click Rollback to Revision 1
  test('Test 11: POST /admin/v1/cards/:id/rollback restores Revision 1 to active feed', async () => {
    const rollbackRes = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: `/admin/v1/cards/${createdCardId}/rollback`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, {
      targetRevisionId: rev1Id,
      reason: 'Emergency rollback to initial verified copy'
    });

    assert.equal(rollbackRes.statusCode, 200);
    assert.equal(rollbackRes.body.version, 1);

    // Verify active feed reverted to Version 1 title
    const feedRes = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v2/servicecard/list?country=US',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${readOnlyToken}` }
    });

    assert.equal(feedRes.statusCode, 200);
    assert.equal(feedRes.body[0].serviceInfo.resourceInfo.data.serviceName, 'Dokra Admin Controlled Card');
  });

  // Test 12: Duplicate Card
  test('Test 12: POST /admin/v1/cards/:id/duplicate creates a new draft clone with unique slug', async () => {
    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: `/admin/v1/cards/${createdCardId}/duplicate`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authorToken}` }
    });

    assert.equal(res.statusCode, 201);
    assert.ok(res.body.id !== createdCardId);
    assert.ok(res.body.slug.startsWith('dokra-admin-card-001-copy'));
    assert.equal(res.body.status, 'DRAFT');
  });

  // Test 13: Unpublish Card
  test('Test 13: POST /admin/v1/cards/:id/unpublish removes card from active mobile feed', async () => {
    const unpubRes = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: `/admin/v1/cards/${createdCardId}/unpublish`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { reason: 'Decommissioned by Admin' });

    assert.equal(unpubRes.statusCode, 200);
    assert.equal(unpubRes.body.status, 'ARCHIVED');

    // Verify feed is now empty
    const feedRes = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v2/servicecard/list?country=US',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${readOnlyToken}` }
    });

    assert.equal(feedRes.statusCode, 200);
    assert.equal(feedRes.body.length, 0);
  });

  // Test 14: Audit Log Event Inspection
  test('Test 14: GET /admin/v1/cards/:id/audit returns full audit trail', async () => {
    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: `/admin/v1/cards/${createdCardId}/audit`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${readOnlyToken}` }
    });

    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    const operations = res.body.map(a => a.operation);
    assert.ok(operations.includes('CREATE_DRAFT'));
    assert.ok(operations.includes('PUBLISH'));
    assert.ok(operations.includes('UPDATE_DRAFT'));
    assert.ok(operations.includes('ROLLBACK'));
    assert.ok(operations.includes('UNPUBLISH'));
  });

  // Test 15: Publish Validation Failure (Unsupported Template Type rejected)
  test('Test 15: Validation engine rejects unsupported templateType != 0 without corrupting feed', async () => {
    const badCardRes = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/admin/v1/cards',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authorToken}`
      }
    }, {
      slug: 'bad-template-card',
      metadata: {
        providerId: 'com.dokra.health'
      },
      content: {
        templateType: 2, // Unsupported in MVP
        title: 'Bad Template',
        description: 'Testing template validation'
      }
    });

    assert.equal(badCardRes.statusCode, 400);
    assert.ok(badCardRes.body.error.includes('Unsupported templateType'));
  });
});
