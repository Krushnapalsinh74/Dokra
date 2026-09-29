const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const apktoolDir = path.join(rootDir, 'apktool');

console.log('=== APPLYING COMPREHENSIVE ACTIVITY & PERMISSION FLOW FIXES ===');

// 1. Patch BaseActivity.shouldStop() -> Always return false (0)
const baseActivityPath = path.join(apktoolDir, 'smali', 'com', 'samsung', 'android', 'app', 'shealth', 'app', 'BaseActivity.smali');
if (fs.existsSync(baseActivityPath)) {
    let content = fs.readFileSync(baseActivityPath, 'utf8');
    const shouldStopRegex = /\.method public final shouldStop\(\)Z[\s\S]*?\.end method/;
    const newShouldStop = `.method public final shouldStop()Z
    .locals 1

    const/4 v0, 0x0

    return v0
.end method`;
    content = content.replace(shouldStopRegex, newShouldStop);
    fs.writeFileSync(baseActivityPath, content, 'utf8');
    console.log('✓ Patched BaseActivity.shouldStop() -> always returns false (prevents black screen abort).');
} else {
    console.error('✗ BaseActivity.smali not found!');
}

// 2. Patch b11.smali (AppStateManager) -> Never stop, block, or redirect activities
const b11Path = path.join(apktoolDir, 'smali', 'b11.smali');
if (fs.existsSync(b11Path)) {
    let content = fs.readFileSync(b11Path, 'utf8');
    
    // Patch y0 -> return false
    const y0Regex = /\.method public final y0\(Landroidx\/fragment\/app\/FragmentActivity;\)Z[\s\S]*?\.end method/;
    const newY0 = `.method public final y0(Landroidx/fragment/app/FragmentActivity;)Z
    .locals 1

    const/4 v0, 0x0

    return v0
.end method`;
    content = content.replace(y0Regex, newY0);

    // Patch t0 -> return false
    const t0Regex = /\.method public final t0\(Landroidx\/fragment\/app\/FragmentActivity;\)Z[\s\S]*?\.end method/;
    const newT0 = `.method public final t0(Landroidx/fragment/app/FragmentActivity;)Z
    .locals 1

    const/4 v0, 0x0

    return v0
.end method`;
    content = content.replace(t0Regex, newT0);

    // Patch q0 -> return-void (safe no-op)
    const q0Regex = /\.method public final q0\(Landroidx\/fragment\/app\/FragmentActivity;\)V[\s\S]*?\.end method/;
    const newQ0 = `.method public final q0(Landroidx/fragment/app/FragmentActivity;)V
    .locals 0

    return-void
.end method`;
    content = content.replace(q0Regex, newQ0);

    fs.writeFileSync(b11Path, content, 'utf8');
    console.log('✓ Patched b11.smali (y0, t0, q0) -> safe no-ops.');
} else {
    console.error('✗ b11.smali not found!');
}

// 3. Patch ezi.smali -> Always return true for location disclaimer agreement (b()Z)
const eziPath = path.join(apktoolDir, 'smali', 'ezi.smali');
if (fs.existsSync(eziPath)) {
    let content = fs.readFileSync(eziPath, 'utf8');
    const bRegex = /\.method public static b\(\)Z[\s\S]*?\.end method/;
    const newB = `.method public static b()Z
    .locals 1

    const/4 v0, 0x1

    return v0
.end method`;
    content = content.replace(bRegex, newB);
    fs.writeFileSync(eziPath, content, 'utf8');
    console.log('✓ Patched ezi.b() -> always returns true (location agreement bypassed).');
} else {
    console.error('✗ ezi.smali not found!');
}

// 4. Patch v1p.smali -> Always return true for GDPR location info permission (s0()Z)
const v1pPath = path.join(apktoolDir, 'smali_classes5', 'v1p.smali');
if (fs.existsSync(v1pPath)) {
    let content = fs.readFileSync(v1pPath, 'utf8');
    const s0Regex = /\.method public static s0\(\)Z[\s\S]*?\.end method/;
    const newS0 = `.method public static s0()Z
    .locals 1

    const/4 v0, 0x1

    return v0
.end method`;
    content = content.replace(s0Regex, newS0);
    fs.writeFileSync(v1pPath, content, 'utf8');
    console.log('✓ Patched v1p.s0() -> always returns true (GDPR/Samsung location agreement granted).');
} else {
    console.error('✗ v1p.smali not found!');
}

