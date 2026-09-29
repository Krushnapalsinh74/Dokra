/**
 * DOKRA HEALTH — STEP 5 HEART HEALTH & SINUS ECG END-TO-END VERIFICATION
 *
 * Verifies all 14 Step 5 Heart & ECG screens:
 * 1. Database seeding & registry queries
 * 2. Visual editor UI property synchronization
 * 3. 60Hz ECG Single-Lead Lead I calibration standard
 * 4. Clinical safety guardrails (CODE-CONTROLLED / PROTECTED)
 * 5. Revision increment, rollback, recycle bin, restore
 * 6. Full cross-domain regression testing (Steps 1-4)
 */

const http = require('node:http');
const { createCardServer } = require('../src/server');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failCount++;
  }
}

async function runStep5Verification() {
  console.log('========================================================================');
  console.log('💓 DOKRA HEALTH — STEP 5: HEART HEALTH & SINUS ECG DEEP VERIFICATION');
  console.log('========================================================================\n');

  const app = createCardServer({
    dbPath: ':memory:',
    requireAuth: false
  });

  await app.listen(0);
  const port = app.server.address().port;

  function api(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
      const payload = body ? JSON.stringify(body) : null;
      const req = http.request({
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: {
          'Accept': 'application/json',
          'X-Actor-Id': 'super_admin',
          ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {})
        }
      }, (res) => {
        let raw = '';
        res.on('data', chunk => { raw += chunk; });
        res.on('end', () => {
          let parsed;
          try { parsed = JSON.parse(raw); } catch { parsed = raw; }
          resolve({ status: res.statusCode, body: parsed });
        });
      });
      req.on('error', reject);
      if (payload) req.write(payload);
      req.end();
    });
  }

  try {
    // 1. Screen Registry Domain 5 Verification
    console.log('--- Phase 1: Screen Registry Discovery & Discovery Hierarchy ---');
    const heartScreensRes = await api('/admin/v2/screens?domain=heart');
    assert(heartScreensRes.status === 200, 'GET /admin/v2/screens?domain=heart returns HTTP 200');
    assert(Array.isArray(heartScreensRes.body) && heartScreensRes.body.length === 14, `Found exactly 14 registered Step 5 screens (got ${heartScreensRes.body.length})`);

    const expectedScreens = [
      'scr_heart_main_dashboard',
      'scr_heart_live_measurement',
      'scr_heart_resting_detail',
      'scr_heart_max_zones_calibration',
      'scr_heart_history_trends_chart',
      'scr_ecg_sinus_lead_live',
      'scr_ecg_result_sinus_rhythm',
      'scr_ecg_afib_warning_alert',
      'scr_ecg_history_recordings',
      'scr_ecg_clinical_pdf_export',
      'scr_vitals_composite_dashboard',
      'scr_vitals_metric_detail',
      'scr_heart_widget_oneui_settings',
      'scr_heart_ecg_advanced_settings'
    ];

    const discoveredIds = heartScreensRes.body.map(s => s.id);
    for (const expectedId of expectedScreens) {
      assert(discoveredIds.includes(expectedId), `Registered screen verified: ${expectedId}`);
    }

    // 2. Search Engine Verification
    console.log('\n--- Phase 2: Master Admin Search Filter ---');
    const searchEcg = await api('/admin/v2/screens?search=ECG');
    assert(searchEcg.status === 200 && searchEcg.body.length >= 5, `Search for 'ECG' returned ${searchEcg.body.length} screens`);

    const searchHeart = await api('/admin/v2/screens?search=Heart');
    assert(searchHeart.status === 200 && searchHeart.body.length >= 7, `Search for 'Heart' returned ${searchHeart.body.length} screens`);

    const searchVitals = await api('/admin/v2/screens?search=Vitals');
    assert(searchVitals.status === 200 && searchVitals.body.length >= 2, `Search for 'Vitals' returned ${searchVitals.body.length} screens`);

    // 3. Clinical Safeguards & Deep Configuration Verification
    console.log('\n--- Phase 3: Clinical Safeguards & Deep Configuration ---');
    const ecgLiveDetail = await api('/admin/v2/screens/scr_ecg_sinus_lead_live');
    assert(ecgLiveDetail.status === 200, 'Fetched Live ECG screen details');
    assert(ecgLiveDetail.body.config.sampling_frequency_hz === 60, 'Live ECG sampling frequency is 60Hz');
    assert(ecgLiveDetail.body.config.standard_calibration === '25mm/s, 10mm/mV', 'Calibration matches AHA 25mm/s, 10mm/mV standard');
    assert(ecgLiveDetail.body.config.medical_engine === 'CODE-CONTROLLED / PROTECTED', 'Clinical medical engine marked CODE-CONTROLLED / PROTECTED');

    const hrDetail = await api('/admin/v2/screens/scr_heart_main_dashboard');
    assert(hrDetail.body.config.current_bpm === 72, 'Heart Rate dashboard baseline BPM is 72');
    assert(hrDetail.body.config.resting_bpm === 58, 'Heart Rate dashboard resting BPM is 58');
    assert(hrDetail.body.config.max_bpm === 168, 'Heart Rate dashboard max BPM is 168');
    assert(hrDetail.body.config.clinical_engine === 'CODE-CONTROLLED / PROTECTED', 'Heart clinical engine marked CODE-CONTROLLED / PROTECTED');

    const afibDetail = await api('/admin/v2/screens/scr_ecg_afib_warning_alert');
    assert(afibDetail.body.config.risk_level === 'HIGH_PRIORITY_CLINICAL', 'AFib alert risk level is HIGH_PRIORITY_CLINICAL');
    assert(afibDetail.body.config.classification_engine === 'CODE-CONTROLLED / PROTECTED', 'AFib classification engine marked CODE-CONTROLLED / PROTECTED');

    const vitalsDetail = await api('/admin/v2/screens/scr_vitals_composite_dashboard');
    assert(vitalsDetail.body.config.vitals.blood_pressure.systolic === 118, 'Vitals BP systolic is 118 mmHg');
    assert(vitalsDetail.body.config.vitals.blood_oxygen.value === 98, 'Vitals SpO2 is 98%');

    // 4. Mutation, Revisions, Rollback & Recycle Bin Verification
    console.log('\n--- Phase 4: Mutation, Version History, Rollback & Trash Lifecycle ---');
    const updateRes = await api('/admin/v2/screens/scr_ecg_sinus_lead_live', 'PUT', {
      screen_name: 'Live 60Hz Sinus Rhythm ECG Lead I (High Contrast)',
      style: { ecg_line_color: '#00ff88' },
      change_summary: 'Clinical contrast enhancement'
    });
    assert(updateRes.status === 200 && updateRes.body.version === 2, 'Screen updated to Version 2');
    assert(updateRes.body.style.ecg_line_color === '#00ff88', 'ECG line color updated in active registry');

    const revsRes = await api('/admin/v2/screens/scr_ecg_sinus_lead_live/revisions');
    assert(revsRes.body.length === 2, '2 immutable revision snapshots stored');

    const rollbackRes = await api('/admin/v2/screens/scr_ecg_sinus_lead_live/rollback', 'POST', {
      revision_id: revsRes.body[1].revision_id,
      reason: 'Revert to initial calibration'
    });
    assert(rollbackRes.status === 200 && rollbackRes.body.version === 3, 'Screen rolled back (created v3 audit entry)');
    assert(rollbackRes.body.screen_name === 'Live 60Hz Sinus Rhythm ECG Lead I Waveform', 'Restored screen name from v1 snapshot');

    // Soft delete and restore
    const deleteRes = await api('/admin/v2/screens/scr_heart_widget_oneui_settings', 'DELETE');
    assert(deleteRes.status === 200 && deleteRes.body.status === 'trashed', 'Screen successfully moved to Recycle Bin');

    const binRes = await api('/admin/v2/recycle-bin');
    assert(binRes.body.some(item => item.item_id === 'scr_heart_widget_oneui_settings'), 'Recycle Bin contains trashed screen');

    const restoreRes = await api('/admin/v2/screens/scr_heart_widget_oneui_settings/restore', 'POST');
    assert(restoreRes.status === 200 && restoreRes.body.status === 'active', 'Screen restored from Recycle Bin');

    // 5. Cross-Domain Regression Testing (Steps 1 - 4)
    console.log('\n--- Phase 5: Complete Cross-Domain Regression Check ---');
    const step1 = await api('/admin/v2/screens?domain=home_daily');
    assert(step1.status === 200 && step1.body.length >= 4, `Step 1 (Home & Daily Activity) intact: ${step1.body.length} screens`);

    const step2 = await api('/admin/v2/screens?domain=vitality');
    assert(step2.status === 200 && step2.body.length >= 9, `Step 2 (Vitality & Energy Score) intact: ${step2.body.length} screens`);

    const step3 = await api('/admin/v2/screens?domain=sport');
    assert(step3.status === 200 && step3.body.length >= 12, `Step 3 (Sports & GPS Running) intact: ${step3.body.length} screens`);

    const step4 = await api('/admin/v2/screens?domain=sleep');
    assert(step4.status === 200 && step4.body.length >= 14, `Step 4 (Sleep & Sleep Coaching) intact: ${step4.body.length} screens`);

    const step5 = await api('/admin/v2/screens?domain=heart');
    assert(step5.status === 200 && step5.body.length >= 14, `Step 5 (Heart Health & Sinus ECG) intact: ${step5.body.length} screens`);

    console.log('\n========================================================================');
    console.log(`STEP 5 VERIFICATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('========================================================================\n');

    if (failCount > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Unhandled error during verification:', err);
    process.exit(1);
  } finally {
    await app.close();
  }
}

runStep5Verification();
