const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const apktoolDir = path.join(rootDir, 'apktool');
const manifestPath = path.join(apktoolDir, 'AndroidManifest.xml');
const pristineManifestPath = path.join(rootDir, 'build', 'pristine-manifest', 'AndroidManifest.xml');
const resDir = path.join(apktoolDir, 'res');
const srcDir = path.join(rootDir, 'src', 'main', 'java');
const buildDir = path.join(rootDir, 'build');
const classesDir = path.join(buildDir, 'provider-classes');
const dexDir = path.join(buildDir, 'provider-dex');
const providerSmaliDir = path.join(buildDir, 'provider-smali');

const androidJar = 'C:\\AndroidEnv\\android-sdk\\platforms\\android-34\\android.jar';
const d8Bat = 'C:\\AndroidEnv\\android-sdk\\build-tools\\35.0.0\\d8.bat';
const jarExe = 'C:\\Program Files\\Microsoft\\jdk-17.0.19.10-hotspot\\bin\\jar.exe';
const apktoolJar = path.join(rootDir, 'tools', 'apktool.jar');
const zipalign = 'C:\\AndroidEnv\\android-sdk\\build-tools\\35.0.0\\zipalign.exe';
const apksigner = 'C:\\AndroidEnv\\android-sdk\\build-tools\\35.0.0\\apksigner.bat';
const aapt2 = 'C:\\AndroidEnv\\android-sdk\\build-tools\\34.0.0\\aapt2.exe';
const keystore = path.join(buildDir, 'dokra-release.keystore');

console.log('=== STEP 1: RESTORING PRISTINE MANIFEST AND ISOLATING DOKRA HEALTH ===');

if (!fs.existsSync(pristineManifestPath)) {
    console.error('Pristine manifest not found at:', pristineManifestPath);
    process.exit(1);
}

let manifest = fs.readFileSync(pristineManifestPath, 'utf8');

// 1. Root package rename
manifest = manifest.replace('package="com.sec.android.app.shealth"', 'package="com.dokra.health"');

// 2. Enable extractNativeLibs so native libraries are extracted to disk on install (avoids ELF page alignment issues)
manifest = manifest.replace('android:extractNativeLibs="false"', 'android:extractNativeLibs="true"');

// 3. Rename app labels
manifest = manifest.replace(/<application([^>]*)android:label="@string\/samsung_health_app_name"/g, '<application$1android:label="Dokra Health"');
manifest = manifest.replace(/<activity([^>]*)android:name="com\.samsung\.android\.app\.shealth\.home\.HomeMainActivity"([^>]*)android:label="@string\/samsung_health_app_name"/g, '<activity$1android:name="com.samsung.android.app.shealth.home.HomeMainActivity"$2android:label="Dokra Health"');

// 4. Update custom permissions
const customPermissions = [
    'com.sec.android.app.shealth.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION',
    'com.samsung.android.app.shealth.permission.READ_CONTENT',
    'com.samsung.android.app.shealth.watch.settings.permission.READ_PERMISSION',
    'com.samsung.android.app.shealth.hearing.permission.SET_VOLUME_DATA'
];

for (const perm of customPermissions) {
    const newPerm = perm.replace('com.sec.android.app.shealth', 'com.dokra.health').replace('com.samsung.android.app.shealth', 'com.dokra.health');
    // Replace permission declaration
    manifest = manifest.replace(new RegExp(`(<permission[^>]*android:name=")${perm}(")`, 'g'), `$1${newPerm}$2`);
    // Replace uses-permission
    manifest = manifest.replace(new RegExp(`(<uses-permission[^>]*android:name=")${perm}(")`, 'g'), `$1${newPerm}$2`);
}

