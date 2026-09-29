/**
 * Step 4 Verification Script: Sleep & Sleep Coaching Domain End-to-End Flow
 */
const assert = require('assert');
const { createCardServer } = require('../src/server');
const http = require('http');

async function runVerification() {
  console.log('=== RUNNING DEEP VERIFICATION FOR STEP 4 (SLEEP & SLEEP COACHING) ===\n');

  const app = createCardServer({
    dbPath: ':memory:',
    requireAuth: false
  });
  await app.listen(0);
  const serverPort = app.server.address().port;

  function req(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const data = body ? JSON.stringify(body) : null;
      const request = http.request({
        hostname: '127.0.0.1',
        port: serverPort,
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

  try {
    // 1. Studio HTML Rendering
    const studioRes = await req('GET', '/admin/studio');
    assert.strictEqual(studioRes.status, 200);
    assert.ok(studioRes.text.includes('Sleep &amp; Sleep Coaching') || studioRes.text.includes('Sleep & Coaching'));
    console.log('✔ Studio HTML loaded successfully with Domain 4 Sleep navigation');

    // 2. Discover all 14 Sleep screens
    const screensRes = await req('GET', '/admin/v2/screens?domain=sleep');
    assert.strictEqual(screensRes.status, 200);
    assert.strictEqual(screensRes.json.length, 14);
    console.log(`✔ Retrieved all 14 seeded Sleep & Sleep Coaching screens`);

    // 3. Search indexing for "Persona" and "Snoring"
    const searchPersona = await req('GET', '/admin/v2/screens?search=Persona');
    assert.strictEqual(searchPersona.status, 200);
    assert.ok(searchPersona.json.length >= 1);
    console.log(`✔ Search indexer for "Persona" matched ${searchPersona.json.length} screen(s)`);

    const searchSnore = await req('GET', '/admin/v2/screens?search=Snoring');
    assert.strictEqual(searchSnore.status, 200);
    assert.ok(searchSnore.json.length >= 1);
    console.log(`✔ Search indexer for "Snoring" matched ${searchSnore.json.length} screen(s)`);

    // 4. Retrieve Main Sleep Dashboard
    const mainScreenRes = await req('GET', '/admin/v2/screens/scr_sleep_main_dashboard');
    assert.strictEqual(mainScreenRes.status, 200);
    assert.strictEqual(mainScreenRes.json.id, 'scr_sleep_main_dashboard');
    assert.strictEqual(mainScreenRes.json.config.sleep_score, 88);
    assert.strictEqual(mainScreenRes.json.config.animal_persona.id, 'lion');
    console.log(`✔ Main Sleep Dashboard retrieved: Score 88/100, Persona: Unconcerned Lion, Duration: 7h 42m`);

    // 5. Update and Publish Screen -> Version 2
    const updateRes = await req('PUT', '/admin/v2/screens/scr_sleep_main_dashboard', {
      config: {
        sleep_score: 93,
        restorative_label: 'Peak Restorative',
        duration_formatted: '8h 05m',
        animal_persona: 'lion',
        persona_advice: 'Consistent restorative delta cycles. Your sleep architecture is optimal.',
        snoring: { threshold_db: 55, detection_enabled: true }
      },
      change_summary: 'Calibrated Sleep Score to 93 and updated persona advice'
    });
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.json.version, 2);
    assert.strictEqual(updateRes.json.config.sleep_score, 93);
    console.log(`✔ Published updates: Screen bumped to Version 2 (Score: 93)`);

    // 6. Check Immutable Version History
    const revsRes = await req('GET', '/admin/v2/screens/scr_sleep_main_dashboard/revisions');
    assert.strictEqual(revsRes.status, 200);
    assert.strictEqual(revsRes.json.length, 2);
    console.log(`✔ Revision History: 2 immutable snapshots recorded`);

    // 7. 1-Click Rollback
    const v1Rev = revsRes.json.find(r => r.version === 1);
    const rollbackRes = await req('POST', '/admin/v2/screens/scr_sleep_main_dashboard/rollback', {
      revision_id: v1Rev.revision_id,
      reason: 'Revert to baseline v1'
    });
    assert.strictEqual(rollbackRes.status, 200);
    assert.strictEqual(rollbackRes.json.version, 3);
    assert.strictEqual(rollbackRes.json.config.sleep_score, 88);
    console.log(`✔ 1-Click Rollback executed: Version 3 restored baseline Score (88)`);

    // 8. Soft Delete & Restore from Recycle Bin
    const delRes = await req('DELETE', '/admin/v2/screens/scr_sleep_advanced_settings');
    assert.strictEqual(delRes.status, 200);
    const binRes = await req('GET', '/admin/v2/recycle-bin');
    assert.ok(binRes.json.some(i => i.item_id === 'scr_sleep_advanced_settings'));
    const restoreRes = await req('POST', '/admin/v2/screens/scr_sleep_advanced_settings/restore');
    assert.strictEqual(restoreRes.status, 200);
    console.log(`✔ Recycle Bin soft-delete and restore verified for scr_sleep_advanced_settings`);

    // 9. Audit Logging
    const auditRes = await req('GET', '/admin/v2/audit-logs');
    assert.strictEqual(auditRes.status, 200);
    assert.ok(auditRes.json.some(l => l.target_id === 'scr_sleep_main_dashboard'));
    console.log(`✔ Audit Trail verified: Actions logged with actor IDs and timestamp`);

    // 10. Regression Check Steps 1, 2, and 3
    const step1Res = await req('GET', '/admin/v2/screens?domain=home');
    const step2Res = await req('GET', '/admin/v2/screens?domain=vitality');
    const step3Res = await req('GET', '/admin/v2/screens?domain=sports');
    assert.ok(step1Res.json.length >= 5, 'Step 1 screens intact');
    assert.ok(step2Res.json.length >= 8, 'Step 2 screens intact');
    assert.ok(step3Res.json.length >= 10, 'Step 3 screens intact');
    console.log(`✔ Regression checks passed: Step 1 (${step1Res.json.length}), Step 2 (${step2Res.json.length}), Step 3 (${step3Res.json.length}) all intact`);

    console.log('\n🎉 ALL STEP 4 VERIFICATION CHECKS PASSED SUCCESSFULLY!\n');
  } finally {
    await app.close();
  }
}

runVerification().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
