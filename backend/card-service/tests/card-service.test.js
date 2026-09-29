/**
 * Dokra Health - Card Service Automated Test Suite
 * Task ID: DOKRA-HCS-MVP-001
 * 
 * Verifies all 15 mandatory test scenarios against the Dokra Card Service.
 */

const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const { createCardServer } = require('../src/server');

// Helper to make HTTP requests
function httpRequest(url, options = {}, bodyData = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (bodyData && typeof bodyData === 'object') {
      bodyData = JSON.stringify(bodyData);
      reqOptions.headers['Content-Type'] = 'application/json';
      reqOptions.headers['Content-Length'] = Buffer.byteLength(bodyData);
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
        } catch (e) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
          json
        });
      });
    });

    req.on('error', reject);
    if (bodyData) req.write(bodyData);
    req.end();
  });
}

test('Dokra Card Service MVP - 15 Mandatory Tests', async (t) => {
  let app;
  let baseUrl;

  t.before(async () => {
    app = createCardServer({ dbPath: ':memory:', isDevMode: true });
    const { port, host } = await app.listen(0, '127.0.0.1'); // Random available port
    baseUrl = `http://${host}:${port}`;
  });

  t.after(async () => {
    await app.close();
  });

  let createdCardId = null;
  let firstRevisionId = null;
  let secondRevisionId = null;
  let firstEtag = null;
  let secondEtag = null;

  // Sample verified payload
  const sampleCard = {
    slug: 'dokra-poc-card-001',
    metadata: {
      providerId: 'com.dokra.health',
      partnerName: 'Dokra Health',
      ttsPrompt: 'Dokra test card'
    },
    content: {
      title: 'Dokra Test Card',
      description: 'This card proves the Dokra backend compatibility path.',
      iconUrl: 'https://content.dokrahealth.com/icons/ic_vitality.png',
      contentUrl: 'file:///android_asset/service_card_test_update.html',
      templateType: 0
    },
    actions: [
      {
        id: 'cta_01',
        title: 'View Analysis',
        actionUrl: 'dokrahealth://vitality/detail',
        ttsPrompt: 'Open analysis',
        extra: null
      }
    ],
    priority: 10,
    scheduling: {
      startAt: '2026-01-01T00:00:00Z',
      endAt: '2027-01-01T00:00:00Z'
    },
    targeting: {
      allowedCountries: ['US', 'GB', 'DE', 'KR']
    }
  };

  // -------------------------------------------------------------
  // Test 1: Create Draft
  // -------------------------------------------------------------
  await t.test('Test 1: Create Draft (Expected 201 Created)', async () => {
    const res = await httpRequest(`${baseUrl}/admin/v1/cards`, { method: 'POST' }, sampleCard);
    assert.strictEqual(res.status, 201, 'Should return HTTP 201 Created');
    assert.ok(res.json.id, 'Created card must have an ID');
    assert.strictEqual(res.json.status, 'DRAFT', 'Created card status must be DRAFT');
    assert.strictEqual(res.json.version, 1, 'Initial version must be 1');
    assert.strictEqual(res.json.slug, 'dokra-poc-card-001');
    createdCardId = res.json.id;
  });

  // -------------------------------------------------------------
  // Test 2: Retrieve Draft
  // -------------------------------------------------------------
  await t.test('Test 2: Retrieve Draft (Same canonical fields)', async () => {
    const res = await httpRequest(`${baseUrl}/admin/v1/cards/${createdCardId}`, { method: 'GET' });
    assert.strictEqual(res.status, 200, 'Should return HTTP 200 OK');
    assert.strictEqual(res.json.id, createdCardId);
    assert.strictEqual(res.json.content.title, 'Dokra Test Card');
    assert.strictEqual(res.json.content.description, 'This card proves the Dokra backend compatibility path.');
    assert.strictEqual(res.json.content.templateType, 0);
    assert.strictEqual(res.json.actions[0].actionUrl, 'dokrahealth://vitality/detail');
  });

  // -------------------------------------------------------------
  // Test 3: Publish
  // -------------------------------------------------------------
  await t.test('Test 3: Publish (PUBLISHED revision created)', async () => {
    const res = await httpRequest(`${baseUrl}/admin/v1/cards/${createdCardId}/publish`, { method: 'POST' }, {
      changeSummary: 'Initial release of Dokra POC Card'
    });
    assert.strictEqual(res.status, 200, 'Should return HTTP 200 OK');
    assert.strictEqual(res.json.status, 'PUBLISHED', 'Status must be updated to PUBLISHED');
    assert.ok(res.json.audit.revisionId, 'Published card must have an active revisionId');
    firstRevisionId = res.json.audit.revisionId;

    // Check revisions list
    const revRes = await httpRequest(`${baseUrl}/admin/v1/cards/${createdCardId}/revisions`, { method: 'GET' });
    assert.strictEqual(revRes.status, 200);
    assert.strictEqual(revRes.json.length, 1, 'Should have exactly 1 revision in history');
    assert.strictEqual(revRes.json[0].revisionId, firstRevisionId);
  });

  // -------------------------------------------------------------
  // Test 4: Feed
  // -------------------------------------------------------------
  await t.test('Test 4: Feed (Legacy WebServiceData JSON returned on /v2/servicecard/list)', async () => {
    const res = await httpRequest(`${baseUrl}/v2/servicecard/list?country=US`, { method: 'GET' });
    assert.strictEqual(res.status, 200, 'Should return HTTP 200 OK');
    assert.ok(Array.isArray(res.json), 'Feed must return an array');
    assert.strictEqual(res.json.length, 1, 'Should contain 1 card');

    const card = res.json[0];
    assert.strictEqual(card.providerId, 'com.dokra.health');
    assert.strictEqual(card.serviceId, 'dokra-poc-card-001');
    assert.ok(card.eTag, 'Card must contain eTag string');
  });

  // -------------------------------------------------------------
  // Test 5: Compatibility Mapping
  // -------------------------------------------------------------
  await t.test('Test 5: Compatibility Mapping (Verify every mapped field)', async () => {
    const res = await httpRequest(`${baseUrl}/v2/servicecard/list?country=US`, { method: 'GET' });
    const card = res.json[0];

    // Top-level WebServiceData
    assert.strictEqual(card.providerId, 'com.dokra.health');
    assert.strictEqual(card.serviceId, 'dokra-poc-card-001');

    // ServiceInfo
    assert.ok(card.serviceInfo, 'Must have serviceInfo object');
    assert.strictEqual(card.serviceInfo.serviceVersion, 1);
    assert.ok(card.serviceInfo.deactivationUrl);
    assert.ok(card.serviceInfo.serviceDataApi);
    assert.ok(card.serviceInfo.deactivationApi);

    // ResourceInfo
    const resourceInfo = card.serviceInfo.resourceInfo;
    assert.ok(resourceInfo, 'Must have resourceInfo object');
    assert.strictEqual(resourceInfo.templateType, 0);
    assert.strictEqual(resourceInfo.contentUrl, 'file:///android_asset/service_card_test_update.html');

    // ViewData
    const viewData = resourceInfo.data;
    assert.ok(viewData, 'Must have viewData object');
    assert.strictEqual(viewData.serviceName, 'Dokra Test Card');
    assert.strictEqual(viewData.partnerName, 'Dokra Health');
    assert.strictEqual(viewData.ttsDesc, 'Dokra test card');
    assert.strictEqual(viewData.description, 'This card proves the Dokra backend compatibility path.');
    assert.strictEqual(viewData.serviceIconUrl, 'https://content.dokrahealth.com/icons/ic_vitality.png');

    // Button list
    assert.ok(Array.isArray(viewData.buttonList), 'Must have buttonList array');
    assert.strictEqual(viewData.buttonList.length, 1);
    const button = viewData.buttonList[0];
    assert.strictEqual(button.title, 'View Analysis');
    assert.strictEqual(button.actionUrl, 'dokrahealth://vitality/detail');
    assert.strictEqual(button.ttsDesc, 'Open analysis');
    assert.strictEqual(button.extra, null);
  });

  // -------------------------------------------------------------
  // Test 6: ETag First Request
  // -------------------------------------------------------------
  await t.test('Test 6: ETag First Request (Expected 200 + ETag Header)', async () => {
    const res = await httpRequest(`${baseUrl}/v2/servicecard/list?country=US`, { method: 'GET' });
    assert.strictEqual(res.status, 200);
    firstEtag = res.headers['etag'];
    assert.ok(firstEtag, 'Response must include ETag header');
    assert.ok(firstEtag.startsWith('W/"'), 'ETag must be weak or strong SHA-256 hash string');
  });

  // -------------------------------------------------------------
  // Test 7: ETag Second Request (Matching If-None-Match -> 304)
  // -------------------------------------------------------------
  await t.test('Test 7: ETag Second Request (Matching If-None-Match -> Expected 304)', async () => {
    const res = await httpRequest(`${baseUrl}/v2/servicecard/list?country=US`, {
      method: 'GET',
      headers: {
        'If-None-Match': firstEtag
      }
    });
    assert.strictEqual(res.status, 304, 'Must return HTTP 304 Not Modified');
    assert.strictEqual(res.body, '', 'HTTP 304 response body must be empty');
    assert.strictEqual(res.headers['etag'], firstEtag, '304 must return matching ETag');
  });

  // -------------------------------------------------------------
  // Test 8: Modify and Publish (New ETag)
  // -------------------------------------------------------------
  await t.test('Test 8: Modify and Publish (Expected New ETag)', async () => {
    // 1. Update draft content
    await httpRequest(`${baseUrl}/admin/v1/cards/${createdCardId}`, { method: 'PUT' }, {
      content: {
        title: 'Dokra Test Card (Updated v2)',
        description: 'Updated copy for ETag modification test.',
        iconUrl: 'https://content.dokrahealth.com/icons/ic_vitality.png',
        contentUrl: 'file:///android_asset/service_card_test_update.html',
        templateType: 0
      }
    });

    // 2. Publish updated draft
    const pubRes = await httpRequest(`${baseUrl}/admin/v1/cards/${createdCardId}/publish`, { method: 'POST' }, {
      changeSummary: 'Updated title and description'
    });
    assert.strictEqual(pubRes.status, 200);
    assert.strictEqual(pubRes.json.version, 2, 'Version must increment to 2');
    secondRevisionId = pubRes.json.audit.revisionId;

    // 3. Fetch feed and verify new ETag
    const feedRes = await httpRequest(`${baseUrl}/v2/servicecard/list?country=US`, { method: 'GET' });
    assert.strictEqual(feedRes.status, 200);
    secondEtag = feedRes.headers['etag'];
    assert.notStrictEqual(secondEtag, firstEtag, 'ETag must change after publish of modified content');
    const updatedCardInFeed = feedRes.json.find(c => c.serviceId === 'dokra-poc-card-001');
    assert.ok(updatedCardInFeed, 'Updated card must exist in feed');
    assert.strictEqual(updatedCardInFeed.serviceInfo.resourceInfo.data.serviceName, 'Dokra Test Card (Updated v2)');
  });

  // -------------------------------------------------------------
  // Test 9: Rollback (Previous revision becomes active)
  // -------------------------------------------------------------
  await t.test('Test 9: Rollback (Previous revision becomes active)', async () => {
    const rollRes = await httpRequest(`${baseUrl}/admin/v1/cards/${createdCardId}/rollback`, { method: 'POST' }, {
      targetRevisionId: firstRevisionId,
      reason: 'Reverting to initial release'
    });
    assert.strictEqual(rollRes.status, 200);
    assert.strictEqual(rollRes.json.version, 1, 'Active version must be reverted to 1');
    assert.strictEqual(rollRes.json.content.title, 'Dokra Test Card', 'Title must revert to v1');

    // Fetch feed and verify feed matches v1 again
    const feedRes = await httpRequest(`${baseUrl}/v2/servicecard/list?country=US`, { method: 'GET' });
    assert.strictEqual(feedRes.status, 200);
    assert.strictEqual(feedRes.headers['etag'], firstEtag, 'Feed ETag must match original v1 ETag');
    assert.strictEqual(feedRes.json[0].serviceInfo.resourceInfo.data.serviceName, 'Dokra Test Card');
  });

  // -------------------------------------------------------------
  // Test 10: Expired Card (Excluded from feed)
  // -------------------------------------------------------------
  await t.test('Test 10: Expired Card (Excluded from feed)', async () => {
    // Create and publish an already-expired card
    const expiredCard = {
      slug: 'dokra-expired-card-002',
      metadata: { providerId: 'com.dokra.health' },
      content: {
        title: 'Expired Card',
        description: 'Should not appear',
        templateType: 0
      },
      scheduling: {
        startAt: '2020-01-01T00:00:00Z',
        endAt: '2020-01-02T00:00:00Z' // Past date
      }
    };
    const draftRes = await httpRequest(`${baseUrl}/admin/v1/cards`, { method: 'POST' }, expiredCard);
    await httpRequest(`${baseUrl}/admin/v1/cards/${draftRes.json.id}/publish`, { method: 'POST' }, {});

    const feedRes = await httpRequest(`${baseUrl}/v2/servicecard/list?country=US`, { method: 'GET' });
    assert.strictEqual(feedRes.status, 200);
    const expiredFound = feedRes.json.some(c => c.serviceId === 'dokra-expired-card-002');
    assert.strictEqual(expiredFound, false, 'Expired card must be excluded from active feed');
  });

  // -------------------------------------------------------------
  // Test 11: Country Targeting (Included / Excluded correctly)
  // -------------------------------------------------------------
  await t.test('Test 11: Country Targeting (Included / Excluded correctly)', async () => {
    // Create card targeted exclusively to 'JP'
    const jpCard = {
      slug: 'dokra-jp-only-card-003',
      metadata: { providerId: 'com.dokra.health' },
      content: {
        title: 'Japan Targeted Card',
        description: 'Special notice for Japan users',
        templateType: 0
      },
      targeting: {
        allowedCountries: ['JP']
      }
    };
    const draftRes = await httpRequest(`${baseUrl}/admin/v1/cards`, { method: 'POST' }, jpCard);
    await httpRequest(`${baseUrl}/admin/v1/cards/${draftRes.json.id}/publish`, { method: 'POST' }, {});

    // Query US feed -> Should NOT contain JP card
    const usFeed = await httpRequest(`${baseUrl}/v2/servicecard/list?country=US`, { method: 'GET' });
    const jpInUs = usFeed.json.some(c => c.serviceId === 'dokra-jp-only-card-003');
    assert.strictEqual(jpInUs, false, 'JP card must NOT appear in US feed');

    // Query JP feed -> MUST contain JP card
    const jpFeed = await httpRequest(`${baseUrl}/v2/servicecard/list?country=JP`, { method: 'GET' });
    const jpInJp = jpFeed.json.some(c => c.serviceId === 'dokra-jp-only-card-003');
    assert.strictEqual(jpInJp, true, 'JP card MUST appear in JP feed');
  });

  // -------------------------------------------------------------
  // Test 12: Invalid CTA (Publish rejected)
  // -------------------------------------------------------------
  await t.test('Test 12: Invalid CTA (Publish rejected for disallowed schemes)', async () => {
    const badCtaCard = {
      slug: 'dokra-bad-cta-004',
      metadata: { providerId: 'com.dokra.health' },
      content: {
        title: 'Malicious Card Test',
        description: 'CTA injection test',
        templateType: 0
      },
      actions: [
        {
          title: 'Click Me',
          actionUrl: 'javascript:alert(1)' // Dangerous scheme
        }
      ]
    };
    const res = await httpRequest(`${baseUrl}/admin/v1/cards`, { method: 'POST' }, badCtaCard);
    assert.strictEqual(res.status, 400, 'Must reject card creation with invalid CTA scheme');
    assert.ok(res.json.error.includes('Security Violation'), 'Error message must specify security violation');
  });

  // -------------------------------------------------------------
  // Test 13: Unsupported Template Type (Publish rejected)
  // -------------------------------------------------------------
  await t.test('Test 13: Unsupported Template Type (Publish rejected if templateType != 0)', async () => {
    const unsuppTemplateCard = {
      slug: 'dokra-unsupported-template-005',
      metadata: { providerId: 'com.dokra.health' },
      content: {
        title: 'Template 99 Card',
        description: 'Invalid template',
        templateType: 99 // Invalid
      }
    };
    const res = await httpRequest(`${baseUrl}/admin/v1/cards`, { method: 'POST' }, unsuppTemplateCard);
    assert.strictEqual(res.status, 400, 'Must reject unsupported template type');
    assert.ok(res.json.error.includes('Unsupported templateType'), 'Error message must flag unsupported template');
  });

  // -------------------------------------------------------------
  // Test 14: Multiple Cards (Stable deterministic ordering)
  // -------------------------------------------------------------
  await t.test('Test 14: Multiple Cards (Deterministic ordering: priority DESC -> ID ASC)', async () => {
    // Create card with priority 50
    const highPriCard = {
      slug: 'dokra-high-priority-006',
      metadata: { providerId: 'com.dokra.health' },
      content: { title: 'High Priority Card', description: 'Priority 50', templateType: 0 },
      priority: 50
    };
    const resA = await httpRequest(`${baseUrl}/admin/v1/cards`, { method: 'POST' }, highPriCard);
    await httpRequest(`${baseUrl}/admin/v1/cards/${resA.json.id}/publish`, { method: 'POST' }, {});

    // Create card with priority 5
    const lowPriCard = {
      slug: 'dokra-low-priority-007',
      metadata: { providerId: 'com.dokra.health' },
      content: { title: 'Low Priority Card', description: 'Priority 5', templateType: 0 },
      priority: 5
    };
    const resB = await httpRequest(`${baseUrl}/admin/v1/cards`, { method: 'POST' }, lowPriCard);
    await httpRequest(`${baseUrl}/admin/v1/cards/${resB.json.id}/publish`, { method: 'POST' }, {});

    // Fetch feed and check order
    const feedRes = await httpRequest(`${baseUrl}/v2/servicecard/list?country=US`, { method: 'GET' });
    const slugs = feedRes.json.map(c => c.serviceId);
    
    // dokra-high-priority-006 (pri: 50) must appear BEFORE dokra-poc-card-001 (pri: 10) and dokra-low-priority-007 (pri: 5)
    assert.strictEqual(slugs[0], 'dokra-high-priority-006');
    assert.strictEqual(slugs[1], 'dokra-poc-card-001');
    assert.strictEqual(slugs[2], 'dokra-low-priority-007');
  });

  // -------------------------------------------------------------
  // Test 15: Draft Mutation (Feed and ETag unchanged until publish)
  // -------------------------------------------------------------
  await t.test('Test 15: Draft Mutation (Feed and ETag unchanged until publish)', async () => {
    // 1. Get current feed ETag
    const beforeFeed = await httpRequest(`${baseUrl}/v2/servicecard/list?country=US`, { method: 'GET' });
    const beforeEtag = beforeFeed.headers['etag'];

    // 2. Edit a card in draft mode without publishing
    await httpRequest(`${baseUrl}/admin/v1/cards/${createdCardId}`, { method: 'PUT' }, {
      content: {
        title: 'Unpublished Secret Draft',
        description: 'Should not appear in active feed',
        templateType: 0
      }
    });

    // 3. Fetch feed again
    const afterFeed = await httpRequest(`${baseUrl}/v2/servicecard/list?country=US`, { method: 'GET' });
    const afterEtag = afterFeed.headers['etag'];

    // Assert that feed and ETag have NOT changed
    assert.strictEqual(afterEtag, beforeEtag, 'Draft edits must NOT change published feed ETag');
    const titleInFeed = afterFeed.json.find(c => c.serviceId === 'dokra-poc-card-001').serviceInfo.resourceInfo.data.serviceName;
    assert.strictEqual(titleInFeed, 'Dokra Test Card', 'Feed must continue serving active published revision');
  });
});