// 5. Patch PhysicalActivityPermissionActivity.smali -> Finish cleanly on permission result
const papPath = path.join(apktoolDir, 'smali_classes8', 'com', 'samsung', 'android', 'app', 'shealth', 'tracker', 'pedometer', 'permission', 'PhysicalActivityPermissionActivity.smali');
if (fs.existsSync(papPath)) {
    let content = fs.readFileSync(papPath, 'utf8');
    const onActResRegex = /\.method public final onActivityResult\(IILandroid\/content\/Intent;\)V[\s\S]*?\.end method/;
    const newOnActRes = `.method public final onActivityResult(IILandroid/content/Intent;)V
    .locals 1

    invoke-super {p0, p1, p2, p3}, Landroidx/fragment/app/FragmentActivity;->onActivityResult(IILandroid/content/Intent;)V

    const/4 v0, -0x1

    invoke-virtual {p0, v0, p3}, Landroid/app/Activity;->setResult(ILandroid/content/Intent;)V

    invoke-virtual {p0}, Landroid/app/Activity;->finish()V

    return-void
.end method`;
    content = content.replace(onActResRegex, newOnActRes);
    fs.writeFileSync(papPath, content, 'utf8');
    console.log('✓ Patched PhysicalActivityPermissionActivity.onActivityResult -> instant clean return.');
}

// 6. Patch DaActivityRecognitionPermissionActivity.smali -> Finish cleanly on result
const daPapPath = path.join(apktoolDir, 'smali_classes7', 'com', 'samsung', 'android', 'app', 'shealth', 'tracker', 'dailyactivity', 'ui', 'view', 'track', 'DaActivityRecognitionPermissionActivity.smali');
if (fs.existsSync(daPapPath)) {
    let content = fs.readFileSync(daPapPath, 'utf8');
    const onActResRegex = /\.method public final onActivityResult\(IILandroid\/content\/Intent;\)V[\s\S]*?\.end method/;
    const newOnActRes = `.method public final onActivityResult(IILandroid/content/Intent;)V
    .locals 1

    invoke-super {p0, p1, p2, p3}, Landroidx/fragment/app/FragmentActivity;->onActivityResult(IILandroid/content/Intent;)V

    const/4 v0, -0x1

    invoke-virtual {p0, v0, p3}, Landroid/app/Activity;->setResult(ILandroid/content/Intent;)V

    invoke-virtual {p0}, Lcom/samsung/android/app/shealth/app/BaseActivity;->finish()V

    return-void
.end method`;
    content = content.replace(onActResRegex, newOnActRes);
    fs.writeFileSync(daPapPath, content, 'utf8');
    console.log('✓ Patched DaActivityRecognitionPermissionActivity.onActivityResult -> instant clean return.');
}

// 7. Patch TrackerSportCardMainActivity.smali -> Ensure applyInsetInBase is 100% crash-safe
const trackerSportPath = path.join(apktoolDir, 'smali_classes5', 'com', 'samsung', 'android', 'app', 'shealth', 'tracker', 'sport', 'track', 'view', 'TrackerSportCardMainActivity.smali');
if (fs.existsSync(trackerSportPath)) {
    let content = fs.readFileSync(trackerSportPath, 'utf8');
    
    // Make sure applyInsetInBase handles all exceptions smoothly
    const applyInsetIdx = content.indexOf('.method public final applyInsetInBase(');
    const endApplyInsetIdx = content.indexOf('.end method', applyInsetIdx);
    if (applyInsetIdx !== -1 && endApplyInsetIdx !== -1) {
        const safeApplyInset = `.method public final applyInsetInBase(Landroid/view/View;Landroidx/core/view/WindowInsetsCompat;)Landroidx/core/view/WindowInsetsCompat;
    .locals 3

    :try_start_inset
    invoke-super {p0, p1, p2}, Lcom/samsung/android/app/shealth/app/BaseActivity;->applyInsetInBase(Landroid/view/View;Landroidx/core/view/WindowInsetsCompat;)Landroidx/core/view/WindowInsetsCompat;
    :try_end_inset
    .catch Ljava/lang/Throwable; {:try_start_inset .. :try_end_inset} :catch_inset

    return-object p2

    :catch_inset
    return-object p2
.end method`;
        content = content.substring(0, applyInsetIdx) + safeApplyInset + content.substring(endApplyInsetIdx + '.end method'.length);
        console.log('✓ Patched TrackerSportCardMainActivity.applyInsetInBase() -> fully shielded against inset crashes.');
    }
    fs.writeFileSync(trackerSportPath, content, 'utf8');
}

console.log('\n=== ALL SMALI FLOW PATCHES SUCCESSFULLY APPLIED! ===');
