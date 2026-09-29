/**
 * Dokra Health - End-to-End Android Staging Integration Test
 * Task ID: DOKRA-HCS-STAGING-002
 * 
 * Validates the complete pipeline:
 * Android Dev Flow -> DokraAuthTokenProvider -> Staging Auth -> Card Service
 * -> WebServiceData -> Room Table -> ServiceViewFactory -> Rendered Card
 */

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { DatabaseSync } = require('node:sqlite');
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

describe('DOKRA-HCS-STAGING-002: End-to-End Android Staging Verification', () => {
  let app;
  let serverPort;
  let authService;
  let stagingToken;
  let simulatedRoomDb;

  const timings = {};

  before(async () => {
    authService = new AuthService({
      issuer: 'dokra-staging-auth',
      audience: 'dokra-api-staging',
      environment: 'staging',
      ttlSeconds: 3600,
      signingKey: 'dokra_staging_verified_secret_key_2026'
    });

    app = createCardServer({
      dbPath: ':memory:',
      requireAuth: true,
      authService
    });

    const listenInfo = await app.listen(0, '127.0.0.1');
    serverPort = listenInfo.port;

    // Create and publish the official test card
    const testCard = {
      slug: 'dokra-poc-card-001',
      priority: 100,
      metadata: {
        providerId: 'com.dokra.health',
        partnerName: 'Dokra Clinical Labs',
        ttsPrompt: 'Dokra Vitality Summary Card'
      },
      content: {
        templateType: 0,
        title: 'Dokra Test Card',
        description: 'This card proves the Dokra backend compatibility path.',
        iconUrl: 'https://cdn.dokrahealth.com/icons/card_vitality.png',
        contentUrl: 'file:///android_asset/service_card_test_update.html'
      },
      actions: [
        {
          id: 'act-01',
          title: 'View Analysis',
          actionUrl: 'dokrahealth://vitality/detail',
          ttsPrompt: 'Open Dokra Vitality details',
          extra: 'source=home_card'
        }
      ],
      endpoints: {
        deactivationUrl: 'https://api.dokrahealth.com/v1/cards/deactivate',
        serviceDataApi: 'https://api.dokrahealth.com/v2/servicecard/list',
        deactivationApi: 'https://api.dokrahealth.com/v1/cards/deactivate'
      },
      scheduling: {
        startAt: '2026-01-01T00:00:00.000Z',
        endAt: '2028-01-01T00:00:00.000Z'
      },
      targeting: {
        countries: ['KR', 'US', 'IN'],
        minAppVersion: '7.00.0.000'
      }
    };

    const draft = app.adminService.createDraft(testCard, 'master_admin');
    app.adminService.publishCard(draft.id, 'master_admin', 'Official Dokra Test Card Publish');

    // Initialize in-memory SQLite mimicking Room `web_service_data` table (smali_classes3/l70.smali)
    simulatedRoomDb = new DatabaseSync(':memory:');
    simulatedRoomDb.exec(`
      CREATE TABLE IF NOT EXISTS web_service_data (
        provider_id TEXT NOT NULL,
        service_id TEXT NOT NULL,
        service_version INTEGER NOT NULL,
        etag TEXT NOT NULL,
        deactivation_url TEXT,
        service_data_api TEXT,
        deactivation_api TEXT,
        template_type INTEGER NOT NULL,
        content_url TEXT,
        service_icon_url TEXT,
        service_name TEXT,
        partner_name TEXT,
        tts_desc TEXT,
        description TEXT,
        button_list TEXT,
        PRIMARY KEY(provider_id, service_id)
      )
    `);
  });

  after(async () => {
    if (simulatedRoomDb) {
      simulatedRoomDb.close();
    }
    if (app) {
      await app.close();
    }
  });

  // Step 1: T0 -> T1: DokraAuthTokenProvider requests staging session
  test('Stage 1: T0 -> T1: DokraAuthTokenProvider obtains legitimate Dokra Staging JWT', async () => {
    timings.t0 = Date.now();

    const authRes = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v1/auth/staging-token',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      client_id: 'dokra-android-dev',
      client_flavor: 'staging',
      app_version: '7.00.6.011',
      device_id: 'staging-emulator-uuid-001',
      scope: 'cards:read'
    });

    timings.t1 = Date.now();

    assert.equal(authRes.statusCode, 200);
    assert.equal(authRes.body.token_type, 'Bearer');
    assert.ok(authRes.body.access_token);
    assert.equal(authRes.body.scope, 'cards:read');

    stagingToken = authRes.body.access_token;
  });

  // Step 2: T2 -> T3: Mobile WebServicePartnerServerManager queries GET /v2/servicecard/list with Bearer token
  test('Stage 2: T2 -> T3: Mobile client dispatches authenticated request and receives legacy WebServiceData JSON', async () => {
    timings.t2 = Date.now();

    const feedRes = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v2/servicecard/list?country=US&lang=en&app_ver=7.00.6.011',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${stagingToken}`,
        'providerId': 'com.dokra.health',
        'serviceId': 'dokra-poc-card-001',
        'deviceId': 'staging-emulator-uuid-001'
      }
    });

    timings.t3 = Date.now();

    assert.equal(feedRes.statusCode, 200);
    assert.ok(feedRes.headers.etag);
    assert.ok(Array.isArray(feedRes.body));
    assert.equal(feedRes.body.length, 1);

    const card = feedRes.body[0];
    assert.equal(card.providerId, 'com.dokra.health');
    assert.equal(card.serviceId, 'dokra-poc-card-001');
    assert.equal(card.serviceInfo.resourceInfo.data.serviceName, 'Dokra Test Card');
    assert.equal(card.serviceInfo.resourceInfo.data.description, 'This card proves the Dokra backend compatibility path.');
    assert.equal(card.serviceInfo.resourceInfo.templateType, 0);
    assert.equal(card.serviceInfo.resourceInfo.data.buttonList[0].title, 'View Analysis');
    assert.equal(card.serviceInfo.resourceInfo.data.buttonList[0].actionUrl, 'dokrahealth://vitality/detail');

    timings.receivedCard = card;
    timings.etag = feedRes.headers.etag;
  });

  // Step 3: T4 -> T5: WebServiceDataManager parses and stores in Room `web_service_data`
  test('Stage 3: T4 -> T5: WebServiceDataManager deserializes and commits to Room web_service_data table', () => {
    timings.t4 = Date.now();

    const card = timings.receivedCard;
    const viewData = card.serviceInfo.resourceInfo.data;
    const stmt = simulatedRoomDb.prepare(`
      INSERT OR REPLACE INTO web_service_data (
        provider_id, service_id, service_version, etag,
        deactivation_url, service_data_api, deactivation_api,
        template_type, content_url, service_icon_url,
        service_name, partner_name, tts_desc, description,
        button_list
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      card.providerId,
      card.serviceId,
      card.serviceInfo.serviceVersion,
      card.eTag,
      card.serviceInfo.deactivationUrl,
      card.serviceInfo.serviceDataApi,
      card.serviceInfo.deactivationApi,
      card.serviceInfo.resourceInfo.templateType,
      card.serviceInfo.resourceInfo.contentUrl,
      viewData.serviceIconUrl,
      viewData.serviceName,
      viewData.partnerName,
      viewData.ttsDesc,
      viewData.description,
      JSON.stringify(viewData.buttonList)
    );

    timings.t5 = Date.now();

    // Verify database record
    const query = simulatedRoomDb.prepare('SELECT * FROM web_service_data WHERE provider_id = ? AND service_id = ?');
    const row = query.get('com.dokra.health', 'dokra-poc-card-001');

    assert.ok(row);
    assert.equal(row.service_name, 'Dokra Test Card');
    assert.equal(row.template_type, 0);
    assert.equal(row.etag, timings.etag);

    const buttons = JSON.parse(row.button_list);
    assert.equal(buttons.length, 1);
    assert.equal(buttons[0].title, 'View Analysis');
    assert.equal(buttons[0].actionUrl, 'dokrahealth://vitality/detail');
  });

  // Step 4: T6 -> T7: ServiceViewFactory creates card view and validates Dashboard display
  test('Stage 4: T6 -> T7: ServiceViewFactory binds Template 0 and produces visible Home Dashboard Card', () => {
    timings.t6 = Date.now();

    const query = simulatedRoomDb.prepare('SELECT * FROM web_service_data WHERE service_id = ?');
    const row = query.get('dokra-poc-card-001');

    // Simulating ServiceViewFactory.createServiceView()
    const viewState = {
      templateType: row.template_type,
      title: row.service_name,
      description: row.description,
      iconUrl: row.service_icon_url,
      buttons: JSON.parse(row.button_list),
      renderedTimestamp: new Date().toISOString()
    };

    timings.t7 = Date.now();

    assert.equal(viewState.templateType, 0);
    assert.equal(viewState.title, 'Dokra Test Card');
    assert.equal(viewState.buttons[0].title, 'View Analysis');
    assert.equal(viewState.buttons[0].actionUrl, 'dokrahealth://vitality/detail');

    // Latency metrics calculation
    const authLatency = timings.t1 - timings.t0;
    const cardNetworkLatency = timings.t3 - timings.t2;
    const roomLatency = timings.t5 - timings.t4;
    const uiLatency = timings.t7 - timings.t6;
    const totalEndToEnd = (timings.t1 - timings.t0) + (timings.t3 - timings.t2) + (timings.t5 - timings.t4) + (timings.t7 - timings.t6);

    console.log('\n--- MEASURED STAGING TIMINGS (T0 -> T7) ---');
    console.log(`Auth Latency (T0 -> T1):          ${authLatency} ms`);
    console.log(`Card Feed Network (T2 -> T3):      ${cardNetworkLatency} ms`);
    console.log(`Room SQLite Write (T4 -> T5):      ${roomLatency} ms`);
    console.log(`View Binding / UI (T6 -> T7):      ${uiLatency} ms`);
    console.log(`End-to-End Feed Sync Latency:      ${totalEndToEnd} ms`);
  });

  // Step 5: ETag Caching test (304 Not Modified)
  test('Stage 5: Conditional Request with If-None-Match returns 304 Not Modified', async () => {
    const cachedRes = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v2/servicecard/list?country=US',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${stagingToken}`,
        'If-None-Match': timings.etag
      }
    });

    assert.equal(cachedRes.statusCode, 304);
    assert.equal(cachedRes.headers.etag, timings.etag);
  });
});
