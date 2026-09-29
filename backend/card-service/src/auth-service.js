/**
 * Dokra Health - Staging Auth & Token Issuer Service MVP
 * Task ID: DOKRA-AUTH-SRV-001
 * 
 * Provides:
 * 1. Token Issuance: POST /v1/auth/staging-token
 * 2. Token Verification for Card API (/v2/servicecard/list, /v1/cards/feed)
 * 3. Standard JWT HS256 signing and claims validation using node:crypto
 */

const crypto = require('crypto');

const DEFAULT_STAGING_CONFIG = {
  issuer: process.env.DOKRA_AUTH_ISSUER || 'dokra-staging-auth',
  audience: process.env.DOKRA_AUTH_AUDIENCE || 'dokra-api-staging',
  environment: process.env.DOKRA_ENV || 'staging',
  ttlSeconds: parseInt(process.env.DOKRA_TOKEN_TTL_SECONDS, 10) || 3600,
  signingKey: process.env.DOKRA_SIGNING_KEY || 'dokra_staging_secret_key_change_in_production_2026'
};

const RECOGNIZED_STAGING_CLIENTS = new Set([
  'dokra-android-dev',
  'dokra-staging-client',
  'dokra-admin-test',
  'dokra-android-staging',
  'dokra-android-google-auth',
  'dokra-android-firebase',
  'dokra-android-google',
  'dokra-mobile-auth',
  'dokra-mobile-app'
]);

const ALLOWED_SCOPES = new Set([
  'cards:read',
  'cards:author',
  'cards:admin',
  'cards:all'
]);

// Base64URL helpers
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

class AuthService {
  constructor(options = {}) {
    this.issuer = options.issuer || DEFAULT_STAGING_CONFIG.issuer;
    this.audience = options.audience || DEFAULT_STAGING_CONFIG.audience;
    this.environment = options.environment || DEFAULT_STAGING_CONFIG.environment;
    this.ttlSeconds = options.ttlSeconds || DEFAULT_STAGING_CONFIG.ttlSeconds;
    this.signingKey = options.signingKey || DEFAULT_STAGING_CONFIG.signingKey;
  }

  /**
   * Validate staging token request parameters
   */
  validateTokenRequest(params) {
    if (!params || typeof params !== 'object') {
      throw new Error('Missing request body.');
    }

    const { client_id, client_flavor, app_version, device_id, scope } = params;

    if (!client_id || typeof client_id !== 'string') {
      throw new Error("Missing or invalid required field 'client_id'.");
    }
    if (!RECOGNIZED_STAGING_CLIENTS.has(client_id)) {
      throw new Error(`Unrecognized staging client_id: '${client_id}'.`);
    }

    if (!client_flavor || client_flavor !== 'staging') {
      throw new Error("Invalid 'client_flavor'. Staging token issuer accepts only 'staging'.");
    }

    if (!app_version || typeof app_version !== 'string' || !/^\d+(\.\d+)+$/.test(app_version)) {
      throw new Error("Invalid 'app_version' format. Expected numeric dot-separated format (e.g. 7.00.6.011).");
    }

    if (!device_id || typeof device_id !== 'string' || device_id.trim().length === 0) {
      throw new Error("Missing or empty 'device_id'.");
    }

    if (!scope || typeof scope !== 'string') {
      throw new Error("Missing or invalid 'scope'.");
    }

    const requestedScopes = scope.split(' ').filter(Boolean);
    for (const s of requestedScopes) {
      if (!ALLOWED_SCOPES.has(s)) {
        throw new Error(`Disallowed or unrecognized scope: '${s}'.`);
      }
    }

    return true;
  }

