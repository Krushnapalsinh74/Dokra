/**
 * Dokra Health - Master Admin & Card Service HTTP Server
 * Task ID: DOKRA-ADMIN-STUDIO-REDESIGN-001
 * 
 * Provides REST endpoints and Web UI for:
 * 1. Master Admin Studio UI (GET /, GET /admin, GET /admin/studio)
 * 2. Dashboard Analytics & Telemetry API (/admin/v1/dashboard/metrics)
 * 3. Feature Flags API (/admin/v1/feature-flags)
 * 4. Remote App Config API (/admin/v1/app-config)
 * 5. Notifications Broadcast API (/admin/v1/notifications)
 * 6. Users Directory API (/admin/v1/users)
 * 7. Master Admin Card Studio API (/admin/v1/cards/*)
 * 8. Mobile Feed (/v2/servicecard/list) & Auth (/v1/auth/staging-token)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { CardDatabase } = require('./database');
const { FeedService } = require('./feed-service');
const { AdminService } = require('./admin-service');
const { AuthService } = require('./auth-service');
const { renderCardStudioHtml } = require('./studio-ui');

function createCardServer(options = {}) {
  const db = options.database || new CardDatabase(options.dbPath || ':memory:');
  const feedService = new FeedService(db);
  const adminService = new AdminService(db);
  const authService = options.authService || new AuthService(options.authOptions || {});
  const isDevMode = options.isDevMode !== undefined ? options.isDevMode : false;
  const requireAuth = options.requireAuth !== undefined ? options.requireAuth : (!isDevMode);

  const liveSyncClients = new Set();
  const broadcastSync = (event, data = {}) => {
    const payload = `event: ${event}\ndata: ${JSON.stringify({ timestamp: new Date().toISOString(), event, ...data })}\n\n`;
    for (const client of liveSyncClients) {
      try {
        client.write(payload);
      } catch (_) {
        liveSyncClients.delete(client);
      }
    }
  };

  const server = http.createServer(async (req, res) => {
    // Helper to send JSON
    const sendJson = (statusCode, data, headers = {}) => {
      const body = JSON.stringify(data);
      res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Actor-Id, If-None-Match',
        ...headers
      });
      res.end(body);
    };

    // Helper to send HTML
    const sendHtml = (statusCode, html) => {
      res.writeHead(statusCode, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': Buffer.byteLength(html),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Actor-Id, If-None-Match'
      });
      res.end(html);
    };

    // Helper to read JSON body (2 MB cap; robust against unexpected EOF)
    const readJsonBody = () => {
      return new Promise((resolve, reject) => {
        const MAX_BODY_BYTES = 2 * 1024 * 1024; // 2 MB
        let bodyStr = '';
        let byteLen = 0;
        let settled = false;

        const done = (err, value) => {
          if (settled) return;
          settled = true;
          // Drain & destroy the stream to free resources
          req.unpipe && req.unpipe();
          if (err) return reject(err);
          resolve(value);
        };

        req.on('data', chunk => {
          byteLen += chunk.length;
          if (byteLen > MAX_BODY_BYTES) {
            req.destroy();
            return done(new Error('Request body too large (max 2 MB).'));
          }
          bodyStr += chunk.toString('utf8');
        });

        req.on('end', () => {
          if (!bodyStr || bodyStr.trim().length === 0) {
            return done(null, {});
          }
          try {
            done(null, JSON.parse(bodyStr));
          } catch (err) {
            done(new Error(`Malformed JSON request: ${err.message}`));
          }
        });

        req.on('error', err => {
          // Swallow EOF/connection-reset errors – treat as empty body
          if (err.code === 'ECONNRESET' || err.code === 'ECONNABORTED' || err.message.includes('EOF')) {
            return done(null, {});
          }
          done(err);
        });

        req.on('aborted', () => done(null, {}));
        req.on('close', () => {
          // If stream closed before 'end' fired, resolve with whatever we have
          if (!settled) {
            if (!bodyStr || bodyStr.trim().length === 0) {
              return done(null, {});
            }
            try {
              done(null, JSON.parse(bodyStr));
            } catch {
              done(null, {});
            }
          }
        });
      });
    };

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Actor-Id, If-None-Match'
      });
      return res.end();
    }

    // RBAC Authorization check
    const authorizeAdmin = (requiredScope) => {
      if (!requireAuth && !req.headers.authorization) {
        return { authorized: true, actorId: req.headers['x-actor-id'] || 'admin_dev' };
      }
      const authResult = authService.verifyToken(req.headers.authorization, requiredScope);
      if (!authResult.valid) {
        return { authorized: false, code: authResult.code || 401, error: authResult.error };
      }
      const actorId = authResult.claims?.sub || req.headers['x-actor-id'] || 'admin_authenticated';
      return { authorized: true, actorId };
    };

    try {
      const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const pathname = parsedUrl.pathname;
      const method = req.method;

      // 1. Health check
      if (method === 'GET' && pathname === '/health') {
        return sendJson(200, { status: 'OK', service: 'dokra-card-service', timestamp: new Date().toISOString() });
      }

      // 1b. Static Logo & Assets Serving
      if (method === 'GET' && (pathname === '/assets/dokra-logo.png' || pathname === '/dokra-logo.png' || pathname === '/favicon.ico' || pathname.startsWith('/assets/'))) {
        const logoPath = path.resolve(__dirname, '../public/assets/dokra-logo.png');
        if (fs.existsSync(logoPath)) {
          const stat = fs.statSync(logoPath);
          res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': stat.size,
            'Cache-Control': 'public, max-age=86400',
            'Access-Control-Allow-Origin': '*'
          });
          return fs.createReadStream(logoPath).pipe(res);
        }
      }

      // 2. Master Admin Studio Web UI
      if (method === 'GET' && (pathname === '/' || pathname === '/admin' || pathname === '/admin/' || pathname === '/admin/studio')) {
        return sendHtml(200, renderCardStudioHtml());
      }

      // 2a. Real-Time Live Sync Server-Sent Events (SSE) Endpoint (< 1s sync with mobile app & preview)
      if (method === 'GET' && (pathname === '/v1/events/live-sync' || pathname === '/admin/v1/live-sync')) {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*'
        });
        res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Dokra Real-Time Live Sync Active', timestamp: new Date().toISOString() })}\n\n`);
        liveSyncClients.add(res);
        req.on('close', () => {
          liveSyncClients.delete(res);
        });
        return;
      }

      // 2b. Mobile Live Screen State APIs
      if (method === 'GET' && pathname === '/admin/v1/mobile-state') {
        const state = db.getMobileState();
        return sendJson(200, state);
      }

      if ((method === 'PUT' || method === 'POST') && pathname === '/admin/v1/mobile-state') {
        const body = await readJsonBody();
        const updated = db.updateMobileState(body);
        broadcastSync('mobile_state_update', { state: updated });
        return sendJson(200, updated);
      }

      // 2c. Screen Content Deep CMS APIs
      if (method === 'GET' && pathname === '/admin/v1/screens') {
        const domain = parsedUrl.searchParams.get('domain');
        const screens = db.listScreens(domain);
        return sendJson(200, screens);
      }

      const scrMatch = pathname.match(/^\/admin\/v1\/screens\/([a-zA-Z0-9_\-]+)$/);
      if (scrMatch && method === 'GET') {
        const key = scrMatch[1];
        const scr = db.getScreen(key);
        if (!scr) return sendJson(404, { error: 'Screen not found' });
        return sendJson(200, scr);
      }

      if (scrMatch && (method === 'PUT' || method === 'POST')) {
        const key = scrMatch[1];
        const body = await readJsonBody();
        const updated = db.updateScreen(key, body);
        broadcastSync('screen_update', { key, screen: updated });
        return sendJson(200, updated);
      }

      // 2c2. Master Screen Registry (v2 API): Deep CMS, Revisions, Rollback & Trash
      if (method === 'GET' && pathname === '/admin/v2/screens') {
        const domain = parsedUrl.searchParams.get('domain');
        const search = parsedUrl.searchParams.get('search');
        const status = parsedUrl.searchParams.get('status') || 'active';
        const type = parsedUrl.searchParams.get('type');
        const screens = db.listScreenRegistry({ domain, search, status, type });
        return sendJson(200, screens);
      }

      if (method === 'GET' && pathname === '/admin/v2/recycle-bin') {
        const items = db.listRecycleBin();
        return sendJson(200, items);
      }

      if (method === 'GET' && pathname === '/admin/v2/audit-logs') {
        const targetId = parsedUrl.searchParams.get('targetId');
        const limit = parseInt(parsedUrl.searchParams.get('limit')) || 100;
        const logs = db.listDeepAuditEvents({ targetId, limit });
        return sendJson(200, logs);
      }

      const scrRegMatch = pathname.match(/^\/admin\/v2\/screens\/([a-zA-Z0-9_\-]+)(\/.*)?$/);
      if (scrRegMatch) {
        const screenId = scrRegMatch[1];
        const subRoute = scrRegMatch[2] || '';
        const actorId = req.headers['x-actor-id'] || 'master_admin';

        // GET /admin/v2/screens/:id
        if (method === 'GET' && subRoute === '') {
          const scr = db.getScreenDetail(screenId);
          if (!scr) return sendJson(404, { error: `Screen '${screenId}' not found.` });
          return sendJson(200, scr);
        }

        // PUT /admin/v2/screens/:id
        if ((method === 'PUT' || method === 'POST') && subRoute === '') {
          const body = await readJsonBody();
          const changeSummary = body.change_summary || body.changeSummary || 'Screen parameters updated via Master Admin';
          const updated = db.saveScreenRevision(screenId, body, actorId, changeSummary);
          broadcastSync('screen_registry_update', { screenId, screen: updated });
          return sendJson(200, updated);
        }

        // POST /admin/v2/screens/:id/rollback
        if (method === 'POST' && subRoute === '/rollback') {
          const body = await readJsonBody();
          let revisionId = body.revision_id || body.revisionId;
          if (!revisionId && (body.target_version !== undefined || body.version !== undefined)) {
            const targetVer = parseInt(body.target_version !== undefined ? body.target_version : body.version);
            const revs = db.listScreenRevisions(screenId);
            const matchingRev = revs.find(r => r.version === targetVer);
            if (matchingRev) revisionId = matchingRev.revision_id;
          }
          if (!revisionId) return sendJson(400, { error: "Missing 'revision_id' or valid 'target_version' in rollback payload." });
          const reason = body.reason || 'Restored via Master Admin Rollback';
          const restored = db.rollbackScreenRevision(screenId, revisionId, actorId, reason);
          broadcastSync('screen_registry_rollback', { screenId, screen: restored, revisionId });
          return sendJson(200, restored);
        }

        // DELETE /admin/v2/screens/:id (Soft-delete to Recycle Bin)
        if (method === 'DELETE' && subRoute === '') {
          const result = db.softDeleteScreen(screenId, actorId);
          broadcastSync('screen_registry_deleted', { screenId });
          return sendJson(200, result);
        }

        // POST /admin/v2/screens/:id/restore
        if (method === 'POST' && subRoute === '/restore') {
          const restored = db.restoreScreen(screenId, actorId);
          broadcastSync('screen_registry_restored', { screenId, screen: restored });
          return sendJson(200, restored);
        }

        // GET /admin/v2/screens/:id/revisions
        if (method === 'GET' && subRoute === '/revisions') {
          const revisions = db.listScreenRevisions(screenId);
          return sendJson(200, revisions);
        }
      }

      // Permanent delete from recycle bin: DELETE /admin/v2/recycle-bin/:id
      const binMatch = pathname.match(/^\/admin\/v2\/recycle-bin\/([a-zA-Z0-9_\-]+)$/);
      if (binMatch && method === 'DELETE') {
        const itemId = binMatch[1];
        const actorId = req.headers['x-actor-id'] || 'master_admin';
        const result = db.permanentDeleteScreen(itemId, actorId);
        broadcastSync('recycle_bin_purged', { itemId });
        return sendJson(200, result);
      }

      // 2d. Sports Catalog APIs
      if (method === 'GET' && pathname === '/admin/v1/sports') {
        const sports = db.listSports();
        return sendJson(200, sports);
      }

      const spMatch = pathname.match(/^\/admin\/v1\/sports\/([a-zA-Z0-9_\-]+)$/);
      if (spMatch && (method === 'PUT' || method === 'POST')) {
        const id = spMatch[1];
        const body = await readJsonBody();
        const updated = db.updateSport(id, body);
        broadcastSync('sport_update', { id, sport: updated });
        return sendJson(200, updated);
      }

      // 2e. Wearables & Accessories APIs
      if (method === 'GET' && pathname === '/admin/v1/wearables') {
        const wearables = db.listWearables();
        return sendJson(200, wearables);
      }

      const wearMatch = pathname.match(/^\/admin\/v1\/wearables\/([a-zA-Z0-9_\-]+)$/);
      if (wearMatch && (method === 'PUT' || method === 'POST')) {
        const id = wearMatch[1];
        const body = await readJsonBody();
        const updated = db.updateWearable(id, body);
        broadcastSync('wearable_update', { id, wearable: updated });
        return sendJson(200, updated);
      }

      // 2b. Direct APK Download Endpoints
      if (method === 'GET' && (pathname === '/download/apk' || pathname === '/download/dokra-health.apk')) {
        const apkPath = path.resolve(__dirname, '../../Dokra Health.apk');
        if (fs.existsSync(apkPath)) {
          const stat = fs.statSync(apkPath);
          res.writeHead(200, {
            'Content-Type': 'application/vnd.android.package-archive',
            'Content-Length': stat.size,
            'Content-Disposition': 'attachment; filename="Dokra Health.apk"'
          });
          return fs.createReadStream(apkPath).pipe(res);
        } else {
          return sendJson(404, { error: 'APK is currently being assembled. Please retry in 10 seconds.' });
        }
      }

      if (method === 'GET' && pathname === '/download/standalone-apk') {
        const apkPath = path.resolve(__dirname, '../../Dokra Health (Standalone).apk');
        if (fs.existsSync(apkPath)) {
          const stat = fs.statSync(apkPath);
          res.writeHead(200, {
            'Content-Type': 'application/vnd.android.package-archive',
            'Content-Length': stat.size,
            'Content-Disposition': 'attachment; filename="Dokra Health (Standalone).apk"'
          });
          return fs.createReadStream(apkPath).pipe(res);
        } else {
          return sendJson(404, { error: 'APK is currently being assembled. Please retry in 10 seconds.' });
        }
      }

      // 3. Staging Auth Endpoint: POST /v1/auth/staging-token
      if (method === 'POST' && pathname === '/v1/auth/staging-token') {
        const body = await readJsonBody();
        try {
          const tokenResult = authService.issueStagingToken(body);
          return sendJson(200, tokenResult);
        } catch (err) {
          return sendJson(400, { error: err.message });
        }
      }

      // 3b. Native Google Auth Endpoint: POST /v1/auth/google-login
      if (method === 'POST' && pathname === '/v1/auth/google-login') {
        const body = await readJsonBody();
        const email = body.email || 'user@gmail.com';
        const name = body.name || 'Dokra Health Athlete';
        const photoUrl = body.photoUrl || '';
        const googleId = body.googleId || body.idToken?.slice(0, 16) || 'google_' + Date.now();

        try {
          const tokenResult = authService.issueStagingToken({
            client_id: 'dokra-android-staging',
            client_flavor: 'staging',
            scope: 'cards:read',
            app_version: '2.0.0',
            device_id: body.device_id || 'android_' + googleId
          });

          // Ensure user registered in DB
          try {
            db.createUser({
              id: 'usr_' + googleId,
              email,
              name,
              role: 'user',
              auth_provider: 'google'
            });
          } catch (_) {}

          return sendJson(200, {
            success: true,
            user: { id: 'usr_' + googleId, email, name, role: 'user', photoUrl, provider: 'google' },
            access_token: tokenResult.access_token,
            expires_in: tokenResult.expires_in,
            token_type: 'Bearer'
          });
        } catch (err) {
          return sendJson(400, { error: err.message });
        }
      }

      // 3c. Firebase Auth & Sign-Up Endpoint: POST /v1/auth/firebase-login / POST /v1/auth/signup
      if (method === 'POST' && (pathname === '/v1/auth/firebase-login' || pathname === '/v1/auth/signup' || pathname === '/v1/auth/login')) {
        const body = await readJsonBody();
        const email = body.email || 'runner@dokrahealth.com';
        const name = body.name || (email.split('@')[0]) || 'Dokra Runner';
        const uid = body.uid || body.firebaseUid || 'fb_' + Date.now();

        try {
          const tokenResult = authService.issueStagingToken({
            client_id: 'dokra-android-firebase',
            client_flavor: 'staging',
            scope: 'cards:read',
            app_version: '2.0.0',
            device_id: body.device_id || 'android_' + uid
          });

          try {
            db.createUser({
              id: 'usr_' + uid,
              email,
              name,
              role: 'user',
              auth_provider: 'firebase'
            });
          } catch (_) {}

          return sendJson(200, {
            success: true,
            user: { id: 'usr_' + uid, email, name, role: 'user', provider: 'firebase' },
            access_token: tokenResult.access_token,
            expires_in: tokenResult.expires_in,
            token_type: 'Bearer'
          });
        } catch (err) {
          return sendJson(400, { error: err.message });
        }
      }

      // 4. Mobile Feed Endpoints: GET /v2/servicecard/list OR GET /v1/cards/feed
      if (method === 'GET' && (pathname === '/v2/servicecard/list' || pathname === '/v1/cards/feed')) {
        const country = parsedUrl.searchParams.get('country');
        const lang = parsedUrl.searchParams.get('lang');
        const app_ver = parsedUrl.searchParams.get('app_ver');

        if (requireAuth || req.headers.authorization) {
          const authResult = authService.verifyToken(req.headers.authorization, 'cards:read');
          if (!authResult.valid) {
            return sendJson(authResult.code || 401, { error: authResult.error });
          }
        }

        const feedResult = feedService.getFeed({ country, lang, app_ver });
        const ifNoneMatch = req.headers['if-none-match'];

        if (ifNoneMatch && ifNoneMatch === feedResult.etag) {
          res.writeHead(304, {
            'ETag': feedResult.etag,
            'Cache-Control': 'no-cache'
          });
          return res.end();
        }

        return sendJson(200, feedResult.cards, {
          'ETag': feedResult.etag,
          'Cache-Control': 'no-cache'
        });
      }

      // 5. Dashboard Metrics & Analytics: GET /admin/v1/dashboard/metrics
      if (method === 'GET' && pathname === '/admin/v1/dashboard/metrics') {
        const metrics = db.getDashboardMetrics();
        return sendJson(200, metrics);
      }

      // 6. Feature Flags APIs
      if (method === 'GET' && pathname === '/admin/v1/feature-flags') {
        const flags = db.listFeatureFlags();
        return sendJson(200, flags);
      }

      if (method === 'POST' && pathname === '/admin/v1/feature-flags') {
        const body = await readJsonBody();
        const created = db.createFeatureFlag(body);
        return sendJson(201, created);
      }

      const flagMatch = pathname.match(/^\/admin\/v1\/feature-flags\/([a-zA-Z0-9_\-]+)$/);
      if (flagMatch && (method === 'PUT' || method === 'POST')) {
        const key = flagMatch[1];
        const body = await readJsonBody();
        const updated = db.updateFeatureFlag(key, body);
        return sendJson(200, updated);
      }

      if (flagMatch && method === 'DELETE') {
        const key = flagMatch[1];
        const deleteResult = db.deleteFeatureFlag(key);
        return sendJson(200, deleteResult);
      }

      // 7. Remote App Config APIs
      if (method === 'GET' && pathname === '/admin/v1/app-config') {
        const configs = db.listAppConfig();
        return sendJson(200, configs);
      }

      if (method === 'POST' && pathname === '/admin/v1/app-config') {
        const body = await readJsonBody();
        const created = db.createAppConfig(body);
        return sendJson(201, created);
      }

      const configMatch = pathname.match(/^\/admin\/v1\/app-config\/([a-zA-Z0-9_\-]+)$/);
      if (configMatch && (method === 'PUT' || method === 'POST')) {
        const key = configMatch[1];
        const body = await readJsonBody();
        const updated = db.updateAppConfig(key, body.value);
        return sendJson(200, updated);
      }

      if (configMatch && method === 'DELETE') {
        const key = configMatch[1];
        const deleteResult = db.deleteAppConfig(key);
        return sendJson(200, deleteResult);
      }

      // 7b. App Settings (General, Flavors, Build, Features)
      if (method === 'GET' && pathname === '/admin/v1/app-settings') {
        const settings = db.getAppSettings();
        return sendJson(200, settings);
      }

      if ((method === 'POST' || method === 'PUT') && pathname === '/admin/v1/app-settings') {
        const body = await readJsonBody();
        const updated = db.updateAppSettings(body);
        return sendJson(200, updated);
      }

      if (method === 'GET' && pathname === '/admin/v1/recent-changes') {
        const changes = db.getRecentChanges();
        return sendJson(200, changes);
      }

      if (method === 'POST' && pathname === '/admin/v1/recent-changes') {
        const body = await readJsonBody();
        db.addRecentChange(body.action, body.actor || 'admin');
        return sendJson(201, { success: true });
      }

      // 7c. Health Modules API
      if (method === 'GET' && pathname === '/admin/v1/health-modules') {
        const modules = db.listHealthModules();
        return sendJson(200, modules);
      }

      const modMatch = pathname.match(/^\/admin\/v1\/health-modules\/([a-zA-Z0-9_\-]+)$/);
      if (modMatch && (method === 'PUT' || method === 'POST')) {
        const id = modMatch[1];
        const body = await readJsonBody();
        const updated = db.updateHealthModule(id, body);
        return sendJson(200, updated);
      }

      if (method === 'POST' && pathname === '/admin/v1/health-modules') {
        const body = await readJsonBody();
        const created = db.createHealthModule(body);
        return sendJson(201, created);
      }

      // 7d. Workouts API
      if (method === 'GET' && pathname === '/admin/v1/workouts') {
        const workouts = db.listWorkouts();
        return sendJson(200, workouts);
      }

      if (method === 'GET' && pathname === '/admin/v1/workouts/stats') {
        const stats = db.getWorkoutStats();
        return sendJson(200, stats);
      }

      const workoutMatch = pathname.match(/^\/admin\/v1\/workouts\/([a-zA-Z0-9_\-]+)$/);
      if (workoutMatch && method === 'GET') {
        const id = workoutMatch[1];
        const w = db.getWorkout(id);
        if (!w) return sendJson(404, { error: 'Workout not found' });
        return sendJson(200, w);
      }

      if (workoutMatch && method === 'DELETE') {
        const id = workoutMatch[1];
        const deleteResult = db.deleteWorkout(id);
        return sendJson(200, deleteResult);
      }

      if (method === 'POST' && pathname === '/admin/v1/workouts') {
        const body = await readJsonBody();
        const created = db.createWorkout(body);
        return sendJson(201, created);
      }

      // 7e. Medications API
      if (method === 'GET' && pathname === '/admin/v1/medications') {
        const meds = db.listMedications();
        return sendJson(200, meds);
      }

      if (method === 'GET' && pathname === '/admin/v1/medications/kpis') {
        const kpis = db.getMedicationKPIs();
        return sendJson(200, kpis);
      }

      if (method === 'GET' && pathname === '/admin/v1/medications/history') {
        const hist = db.getMedicationHistory();
        return sendJson(200, hist);
      }

      if (method === 'POST' && pathname === '/admin/v1/medications/history') {
        const body = await readJsonBody();
        const created = db.addMedicationHistory(body);
        return sendJson(201, created);
      }

      const medMatch = pathname.match(/^\/admin\/v1\/medications\/([a-zA-Z0-9_\-]+)$/);
      if (medMatch && method === 'GET') {
        const id = medMatch[1];
        const med = db.getMedication(id);
        if (!med) return sendJson(404, { error: 'Medication not found' });
        return sendJson(200, med);
      }

      if (medMatch && (method === 'PUT' || method === 'POST')) {
        const id = medMatch[1];
        const body = await readJsonBody();
        const updated = db.updateMedication(id, body);
        return sendJson(200, updated);
      }

      if (medMatch && method === 'DELETE') {
        const id = medMatch[1];
        const deleteResult = db.deleteMedication(id);
        return sendJson(200, deleteResult);
      }

      if (method === 'POST' && pathname === '/admin/v1/medications') {
        const body = await readJsonBody();
        const created = db.createMedication(body);
        return sendJson(201, created);
      }

      // 8. Notifications APIs
      if (method === 'GET' && pathname === '/admin/v1/notifications') {
        const notifs = db.listNotifications();
        return sendJson(200, notifs);
      }

      if (method === 'POST' && pathname === '/admin/v1/notifications/send') {
        const body = await readJsonBody();
        const sent = db.sendNotification(body);
        return sendJson(201, sent);
      }

      // 9. Users APIs
      if (method === 'GET' && pathname === '/admin/v1/users') {
        const users = db.listUsers();
        return sendJson(200, users);
      }

      if (method === 'POST' && pathname === '/admin/v1/users') {
        const body = await readJsonBody();
        const user = db.createUser(body);
        return sendJson(201, user);
      }

      const userMatch = pathname.match(/^\/admin\/v1\/users\/([a-zA-Z0-9_\-]+)\/role$/);
      if (userMatch && method === 'PUT') {
        const userId = userMatch[1];
        const body = await readJsonBody();
        const updated = db.updateUserRole(userId, body.role);
        return sendJson(200, updated);
      }

      // 10. Audit Log APIs: GET /admin/v1/audit/all
      if (method === 'GET' && pathname === '/admin/v1/audit/all') {
        const events = db.listAuditEvents();
        return sendJson(200, events);
      }

      // 11. Admin Card Studio APIs
      // POST /admin/v1/cards (Create Draft)
      if (method === 'POST' && pathname === '/admin/v1/cards') {
        const auth = authorizeAdmin('cards:author');
        if (!auth.authorized) return sendJson(auth.code, { error: auth.error });

        const body = await readJsonBody();
        try {
          const created = adminService.createDraft(body, auth.actorId);
          broadcastSync('card_created', { cardId: created.id, card: created });
          return sendJson(201, created);
        } catch (validationErr) {
          return sendJson(400, { error: validationErr.message });
        }
      }

      // GET /admin/v1/cards (List Cards)
      if (method === 'GET' && pathname === '/admin/v1/cards') {
        const auth = authorizeAdmin('cards:read');
        if (!auth.authorized) return sendJson(auth.code, { error: auth.error });

        const cards = adminService.listCards();
        return sendJson(200, cards);
      }

      // Card parameter routes: /admin/v1/cards/:id...
      const adminCardMatch = pathname.match(/^\/admin\/v1\/cards\/([a-zA-Z0-9_\-]+)(\/.*)?$/);
      if (adminCardMatch) {
        const cardId = adminCardMatch[1];
        const subRoute = adminCardMatch[2] || '';

        // GET /admin/v1/cards/:id
        if (method === 'GET' && subRoute === '') {
          const auth = authorizeAdmin('cards:read');
          if (!auth.authorized) return sendJson(auth.code, { error: auth.error });

          const card = adminService.getCard(cardId);
          return sendJson(200, card);
        }

        // PUT /admin/v1/cards/:id (Update Draft)
        if (method === 'PUT' && subRoute === '') {
          const auth = authorizeAdmin('cards:author');
          if (!auth.authorized) return sendJson(auth.code, { error: auth.error });

          const body = await readJsonBody();
          try {
            const updated = adminService.updateDraft(cardId, body, auth.actorId);
            broadcastSync('card_updated', { cardId, card: updated });
            return sendJson(200, updated);
          } catch (validationErr) {
            return sendJson(400, { error: validationErr.message });
          }
        }

        // DELETE /admin/v1/cards/:id
        if (method === 'DELETE' && subRoute === '') {
          const auth = authorizeAdmin('cards:admin');
          if (!auth.authorized) return sendJson(auth.code, { error: auth.error });

          const result = adminService.deleteCard(cardId, auth.actorId);
          broadcastSync('card_deleted', { cardId });
          return sendJson(200, result);
        }

        // POST /admin/v1/cards/:id/publish
        if (method === 'POST' && subRoute === '/publish') {
          const auth = authorizeAdmin('cards:admin');
          if (!auth.authorized) return sendJson(auth.code, { error: auth.error });

          const body = await readJsonBody();
          const changeSummary = body.changeSummary || 'Card published';
          try {
            const published = adminService.publishCard(cardId, auth.actorId, changeSummary);
            broadcastSync('card_published', { cardId, card: published });
            return sendJson(200, published);
          } catch (validationErr) {
            return sendJson(400, { error: validationErr.message });
          }
        }

        // POST /admin/v1/cards/:id/unpublish
        if (method === 'POST' && subRoute === '/unpublish') {
          const auth = authorizeAdmin('cards:admin');
          if (!auth.authorized) return sendJson(auth.code, { error: auth.error });

          const body = await readJsonBody();
          const unpublished = adminService.unpublishCard(cardId, auth.actorId, body.reason);
          broadcastSync('card_unpublished', { cardId });
          return sendJson(200, unpublished);
        }

        // POST /admin/v1/cards/:id/duplicate
        if (method === 'POST' && subRoute === '/duplicate') {
          const auth = authorizeAdmin('cards:author');
          if (!auth.authorized) return sendJson(auth.code, { error: auth.error });

          const duplicated = adminService.duplicateCard(cardId, auth.actorId);
          broadcastSync('card_duplicated', { cardId: duplicated.id, card: duplicated });
          return sendJson(201, duplicated);
        }

        // POST /admin/v1/cards/:id/rollback
        if (method === 'POST' && subRoute === '/rollback') {
          const auth = authorizeAdmin('cards:admin');
          if (!auth.authorized) return sendJson(auth.code, { error: auth.error });

          const body = await readJsonBody();
          const revId = body.targetRevisionId || body.revisionId;
          if (!revId) {
            return sendJson(400, { error: "Missing 'revisionId' or 'targetRevisionId' in request body." });
          }
          const restored = adminService.rollbackCard(cardId, revId, auth.actorId, body.reason);
          return sendJson(200, restored);
        }

        // GET /admin/v1/cards/:id/revisions
        if (method === 'GET' && subRoute === '/revisions') {
          const auth = authorizeAdmin('cards:read');
          if (!auth.authorized) return sendJson(auth.code, { error: auth.error });

          const revisions = adminService.listRevisions(cardId);
          return sendJson(200, revisions);
        }

        // GET /admin/v1/cards/:id/audit
        if (method === 'GET' && subRoute === '/audit') {
          const auth = authorizeAdmin('cards:read');
          if (!auth.authorized) return sendJson(auth.code, { error: auth.error });

          const events = adminService.listAuditEvents(cardId);
          return sendJson(200, events);
        }
      }

      // 404 Route Not Found
      return sendJson(404, { error: `Endpoint '${method} ${pathname}' not found.` });

    } catch (err) {
      console.error('Server Internal Error:', err);
      return sendJson(err.status || 500, { error: err.message || 'Internal Server Error' });
    }
  });

  return {
    server,
    db,
    feedService,
    adminService,
    authService,
    listen: (port, host) => {
      return new Promise((resolve, reject) => {
        server.listen(port, host, () => {
          const addr = server.address();
          const actualPort = typeof addr === 'object' && addr ? addr.port : port;
          resolve({ port: actualPort, host });
        });
        server.on('error', reject);
      });
    },
    close: () => {
      return new Promise((resolve) => {
        server.close(() => {
          db.close();
          resolve();
        });
      });
    }
  };
}

// Standalone execution entry point
if (require.main === module) {
  const PORT = process.env.PORT || 8080;
  const HOST = process.env.HOST || '0.0.0.0';
  const DB_PATH = process.env.DB_PATH || './data/card-service.db';

  const app = createCardServer({ dbPath: DB_PATH, requireAuth: false });
  app.listen(PORT, HOST).then(({ port, host }) => {
    console.log(`=== Dokra Master Admin Studio running on http://${host}:${port} ===`);
    console.log(`- Web Studio URL:           http://${host}:${port}/admin/studio`);
    console.log(`- Mobile Feed Endpoint:     http://${host}:${port}/v2/servicecard/list`);
    console.log(`- Staging Auth Token API:   http://${host}:${port}/v1/auth/staging-token`);
    console.log(`- Admin APIs:               http://${host}:${port}/admin/v1/*`);
    console.log(`- SQLite Database:          ${DB_PATH}`);
  }).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = {
  createCardServer
};
