/**
 * Dokra Health - Generic Android Provider Layer Specifications & Contracts
 * Task ID: DOKRA-ADMIN-RUN-002
 * 
 * Defines the clean, device-agnostic abstraction boundary:
 * 1. DokraAuthProvider (Staging & Production Auth contracts)
 * 2. DokraApiClient (HTTP 200/304/401/403/404/5xx, timeouts, ETag caching)
 * 3. HealthDataStore (Capability-oriented health data access)
 * 4. SamsungHealthDataStoreAdapter (Optional OEM adapter without hard dependencies)
 */

const CAPABILITY_STATUS = Object.freeze({
  SUPPORTED: 'SUPPORTED',
  UNSUPPORTED: 'UNSUPPORTED',
  PERMISSION_REQUIRED: 'PERMISSION_REQUIRED',
  HARDWARE_REQUIRED: 'HARDWARE_REQUIRED',
  TEMPORARILY_UNAVAILABLE: 'TEMPORARILY_UNAVAILABLE',
  ERROR: 'ERROR'
});

const HEALTH_CAPABILITY = Object.freeze({
  STEPS: 'STEPS',
  HEART_RATE: 'HEART_RATE',
  ACTIVITY: 'ACTIVITY',
  SLEEP: 'SLEEP',
  WEIGHT: 'WEIGHT',
  WORKOUTS: 'WORKOUTS',
  HYDRATION: 'HYDRATION',
  NUTRITION: 'NUTRITION',
  BLOOD_PRESSURE: 'BLOOD_PRESSURE',
  BLOOD_GLUCOSE: 'BLOOD_GLUCOSE',
  BODY_COMPOSITION: 'BODY_COMPOSITION'
});

/**
 * Base DokraAuthProvider interface
 */
class DokraAuthProvider {
  async getAccessToken() {
    throw new Error('Not implemented');
  }

  async refreshToken() {
    throw new Error('Not implemented');
  }

  async isAuthenticated() {
    throw new Error('Not implemented');
  }

  async logout() {
    throw new Error('Not implemented');
  }
}

/**
 * Generic Staging Auth Provider implementation
 */
class GenericStagingAuthProvider extends DokraAuthProvider {
  constructor(options = {}) {
    super();
    this.authUrl = options.authUrl || 'http://127.0.0.1:8080/v1/auth/staging-token';
    this.clientId = options.clientId || 'dokra-android-dev';
    this.clientFlavor = options.clientFlavor || 'staging';
    this.deviceId = options.deviceId || 'device-staging-001';
    this.appVersion = options.appVersion || '7.00.6.011';
    this.scope = options.scope || 'cards:read';
    this.tokenFetcher = options.tokenFetcher || null;

    this.currentToken = null;
    this.tokenExpiresAt = 0;
  }

  async getAccessToken() {
    const now = Math.floor(Date.now() / 1000);
    if (this.currentToken && this.tokenExpiresAt > now + 30) {
      return this.currentToken;
    }
    return this.refreshToken();
  }

  async refreshToken() {
    if (this.tokenFetcher) {
      const res = await this.tokenFetcher({
        client_id: this.clientId,
        client_flavor: this.clientFlavor,
        device_id: this.deviceId,
        app_version: this.appVersion,
        scope: this.scope
      });
      this.currentToken = res.access_token || res.token;
      const ttl = res.expires_in !== undefined ? res.expires_in : 3600;
      this.tokenExpiresAt = Math.floor(Date.now() / 1000) + ttl;
      return this.currentToken;
    }

    throw new Error('Network token fetcher not configured.');
  }

  async isAuthenticated() {
    const now = Math.floor(Date.now() / 1000);
    return !!(this.currentToken && this.tokenExpiresAt > now);
  }

  async logout() {
    this.currentToken = null;
    this.tokenExpiresAt = 0;
  }
}

/**
 * Generic DokraApiClient implementation with ETag caching
 */
class DokraApiClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://127.0.0.1:8080';
    this.authProvider = options.authProvider;
    this.httpClient = options.httpClient;
    this.cache = new Map(); // path -> { etag, data }
  }

  async getServiceCards(country = 'US', appVersion = '7.00.6.011') {
    const token = await this.authProvider.getAccessToken();
    const path = `/v2/servicecard/list?country=${encodeURIComponent(country)}&app_version=${encodeURIComponent(appVersion)}`;
    
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    const cached = this.cache.get(path);
    if (cached && cached.etag) {
      headers['If-None-Match'] = cached.etag;
    }

    const response = await this.httpClient({
      url: this.baseUrl + path,
      method: 'GET',
      headers
    });

    if (response.status === 304) {
      return { status: 304, fromCache: true, data: cached ? cached.data : null };
    }

    if (response.status === 200) {
      const etag = response.headers['etag'] || response.headers['ETag'];
      if (etag) {
        this.cache.set(path, { etag, data: response.data });
      }
      return { status: 200, fromCache: false, data: response.data, etag };
    }

    const error = new Error(`Dokra API error: ${response.status}`);
    error.status = response.status;
    error.data = response.data;
    throw error;
  }
}

