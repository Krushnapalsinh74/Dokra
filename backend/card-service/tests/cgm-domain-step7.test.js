const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createCardServer } = require('../src/server');

describe('DOKRA-CGM-STEP7-001: Blood Glucose & CGM Domain Suite', () => {
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

  // Test 1: Discover all 16 Blood Glucose & CGM domain screens
  test('Test 1: GET /admin/v2/screens?domain=blood_glucose returns all 16 seeded Blood Glucose & CGM screens', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens?domain=blood_glucose', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length >= 16, `Expected at least 16 CGM screens, got ${res.body.length}`);

    const screenIds = res.body.map(s => s.id);
    assert.ok(screenIds.includes('scr_cgm_main_dashboard'), 'scr_cgm_main_dashboard missing');
    assert.ok(screenIds.includes('scr_cgm_live_curve_graph'), 'scr_cgm_live_curve_graph missing');
    assert.ok(screenIds.includes('scr_glucose_fasting_detail'), 'scr_glucose_fasting_detail missing');
    assert.ok(screenIds.includes('scr_glucose_postprandial_meal'), 'scr_glucose_postprandial_meal missing');
    assert.ok(screenIds.includes('scr_glucose_hba1c_estimate'), 'scr_glucose_hba1c_estimate missing');
    assert.ok(screenIds.includes('scr_glucose_target_ranges_config'), 'scr_glucose_target_ranges_config missing');
    assert.ok(screenIds.includes('scr_cgm_hypoglycemia_alert'), 'scr_cgm_hypoglycemia_alert missing');
    assert.ok(screenIds.includes('scr_cgm_hyperglycemia_alert'), 'scr_cgm_hyperglycemia_alert missing');
    assert.ok(screenIds.includes('scr_cgm_sensor_pairing_wizard'), 'scr_cgm_sensor_pairing_wizard missing');
    assert.ok(screenIds.includes('scr_cgm_sensor_telemetry_status'), 'scr_cgm_sensor_telemetry_status missing');
    assert.ok(screenIds.includes('scr_glucose_history_logbook'), 'scr_glucose_history_logbook missing');
    assert.ok(screenIds.includes('scr_glucose_trends_timeinrange'), 'scr_glucose_trends_timeinrange missing');
    assert.ok(screenIds.includes('scr_glucose_clinical_agp_export'), 'scr_glucose_clinical_agp_export missing');
    assert.ok(screenIds.includes('scr_glucose_manual_entry_modal'), 'scr_glucose_manual_entry_modal missing');
    assert.ok(screenIds.includes('scr_cgm_widget_oneui_settings'), 'scr_cgm_widget_oneui_settings missing');
    assert.ok(screenIds.includes('scr_cgm_advanced_alarm_settings'), 'scr_cgm_advanced_alarm_settings missing');
  });

  // Test 2: Search Blood Glucose & CGM screens by keyword
  test('Test 2: GET /admin/v2/screens?search=CGM finds CGM curve, live, sensor screens', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens?search=CGM', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length >= 7, `Expected at least 7 CGM matches, got ${res.body.length}`);
  });

  // Test 3: Search for HbA1c, Fasting, Hypoglycemia, Hyperglycemia, and Sensor
  test('Test 3: Search finds HbA1c, Fasting, Post-Meal, Hypoglycemia, and Sensor screens', async () => {
    const resHba1c = await httpRequest({ path: '/admin/v2/screens?search=HbA1c', method: 'GET' });
    assert.equal(resHba1c.statusCode, 200);
    assert.ok(resHba1c.body.some(s => s.id === 'scr_glucose_hba1c_estimate'));

    const resFasting = await httpRequest({ path: '/admin/v2/screens?search=Fasting', method: 'GET' });
    assert.equal(resFasting.statusCode, 200);
    assert.ok(resFasting.body.some(s => s.id === 'scr_glucose_fasting_detail'));

    const resHypo = await httpRequest({ path: '/admin/v2/screens?search=Hypoglycemia', method: 'GET' });
    assert.equal(resHypo.statusCode, 200);
    assert.ok(resHypo.body.some(s => s.id === 'scr_cgm_hypoglycemia_alert'));

    const resSensor = await httpRequest({ path: '/admin/v2/screens?search=Sensor', method: 'GET' });
    assert.equal(resSensor.statusCode, 200);
    assert.ok(resSensor.body.some(s => s.id === 'scr_cgm_sensor_pairing_wizard' || s.id === 'scr_cgm_sensor_telemetry_status'));
  });

  // Test 4: Detail retrieval for Main Glucose & CGM Dashboard
  test('Test 4: GET /admin/v2/screens/scr_cgm_main_dashboard returns rich configuration with targets, TIR, and protected telemetry', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens/scr_cgm_main_dashboard', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.id, 'scr_cgm_main_dashboard');
    assert.equal(res.body.domain_id, 'blood_glucose');
    assert.ok(res.body.config);
    assert.equal(res.body.config.current_glucose, 95);
    assert.equal(res.body.config.glucose_unit, 'mg/dL');
    assert.equal(res.body.config.trend_arrow, '→');
    assert.equal(res.body.config.time_in_range_pct, 94);
    assert.equal(res.body.config.target_min, 70);
    assert.equal(res.body.config.target_max, 140);
    assert.equal(res.body.config.clinical_engine, 'CODE-CONTROLLED / PROTECTED');
  });

  // Test 5: Detail retrieval for CGM Curve Graph & Hypoglycemia Alert
  test('Test 5: Verify Live Curve Graph and Hypoglycemia Alert configurations', async () => {
    const resCurve = await httpRequest({ path: '/admin/v2/screens/scr_cgm_live_curve_graph', method: 'GET' });
    assert.equal(resCurve.statusCode, 200);
    assert.equal(resCurve.body.config.current_reading, 95);
    assert.equal(resCurve.body.config.curve_engine, 'CODE-CONTROLLED / PROTECTED');

    const resHypo = await httpRequest({ path: '/admin/v2/screens/scr_cgm_hypoglycemia_alert', method: 'GET' });
    assert.equal(resHypo.statusCode, 200);
    assert.equal(resHypo.body.config.glucose_value, 62);
    assert.equal(resHypo.body.config.alert_level, 'CRITICAL_HYPOGLYCEMIA');
    assert.equal(resHypo.body.config.detection_engine, 'CODE-CONTROLLED / PROTECTED');
  });

  // Test 6: Verify HbA1c Estimation Screen configuration
  test('Test 6: Verify HbA1c screen maintains code-controlled ADAG/GMI calculation formula', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens/scr_glucose_hba1c_estimate', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.config.estimated_hba1c_pct, 5.4);
    assert.equal(res.body.config.formula_engine, 'CODE-CONTROLLED / PROTECTED');
  });

  // Test 7: Update screen layout/styles and verify revision increment
  test('Test 7: PUT /admin/v2/screens/scr_cgm_main_dashboard updates parameters and increments version', async () => {
    const updatePayload = {
      screen_name: 'Dokra Continuous Glucose Monitor v2',
      change_summary: 'Admin customized CGM curve theme and fasting target corridors',
      layout: {
        container_padding: '24px',
        card_gap: '18px'
      },
      style: {
        card_bg_color: '#0a0f1d',
        text_primary_color: '#f8fafc',
        accent_color: '#10b981'
      },
      config: {
        title: 'Dokra Continuous Glucose Monitor v2',
        current_glucose: 104,
        glucose_unit: 'mg/dL',
        trend_arrow: '→',
        target_min: 70,
        target_max: 140,
        fasting_glucose: 92,
        post_meal_glucose: 118,
        time_in_range_pct: 96,
        sensor_days_left: 7,
        clinical_engine: 'CODE-CONTROLLED / PROTECTED'
      }
    };

    const putRes = await httpRequest({
      path: '/admin/v2/screens/scr_cgm_main_dashboard',
      method: 'PUT'
    }, updatePayload);

    assert.equal(putRes.statusCode, 200);
    assert.equal(putRes.body.version, 2);
    assert.equal(putRes.body.screen_name, 'Dokra Continuous Glucose Monitor v2');
    assert.equal(putRes.body.config.time_in_range_pct, 96);
  });

  // Test 8: List screen revisions and test rollback to v1
  test('Test 8: GET /admin/v2/screens/scr_cgm_main_dashboard/revisions and rollback to v1', async () => {
    const revsRes = await httpRequest({
      path: '/admin/v2/screens/scr_cgm_main_dashboard/revisions',
      method: 'GET'
    });

    assert.equal(revsRes.statusCode, 200);
    assert.ok(Array.isArray(revsRes.body));
    assert.ok(revsRes.body.length >= 2);

    const rollbackRes = await httpRequest({
      path: '/admin/v2/screens/scr_cgm_main_dashboard/rollback',
      method: 'POST'
    }, { revision_id: revsRes.body[1].revision_id, reason: 'Rollback to initial CGM clinical baseline' });

    assert.equal(rollbackRes.statusCode, 200);
    assert.equal(rollbackRes.body.version, 3);
    assert.equal(rollbackRes.body.config.time_in_range_pct, 94);
  });

  // Test 9: Soft-delete (trash) and restore from Recycle Bin
  test('Test 9: DELETE screen moves to Recycle Bin and POST /restore recovers it safely', async () => {
    const delRes = await httpRequest({
      path: '/admin/v2/screens/scr_cgm_advanced_alarm_settings',
      method: 'DELETE'
    });
    assert.equal(delRes.statusCode, 200);
    assert.equal(delRes.body.status, 'trashed');

    const trashRes = await httpRequest({
      path: '/admin/v2/recycle-bin',
      method: 'GET'
    });
    assert.equal(trashRes.statusCode, 200);
    assert.ok(trashRes.body.some(item => item.item_id === 'scr_cgm_advanced_alarm_settings'));

    // Verify screen is not returned in active screens
    const listRes = await httpRequest({ path: '/admin/v2/screens?domain=blood_glucose', method: 'GET' });
    assert.ok(!listRes.body.some(s => s.id === 'scr_cgm_advanced_alarm_settings'));

    const restoreRes = await httpRequest({
      path: '/admin/v2/screens/scr_cgm_advanced_alarm_settings/restore',
      method: 'POST'
    });
    assert.equal(restoreRes.statusCode, 200);
    assert.equal(restoreRes.body.status, 'active');

    const getAfterRestore = await httpRequest({
      path: '/admin/v2/screens/scr_cgm_advanced_alarm_settings',
      method: 'GET'
    });
    assert.equal(getAfterRestore.statusCode, 200);
    assert.equal(getAfterRestore.body.id, 'scr_cgm_advanced_alarm_settings');
  });

  // Test 10: Verify audit log captures Blood Glucose / CGM modifications
  test('Test 10: GET /admin/v2/audit-logs captures CGM domain configuration events', async () => {
    const auditRes = await httpRequest({
      path: '/admin/v2/audit-logs?targetId=scr_cgm_main_dashboard',
      method: 'GET'
    });

    assert.equal(auditRes.statusCode, 200);
    assert.ok(Array.isArray(auditRes.body));
    assert.ok(auditRes.body.length >= 1, 'Expected at least 1 audit event for CGM dashboard');
  });

  // Test 11: Regression Test across Steps 1 - 6
  test('Test 11: Regression verify that Steps 1, 2, 3, 4, 5, and 6 domains remain 100% operational', async () => {
    const homeRes = await httpRequest({ path: '/admin/v2/screens?domain=home_daily', method: 'GET' });
    assert.equal(homeRes.statusCode, 200);
    assert.ok(homeRes.body.length >= 4);

    const vitalityRes = await httpRequest({ path: '/admin/v2/screens?domain=vitality', method: 'GET' });
    assert.equal(vitalityRes.statusCode, 200);
    assert.ok(vitalityRes.body.length >= 8);

    const sportRes = await httpRequest({ path: '/admin/v2/screens?domain=sport', method: 'GET' });
    assert.equal(sportRes.statusCode, 200);
    assert.ok(sportRes.body.length >= 9);

    const sleepRes = await httpRequest({ path: '/admin/v2/screens?domain=sleep', method: 'GET' });
    assert.equal(sleepRes.statusCode, 200);
    assert.ok(sleepRes.body.length >= 14);

    const heartRes = await httpRequest({ path: '/admin/v2/screens?domain=heart', method: 'GET' });
    assert.equal(heartRes.statusCode, 200);
    assert.ok(heartRes.body.length >= 14);

    const bpRes = await httpRequest({ path: '/admin/v2/screens?domain=blood_pressure', method: 'GET' });
    assert.equal(bpRes.statusCode, 200);
    assert.ok(bpRes.body.length >= 14);
  });
});
