const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createCardServer } = require('../src/server');

describe('DOKRA-SLEEP-STEP4-001: Sleep & Sleep Coaching Domain Suite', () => {
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

  // Test 1: Discover all 14 Sleep domain screens
  test('Test 1: GET /admin/v2/screens?domain=sleep returns all 14 seeded Sleep & Coaching screens', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens?domain=sleep', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length >= 14, `Expected 14 Sleep screens, got ${res.body.length}`);

    const screenIds = res.body.map(s => s.id);
    assert.ok(screenIds.includes('scr_sleep_main_dashboard'), 'scr_sleep_main_dashboard missing');
    assert.ok(screenIds.includes('scr_sleep_score_contributors'), 'scr_sleep_score_contributors missing');
    assert.ok(screenIds.includes('scr_sleep_stages_hypnogram'), 'scr_sleep_stages_hypnogram missing');
    assert.ok(screenIds.includes('scr_sleep_coaching_persona_hub'), 'scr_sleep_coaching_persona_hub missing');
    assert.ok(screenIds.includes('scr_sleep_snoring_audio_detail'), 'scr_sleep_snoring_audio_detail missing');
    assert.ok(screenIds.includes('scr_sleep_blood_oxygen_apnea'), 'scr_sleep_blood_oxygen_apnea missing');
    assert.ok(screenIds.includes('scr_sleep_skin_temperature'), 'scr_sleep_skin_temperature missing');
    assert.ok(screenIds.includes('scr_sleep_respiratory_rate'), 'scr_sleep_respiratory_rate missing');
    assert.ok(screenIds.includes('scr_sleep_bedtime_guidance_goals'), 'scr_sleep_bedtime_guidance_goals missing');
    assert.ok(screenIds.includes('scr_sleep_consistency_regularity'), 'scr_sleep_consistency_regularity missing');
    assert.ok(screenIds.includes('scr_sleep_history_trends_chart'), 'scr_sleep_history_trends_chart missing');
    assert.ok(screenIds.includes('scr_sleep_rewards_streaks'), 'scr_sleep_rewards_streaks missing');
    assert.ok(screenIds.includes('scr_sleep_widget_oneui_settings'), 'scr_sleep_widget_oneui_settings missing');
    assert.ok(screenIds.includes('scr_sleep_advanced_settings'), 'scr_sleep_advanced_settings missing');
  });

  // Test 2: Search sleep screens by keyword
  test('Test 2: GET /admin/v2/screens?search=Sleep finds all Sleep domain screens', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens?search=Sleep', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length >= 10);
  });

  // Test 3: Search for Snoring and SpO2 Blood Oxygen
  test('Test 3: Search finds Snoring and SpO2 screens', async () => {
    const resSnore = await httpRequest({ path: '/admin/v2/screens?search=Snoring', method: 'GET' });
    assert.equal(resSnore.statusCode, 200);
    assert.ok(resSnore.body.some(s => s.id === 'scr_sleep_snoring_audio_detail' || s.screen_name.includes('Snoring')));

    const resSpo2 = await httpRequest({ path: '/admin/v2/screens?search=Oxygen', method: 'GET' });
    assert.equal(resSpo2.statusCode, 200);
    assert.ok(resSpo2.body.some(s => s.id === 'scr_sleep_blood_oxygen_apnea' || s.screen_name.includes('Oxygen')));
  });

  // Test 4: Search for Animal Persona and Coaching
  test('Test 4: Search finds Animal Persona and Coaching screens', async () => {
    const resPersona = await httpRequest({ path: '/admin/v2/screens?search=Persona', method: 'GET' });
    assert.equal(resPersona.statusCode, 200);
    assert.ok(resPersona.body.some(s => s.id === 'scr_sleep_coaching_persona_hub' || s.screen_name.includes('Persona')));
  });

  // Test 5: Retrieve deep layout, style, config, and stages for Main Sleep Dashboard
  test('Test 5: GET /admin/v2/screens/scr_sleep_main_dashboard returns 4 sleep stages and hypnogram telemetry', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens/scr_sleep_main_dashboard', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.id, 'scr_sleep_main_dashboard');
    assert.equal(res.body.domain_id, 'sleep');

    const config = res.body.config;
    assert.equal(config.sleep_score, 88);
    assert.equal(config.sleep_quality_label, 'Optimal / Restorative');
    assert.equal(config.sleep_duration_display, '7h 42m');
    assert.equal(config.hypnogram_stages.deep.pct, 20);
    assert.equal(config.hypnogram_stages.rem.pct, 24);
    assert.equal(config.hypnogram_stages.light.pct, 49);
    assert.equal(config.hypnogram_stages.awake.pct, 7);
    assert.equal(config.animal_persona.id, 'lion');
    assert.equal(config.snoring_summary.threshold_db, 50);
    assert.equal(config.spo2_summary.mean_spo2_pct, 97);
    assert.equal(config.skin_temp_summary.variation_celsius, -0.3);
    assert.equal(config.respiratory_summary.avg_rpm, 14.2);
  });

  // Test 6: Verify 5 Sleep Score Contributors based on APK rule table
  test('Test 6: GET /admin/v2/screens/scr_sleep_score_contributors returns 5 factor contributors', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens/scr_sleep_score_contributors', method: 'GET' });
    assert.equal(res.statusCode, 200);

    const contributors = res.body.config.contributors;
    assert.ok(Array.isArray(contributors));
    assert.equal(contributors.length, 5);
    const ids = contributors.map(c => c.id);
    assert.ok(ids.includes('total_sleep_time'), 'Missing total_sleep_time');
    assert.ok(ids.includes('sleep_cycle'), 'Missing sleep_cycle');
    assert.ok(ids.includes('awake'), 'Missing awake');
    assert.ok(ids.includes('physical_recovery'), 'Missing physical_recovery');
    assert.ok(ids.includes('mental_recovery'), 'Missing mental_recovery');
  });

  // Test 7: Verify 8 Animal Personas dictionary in persona hub
  test('Test 7: GET /admin/v2/screens/scr_sleep_coaching_persona_hub returns 8 animal personas and active persona', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens/scr_sleep_coaching_persona_hub', method: 'GET' });
    assert.equal(res.statusCode, 200);

    const config = res.body.config;
    assert.equal(config.active_persona, 'lion');
    assert.equal(config.personas_catalog.length, 8);
    
    const types = config.personas_catalog.map(p => p.id);
    assert.ok(types.includes('lion'));
    assert.ok(types.includes('hedgehog'));
    assert.ok(types.includes('penguin'));
    assert.ok(types.includes('mole'));
    assert.ok(types.includes('deer'));
    assert.ok(types.includes('elephantsea'));
    assert.ok(types.includes('alligator'));
    assert.ok(types.includes('shark'));
  });

  // Test 8: Update Sleep Dashboard parameters (Creates Version 2)
  test('Test 8: PUT /admin/v2/screens/scr_sleep_main_dashboard creates Version 2 revision', async () => {
    const updatePayload = {
      change_summary: 'Admin calibrated Sleep Score to 91 and updated persona coaching advice',
      config: {
        sleep_score: 91,
        restorative_label: 'Peak Restorative',
        animal_persona: 'lion',
        persona_advice: 'Excellent deep sleep delta waves. Your autonomic recovery is exceptional.',
        snoring: {
          threshold_db: 52,
          detection_enabled: true
        }
      }
    };

    const res = await httpRequest(
      { path: '/admin/v2/screens/scr_sleep_main_dashboard', method: 'PUT' },
      updatePayload
    );

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.version, 2);
    assert.equal(res.body.config.sleep_score, 91);
    assert.equal(res.body.config.restorative_label, 'Peak Restorative');
  });

  // Test 9: Verify immutable revision history
  test('Test 9: GET /admin/v2/screens/scr_sleep_main_dashboard/revisions returns snapshots for v1 and v2', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens/scr_sleep_main_dashboard/revisions', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.equal(res.body.length, 2);
    assert.equal(res.body[0].version, 2);
    assert.equal(res.body[1].version, 1);
  });

  // Test 10: Rollback to Revision v1
  test('Test 10: POST /admin/v2/screens/scr_sleep_main_dashboard/rollback successfully rolls back to v1', async () => {
    const revsRes = await httpRequest({ path: '/admin/v2/screens/scr_sleep_main_dashboard/revisions', method: 'GET' });
    const v1Rev = revsRes.body.find(r => r.version === 1);
    assert.ok(v1Rev, 'v1 revision must exist');

    const rollRes = await httpRequest(
      { path: '/admin/v2/screens/scr_sleep_main_dashboard/rollback', method: 'POST' },
      { revision_id: v1Rev.revision_id, reason: 'Rollback to baseline v1' }
    );

    assert.equal(rollRes.statusCode, 200);
    assert.equal(rollRes.body.version, 3);
    assert.equal(rollRes.body.config.sleep_score, 88);
  });

  // Test 11: Soft delete Sleep screen and Recycle Bin operations
  test('Test 11: Soft-delete scr_sleep_advanced_settings, verify in Recycle Bin, and restore', async () => {
    const delRes = await httpRequest({ path: '/admin/v2/screens/scr_sleep_advanced_settings', method: 'DELETE' });
    assert.equal(delRes.statusCode, 200);

    const listRes = await httpRequest({ path: '/admin/v2/screens?domain=sleep', method: 'GET' });
    assert.equal(listRes.body.some(s => s.id === 'scr_sleep_advanced_settings'), false);

    const binRes = await httpRequest({ path: '/admin/v2/recycle-bin', method: 'GET' });
    assert.ok(binRes.body.some(i => i.item_id === 'scr_sleep_advanced_settings'));

    const restRes = await httpRequest({ path: '/admin/v2/screens/scr_sleep_advanced_settings/restore', method: 'POST' });
    assert.equal(restRes.statusCode, 200);

    const listRes2 = await httpRequest({ path: '/admin/v2/screens?domain=sleep', method: 'GET' });
    assert.equal(listRes2.body.some(s => s.id === 'scr_sleep_advanced_settings'), true);
  });

  // Test 12: Audit trail records all operations
  test('Test 12: GET /admin/v2/audit-logs records sleep domain operations', async () => {
    const res = await httpRequest({ path: '/admin/v2/audit-logs', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.some(l => l.target_id === 'scr_sleep_main_dashboard' && l.action === 'SCREEN_UPDATE'));
    assert.ok(res.body.some(l => l.target_id === 'scr_sleep_main_dashboard' && l.action === 'SCREEN_ROLLBACK'));
    assert.ok(res.body.some(l => l.target_id === 'scr_sleep_advanced_settings' && l.action === 'SCREEN_SOFT_DELETE'));
    assert.ok(res.body.some(l => l.target_id === 'scr_sleep_advanced_settings' && l.action === 'SCREEN_RESTORE'));
  });

  // Test 13: Regression Test — Step 1 (Home & Daily Activity) remains functional
  test('Test 13: REGRESSION Step 1 Home & Daily Activity domain remains fully operational', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens?domain=home', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.ok(res.body.length >= 5);
    assert.ok(res.body.some(s => s.id === 'scr_daily_activity_ring'));
  });

  // Test 14: Regression Test — Step 2 (Vitality & Energy Score) remains functional
  test('Test 14: REGRESSION Step 2 Vitality domain remains fully operational', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens?domain=vitality', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.ok(res.body.length >= 8);
    assert.ok(res.body.some(s => s.id === 'scr_vitality_energy_score'));
  });

  // Test 15: Regression Test — Step 3 (Sports & GPS Running) remains functional
  test('Test 15: REGRESSION Step 3 Sports domain remains fully operational', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens?domain=sports', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.ok(res.body.length >= 10);
    assert.ok(res.body.some(s => s.id === 'scr_sport_live_run_hud'));
  });
});