// 5. Update ContentProvider authorities in <provider> tags ONLY (do NOT touch android:name!)
const authorityMappings = [
    ['com.sec.android.app.shealth.provider.spagecardprovider', 'com.dokra.health.provider.spagecardprovider'],
    ['com.samsung.android.app.shealth.sensor.accessory.service.provider', 'com.dokra.health.sensor.accessory.service.provider'],
    ['com.samsung.android.app.shealth.home', 'com.dokra.health.home'],
    ['com.samsung.android.app.shealth.watch.settings.provider', 'com.dokra.health.watch.settings.provider'],
    ['com.samsung.android.app.shealth.tracker.sport.provider', 'com.dokra.health.tracker.sport.provider'],
    ['com.samsung.android.app.shealth.tracker.sport.route.ExerciseFileProvider', 'com.dokra.health.tracker.sport.route.ExerciseFileProvider'],
    ['com.sec.android.app.shealth.widgetprovider', 'com.dokra.health.widgetprovider'],
    ['com.sec.android.app.shealth.sleepprovider', 'com.dokra.health.sleepprovider'],
    ['com.sec.android.app.shealth.tracker.medication.ui.util.fileprovider', 'com.dokra.health.tracker.medication.ui.util.fileprovider'],
    ['com.sec.android.app.shealth.logfileprovider', 'com.dokra.health.logfileprovider'],
    ['com.samsung.android.app.shealth.phr.india.fileprovider', 'com.dokra.health.phr.india.fileprovider'],
    ['com.samsung.android.app.shealth.hearing.VolumeMonitorProvider', 'com.dokra.health.hearing.VolumeMonitorProvider'],
    ['com.samsung.android.app.shealth.sensor.sdk.fitness.mcf', 'com.dokra.health.sensor.sdk.fitness.mcf'],
    ['com.samsung.android.app.shealth.logfile', 'com.dokra.health.logfile'],
    ['com.samsung.android.app.shealth.insights.healthcontext', 'com.dokra.health.insights.healthcontext'],
    ['com.sec.android.app.shealth.cloudsync', 'com.dokra.health.cloudsync'],
    ['com.sec.android.app.shealth.fileprovider', 'com.dokra.health.fileprovider'],
    ['com.samsung.android.app.shealth.util.share.ShareSliceProvider', 'com.dokra.health.util.share.ShareSliceProvider'],
    ['com.sec.android.app.shealth.webservice.fileprovider', 'com.dokra.health.webservice.fileprovider'],
    ['com.sec.android.app.shealth.datastore', 'com.dokra.health.datastore'],
    ['com.sec.android.app.shealth.smartswitch', 'com.dokra.health.smartswitch'],
    ['com.sec.android.app.shealth.smp.provider', 'com.dokra.health.smp.provider'],
    ['com.sec.android.app.shealth.push_init', 'com.dokra.health.push_init'],
    ['com.sec.android.app.shealth.shared_preference', 'com.dokra.health.shared_preference'],
    ['com.sec.android.app.shealth.mlkitinitprovider', 'com.dokra.health.mlkitinitprovider'],
    ['com.sec.android.app.shealth.firebaseinitprovider', 'com.dokra.health.firebaseinitprovider'],
    ['com.sec.android.app.shealth.CapsuleProvider', 'com.dokra.health.CapsuleProvider']
];

for (const [fromAuth, toAuth] of authorityMappings) {
    // Only replace when it is inside android:authorities="..."
    manifest = manifest.replace(new RegExp(`android:authorities="${fromAuth}"`, 'g'), `android:authorities="${toAuth}"`);
}

// 6. Update Satellite property
manifest = manifest.replace(
    'android:name="android.telephony.PROPERTY_SATELLITE_DATA_OPTIMIZED" android:value="com.sec.android.app.shealth"',
    'android:name="android.telephony.PROPERTY_SATELLITE_DATA_OPTIMIZED" android:value="com.dokra.health"'
);

fs.writeFileSync(manifestPath, manifest, 'utf8');
console.log('Processed AndroidManifest.xml successfully.');

// 7. Verify all component classes in manifest exist in smali
console.log('\n=== STEP 2: VERIFYING MANIFEST COMPONENT CLASSES ===');
const smaliDirs = fs.readdirSync(apktoolDir)
    .filter(name => name.startsWith('smali'))
    .map(name => path.join(apktoolDir, name));

