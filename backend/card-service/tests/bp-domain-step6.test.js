const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createCardServer } = require('../src/server');

describe('DOKRA-BP-STEP6-001: Blood Pressure & Telehealth Domain Suite', () => {
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

  // Test 1: Discover all 14 Blood Pressure & Telehealth domain screens
  test('Test 1: GET /admin/v2/screens?domain=blood_pressure returns all 14 seeded BP & Telehealth screens', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens?domain=blood_pressure', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length >= 14, `Expected at least 14 BP screens, got ${res.body.length}`);

    const screenIds = res.body.map(s => s.id);
    assert.ok(screenIds.includes('scr_bp_main_dashboard'), 'scr_bp_main_dashboard missing');
    assert.ok(screenIds.includes('scr_bp_live_measurement'), 'scr_bp_live_measurement missing');
    assert.ok(screenIds.includes('scr_bp_result_detail'), 'scr_bp_result_detail missing');
    assert.ok(screenIds.includes('scr_bp_target_range_config'), 'scr_bp_target_range_config missing');
    assert.ok(screenIds.includes('scr_bp_map_analytics'), 'scr_bp_map_analytics missing');
    assert.ok(screenIds.includes('scr_bp_cuff_calibration_wizard'), 'scr_bp_cuff_calibration_wizard missing');
    assert.ok(screenIds.includes('scr_bp_history_log'), 'scr_bp_history_log missing');
    assert.ok(screenIds.includes('scr_bp_trend_charts'), 'scr_bp_trend_charts missing');
    assert.ok(screenIds.includes('scr_bp_morning_surge_alert'), 'scr_bp_morning_surge_alert missing');
    assert.ok(screenIds.includes('scr_telehealth_consultation_hub'), 'scr_telehealth_consultation_hub missing');
    assert.ok(screenIds.includes('scr_telehealth_doctor_profile'), 'scr_telehealth_doctor_profile missing');
    assert.ok(screenIds.includes('scr_telehealth_clinical_report_share'), 'scr_telehealth_clinical_report_share missing');
    assert.ok(screenIds.includes('scr_bp_widget_oneui_settings'), 'scr_bp_widget_oneui_settings missing');
    assert.ok(screenIds.includes('scr_bp_advanced_sensor_settings'), 'scr_bp_advanced_sensor_settings missing');
  });

  // Test 2: Search BP and Telehealth screens by keyword
  test('Test 2: GET /admin/v2/screens?search=Blood%20Pressure finds BP domain screens', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens?search=Blood%20Pressure', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length >= 8);
  });

  // Test 3: Search for MAP, Calibration, and Telehealth
  test('Test 3: Search finds MAP, Calibration, and Telehealth screens', async () => {
    const resMap = await httpRequest({ path: '/admin/v2/screens?search=MAP', method: 'GET' });
    assert.equal(resMap.statusCode, 200);
    assert.ok(resMap.body.some(s => s.id === 'scr_bp_map_analytics' || s.screen_name.includes('MAP')));

    const resCuff = await httpRequest({ path: '/admin/v2/screens?search=Calibration', method: 'GET' });
    assert.equal(resCuff.statusCode, 200);
    assert.ok(resCuff.body.some(s => s.id === 'scr_bp_cuff_calibration_wizard'));

    const resTele = await httpRequest({ path: '/admin/v2/screens?search=Telehealth', method: 'GET' });
    assert.equal(resTele.statusCode, 200);
    assert.ok(resTele.body.some(s => s.id === 'scr_telehealth_consultation_hub'));
  });

  // Test 4: Deep Screen Details for BP Main Dashboard
  test('Test 4: GET /admin/v2/screens/scr_bp_main_dashboard returns dual systolic/diastolic, MAP, and clinical safeguards', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens/scr_bp_main_dashboard', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.id, 'scr_bp_main_dashboard');
    assert.equal(res.body.domain_id, 'blood_pressure');
    assert.equal(res.body.config.systolic_value, 118);
    assert.equal(res.body.config.diastolic_value, 76);
    assert.equal(res.body.config.map_value, 90);
    assert.equal(res.body.config.target_systolic, 120);
    assert.equal(res.body.config.target_diastolic, 80);
    assert.equal(res.body.config.clinical_safeguards, 'CODE-CONTROLLED / PROTECTED');
  });

  // Test 5: Deep Screen Details for MAP Analytics
  test('Test 5: GET /admin/v2/screens/scr_bp_map_analytics returns organ perfusion telemetry and formula engine', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens/scr_bp_map_analytics', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.id, 'scr_bp_map_analytics');
    assert.equal(res.body.config.current_map, 90);
    assert.equal(res.body.config.normal_map_range, '70 - 100 mmHg');
    assert.equal(res.body.config.calculation_engine, 'CODE-CONTROLLED');
  });

  // Test 6: Deep Screen Details for Cuff Calibration Wizard
  test('Test 6: GET /admin/v2/screens/scr_bp_cuff_calibration_wizard returns 3-step calibration protocol', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens/scr_bp_cuff_calibration_wizard', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.config.calibration_mode, 'STANDARD_OMRON_BLE');
    assert.equal(res.body.config.total_steps, 3);
    assert.equal(res.body.config.zero_offset_mmhg, 0.2);
    assert.equal(res.body.config.protocol_engine, 'CODE-CONTROLLED / PROTECTED');
  });

  // Test 7: Deep Screen Details for Telehealth Hub
  test('Test 7: GET /admin/v2/screens/scr_telehealth_consultation_hub returns physician network and HIPAA link', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens/scr_telehealth_consultation_hub', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.config.next_available_doctor, 'Dr. Evelyn Reed, MD (Cardiology)');
    assert.equal(res.body.config.secure_hipaa_link, 'https://telehealth.dokrahealth.com/cardiology/join');
    assert.equal(res.body.config.estimated_wait_mins, 8);
  });

  // Test 8: Save & Publish Draft (PUT /admin/v2/screens/:id) with Version Increment
  test('Test 8: PUT /admin/v2/screens/scr_bp_main_dashboard creates v2 revision and updates style/config', async () => {
    const updatePayload = {
      screen_name: 'Blood Pressure Main Dashboard Pro',
      style: {
        accent_color: '#7c3aed',
        bp_systolic_color: '#8b5cf6'
      },
      config: {
        title: 'Blood Pressure Telemetry High Precision',
        systolic_value: 118,
        diastolic_value: 76,
        target_systolic: 120,
        target_diastolic: 80,
        map_value: 90,
        classification: 'Normal / Optimal',
        clinical_safeguards: 'CODE-CONTROLLED / PROTECTED'
      },
      change_summary: 'Updated One UI 7 typography and target corridor'
    };

    const res = await httpRequest({
      path: '/admin/v2/screens/scr_bp_main_dashboard',
      method: 'PUT'
    }, updatePayload);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.version, 2);
    assert.equal(res.body.screen_name, 'Blood Pressure Main Dashboard Pro');
    assert.equal(res.body.style.accent_color, '#7c3aed');
    assert.ok(res.body.active_revision_id.includes('v2'));
  });

  // Test 9: List Revisions & Rollback
  test('Test 9: GET revisions and rollback to v1 baseline snapshot', async () => {
    const revsRes = await httpRequest({ path: '/admin/v2/screens/scr_bp_main_dashboard/revisions', method: 'GET' });
    assert.equal(revsRes.statusCode, 200);
    assert.ok(Array.isArray(revsRes.body));
    assert.ok(revsRes.body.length >= 2);

    const v1Rev = revsRes.body.find(r => r.version === 1);
    assert.ok(v1Rev, 'Version 1 revision not found');

    const rollbackRes = await httpRequest({
      path: '/admin/v2/screens/scr_bp_main_dashboard/rollback',
      method: 'POST'
    }, {
      revision_id: v1Rev.revision_id,
      reason: 'Revert to initial standard baseline'
    });

    assert.equal(rollbackRes.statusCode, 200);
    assert.equal(rollbackRes.body.version, 3);
    assert.equal(rollbackRes.body.screen_name, 'Blood Pressure Main Dashboard & Cardiovascular Hub');
  });

  // Test 10: Soft Delete & Recycle Bin
  test('Test 10: DELETE moves screen to Recycle Bin and RESTORE recovers it', async () => {
    const delRes = await httpRequest({
      path: '/admin/v2/screens/scr_bp_widget_oneui_settings',
      method: 'DELETE'
    });
    assert.equal(delRes.statusCode, 200);
    assert.equal(delRes.body.status, 'trashed');

    const binRes = await httpRequest({ path: '/admin/v2/recycle-bin', method: 'GET' });
    assert.equal(binRes.statusCode, 200);
    assert.ok(binRes.body.some(item => item.item_id === 'scr_bp_widget_oneui_settings'));

    const restoreRes = await httpRequest({
      path: '/admin/v2/screens/scr_bp_widget_oneui_settings/restore',
      method: 'POST'
    });
    assert.equal(restoreRes.statusCode, 200);
    assert.equal(restoreRes.body.status, 'active');
  });

  // Test 11: Audit Trail Verification
  test('Test 11: GET /admin/v2/audit-logs records BP admin mutations', async () => {
    const res = await httpRequest({ path: '/admin/v2/audit-logs?targetId=scr_bp_main_dashboard', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length >= 2);
    assert.ok(res.body.some(a => a.action === 'SCREEN_UPDATE'));
    assert.ok(res.body.some(a => a.action === 'SCREEN_ROLLBACK'));
  });

  // Test 12: Regression Testing across Steps 1-5
  test('Test 12: Regression compatibility across Step 1 (Home), Step 2 (Vitality), Step 3 (Sport), Step 4 (Sleep), and Step 5 (Heart)', async () => {
    const homeRes = await httpRequest({ path: '/admin/v2/screens?domain=home_daily', method: 'GET' });
    assert.equal(homeRes.statusCode, 200);
    assert.ok(homeRes.body.length >= 4);

    const vitRes = await httpRequest({ path: '/admin/v2/screens?domain=vitality', method: 'GET' });
    assert.equal(vitRes.statusCode, 200);
    assert.ok(vitRes.body.length >= 9);

    const sportRes = await httpRequest({ path: '/admin/v2/screens?domain=sport', method: 'GET' });
    assert.equal(sportRes.statusCode, 200);
    assert.ok(sportRes.body.length >= 12);

    const sleepRes = await httpRequest({ path: '/admin/v2/screens?domain=sleep', method: 'GET' });
    assert.equal(sleepRes.statusCode, 200);
    assert.ok(sleepRes.body.length >= 14);

    const heartRes = await httpRequest({ path: '/admin/v2/screens?domain=heart', method: 'GET' });
    assert.equal(heartRes.statusCode, 200);
    assert.ok(heartRes.body.length >= 14);
  });
});
