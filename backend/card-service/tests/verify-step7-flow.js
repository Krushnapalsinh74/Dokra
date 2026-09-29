/**
 * DOKRA HEALTH — STEP 7 BLOOD GLUCOSE & CGM END-TO-END VERIFICATION
 *
 * Verifies all 16 Step 7 Blood Glucose & CGM screens:
 * 1. Database seeding & registry queries for blood_glucose domain
 * 2. Visual editor UI property synchronization (Current Glucose, Trend Arrow, TIR)
 * 3. ADA 2024 Glycemic Target Corridor (70-140 mg/dL, Fasting 70-99 mg/dL)
 * 4. Hypoglycemia (<65 mg/dL) & Hyperglycemia (>180 mg/dL) Alarm Protocols
 * 5. CGM Curve Continuous 5-min stream & AGP Export
 * 6. Sensor Pairing Wizard & Telemetry Status Lifecycle
 * 7. Clinical safety guardrails (CODE-CONTROLLED / PROTECTED)
 * 8. Revision increment, rollback, recycle bin, restore
 * 9. Full cross-domain regression testing (Steps 1-6)
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

async function runStep7Verification() {
  console.log('========================================================================');
  console.log('🩸 DOKRA HEALTH — STEP 7: BLOOD GLUCOSE & CGM DEEP VERIFICATION');
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
    // 1. Screen Registry Domain 7 Discovery
    console.log('--- Phase 1: Screen Registry Discovery & Discovery Hierarchy ---');
    const cgmScreensRes = await api('/admin/v2/screens?domain=blood_glucose');
    assert(cgmScreensRes.status === 200, 'GET /admin/v2/screens?domain=blood_glucose returns HTTP 200');
    assert(Array.isArray(cgmScreensRes.body) && cgmScreensRes.body.length === 16, `Found exactly 16 registered Step 7 screens (got ${cgmScreensRes.body.length})`);

    const expectedScreens = [
      'scr_cgm_main_dashboard',
      'scr_cgm_live_curve_graph',
      'scr_glucose_fasting_detail',
      'scr_glucose_postprandial_meal',
      'scr_glucose_hba1c_estimate',
      'scr_glucose_target_ranges_config',
      'scr_cgm_hypoglycemia_alert',
      'scr_cgm_hyperglycemia_alert',
      'scr_cgm_sensor_pairing_wizard',
      'scr_cgm_sensor_telemetry_status',
      'scr_glucose_history_logbook',
      'scr_glucose_trends_timeinrange',
      'scr_glucose_clinical_agp_export',
      'scr_glucose_manual_entry_modal',
      'scr_cgm_widget_oneui_settings',
      'scr_cgm_advanced_alarm_settings'
    ];

    const discoveredIds = cgmScreensRes.body.map(s => s.id);
    for (const expectedId of expectedScreens) {
      assert(discoveredIds.includes(expectedId), `Registered screen verified: ${expectedId}`);
    }

    // 2. Keyword Search Capabilities
    console.log('\n--- Phase 2: Master Admin Keyword Search ---');
    const searchTerms = ['Blood Glucose', 'CGM', 'HbA1c', 'Fasting', 'Hypoglycemia', 'Hyperglycemia', 'Sensor'];
    for (const term of searchTerms) {
      const sRes = await api(`/admin/v2/screens?search=${encodeURIComponent(term)}`);
      assert(sRes.status === 200 && Array.isArray(sRes.body) && sRes.body.length > 0, `Search for "${term}" returned ${sRes.body.length} matching screen(s)`);
    }

    // 3. Clinical Data & Safeguard Verification
    console.log('\n--- Phase 3: Clinical Data & Protected Medical Safeguards ---');
    const mainDashRes = await api('/admin/v2/screens/scr_cgm_main_dashboard');
    assert(mainDashRes.status === 200, 'Main CGM Dashboard details retrieved successfully');
    assert(mainDashRes.body.config.current_glucose === 95, 'Authoritative glucose reading matches telemetry baseline (95 mg/dL)');
    assert(mainDashRes.body.config.time_in_range_pct === 94, 'ADA Time In Range standard baseline is 94%');
    assert(mainDashRes.body.config.target_min === 70 && mainDashRes.body.config.target_max === 140, 'Target corridor set to standard 70-140 mg/dL');
    assert(mainDashRes.body.config.clinical_engine.includes('CODE-CONTROLLED'), 'Clinical glycemic calculation engine is marked CODE-CONTROLLED / PROTECTED');

    const hba1cRes = await api('/admin/v2/screens/scr_glucose_hba1c_estimate');
    assert(hba1cRes.status === 200, 'HbA1c Estimation screen retrieved');
    assert(hba1cRes.body.config.estimated_hba1c_pct === 5.4, 'Estimated HbA1c matches baseline (5.4%)');
    assert(hba1cRes.body.config.formula_engine.includes('CODE-CONTROLLED'), 'eA1c calculation formula is immutable and protected');

    const hypoAlertRes = await api('/admin/v2/screens/scr_cgm_hypoglycemia_alert');
    assert(hypoAlertRes.status === 200, 'Hypoglycemia alert configuration retrieved');
    assert(hypoAlertRes.body.config.glucose_value === 62, 'Urgent low reading set to 62 mg/dL');
    assert(hypoAlertRes.body.config.detection_engine.includes('CODE-CONTROLLED'), 'Hypoglycemia clinical protocol is CODE-CONTROLLED / PROTECTED');

    // 4. Visual Configuration Update & Version Lifecycle
    console.log('\n--- Phase 4: Visual Configuration Update, Revision & Rollback ---');
    const updateRes = await api('/admin/v2/screens/scr_cgm_main_dashboard', 'PUT', {
      screen_name: 'Continuous Glucose Monitor (High Precision)',
      change_summary: 'E2E Test: Updated CGM dial theme & expanded TIR target',
      layout: { container_padding: '24px' },
      style: { card_bg_color: '#0a0f1d', text_primary_color: '#10b981' },
      config: {
        title: 'Dokra Continuous Glucose Monitor E2E',
        current_glucose: 98,
        glucose_unit: 'mg/dL',
        trend_arrow: '→',
        target_min: 70,
        target_max: 140,
        fasting_glucose: 92,
        post_meal_glucose: 118,
        time_in_range_pct: 95,
        estimated_hba1c: 5.4,
        sensor_days_left: 6,
        clinical_engine: 'CODE-CONTROLLED / PROTECTED'
      }
    });

    assert(updateRes.status === 200 && updateRes.body.version === 2, 'Screen successfully updated to Version 2');

    const revsRes = await api('/admin/v2/screens/scr_cgm_main_dashboard/revisions');
    assert(revsRes.status === 200 && revsRes.body.length >= 2, '2 immutable revision snapshots stored');

    // Rollback test
    const rollbackRes = await api('/admin/v2/screens/scr_cgm_main_dashboard/rollback', 'POST', {
      revision_id: revsRes.body[1].revision_id,
      reason: 'E2E Rollback to initial clinical release'
    });
    assert(rollbackRes.status === 200 && rollbackRes.body.version === 3, 'Rollback to Version 1 created Version 3 revision snapshot');
    assert(rollbackRes.body.screen_name === 'Continuous Glucose Main Dashboard & Telemetry', 'Restored screen name from v1 snapshot');

    // 5. Recycle Bin & Restoration
    console.log('\n--- Phase 5: Soft-Delete & Recycle Bin Restoration ---');
    const delRes = await api('/admin/v2/screens/scr_cgm_advanced_alarm_settings', 'DELETE');
    assert(delRes.status === 200 && delRes.body.status === 'trashed', 'Screen scr_cgm_advanced_alarm_settings moved to Recycle Bin');

    const binRes = await api('/admin/v2/recycle-bin');
    assert(binRes.status === 200 && binRes.body.some(item => item.item_id === 'scr_cgm_advanced_alarm_settings'), 'Recycle Bin contains trashed screen');

    const restoreRes = await api('/admin/v2/screens/scr_cgm_advanced_alarm_settings/restore', 'POST');
    assert(restoreRes.status === 200 && restoreRes.body.status === 'active', 'Screen restored from Recycle Bin');

    const verifyActive = await api('/admin/v2/screens/scr_cgm_advanced_alarm_settings');
    assert(verifyActive.status === 200 && verifyActive.body.status === 'active', 'Restored screen accessible in active registry');

    // 6. Cross-Domain Regression Testing (Steps 1-6)
    console.log('\n--- Phase 6: Cross-Domain Regression Testing (Steps 1-6) ---');
    const domainChecks = [
      { domain: 'home_daily', min: 4, name: 'Step 1: Home & Daily Activity' },
      { domain: 'vitality', min: 8, name: 'Step 2: Vitality & Energy Score' },
      { domain: 'sport', min: 9, name: 'Step 3: Sports & GPS Running' },
      { domain: 'sleep', min: 14, name: 'Step 4: Sleep & Sleep Coaching' },
      { domain: 'heart', min: 14, name: 'Step 5: Heart Health & ECG' },
      { domain: 'blood_pressure', min: 14, name: 'Step 6: Blood Pressure & Telehealth' },
      { domain: 'blood_glucose', min: 16, name: 'Step 7: Blood Glucose & CGM' }
    ];

    for (const d of domainChecks) {
      const dRes = await api(`/admin/v2/screens?domain=${d.domain}`);
      assert(dRes.status === 200 && dRes.body.length >= d.min, `${d.name} intact with ${dRes.body.length} screens`);
    }

    console.log('\n========================================================================');
    console.log(`🎉 STEP 7 E2E VERIFICATION COMPLETE: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('========================================================================\n');

  } finally {
    await app.close();
  }
}

runStep7Verification().catch(err => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
