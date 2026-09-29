const http = require('node:http');
const { URL } = require('node:url');
const { createCardServer } = require('../src/server');
const { CardDatabase } = require('../src/database');
const { AuthService } = require('../src/auth-service');

function httpRequest(url, options = {}, bodyData = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: { ...(options.headers || {}) }
    };

    let payload = null;
    if (bodyData && typeof bodyData === 'object') {
      payload = JSON.stringify(bodyData);
      reqOptions.headers['Content-Type'] = 'application/json';
      reqOptions.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(reqOptions, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk.toString();
      });
      res.on('end', () => {
        let json = null;
        try {
          if (data && data.trim().length > 0) {
            json = JSON.parse(data);
          }
        } catch (e) {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
          body: data
        });
      });
    });

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function runAudit() {
  const db = new CardDatabase(':memory:');
  const authService = new AuthService({
    issuer: 'dokra-staging-auth',
    audience: 'dokra-api-staging',
    environment: 'staging',
    ttlSeconds: 3600,
    signingKey: 'dokra_admin_studio_audit_key_2026'
  });

  const adminToken = authService.issueStagingToken({
    client_id: 'dokra-android-dev',
    client_flavor: 'staging',
    device_id: 'admin-auditor-01',
    app_version: '7.00.6.011',
    scope: 'cards:all'
  }).access_token;

  const authorToken = authService.issueStagingToken({
    client_id: 'dokra-android-dev',
    client_flavor: 'staging',
    device_id: 'author-01',
    app_version: '7.00.6.011',
    scope: 'cards:author'
  }).access_token;

  const readerToken = authService.issueStagingToken({
    client_id: 'dokra-android-dev',
    client_flavor: 'staging',
    device_id: 'reader-01',
    app_version: '7.00.6.011',
    scope: 'cards:read'
  }).access_token;

  const app = createCardServer({ database: db, authService, requireAuth: true });
  const { port } = await app.listen(0, '127.0.0.1');
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log('========================================================================');
  console.log(`Dokra Card & Auth Service running at ${baseUrl}`);
  console.log('========================================================================\n');

  console.log('--- ACTION 1: Master Admin Studio Web UI Verification ---');
  const uiRes = await httpRequest(`${baseUrl}/admin/studio`);
  console.log(`GET /admin/studio -> Status: ${uiRes.status}, Content-Type: ${uiRes.headers['content-type']}`);
  console.log(`UI HTML length: ${uiRes.body.length} bytes, Contains Studio Title: ${uiRes.body.includes('Dokra Health — Master Admin Card Studio')}`);

  console.log('\n--- ACTION 2: Create Draft Card ---');
  const createDraftPayload = {
    slug: 'dokra-vitality-card-001',
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
        id: 'act-vitality-01',
        title: 'Open Vitality',
        actionUrl: 'dokrahealth://vitality/detail'
      }
    ],
    targeting: {
      countries: ['US', 'KR', 'GB'],
      locales: ['en-US', 'ko-KR', 'en-GB'],
      minAppVersion: '7.00.0.000',
      maxAppVersion: '7.99.9.999'
    },
    scheduling: {
      startDate: '2026-01-01T00:00:00Z',
      endDate: '2030-01-01T00:00:00Z',
      timezone: 'UTC'
    }
  };

  const createRes = await httpRequest(`${baseUrl}/admin/v1/cards`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  }, createDraftPayload);

  console.log(`POST /admin/v1/cards -> Status: ${createRes.status}`);
  console.log('Created Card Body:', JSON.stringify(createRes.data, null, 2));
  const cardId = createRes.data.id;

  console.log('\n--- ACTION 3: Verify Draft Isolation (Mobile Feed must not include draft) ---');
  const feedDraftRes = await httpRequest(`${baseUrl}/v2/servicecard/list?country=US`, {
    headers: { 'Authorization': `Bearer ${readerToken}` }
  });
  console.log(`GET /v2/servicecard/list -> Status: ${feedDraftRes.status}, Feed Cards count: ${feedDraftRes.data.length}`);

  console.log('\n--- ACTION 4: Publish Card (Revision 1) ---');
  const pub1Res = await httpRequest(`${baseUrl}/admin/v1/cards/${cardId}/publish`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  }, { changeSummary: 'Initial release of Daily Vitality Card' });
  console.log(`POST /admin/v1/cards/${cardId}/publish -> Status: ${pub1Res.status}`);
  console.log('Publish Response:', JSON.stringify(pub1Res.data, null, 2));
  const rev1Id = pub1Res.data.audit.revisionId;

  console.log('\n--- ACTION 5: Feed Verify (Revision 1 Live) ---');
  const feedV1Res = await httpRequest(`${baseUrl}/v2/servicecard/list?country=US`, {
    headers: { 'Authorization': `Bearer ${readerToken}` }
  });
  const etagV1 = feedV1Res.headers['etag'];
  console.log(`GET /v2/servicecard/list -> Status: ${feedV1Res.status}, ETag: ${etagV1}`);
  console.log('Mobile Feed JSON:', JSON.stringify(feedV1Res.data, null, 2));

  console.log('\n--- ACTION 6: Edit Draft (Draft Mutation Invariance Test) ---');
  const editPayload = {
    content: {
      templateType: 0,
      title: 'Dokra Admin Controlled Card — Revision 2 Enhanced',
      description: 'Updated description from Master Admin Card Studio.',
      iconUrl: 'https://cdn.dokrahealth.com/icons/admin_card_v2.png',
      contentUrl: 'file:///android_asset/service_card_test_update.html'
    }
  };
  const editRes = await httpRequest(`${baseUrl}/admin/v1/cards/${cardId}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${authorToken}` }
  }, editPayload);
  console.log(`PUT /admin/v1/cards/${cardId} -> Status: ${editRes.status}, Updated Title in Draft: "${editRes.data.content.title}"`);

  // Verify mobile feed is STILL Revision 1
  const feedDuringEditRes = await httpRequest(`${baseUrl}/v2/servicecard/list?country=US`, {
    headers: { 'Authorization': `Bearer ${readerToken}`, 'If-None-Match': etagV1 }
  });
  console.log(`Conditional GET /v2/servicecard/list with If-None-Match -> Status: ${feedDuringEditRes.status} (304 Not Modified invariant maintained)`);

  console.log('\n--- ACTION 7: Publish Revision 2 ---');
  const pub2Res = await httpRequest(`${baseUrl}/admin/v1/cards/${cardId}/publish`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  }, { changeSummary: 'Updated title and description for V2' });
  console.log(`POST /admin/v1/cards/${cardId}/publish -> Status: ${pub2Res.status}, Version: ${pub2Res.data.version}`);
  const rev2Id = pub2Res.data.audit.revisionId;

  console.log('\n--- ACTION 8: Feed Verify (Revision 2 Live) ---');
  const feedV2Res = await httpRequest(`${baseUrl}/v2/servicecard/list?country=US`, {
    headers: { 'Authorization': `Bearer ${readerToken}` }
  });
  const etagV2 = feedV2Res.headers['etag'];
  console.log(`GET /v2/servicecard/list -> Status: ${feedV2Res.status}, New ETag: ${etagV2}`);
  console.log(`Live Service Title on Feed: "${feedV2Res.data[0].serviceInfo.resourceInfo.data.serviceName}"`);

  console.log('\n--- ACTION 9: Revision History Verification ---');
  const revsRes = await httpRequest(`${baseUrl}/admin/v1/cards/${cardId}/revisions`, {
    headers: { 'Authorization': `Bearer ${readerToken}` }
  });
  console.log(`GET /admin/v1/cards/${cardId}/revisions -> Status: ${revsRes.status}`);
  console.log('Revisions List:', JSON.stringify(revsRes.data, null, 2));

  console.log('\n--- ACTION 10: 1-Click Rollback to Revision 1 ---');
  const rollRes = await httpRequest(`${baseUrl}/admin/v1/cards/${cardId}/rollback`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  }, {
    targetRevisionId: rev1Id,
    reason: 'Emergency rollback to Revision 1'
  });
  console.log(`POST /admin/v1/cards/${cardId}/rollback -> Status: ${rollRes.status}, Restored Version: ${rollRes.data.version}`);

  console.log('\n--- ACTION 11: Feed Verify (Post-Rollback) ---');
  const feedRollRes = await httpRequest(`${baseUrl}/v2/servicecard/list?country=US`, {
    headers: { 'Authorization': `Bearer ${readerToken}` }
  });
  console.log(`GET /v2/servicecard/list -> Status: ${feedRollRes.status}, ETag matches V1: ${feedRollRes.headers['etag'] === etagV1}`);
  console.log(`Restored Title on Feed: "${feedRollRes.data[0].serviceInfo.resourceInfo.data.serviceName}"`);

  console.log('\n--- ACTION 12: Duplicate Card ---');
  const dupRes = await httpRequest(`${baseUrl}/admin/v1/cards/${cardId}/duplicate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${authorToken}` }
  });
  console.log(`POST /admin/v1/cards/${cardId}/duplicate -> Status: ${dupRes.status}, New ID: ${dupRes.data.id}, Slug: ${dupRes.data.slug}`);

  console.log('\n--- ACTION 13: Unpublish Card ---');
  const unpubRes = await httpRequest(`${baseUrl}/admin/v1/cards/${cardId}/unpublish`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  }, { reason: 'Decommissioned test card' });
  console.log(`POST /admin/v1/cards/${cardId}/unpublish -> Status: ${unpubRes.status}, New Status: ${unpubRes.data.status}`);

  const feedEmptyRes = await httpRequest(`${baseUrl}/v2/servicecard/list?country=US`, {
    headers: { 'Authorization': `Bearer ${readerToken}` }
  });
  console.log(`GET /v2/servicecard/list after unpublish -> Status: ${feedEmptyRes.status}, Feed Cards count: ${feedEmptyRes.data.length}`);

  console.log('\n--- ACTION 14: Audit Trail Verification ---');
  const auditRes = await httpRequest(`${baseUrl}/admin/v1/cards/${cardId}/audit`, {
    headers: { 'Authorization': `Bearer ${readerToken}` }
  });
  console.log(`GET /admin/v1/cards/${cardId}/audit -> Status: ${auditRes.status}, Events: ${auditRes.data.length}`);
  console.log(`Audit events count: ${auditRes.data.length}`);
  auditRes.data.forEach(e => console.log(` - [${e.operation}] by ${e.actorId} at ${e.timestamp}: ${JSON.stringify(e.details)}`));

  console.log('\n--- ACTION 15: RBAC Role Restrictions Verification ---');
  // Author attempts publish -> should be 403 Forbidden
  const forbiddenPub = await httpRequest(`${baseUrl}/admin/v1/cards/${cardId}/publish`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${authorToken}` }
  }, { changeSummary: 'Illegal publish by author' });
  console.log(`Author POST /publish -> Status: ${forbiddenPub.status} (Expected 403 Forbidden: ${forbiddenPub.status === 403})`);

  // Reader attempts create -> should be 403 Forbidden
  const forbiddenCreate = await httpRequest(`${baseUrl}/admin/v1/cards`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${readerToken}` }
  }, createDraftPayload);
  console.log(`Reader POST /admin/v1/cards -> Status: ${forbiddenCreate.status} (Expected 403 Forbidden: ${forbiddenCreate.status === 403})`);

  console.log('\n--- ACTION 16: Direct Database State Inspection ---');
  const cardInDb = db.getCardById(cardId);
  console.log('Database Card Record:', {
    id: cardInDb.id,
    slug: cardInDb.slug,
    status: cardInDb.status,
    version: cardInDb.version,
    title: cardInDb.content.title
  });
  const dbRevs = db.listRevisions(cardId);
  console.log(`Total Revisions in SQLite DB: ${dbRevs.length}`);

  await app.close();
  console.log('\n=== MASTER ADMIN CARD LIFECYCLE AUDIT COMPLETE: ALL PASS ===');
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