  /**
   * Issue a signed Dokra Staging Access Token (JWT HS256)
   */
  issueStagingToken(params) {
    this.validateTokenRequest(params);

    const nowSeconds = Math.floor(Date.now() / 1000);
    const expSeconds = nowSeconds + this.ttlSeconds;

    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const payload = {
      iss: this.issuer,
      sub: params.client_id,
      aud: this.audience,
      scope: params.scope,
      env: this.environment,
      app_ver: params.app_version,
      device_id: params.device_id,
      iat: nowSeconds,
      exp: expSeconds
    };

    const headerEncoded = base64UrlEncode(JSON.stringify(header));
    const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
    const signatureInput = `${headerEncoded}.${payloadEncoded}`;

    const signature = crypto
      .createHmac('sha256', this.signingKey)
      .update(signatureInput)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const accessToken = `${signatureInput}.${signature}`;

    return {
      token_type: 'Bearer',
      access_token: accessToken,
      expires_in: this.ttlSeconds,
      scope: params.scope,
      issued_at: new Date(nowSeconds * 1000).toISOString(),
      env: this.environment
    };
  }

  /**
   * Verify an incoming Bearer JWT against Dokra Staging policies
   * @param {string} authHeader e.g. "Bearer eyJhbGci..."
   * @param {string} requiredScope e.g. "cards:read"
   * @returns {{ valid: boolean, code?: number, error?: string, claims?: object }}
   */
  verifyToken(authHeader, requiredScope = 'cards:read') {
    if (!authHeader || typeof authHeader !== 'string') {
      return { valid: false, code: 401, error: 'Unauthorized: Missing Authorization header.' };
    }

    const parts = authHeader.trim().split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return { valid: false, code: 401, error: 'Unauthorized: Invalid Authorization header format. Expected Bearer token.' };
    }

    const token = parts[1];
    const jwtParts = token.split('.');
    if (jwtParts.length !== 3) {
      return { valid: false, code: 401, error: 'Unauthorized: Malformed JWT token structure.' };
    }

    const [headerB64, payloadB64, signatureB64] = jwtParts;

    // Verify signature
    const signatureInput = `${headerB64}.${payloadB64}`;
    const expectedSig = crypto
      .createHmac('sha256', this.signingKey)
      .update(signatureInput)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    // Constant-time comparison
    const sigBuf = Buffer.from(signatureB64);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return { valid: false, code: 401, error: 'Unauthorized: Invalid token signature.' };
    }

    // Parse payload
    let payload;
    try {
      payload = JSON.parse(base64UrlDecode(payloadB64));
    } catch {
      return { valid: false, code: 401, error: 'Unauthorized: Malformed token payload.' };
    }

    const nowSeconds = Math.floor(Date.now() / 1000);

    // Validate claims
    if (payload.exp && nowSeconds > payload.exp) {
      return { valid: false, code: 401, error: 'Unauthorized: Token has expired.' };
    }

    if (payload.iss !== this.issuer) {
      return { valid: false, code: 401, error: `Unauthorized: Invalid token issuer. Expected '${this.issuer}'.` };
    }

    if (payload.aud !== this.audience) {
      return { valid: false, code: 401, error: `Unauthorized: Invalid token audience. Expected '${this.audience}'.` };
    }

    if (payload.env !== this.environment) {
      return { valid: false, code: 401, error: `Unauthorized: Invalid token environment. Expected '${this.environment}'.` };
    }

    // Validate scope with hierarchical role inheritance
    if (requiredScope) {
      const grantedScopes = (payload.scope || '').split(' ').filter(Boolean);
      let hasScope = grantedScopes.includes('cards:all');
      
      if (!hasScope) {
        if (requiredScope === 'cards:read') {
          hasScope = grantedScopes.some(s => ['cards:read', 'cards:author', 'cards:admin'].includes(s));
        } else if (requiredScope === 'cards:author') {
          hasScope = grantedScopes.some(s => ['cards:author', 'cards:admin'].includes(s));
        } else if (requiredScope === 'cards:admin') {
          hasScope = grantedScopes.includes('cards:admin');
        } else {
          hasScope = grantedScopes.includes(requiredScope);
        }
      }

      if (!hasScope) {
        return { valid: false, code: 403, error: `Forbidden: Insufficient token scope. Required '${requiredScope}'.` };
      }
    }

    return { valid: true, claims: payload };
  }
}

module.exports = {
  AuthService,
  DEFAULT_STAGING_CONFIG,
  RECOGNIZED_STAGING_CLIENTS,
  ALLOWED_SCOPES
};