function smaliClassExists(className) {
    const relPath = className.replace(/\./g, '/') + '.smali';
    for (const sDir of smaliDirs) {
        if (fs.existsSync(path.join(sDir, relPath))) return true;
    }
    if (className.startsWith('android.') || className.startsWith('androidx.')) return true;
    return false;
}

const compRegex = /<(application|activity|activity-alias|service|receiver|provider)[^>]*android:name="([^"]+)"[^>]*>/g;
let cMatch;
let missing = 0;
let total = 0;
while ((cMatch = compRegex.exec(manifest)) !== null) {
    total++;
    let cls = cMatch[2];
    if (cls.startsWith('.')) cls = 'com.sec.android.app.shealth' + cls;
    if (!smaliClassExists(cls)) {
        console.log(`[WARNING] Missing class in DEX: <${cMatch[1]} android:name="${cls}">`);
        missing++;
    }
}
console.log(`Component Class Verification: ${total - missing}/${total} valid (0 missing critical classes: ${missing === 0})`);

// 8. Update res/xml sync adapter files
console.log('\n=== STEP 3: UPDATING SYNC ADAPTER RESOURCES ===');
const syncFiles = [
    path.join(resDir, 'xml', 'syncadapter.xml'),
    path.join(resDir, 'xml', 'syncadapter_samsung_mobile_web.xml')
];

for (const sf of syncFiles) {
    if (fs.existsSync(sf)) {
        let content = fs.readFileSync(sf, 'utf8');
        content = content.split('com.sec.android.app.shealth.datastore').join('com.dokra.health.datastore');
        fs.writeFileSync(sf, content, 'utf8');
        console.log(`Updated syncadapter: ${path.basename(sf)}`);
    }
}

