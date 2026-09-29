const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createCardServer } = require('../src/server');

describe('DOKRA-SPORTS-STEP3-001: Sports & GPS Running Domain Tests', () => {
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

  // Test 1: Discover all Sports domain screens
  test('Test 1: GET /admin/v2/screens?domain=sport returns all seeded Sports screens', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens?domain=sport', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length >= 10, `Expected at least 10 Sports screens, got ${res.body.length}`);

    const screenIds = res.body.map(s => s.id);
    assert.ok(screenIds.includes('scr_sport_live_run_hud'));
    assert.ok(screenIds.includes('scr_sport_pace_coach'));
    assert.ok(screenIds.includes('scr_sport_gpx_trail_route'));
    assert.ok(screenIds.includes('scr_sport_hr_zones_settings'));
    assert.ok(screenIds.includes('scr_sport_cycling_live'));
    assert.ok(screenIds.includes('scr_sport_treadmill_indoor'));
    assert.ok(screenIds.includes('scr_sport_swimming_pool'));
    assert.ok(screenIds.includes('scr_sport_hiit_interval'));
    assert.ok(screenIds.includes('scr_sport_strength_rep_counter'));
    assert.ok(screenIds.includes('scr_sport_workout_summary'));
    assert.ok(screenIds.includes('scr_sport_catalog_selector'));
    assert.ok(screenIds.includes('scr_sport_settings_autolap'));
  });

  // Test 2: Search for Running and GPS HUD
  test('Test 2: GET /admin/v2/screens?search=Running finds running screens', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens?search=Running', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.some(s => s.id === 'scr_sport_live_run_hud' || s.screen_name.includes('Running')));
  });

  // Test 3: Retrieve Live Run HUD details
  test('Test 3: GET /admin/v2/screens/scr_sport_live_run_hud returns metrics, map, and hr zones', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens/scr_sport_live_run_hud', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.id, 'scr_sport_live_run_hud');
    assert.equal(res.body.domain_id, 'sport');

    const config = res.body.config;
    assert.equal(config.distance_km, 5.42);
    assert.equal(config.current_pace, '5:18 /km');
    assert.equal(config.heart_rate_bpm, 148);
    assert.ok(config.hr_zones);
  });

  // Test 4: Update Live Run HUD parameters (Creates Version 2)
  test('Test 4: PUT /admin/v2/screens/scr_sport_live_run_hud creates Version 2 revision', async () => {
    const updatePayload = {
      change_summary: 'Admin adjusted pace target to 4:55 /km and auto-pause threshold',
      config: {
        distance_km: 6.0,
        current_pace: '4:55 /km',
        coach_cue: 'Pace on target: 4:55 /km'
      }
    };

    const res = await httpRequest(
      { path: '/admin/v2/screens/scr_sport_live_run_hud', method: 'PUT' },
      updatePayload
    );

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.version, 2);
    assert.equal(res.body.config.current_pace, '4:55 /km');
  });

  // Test 5: Verify immutable revision history and rollback
  test('Test 5: GET /admin/v2/screens/scr_sport_live_run_hud/revisions and rollback', async () => {
    const revsRes = await httpRequest({ path: '/admin/v2/screens/scr_sport_live_run_hud/revisions', method: 'GET' });
    assert.equal(revsRes.statusCode, 200);
    assert.equal(revsRes.body.length, 2);

    const v1Rev = revsRes.body.find(r => r.version === 1);
    const rollRes = await httpRequest(
      { path: '/admin/v2/screens/scr_sport_live_run_hud/rollback', method: 'POST' },
      { revision_id: v1Rev.revision_id, reason: 'Revert to baseline' }
    );
    assert.equal(rollRes.statusCode, 200);
    assert.equal(rollRes.body.version, 3);
    assert.equal(rollRes.body.config.current_pace, '5:18 /km');
  });
});