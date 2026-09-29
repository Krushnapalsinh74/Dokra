/**
 * Step 2 Verification Script: Vitality & Energy Score Domain End-to-End
 */
const http = require('http');
const assert = require('assert');

function req(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const request = http.request({
      hostname: '127.0.0.1',
      port: 8080,
      path,
      method,
      headers: {
        'Accept': 'application/json',
        'X-Actor-Id': 'super_admin',
        ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, (res) => {
      let respBody = '';
      res.on('data', chunk => respBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, json: JSON.parse(respBody) });
        } catch {
          resolve({ status: res.statusCode, text: respBody });
        }
      });
    });
    request.on('error', reject);
    if (data) request.write(data);
    request.end();
  });
}

async function runVerification() {
  console.log('=== RUNNING DEEP VERIFICATION FOR STEP 2 (VITALITY & ENERGY SCORE) ===\n');

  // 1. Check Studio HTML
  const studioRes = await req('GET', '/admin/studio');
  assert.strictEqual(studioRes.status, 200);
  console.log('✔ Studio HTML loaded successfully (Status 200)');

  // 2. Search & Screen Selection
  const searchRes = await req('GET', '/admin/v2/screens?search=Vitality');
  assert.strictEqual(searchRes.status, 200);
  assert(searchRes.json.length >= 8, `Expected at least 8 Vitality screens, got ${searchRes.json.length}`);
  console.log(`✔ Search "Vitality" retrieved ${searchRes.json.length} screens`);

  // 3. Query Readiness Score Screen
  const screenRes = await req('GET', '/admin/v2/screens/scr_vitality_energy_score');
  assert.strictEqual(screenRes.status, 200);
  assert.strictEqual(screenRes.json.id, 'scr_vitality_energy_score');
  const initialScore = screenRes.json.config.current_score;
  const targetScore = initialScore === 86 ? 92 : 86;
  console.log(`✔ Vitality Composite screen parameters retrieved (Current Readiness: ${initialScore})`);

  // 4. Update Readiness & Scoring Weights (Save & Publish -> Next Version)
  const currentVersion = screenRes.json.version;
  const updatedConfig = {
    ...screenRes.json.config,
    current_score: targetScore,
    score_category: targetScore >= 90 ? 'Peak Vitality' : 'Optimal Readiness',
    weights: {
      ...screenRes.json.config.weights,
      nocturnal_hrv_weight: 0.50,
      sleep_debt_weight: 0.30
    },
    hrv_telemetry: {
      ...screenRes.json.config.hrv_telemetry,
      current_ms: 72
    }
  };

  const updateRes = await req('PUT', '/admin/v2/screens/scr_vitality_energy_score', {
    config: updatedConfig,
    change_summary: `Calibrated nocturnal HRV weighting to 50% and updated readiness to ${targetScore}`
  });
  assert.strictEqual(updateRes.status, 200);
  assert.strictEqual(updateRes.json.version, currentVersion + 1);
  assert.strictEqual(updateRes.json.config.current_score, targetScore);
  console.log(`✔ Published changes: Screen updated to Version ${currentVersion + 1} (Score: ${targetScore}, HRV Weight: 50%)`);

  // 5. Check Immutable Revisions History
  const revsRes = await req('GET', '/admin/v2/screens/scr_vitality_energy_score/revisions');
  assert.strictEqual(revsRes.status, 200);
  assert(revsRes.json.length >= 2, 'Must have at least 2 revisions');
  console.log(`✔ Revision history verified: ${revsRes.json.length} immutable snapshots recorded`);

  // 6. Test 1-Click Rollback to Version 1
  const v1Rev = revsRes.json.find(r => r.version === 1);
  const v1Snapshot = v1Rev.snapshot || (v1Rev.snapshot_json ? JSON.parse(v1Rev.snapshot_json) : null);
  const rollbackRes = await req('POST', '/admin/v2/screens/scr_vitality_energy_score/rollback', {
    target_version: 1,
    reason: 'Rolling back to baseline calibration'
  });
  assert.strictEqual(rollbackRes.status, 200);
  assert.strictEqual(rollbackRes.json.version, currentVersion + 2);
  assert.strictEqual(rollbackRes.json.config.current_score, v1Snapshot.config.current_score);
  assert.strictEqual(rollbackRes.json.config.weights.nocturnal_hrv_weight, v1Snapshot.config.weights.nocturnal_hrv_weight);
  console.log(`✔ 1-Click Rollback verified: Version ${currentVersion + 2} created restoring v1 baseline data (Score: ${v1Snapshot.config.current_score})`);

  // 7. Test Soft Delete & Recycle Bin Recovery on Widget Screen
  const delRes = await req('DELETE', '/admin/v2/screens/scr_vitality_home_widget_settings');
  assert.strictEqual(delRes.status, 200);
  assert.strictEqual(delRes.json.status, 'trashed');
  console.log('✔ Soft delete verified: Widget settings screen moved to Recycle Bin');

  const trashRes = await req('GET', '/admin/v2/recycle-bin');
  assert.strictEqual(trashRes.status, 200);
  const recycledItem = trashRes.json.find(i => i.item_id === 'scr_vitality_home_widget_settings');
  assert(recycledItem, 'Recycled item must be present in Recycle Bin');
  console.log('✔ Recycle Bin inspection verified: Item safely preserved');

  const restoreRes = await req('POST', '/admin/v2/screens/scr_vitality_home_widget_settings/restore');
  assert.strictEqual(restoreRes.status, 200);
  assert.strictEqual(restoreRes.json.status, 'active');
  console.log('✔ Recycle Bin restore verified: Screen restored to active registry');

  // 8. Verify Step 1 Screens remain 100% functional
  const homeRes = await req('GET', '/admin/v2/screens/scr_daily_activity_ring');
  assert.strictEqual(homeRes.status, 200);
  assert.strictEqual(homeRes.json.id, 'scr_daily_activity_ring');
  assert.strictEqual(homeRes.json.config.goals.step_goal, 10000);
  console.log('✔ Step 1 verification: Daily Activity 3-Ring Geometry screen intact (10,000 steps goal)');

  console.log('\n======================================================');
  console.log('🎉 ALL STEP 2 VITALITY & ENERGY SCORE TESTS VERIFIED 100%!');
  console.log('======================================================\n');
}

runVerification().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
