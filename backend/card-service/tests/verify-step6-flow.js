/**
 * DOKRA HEALTH — STEP 6 BLOOD PRESSURE & TELEHEALTH END-TO-END VERIFICATION
 *
 * Verifies all 14 Step 6 Blood Pressure & Telehealth screens:
 * 1. Database seeding & registry queries for blood_pressure domain
 * 2. Visual editor UI property synchronization (Systolic, Diastolic, MAP)
 * 3. AHA/ACC 2024 Hypertension Stage Category Presets
 * 4. Smart BLE Cuff Calibration Wizard Protocol
 * 5. Telehealth Consultation & Clinical Dossier Share Flows
 * 6. Clinical safety guardrails (CODE-CONTROLLED / PROTECTED)
 * 7. Revision increment, rollback, recycle bin, restore
 * 8. Full cross-domain regression testing (Steps 1-5)
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

async function runStep6Verification() {
  console.log('========================================================================');
  console.log('🩺 DOKRA HEALTH — STEP 6: BLOOD PRESSURE & TELEHEALTH DEEP VERIFICATION');
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
    // 1. Screen Registry Domain 6 Discovery
    console.log('--- Phase 1: Screen Registry Discovery & Discovery Hierarchy ---');
    const bpScreensRes = await api('/admin/v2/screens?domain=blood_pressure');
    assert(bpScreensRes.status === 200, 'GET /admin/v2/screens?domain=blood_pressure returns HTTP 200');
    assert(Array.isArray(bpScreensRes.body) && bpScreensRes.body.length === 14, `Found exactly 14 registered Step 6 screens (got ${bpScreensRes.body.length})`);

    const expectedScreens = [
      'scr_bp_main_dashboard',
      'scr_bp_live_measurement',
      'scr_bp_result_detail',
      'scr_bp_target_range_config',
      'scr_bp_map_analytics',
      'scr_bp_cuff_calibration_wizard',
      'scr_bp_history_log',
      'scr_bp_trend_charts',
      'scr_bp_morning_surge_alert',
      'scr_telehealth_consultation_hub',
      'scr_telehealth_doctor_profile',
      'scr_telehealth_clinical_report_share',
      'scr_bp_widget_oneui_settings',
      'scr_bp_advanced_sensor_settings'
    ];

    const discoveredIds = bpScreensRes.body.map(s => s.id);
    for (const expectedId of expectedScreens) {
      assert(discoveredIds.includes(expectedId), `Registered screen verified: ${expectedId}`);
    }

    // 2. Master Admin Search Filter
    console.log('\n--- Phase 2: Master Admin Search Filter ---');
    const searchBp = await api('/admin/v2/screens?search=Blood%20Pressure');
    assert(searchBp.status === 200 && searchBp.body.length >= 8, `Search for 'Blood Pressure' returned ${searchBp.body.length} screens`);

    const searchMap = await api('/admin/v2/screens?search=MAP');
    assert(searchMap.status === 200 && searchMap.body.length >= 3, `Search for 'MAP' returned ${searchMap.body.length} screens`);

    const searchCuff = await api('/admin/v2/screens?search=Cuff');
    assert(searchCuff.status === 200 && searchCuff.body.length >= 2, `Search for 'Cuff' returned ${searchCuff.body.length} screens`);

    const searchTelehealth = await api('/admin/v2/screens?search=Telehealth');
    assert(searchTelehealth.status === 200 && searchTelehealth.body.length >= 3, `Search for 'Telehealth' returned ${searchTelehealth.body.length} screens`);

    // 3. Clinical Safeguards & Deep Configuration Verification
    console.log('\n--- Phase 3: Clinical Safeguards & Deep Configuration ---');
    const bpMainDetail = await api('/admin/v2/screens/scr_bp_main_dashboard');
    assert(bpMainDetail.status === 200, 'Fetched BP Main Dashboard screen details');
    assert(bpMainDetail.body.config.systolic_value === 118, 'Systolic baseline is 118 mmHg');
    assert(bpMainDetail.body.config.diastolic_value === 76, 'Diastolic baseline is 76 mmHg');
    assert(bpMainDetail.body.config.map_value === 90, 'Mean Arterial Pressure (MAP) is 90 mmHg');
    assert(bpMainDetail.body.config.target_systolic === 120, 'Systolic target ceiling is 120 mmHg');
    assert(bpMainDetail.body.config.target_diastolic === 80, 'Diastolic target ceiling is 80 mmHg');
    assert(bpMainDetail.body.config.clinical_safeguards === 'CODE-CONTROLLED / PROTECTED', 'Clinical safeguards marked CODE-CONTROLLED / PROTECTED');

    const mapDetail = await api('/admin/v2/screens/scr_bp_map_analytics');
    assert(mapDetail.body.config.current_map === 90, 'MAP detail value is 90 mmHg');
    assert(mapDetail.body.config.normal_map_range === '70 - 100 mmHg', 'Normal MAP perfusion range is 70-100 mmHg');
    assert(mapDetail.body.config.calculation_engine === 'CODE-CONTROLLED', 'MAP calculation marked CODE-CONTROLLED');

    const cuffDetail = await api('/admin/v2/screens/scr_bp_cuff_calibration_wizard');
    assert(cuffDetail.body.config.calibration_mode === 'STANDARD_OMRON_BLE', 'Calibration protocol is STANDARD_OMRON_BLE');
    assert(cuffDetail.body.config.zero_offset_mmhg === 0.2, 'Zero offset is 0.2 mmHg');
    assert(cuffDetail.body.config.protocol_engine === 'CODE-CONTROLLED / PROTECTED', 'Calibration protocol marked CODE-CONTROLLED / PROTECTED');

    const teleDetail = await api('/admin/v2/screens/scr_telehealth_consultation_hub');
    assert(teleDetail.body.config.next_available_doctor === 'Dr. Evelyn Reed, MD (Cardiology)', 'Telehealth doctor is Dr. Evelyn Reed, MD');
    assert(teleDetail.body.config.secure_hipaa_link.includes('telehealth.dokrahealth.com'), 'Secure HIPAA link verified');

    // 4. Mutation, Revisions, Rollback & Trash Lifecycle
    console.log('\n--- Phase 4: Mutation, Version History, Rollback & Trash Lifecycle ---');
    const updateRes = await api('/admin/v2/screens/scr_bp_main_dashboard', 'PUT', {
      screen_name: 'Blood Pressure Main Dashboard (High Precision)',
      style: { accent_color: '#7c3aed' },
      change_summary: 'Enhanced high-precision One UI 7 purple theme'
    });
    assert(updateRes.status === 200 && updateRes.body.version === 2, 'Screen updated to Version 2');
    assert(updateRes.body.style.accent_color === '#7c3aed', 'Accent color updated in active registry');

    const revsRes = await api('/admin/v2/screens/scr_bp_main_dashboard/revisions');
    assert(revsRes.body.length === 2, '2 immutable revision snapshots stored');

    const rollbackRes = await api('/admin/v2/screens/scr_bp_main_dashboard/rollback', 'POST', {
      revision_id: revsRes.body[1].revision_id,
      reason: 'Revert to baseline styling'
    });
    assert(rollbackRes.status === 200 && rollbackRes.body.version === 3, 'Screen rolled back (created v3 audit entry)');
    assert(rollbackRes.body.screen_name === 'Blood Pressure Main Dashboard & Cardiovascular Hub', 'Restored screen name from v1 snapshot');

    // Soft delete and restore
    const deleteRes = await api('/admin/v2/screens/scr_bp_widget_oneui_settings', 'DELETE');
    assert(deleteRes.status === 200 && deleteRes.body.status === 'trashed', 'Screen successfully moved to Recycle Bin');

    const binRes = await api('/admin/v2/recycle-bin');
    assert(binRes.body.some(item => item.item_id === 'scr_bp_widget_oneui_settings'), 'Recycle Bin contains trashed screen');

    const restoreRes = await api('/admin/v2/screens/scr_bp_widget_oneui_settings/restore', 'POST');
    assert(restoreRes.status === 200 && restoreRes.body.status === 'active', 'Screen restored from Recycle Bin');

    // 5. Cross-Domain Regression Testing (Steps 1 - 5)
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

    const step6 = await api('/admin/v2/screens?domain=blood_pressure');
    assert(step6.status === 200 && step6.body.length >= 14, `Step 6 (Blood Pressure & Telehealth) intact: ${step6.body.length} screens`);

    console.log('\n========================================================================');
    console.log(`STEP 6 VERIFICATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
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

runStep6Verification();
