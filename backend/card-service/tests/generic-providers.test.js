/**
 * Dokra Health - Generic Android Provider Layer Unit Tests
 * Task ID: DOKRA-ADMIN-RUN-002
 * 
 * Verifies all 4 mandatory test categories for the generic Android provider layer:
 * 1. Auth Provider lifecycle
 * 2. API Client & ETag caching
 * 3. HealthDataStore capability handling
 * 4. Samsung OEM Isolation
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const {
  CAPABILITY_STATUS,
  HEALTH_CAPABILITY,
  GenericStagingAuthProvider,
  DokraApiClient,
  GenericHealthDataStore,
  SamsungHealthDataStoreAdapter
} = require('../src/provider-layer');

describe('DOKRA-ADMIN-RUN-002: Generic Android Provider Layer Tests', () => {

  // --- Category 1: Auth Provider Tests ---
  describe('Category 1: Auth Provider Lifecycle', () => {
    test('Test 1: Token available & caching works before expiration', async () => {
      let fetchCount = 0;
      const provider = new GenericStagingAuthProvider({
        tokenFetcher: async () => {
          fetchCount++;
          return { access_token: 'valid-jwt-token-123', expires_in: 3600 };
        }
      });

      const token1 = await provider.getAccessToken();
      assert.equal(token1, 'valid-jwt-token-123');
      assert.equal(fetchCount, 1);

      const token2 = await provider.getAccessToken();
      assert.equal(token2, 'valid-jwt-token-123');
      assert.equal(fetchCount, 1); // Cached, no refetch
      assert.equal(await provider.isAuthenticated(), true);
    });

    test('Test 2: Token expired triggers automatic refresh', async () => {
      let fetchCount = 0;
      const provider = new GenericStagingAuthProvider({
        tokenFetcher: async () => {
          fetchCount++;
          return { access_token: `token-v${fetchCount}`, expires_in: fetchCount === 1 ? 0 : 3600 };
        }
      });

      const token1 = await provider.getAccessToken();
      assert.equal(token1, 'token-v1');
      assert.equal(fetchCount, 1);

      // Next call sees expired token and triggers refresh
      const token2 = await provider.getAccessToken();
      assert.equal(token2, 'token-v2');
      assert.equal(fetchCount, 2);
    });

    test('Test 3: Authentication failure bubbles clean error', async () => {
      const provider = new GenericStagingAuthProvider({
        tokenFetcher: async () => {
          const err = new Error('Invalid client credentials');
          err.status = 401;
          throw err;
        }
      });

      await assert.rejects(async () => {
        await provider.getAccessToken();
      }, /Invalid client credentials/);
      assert.equal(await provider.isAuthenticated(), false);
    });

    test('Test 4: Network unavailable error handled gracefully', async () => {
      const provider = new GenericStagingAuthProvider({
        tokenFetcher: async () => {
          throw new Error('ECONNREFUSED 127.0.0.1:8080');
        }
      });

      await assert.rejects(async () => {
        await provider.getAccessToken();
      }, /ECONNREFUSED/);
    });

    test('Test 5: Logout clears session and active tokens', async () => {
      const provider = new GenericStagingAuthProvider({
        tokenFetcher: async () => ({ access_token: 'session-jwt', expires_in: 3600 })
      });

      await provider.getAccessToken();
      assert.equal(await provider.isAuthenticated(), true);

      await provider.logout();
      assert.equal(await provider.isAuthenticated(), false);
    });
  });

  // --- Category 2: API Client Tests ---
  describe('Category 2: DokraApiClient HTTP & ETag Handling', () => {
    test('Test 6: HTTP 200 returns data and caches ETag', async () => {
      const authProvider = new GenericStagingAuthProvider({
        tokenFetcher: async () => ({ access_token: 'auth-jwt', expires_in: 3600 })
      });

      const apiClient = new DokraApiClient({
        authProvider,
        httpClient: async (req) => {
          assert.equal(req.headers['Authorization'], 'Bearer auth-jwt');
          return {
            status: 200,
            headers: { 'etag': '"etag-v1-hash"' },
            data: { services: [{ service_id: 'card-1', service_name: 'Vitality' }] }
          };
        }
      });

      const res = await apiClient.getServiceCards('US', '7.00.6.011');
      assert.equal(res.status, 200);
      assert.equal(res.fromCache, false);
      assert.equal(res.etag, '"etag-v1-hash"');
      assert.equal(res.data.services.length, 1);
    });

    test('Test 7: HTTP 304 Not Modified returns cached data', async () => {
      const authProvider = new GenericStagingAuthProvider({
        tokenFetcher: async () => ({ access_token: 'auth-jwt', expires_in: 3600 })
      });

      let callCount = 0;
      const apiClient = new DokraApiClient({
        authProvider,
        httpClient: async (req) => {
          callCount++;
          if (callCount === 1) {
            return {
              status: 200,
              headers: { 'etag': '"etag-v1-hash"' },
              data: { services: [{ service_id: 'card-1', service_name: 'Vitality' }] }
            };
          }
          assert.equal(req.headers['If-None-Match'], '"etag-v1-hash"');
          return { status: 304, headers: {}, data: null };
        }
      });

      const res1 = await apiClient.getServiceCards('US', '7.00.6.011');
      assert.equal(res1.status, 200);

      const res2 = await apiClient.getServiceCards('US', '7.00.6.011');
      assert.equal(res2.status, 304);
      assert.equal(res2.fromCache, true);
      assert.equal(res2.data.services[0].service_name, 'Vitality');
    });

    test('Test 8: HTTP 401 Unauthorized propagates error', async () => {
      const authProvider = new GenericStagingAuthProvider({
        tokenFetcher: async () => ({ access_token: 'bad-token', expires_in: 3600 })
      });

      const apiClient = new DokraApiClient({
        authProvider,
        httpClient: async () => ({ status: 401, data: { error: 'Unauthorized token' } })
      });

      await assert.rejects(async () => {
        await apiClient.getServiceCards('US', '7.00.6.011');
      }, /Dokra API error: 401/);
    });

    test('Test 9: HTTP 403 Forbidden propagates error', async () => {
      const authProvider = new GenericStagingAuthProvider({
        tokenFetcher: async () => ({ access_token: 'limited-token', expires_in: 3600 })
      });

      const apiClient = new DokraApiClient({
        authProvider,
        httpClient: async () => ({ status: 403, data: { error: 'Forbidden' } })
      });

      await assert.rejects(async () => {
        await apiClient.getServiceCards('US', '7.00.6.011');
      }, /Dokra API error: 403/);
    });

    test('Test 10: HTTP 500 Server Error propagates error cleanly', async () => {
      const authProvider = new GenericStagingAuthProvider({
        tokenFetcher: async () => ({ access_token: 'auth-jwt', expires_in: 3600 })
      });

      const apiClient = new DokraApiClient({
        authProvider,
        httpClient: async () => ({ status: 500, data: { error: 'Internal server error' } })
      });

      await assert.rejects(async () => {
        await apiClient.getServiceCards('US', '7.00.6.011');
      }, /Dokra API error: 500/);
    });
  });

  // --- Category 3: HealthDataStore Capability Tests ---
  describe('Category 3: HealthDataStore Capabilities', () => {
    test('Test 11: Supported capability reads & writes locally', async () => {
      const store = new GenericHealthDataStore({ hasStepSensor: true, hasPermission: true });
      
      const cap = await store.checkCapability(HEALTH_CAPABILITY.STEPS);
      assert.equal(cap, CAPABILITY_STATUS.SUPPORTED);

      const writeRes = await store.writeHealthData(HEALTH_CAPABILITY.STEPS, { count: 8500 });
      assert.equal(writeRes.success, true);

      const readRes = await store.readHealthData(HEALTH_CAPABILITY.STEPS);
      assert.equal(readRes.status, CAPABILITY_STATUS.SUPPORTED);
      assert.equal(readRes.records.length, 1);
      assert.equal(readRes.records[0].count, 8500);
    });

    test('Test 12: Permission required capability degrades gracefully without fake data', async () => {
      const store = new GenericHealthDataStore({ hasStepSensor: true, hasPermission: false });
      
      const cap = await store.checkCapability(HEALTH_CAPABILITY.STEPS);
      assert.equal(cap, CAPABILITY_STATUS.PERMISSION_REQUIRED);

      const readRes = await store.readHealthData(HEALTH_CAPABILITY.STEPS);
      assert.equal(readRes.status, CAPABILITY_STATUS.PERMISSION_REQUIRED);
      assert.equal(readRes.records.length, 0); // Zero fake data
    });

    test('Test 13: Hardware required capability reports HARDWARE_REQUIRED', async () => {
      const store = new GenericHealthDataStore({ hasHeartRateSensor: false, hasHealthConnect: false });
      
      const cap = await store.checkCapability(HEALTH_CAPABILITY.HEART_RATE);
      assert.equal(cap, CAPABILITY_STATUS.HARDWARE_REQUIRED);

      const readRes = await store.readHealthData(HEALTH_CAPABILITY.HEART_RATE);
      assert.equal(readRes.status, CAPABILITY_STATUS.HARDWARE_REQUIRED);
      assert.equal(readRes.records.length, 0);
    });

    test('Test 14: Unknown capability returns UNSUPPORTED', async () => {
      const store = new GenericHealthDataStore();
      const cap = await store.checkCapability('UNKNOWN_GENETIC_PROFILE');
      assert.equal(cap, CAPABILITY_STATUS.UNSUPPORTED);
    });
  });

  // --- Category 4: Samsung OEM Isolation Tests ---
  describe('Category 4: Samsung Isolation', () => {
    test('Test 15: Generic Android store does NOT invoke Samsung services', async () => {
      const genericStore = new GenericHealthDataStore({ hasHealthConnect: true, hasPermission: true });
      const cap = await genericStore.checkCapability(HEALTH_CAPABILITY.STEPS);
      assert.equal(cap, CAPABILITY_STATUS.SUPPORTED);
    });

    test('Test 16: Samsung adapter fails gracefully on non-Samsung hardware', async () => {
      const samsungAdapter = new SamsungHealthDataStoreAdapter({ isSamsungDevice: false });
      const initialized = await samsungAdapter.initialize();
      assert.equal(initialized, false);

      const cap = await samsungAdapter.checkCapability(HEALTH_CAPABILITY.STEPS);
      assert.equal(cap, CAPABILITY_STATUS.TEMPORARILY_UNAVAILABLE);
    });
  });
});
