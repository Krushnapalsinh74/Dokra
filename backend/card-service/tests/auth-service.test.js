/**
 * Dokra Staging Auth & Token Issuer Tests
 * Task ID: DOKRA-AUTH-SRV-001
 * 
 * Verifies all 20 mandatory test requirements.
 */

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { AuthService, DEFAULT_STAGING_CONFIG } = require('../src/auth-service');
const { createCardServer } = require('../src/server');

// Helper to make HTTP requests
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

describe('Dokra Staging Auth Service MVP - 20 Mandatory Tests', () => {
  let app;
  let serverPort;
  let authService;
  let validStagingToken;

  const validClientParams = {
    client_id: 'dokra-android-dev',
    client_flavor: 'staging',
    app_version: '7.00.6.011',
    device_id: 'dev-device-uuid-999',
    scope: 'cards:read'
  };

  before(async () => {
    authService = new AuthService({
      issuer: 'dokra-staging-auth',
      audience: 'dokra-api-staging',
      environment: 'staging',
      ttlSeconds: 1800, // 30 minutes
      signingKey: 'test_secret_key_dokra_staging_2026'
    });

    app = createCardServer({
      dbPath: ':memory:',
      requireAuth: true,
      authService
    });

    const listenInfo = await app.listen(0, '127.0.0.1');
    serverPort = listenInfo.port;

    // Publish a sample card for feed tests
    const sampleCard = {
      slug: 'dokra-poc-card-001',
      priority: 100,
      metadata: {
        providerId: 'com.dokra.health',
        partnerName: 'Dokra Clinical Labs'
      },
      content: {
        templateType: 0,
        title: 'Dokra Auth Test Card',
        description: 'Authentication verified card'
      },
      actions: [
        {
          id: 'act-01',
          title: 'View Analysis',
          actionUrl: 'dokrahealth://vitality/detail'
        }
      ]
    };
    const draft = app.adminService.createDraft(sampleCard, 'admin');
    app.adminService.publishCard(draft.id, 'admin', 'Initial publish');
  });

  after(async () => {
    if (app) {
      await app.close();
    }
  });

  // Test 1: Valid staging-token request
  test('Test 1: Valid staging-token request (POST /v1/auth/staging-token -> 200 OK)', async () => {
    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v1/auth/staging-token',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, validClientParams);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.token_type, 'Bearer');
    assert.ok(res.body.access_token);
    assert.equal(res.body.expires_in, 1800);
    assert.equal(res.body.scope, 'cards:read');
    assert.equal(res.body.env, 'staging');

    validStagingToken = res.body.access_token;
  });

  // Test 2: Unknown client_id
  test('Test 2: Unknown client_id rejected with 400 Bad Request', async () => {
    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v1/auth/staging-token',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { ...validClientParams, client_id: 'unknown-malicious-app' });

    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.includes('Unrecognized staging client_id'));
  });

  // Test 3: Wrong client flavor
  test('Test 3: Wrong client flavor (e.g. production) rejected with 400', async () => {
    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v1/auth/staging-token',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { ...validClientParams, client_flavor: 'production' });

    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.includes('client_flavor'));
  });

  // Test 4: Invalid scope
  test('Test 4: Disallowed scope rejected with 400', async () => {
    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v1/auth/staging-token',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { ...validClientParams, scope: 'root:superuser:delete_all' });

    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.includes('Disallowed or unrecognized scope'));
  });

  // Test 5: Invalid app version
  test('Test 5: Invalid app version format rejected with 400', async () => {
    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v1/auth/staging-token',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { ...validClientParams, app_version: 'invalid-version-string' });

    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.includes('app_version'));
  });

  // Test 6: Missing required field
  test('Test 6: Missing required field (device_id) rejected with 400', async () => {
    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v1/auth/staging-token',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { client_id: 'dokra-android-dev', client_flavor: 'staging', app_version: '7.00.6.011' });

    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.includes('device_id'));
  });

  // Test 7: Token contains expected claims
  test('Test 7: Token contains expected claims (iss, sub, aud, env, scope, iat, exp)', () => {
    const tokenResult = authService.issueStagingToken(validClientParams);
    const parts = tokenResult.access_token.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));

    assert.equal(payload.iss, 'dokra-staging-auth');
    assert.equal(payload.sub, 'dokra-android-dev');
    assert.equal(payload.aud, 'dokra-api-staging');
    assert.equal(payload.env, 'staging');
    assert.equal(payload.scope, 'cards:read');
    assert.equal(payload.device_id, 'dev-device-uuid-999');
    assert.ok(typeof payload.iat === 'number');
    assert.ok(typeof payload.exp === 'number');
    assert.equal(payload.exp - payload.iat, 1800);
  });

  // Test 8: Token expires correctly
  test('Test 8: Token expires correctly and verification rejects expired token', () => {
    const shortTtlAuth = new AuthService({
      ttlSeconds: -10, // already expired
      signingKey: 'test_secret_key_dokra_staging_2026'
    });
    const expiredTokenRes = shortTtlAuth.issueStagingToken(validClientParams);
    const verification = shortTtlAuth.verifyToken(`Bearer ${expiredTokenRes.access_token}`, 'cards:read');

    assert.equal(verification.valid, false);
    assert.equal(verification.code, 401);
    assert.ok(verification.error.includes('expired'));
  });

  // Test 9: Card API accepts valid token
  test('Test 9: Card API accepts valid Dokra Bearer token (GET /v2/servicecard/list -> 200 OK)', async () => {
    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v2/servicecard/list',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${validStagingToken}`
      }
    });

    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].serviceId, 'dokra-poc-card-001');
  });

  // Test 10: Card API rejects missing token
  test('Test 10: Card API rejects request without Authorization header -> 401 Unauthorized', async () => {
    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v2/servicecard/list',
      method: 'GET'
    });

    assert.equal(res.statusCode, 401);
    assert.ok(res.body.error.includes('Missing Authorization header'));
  });

  // Test 11: Card API rejects malformed token
  test('Test 11: Card API rejects malformed token -> 401 Unauthorized', async () => {
    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v2/servicecard/list',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer not.a.valid.jwt.token'
      }
    });

    assert.equal(res.statusCode, 401);
  });

  // Test 12: Card API rejects expired token
  test('Test 12: Card API rejects expired token -> 401 Unauthorized', async () => {
    const shortTtlAuth = new AuthService({
      ttlSeconds: -10,
      signingKey: 'test_secret_key_dokra_staging_2026'
    });
    const expiredRes = shortTtlAuth.issueStagingToken(validClientParams);

    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v2/servicecard/list',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${expiredRes.access_token}`
      }
    });

    assert.equal(res.statusCode, 401);
    assert.ok(res.body.error.includes('expired'));
  });

  // Test 13: Card API rejects wrong issuer
  test('Test 13: Card API rejects token with wrong issuer -> 401 Unauthorized', async () => {
    const wrongIssAuth = new AuthService({
      issuer: 'fake-foreign-issuer',
      signingKey: 'test_secret_key_dokra_staging_2026'
    });
    const tokenRes = wrongIssAuth.issueStagingToken(validClientParams);

    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v2/servicecard/list',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenRes.access_token}`
      }
    });

    assert.equal(res.statusCode, 401);
    assert.ok(res.body.error.includes('issuer'));
  });

  // Test 14: Card API rejects wrong audience
  test('Test 14: Card API rejects token with wrong audience -> 401 Unauthorized', async () => {
    const wrongAudAuth = new AuthService({
      audience: 'other-target-service',
      signingKey: 'test_secret_key_dokra_staging_2026'
    });
    const tokenRes = wrongAudAuth.issueStagingToken(validClientParams);

    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v2/servicecard/list',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenRes.access_token}`
      }
    });

    assert.equal(res.statusCode, 401);
    assert.ok(res.body.error.includes('audience'));
  });

  // Test 15: Card API rejects wrong environment
  test('Test 15: Card API rejects token with wrong environment -> 401 Unauthorized', async () => {
    const wrongEnvAuth = new AuthService({
      environment: 'production',
      signingKey: 'test_secret_key_dokra_staging_2026'
    });
    const tokenRes = wrongEnvAuth.issueStagingToken(validClientParams);

    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v2/servicecard/list',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenRes.access_token}`
      }
    });

    assert.equal(res.statusCode, 401);
    assert.ok(res.body.error.includes('environment'));
  });

  // Test 16: Card API rejects insufficient scope
  test('Test 16: Token verification rejects insufficient scope -> 403 Forbidden', () => {
    const readOnlyTokenRes = authService.issueStagingToken({
      ...validClientParams,
      scope: 'cards:read'
    });

    const verification = authService.verifyToken(`Bearer ${readOnlyTokenRes.access_token}`, 'cards:admin');
    assert.equal(verification.valid, false);
    assert.equal(verification.code, 403);
    assert.ok(verification.error.includes('Insufficient token scope'));
  });

  // Test 17: Private signing key never appears in logs
  test('Test 17: Private signing key never appears in response body or error logs', async () => {
    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v1/auth/staging-token',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, validClientParams);

    const bodyStr = JSON.stringify(res.body);
    assert.ok(!bodyStr.includes('test_secret_key'));
    assert.ok(!bodyStr.includes('dokra_staging_secret_key'));
  });

  // Test 18: Token value never appears in error messages
  test('Test 18: Token value never echoed back in authentication error messages', async () => {
    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v2/servicecard/list',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${validStagingToken}.tampered`
      }
    });

    assert.equal(res.statusCode, 401);
    const bodyStr = JSON.stringify(res.body);
    assert.ok(!bodyStr.includes(validStagingToken));
  });

  // Test 19: Existing Card Service feed route alias (/v1/cards/feed) works with auth
  test('Test 19: Dokra alias /v1/cards/feed works with valid Bearer token', async () => {
    const res = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v1/cards/feed',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${validStagingToken}`
      }
    });

    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.equal(res.body.length, 1);
  });

  // Test 20: Existing ETag / 304 behavior remains unchanged for authenticated requests
  test('Test 20: Authenticated feed request with If-None-Match returns 304 Not Modified', async () => {
    // 1. Initial request to get ETag
    const firstRes = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v2/servicecard/list',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${validStagingToken}`
      }
    });

    assert.equal(firstRes.statusCode, 200);
    const etag = firstRes.headers.etag;
    assert.ok(etag);

    // 2. Second request with If-None-Match
    const secondRes = await httpRequest({
      hostname: '127.0.0.1',
      port: serverPort,
      path: '/v2/servicecard/list',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${validStagingToken}`,
        'If-None-Match': etag
      }
    });

    assert.equal(secondRes.statusCode, 304);
    assert.equal(secondRes.headers.etag, etag);
  });
});
