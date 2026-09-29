const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createCardServer } = require('../src/server');

describe('DOKRA-HEART-STEP5-001: Heart Health & Sinus ECG Domain Suite', () => {
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

  // Test 1: Discover all 14 Heart & ECG domain screens
  test('Test 1: GET /admin/v2/screens?domain=heart returns all 14 seeded Heart Health & Sinus ECG screens', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens?domain=heart', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length >= 14, `Expected at least 14 Heart screens, got ${res.body.length}`);

    const screenIds = res.body.map(s => s.id);
    assert.ok(screenIds.includes('scr_heart_main_dashboard'), 'scr_heart_main_dashboard missing');
    assert.ok(screenIds.includes('scr_heart_live_measurement'), 'scr_heart_live_measurement missing');
    assert.ok(screenIds.includes('scr_heart_resting_detail'), 'scr_heart_resting_detail missing');
    assert.ok(screenIds.includes('scr_heart_max_zones_calibration'), 'scr_heart_max_zones_calibration missing');
    assert.ok(screenIds.includes('scr_heart_history_trends_chart'), 'scr_heart_history_trends_chart missing');
    assert.ok(screenIds.includes('scr_ecg_sinus_lead_live'), 'scr_ecg_sinus_lead_live missing');
    assert.ok(screenIds.includes('scr_ecg_result_sinus_rhythm'), 'scr_ecg_result_sinus_rhythm missing');
    assert.ok(screenIds.includes('scr_ecg_afib_warning_alert'), 'scr_ecg_afib_warning_alert missing');
    assert.ok(screenIds.includes('scr_ecg_history_recordings'), 'scr_ecg_history_recordings missing');
    assert.ok(screenIds.includes('scr_ecg_clinical_pdf_export'), 'scr_ecg_clinical_pdf_export missing');
    assert.ok(screenIds.includes('scr_vitals_composite_dashboard'), 'scr_vitals_composite_dashboard missing');
    assert.ok(screenIds.includes('scr_vitals_metric_detail'), 'scr_vitals_metric_detail missing');
    assert.ok(screenIds.includes('scr_heart_widget_oneui_settings'), 'scr_heart_widget_oneui_settings missing');
    assert.ok(screenIds.includes('scr_heart_ecg_advanced_settings'), 'scr_heart_ecg_advanced_settings missing');
  });

  // Test 2: Search Heart & ECG screens by keyword
  test('Test 2: GET /admin/v2/screens?search=Heart finds all Heart Rate screens', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens?search=Heart', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length >= 7);
  });

  // Test 3: Search for ECG and AFib
  test('Test 3: Search finds ECG, Sinus Rhythm, AFib, and PDF export screens', async () => {
    const resEcg = await httpRequest({ path: '/admin/v2/screens?search=ECG', method: 'GET' });
    assert.equal(resEcg.statusCode, 200);
    assert.ok(resEcg.body.some(s => s.id === 'scr_ecg_sinus_lead_live' || s.screen_name.includes('ECG')));

    const resAfib = await httpRequest({ path: '/admin/v2/screens?search=AFib', method: 'GET' });
    assert.equal(resAfib.statusCode, 200);
    assert.ok(resAfib.body.some(s => s.id === 'scr_ecg_afib_warning_alert'));

    const resPdf = await httpRequest({ path: '/admin/v2/screens?search=PDF', method: 'GET' });
    assert.equal(resPdf.statusCode, 200);
    assert.ok(resPdf.body.some(s => s.id === 'scr_ecg_clinical_pdf_export'));
  });

  // Test 4: Deep Screen Details for Heart Rate Dashboard
  test('Test 4: GET /admin/v2/screens/scr_heart_main_dashboard returns rich telemetry layout and clinical safeguards', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens/scr_heart_main_dashboard', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.id, 'scr_heart_main_dashboard');
    assert.equal(res.body.domain_id, 'heart');
    assert.equal(res.body.config.current_bpm, 72);
    assert.equal(res.body.config.resting_bpm, 58);
    assert.equal(res.body.config.max_bpm, 168);
    assert.equal(res.body.config.min_bpm, 52);
    assert.ok(res.body.config.daily_hr_zones);
    assert.equal(res.body.config.clinical_engine, 'CODE-CONTROLLED / PROTECTED');
  });

  // Test 5: Deep Screen Details for Live 60Hz Sinus Rhythm ECG Lead I
  test('Test 5: GET /admin/v2/screens/scr_ecg_sinus_lead_live returns 60Hz canvas config and calibration standard', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens/scr_ecg_sinus_lead_live', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.id, 'scr_ecg_sinus_lead_live');
    assert.equal(res.body.config.sampling_frequency_hz, 60);
    assert.equal(res.body.config.standard_calibration, '25mm/s, 10mm/mV');
    assert.equal(res.body.config.duration_secs, 30);
    assert.equal(res.body.config.electrode_contact, 'EXCELLENT');
    assert.equal(res.body.config.pqrst_visualization, true);
    assert.equal(res.body.config.medical_engine, 'CODE-CONTROLLED / PROTECTED');
    assert.equal(res.body.visibility_flags.show_60hz_canvas, true);
  });

  // Test 6: Deep Screen Details for Vitals Composite Dashboard
  test('Test 6: GET /admin/v2/screens/scr_vitals_composite_dashboard returns 6-biomarker matrix', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens/scr_vitals_composite_dashboard', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.ok(res.body.config.vitals);
    assert.equal(res.body.config.vitals.heart_rate.value, 72);
    assert.equal(res.body.config.vitals.blood_pressure.systolic, 118);
    assert.equal(res.body.config.vitals.blood_oxygen.value, 98);
    assert.equal(res.body.config.vitals.skin_temp.value, -0.3);
    assert.equal(res.body.config.vitals.blood_glucose.value, 95);
    assert.equal(res.body.config.vitals.respiratory_rate.value, 14.2);
  });

  // Test 7: Save & Publish Draft (PUT /admin/v2/screens/:id) with Version Increment
  test('Test 7: PUT /admin/v2/screens/scr_ecg_sinus_lead_live creates v2 revision and updates style/config', async () => {
    const updatePayload = {
      screen_name: 'Live 60Hz Sinus Rhythm ECG Lead I Pro',
      style: {
        accent_color: '#059669',
        ecg_line_color: '#34d399'
      },
      config: {
        title: 'Single-Lead ECG High Precision',
        sampling_frequency_hz: 60,
        standard_calibration: '25mm/s, 10mm/mV',
        medical_engine: 'CODE-CONTROLLED / PROTECTED'
      },
      change_summary: 'Enhanced high-contrast green waveform for One UI 7'
    };

    const res = await httpRequest({
      path: '/admin/v2/screens/scr_ecg_sinus_lead_live',
      method: 'PUT'
    }, updatePayload);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.version, 2);
    assert.equal(res.body.screen_name, 'Live 60Hz Sinus Rhythm ECG Lead I Pro');
    assert.equal(res.body.style.accent_color, '#059669');
    assert.equal(res.body.style.ecg_line_color, '#34d399');
    assert.ok(res.body.active_revision_id.includes('v2'));
  });

  // Test 8: List Revisions
  test('Test 8: GET /admin/v2/screens/scr_ecg_sinus_lead_live/revisions returns all revision history snapshots', async () => {
    const res = await httpRequest({ path: '/admin/v2/screens/scr_ecg_sinus_lead_live/revisions', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length >= 2, `Expected at least 2 revisions, got ${res.body.length}`);
    assert.equal(res.body[0].version, 2);
    assert.equal(res.body[1].version, 1);
  });

  // Test 9: Rollback Revision
  test('Test 9: POST /admin/v2/screens/scr_ecg_sinus_lead_live/rollback restores v1 baseline', async () => {
    const revsRes = await httpRequest({ path: '/admin/v2/screens/scr_ecg_sinus_lead_live/revisions', method: 'GET' });
    const v1Rev = revsRes.body.find(r => r.version === 1);
    assert.ok(v1Rev, 'Version 1 revision not found');

    const rollbackRes = await httpRequest({
      path: '/admin/v2/screens/scr_ecg_sinus_lead_live/rollback',
      method: 'POST'
    }, {
      revision_id: v1Rev.revision_id,
      reason: 'Revert styling to standard medical emerald'
    });

    assert.equal(rollbackRes.statusCode, 200);
    assert.equal(rollbackRes.body.version, 3);
    assert.equal(rollbackRes.body.screen_name, 'Live 60Hz Sinus Rhythm ECG Lead I Waveform');
  });

  // Test 10: Soft Delete & Recycle Bin
  test('Test 10: DELETE moves screen to Recycle Bin and RESTORE recovers it', async () => {
    // 1. Soft delete
    const delRes = await httpRequest({
      path: '/admin/v2/screens/scr_heart_widget_oneui_settings',
      method: 'DELETE'
    });
    assert.equal(delRes.statusCode, 200);
    assert.equal(delRes.body.status, 'trashed');

    // 2. Verify in recycle bin
    const binRes = await httpRequest({ path: '/admin/v2/recycle-bin', method: 'GET' });
    assert.equal(binRes.statusCode, 200);
    assert.ok(binRes.body.some(item => item.item_id === 'scr_heart_widget_oneui_settings'));

    // 3. Verify screen is not returned in active screens
    const listRes = await httpRequest({ path: '/admin/v2/screens?domain=heart', method: 'GET' });
    assert.ok(!listRes.body.some(s => s.id === 'scr_heart_widget_oneui_settings'));

    // 4. Restore
    const restoreRes = await httpRequest({
      path: '/admin/v2/screens/scr_heart_widget_oneui_settings/restore',
      method: 'POST'
    });
    assert.equal(restoreRes.statusCode, 200);
    assert.equal(restoreRes.body.status, 'active');

    // 5. Verify restored screen is back in active screens
    const listAfterRes = await httpRequest({ path: '/admin/v2/screens?domain=heart', method: 'GET' });
    assert.ok(listAfterRes.body.some(s => s.id === 'scr_heart_widget_oneui_settings'));
  });

  // Test 11: Audit Trail Verification
  test('Test 11: GET /admin/v2/audit-logs records all admin mutations with actor ID', async () => {
    const res = await httpRequest({ path: '/admin/v2/audit-logs?targetId=scr_ecg_sinus_lead_live', method: 'GET' });
    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length >= 2);
    assert.ok(res.body.some(a => a.action === 'SCREEN_UPDATE'));
    assert.ok(res.body.some(a => a.action === 'SCREEN_ROLLBACK'));
  });

  // Test 12: Cross-Domain Regression Compatibility (Steps 1-4)
  test('Test 12: Regression compatibility across Step 1 (Home), Step 2 (Vitality), Step 3 (Sport), and Step 4 (Sleep)', async () => {
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
  });
});