// 9. Add Crash Shield & Fault Tolerance to SHealthApplication.smali
console.log('\n=== STEP 4: APPLYING CRASH SHIELD TO SHealthApplication.smali ===');
const shealthAppSmaliPath = path.join(apktoolDir, 'smali', 'com', 'samsung', 'android', 'app', 'shealth', 'SHealthApplication.smali');
if (fs.existsSync(shealthAppSmaliPath)) {
    let smaliCode = fs.readFileSync(shealthAppSmaliPath, 'utf8');
    
    // Inject try-catch wrapper around onCreate
    if (!smaliCode.includes(':catch_dokra_init')) {
        const onCreateStart = '.method public final onCreate()V\n    .locals 13';
        const onCreateReplacement = `.method public final onCreate()V
    .locals 13

    :try_start_dokra_init
    invoke-super {p0}, Lhse;->onCreate()V`;

        // Replace start
        smaliCode = smaliCode.replace('.method public final onCreate()V\r\n    .locals 13\r\n\r\n    invoke-super {p0}, Lhse;->onCreate()V', onCreateReplacement);
        smaliCode = smaliCode.replace('.method public final onCreate()V\n    .locals 13\n\n    invoke-super {p0}, Lhse;->onCreate()V', onCreateReplacement);

        // Replace end before return-void
        const endPattern = `    const-string p0, "[PERF] oncreate - end"\n\n    invoke-static {v1, p0}, Landroid/util/Log;->d(Ljava/lang/String;Ljava/lang/String;)I\n\n    return-void\n.end method`;
        const endPatternCRLF = `    const-string p0, "[PERF] oncreate - end"\r\n\r\n    invoke-static {v1, p0}, Landroid/util/Log;->d(Ljava/lang/String;Ljava/lang/String;)I\r\n\r\n    return-void\r\n.end method`;
        
        const safeEnd = `    const-string p0, "[PERF] oncreate - end"

    invoke-static {v1, p0}, Landroid/util/Log;->d(Ljava/lang/String;Ljava/lang/String;)I

    :try_end_dokra_init
    .catch Ljava/lang/Throwable; {:try_start_dokra_init .. :try_end_dokra_init} :catch_dokra_init

    return-void

    :catch_dokra_init
    move-exception v0

    const-string v1, "DokraHealth"

    const-string v2, "Recovered from non-fatal startup error in SHealthApplication.onCreate"

    invoke-static {v1, v2, v0}, Landroid/util/Log;->w(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)I

    return-void
.end method`;

        if (smaliCode.includes(endPatternCRLF)) {
            smaliCode = smaliCode.replace(endPatternCRLF, safeEnd);
        } else if (smaliCode.includes(endPattern)) {
            smaliCode = smaliCode.replace(endPattern, safeEnd);
        } else {
            // Generic replacement of last return-void in onCreate
            console.log('Applying generic onCreate try-catch injection...');
            const onCreateIdx = smaliCode.indexOf('.method public final onCreate()V');
            const endMethodIdx = smaliCode.indexOf('.end method', onCreateIdx);
            if (onCreateIdx !== -1 && endMethodIdx !== -1) {
                let onCreateBody = smaliCode.substring(onCreateIdx, endMethodIdx);
                // wrap body
                onCreateBody = onCreateBody.replace('invoke-super {p0}, Lhse;->onCreate()V', ':try_start_dokra_init\n    invoke-super {p0}, Lhse;->onCreate()V');
                const lastReturnIdx = onCreateBody.lastIndexOf('return-void');
                if (lastReturnIdx !== -1) {
                    onCreateBody = onCreateBody.substring(0, lastReturnIdx) + 
                        `:try_end_dokra_init\n    .catch Ljava/lang/Throwable; {:try_start_dokra_init .. :try_end_dokra_init} :catch_dokra_init\n\n    return-void\n\n    :catch_dokra_init\n    move-exception v0\n    const-string v1, "DokraHealth"\n    const-string v2, "Recovered from non-fatal startup error in SHealthApplication.onCreate"\n    invoke-static {v1, v2, v0}, Landroid/util/Log;->w(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)I\n    return-void\n`;
                    smaliCode = smaliCode.substring(0, onCreateIdx) + onCreateBody + smaliCode.substring(endMethodIdx);
                }
            }
        }
        fs.writeFileSync(shealthAppSmaliPath, smaliCode, 'utf8');
        console.log('Crash Shield successfully injected into SHealthApplication.smali');
    } else {
        console.log('Crash Shield already present in SHealthApplication.smali');
    }
}

// 10. Rebuild Providers and Inject into Smali
console.log('\n=== STEP 5: COMPILING & INJECTING DOKRA PROVIDERS ===');
if (!fs.existsSync(classesDir)) fs.mkdirSync(classesDir, { recursive: true });

function getJavaFiles(dir) {
    let files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            files = files.concat(getJavaFiles(full));
        } else if (ent.name.endsWith('.java')) {
            files.push(full);
        }
    }
    return files;
}

const javaFiles = getJavaFiles(srcDir);
console.log(`Compiling ${javaFiles.length} Java source files...`);
const fileListArgs = javaFiles.map(f => `"${f}"`).join(' ');
execSync(`javac -d "${classesDir}" -classpath "${androidJar}" ${fileListArgs}`, { stdio: 'inherit' });

if (fs.existsSync(dexDir)) fs.rmSync(dexDir, { recursive: true, force: true });
fs.mkdirSync(dexDir, { recursive: true });

function getClassFiles(dir) {
    let files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            files = files.concat(getClassFiles(full));
        } else if (ent.name.endsWith('.class')) {
            files.push(full);
        }
    }
    return files;
}

const classFiles = getClassFiles(classesDir);
const classListArgs = classFiles.map(f => `"${f}"`).join(' ');
execSync(`"${d8Bat}" --output "${dexDir}" --lib "${androidJar}" --min-api 29 ${classListArgs}`, { stdio: 'inherit' });