/**
 * HealthDataStore Interface & Capability Manager
 */
class HealthDataStore {
  constructor() {
    this.registeredAdapters = [];
  }

  async checkCapability(capability) {
    throw new Error('Not implemented');
  }

  async readHealthData(capability, options = {}) {
    throw new Error('Not implemented');
  }

  async writeHealthData(capability, record) {
    throw new Error('Not implemented');
  }
}

/**
 * Generic Android HealthDataStore Implementation
 * Works cleanly with Android Health Connect or Local SQLite fallback
 */
class GenericHealthDataStore extends HealthDataStore {
  constructor(options = {}) {
    super();
    this.hasStepSensor = options.hasStepSensor !== undefined ? options.hasStepSensor : true;
    this.hasHeartRateSensor = options.hasHeartRateSensor !== undefined ? options.hasHeartRateSensor : false;
    this.hasHealthConnect = options.hasHealthConnect !== undefined ? options.hasHealthConnect : true;
    this.hasPermission = options.hasPermission !== undefined ? options.hasPermission : true;
    this.localStore = new Map();
  }

  async checkCapability(capability) {
    switch (capability) {
      case HEALTH_CAPABILITY.STEPS:
        if (!this.hasPermission) return CAPABILITY_STATUS.PERMISSION_REQUIRED;
        if (this.hasStepSensor || this.hasHealthConnect) return CAPABILITY_STATUS.SUPPORTED;
        return CAPABILITY_STATUS.HARDWARE_REQUIRED;

      case HEALTH_CAPABILITY.ACTIVITY:
      case HEALTH_CAPABILITY.SLEEP:
      case HEALTH_CAPABILITY.HYDRATION:
      case HEALTH_CAPABILITY.NUTRITION:
      case HEALTH_CAPABILITY.WEIGHT:
        if (!this.hasPermission) return CAPABILITY_STATUS.PERMISSION_REQUIRED;
        return CAPABILITY_STATUS.SUPPORTED; // Supported via local UI logging or Health Connect

      case HEALTH_CAPABILITY.HEART_RATE:
        if (!this.hasPermission) return CAPABILITY_STATUS.PERMISSION_REQUIRED;
        if (this.hasHeartRateSensor || this.hasHealthConnect) return CAPABILITY_STATUS.SUPPORTED;
        return CAPABILITY_STATUS.HARDWARE_REQUIRED;

      case HEALTH_CAPABILITY.BLOOD_PRESSURE:
      case HEALTH_CAPABILITY.BLOOD_GLUCOSE:
      case HEALTH_CAPABILITY.BODY_COMPOSITION:
        if (!this.hasPermission) return CAPABILITY_STATUS.PERMISSION_REQUIRED;
        return CAPABILITY_STATUS.HARDWARE_REQUIRED; // Requires BLE medical peripheral or manual entry

      default:
        return CAPABILITY_STATUS.UNSUPPORTED;
    }
  }

  async readHealthData(capability, options = {}) {
    const status = await this.checkCapability(capability);
    if (status !== CAPABILITY_STATUS.SUPPORTED) {
      return { status, records: [] };
    }

    const records = this.localStore.get(capability) || [];
    return { status: CAPABILITY_STATUS.SUPPORTED, records };
  }

  async writeHealthData(capability, record) {
    const status = await this.checkCapability(capability);
    if (status !== CAPABILITY_STATUS.SUPPORTED && status !== CAPABILITY_STATUS.HARDWARE_REQUIRED) {
      return { status, success: false };
    }

    const records = this.localStore.get(capability) || [];
    records.push({ ...record, timestamp: Date.now() });
    this.localStore.set(capability, records);
    return { status: CAPABILITY_STATUS.SUPPORTED, success: true };
  }
}

/**
 * Optional Samsung OEM HealthDataStore Adapter
 * Only initialized when Samsung framework services are legitimately present
 */
class SamsungHealthDataStoreAdapter extends HealthDataStore {
  constructor(options = {}) {
    super();
    this.isSamsungDevice = options.isSamsungDevice || false;
    this.isSamsungAccountConnected = options.isSamsungAccountConnected || false;
    this.isInitialized = false;
  }

  async initialize() {
    if (!this.isSamsungDevice) {
      this.isInitialized = false;
      return false;
    }
    this.isInitialized = true;
    return true;
  }

  async checkCapability(capability) {
    if (!this.isSamsungDevice || !this.isInitialized) {
      return CAPABILITY_STATUS.TEMPORARILY_UNAVAILABLE;
    }
    return CAPABILITY_STATUS.SUPPORTED;
  }
}

module.exports = {
  CAPABILITY_STATUS,
  HEALTH_CAPABILITY,
  DokraAuthProvider,
  GenericStagingAuthProvider,
  DokraApiClient,
  HealthDataStore,
  GenericHealthDataStore,
  SamsungHealthDataStoreAdapter
};