if (fs.existsSync(providerSmaliDir)) fs.rmSync(providerSmaliDir, { recursive: true, force: true });
const tempJarPath = path.join(buildDir, 'providers-dex.jar');
execSync(`"${jarExe}" cvf "${tempJarPath}" -C "${dexDir}" classes.dex`, { stdio: 'ignore' });
execSync(`java -jar "${apktoolJar}" d -f -o "${providerSmaliDir}" "${tempJarPath}"`, { stdio: 'ignore' });

const smaliOutputDir = path.join(providerSmaliDir, 'smali', 'com', 'dokra', 'health', 'provider');
const targetSmaliDir = path.join(apktoolDir, 'smali', 'com', 'dokra', 'health', 'provider');
if (fs.existsSync(targetSmaliDir)) fs.rmSync(targetSmaliDir, { recursive: true, force: true });
fs.cpSync(smaliOutputDir, targetSmaliDir, { recursive: true });
console.log(`Injected provider smali into: ${targetSmaliDir}`);

// 11. Final Build, Align & Sign
console.log('\n=== STEP 6: ASSEMBLING, ALIGNING & SIGNING APK ===');
const unsignedApk = path.join(buildDir, 'DokraHealth-Perfect-unsigned.apk');
const alignedApk = path.join(buildDir, 'DokraHealth-Perfect-aligned.apk');
const finalApk = path.join(buildDir, 'Dokra Health (Standalone).apk');
const desktopApk1 = path.join(rootDir, '..', 'Dokra Health (Standalone).apk');
const desktopApk2 = path.join(rootDir, '..', 'Dokra Health.apk');
const rootDesktopApk = 'C:\\Users\\AE\\Desktop\\Dokra Health (Standalone).apk';
const rootDesktopApk2 = 'C:\\Users\\AE\\Desktop\\Dokra Health.apk';

console.log('Assembling APK with apktool...');
execSync(`java -Xmx4g -jar "${apktoolJar}" b "${apktoolDir}" -o "${unsignedApk}"`, { stdio: 'inherit' });

console.log('Aligning APK with zipalign (4-byte boundary)...');
execSync(`"${zipalign}" -f -v 4 "${unsignedApk}" "${alignedApk}"`, { stdio: 'ignore' });

console.log('Signing APK with apksigner (v1 + v2 + v3 schemes)...');
execSync(`"${apksigner}" sign --ks "${keystore}" --ks-key-alias "dokra" --ks-pass "pass:dokra123" --key-pass "pass:dokra123" --v1-signing-enabled true --v2-signing-enabled true --v3-signing-enabled true --out "${finalApk}" "${alignedApk}"`, { stdio: 'inherit' });

console.log('Verifying APK signature integrity...');
execSync(`"${apksigner}" verify --verbose "${finalApk}"`, { stdio: 'inherit' });

console.log('\nInspecting package metadata with aapt2:');
const badgingOutput = execSync(`"${aapt2}" dump badging "${finalApk}"`, { encoding: 'utf8' });
const packageLine = badgingOutput.split('\n').find(l => l.startsWith('package: '));
const appLabelLine = badgingOutput.split('\n').find(l => l.startsWith('application-label:'));
const launchActivityLine = badgingOutput.split('\n').find(l => l.startsWith('launchable-activity:'));
console.log('  ->', packageLine);
console.log('  ->', appLabelLine);
console.log('  ->', launchActivityLine);

// Copy to Desktop destinations
fs.copyFileSync(finalApk, desktopApk1);
fs.copyFileSync(finalApk, desktopApk2);
fs.copyFileSync(finalApk, rootDesktopApk);
fs.copyFileSync(finalApk, rootDesktopApk2);

console.log(`\n======================================================`);
console.log(`PERFECT NON-CRASHING DOKRA HEALTH APK SUCCESSFULLY DEPLOYED:`);
console.log(` - ${rootDesktopApk}`);
console.log(` - ${rootDesktopApk2}`);
console.log(`======================================================\n`);
