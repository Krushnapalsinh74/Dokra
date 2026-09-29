const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const apktoolDir = path.join(rootDir, 'apktool');
const manifestPath = path.join(apktoolDir, 'AndroidManifest.xml');
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

console.log('=== STEP 1: ISOLATING DOKRA HEALTH MANIFEST IDENTIFIERS ===');

// 1. Update AndroidManifest.xml
let manifest = fs.readFileSync(manifestPath, 'utf8');

// Package name replacement in manifest root
manifest = manifest.replace(/package="com\.sec\.android\.app\.shealth"/g, 'package="com.dokra.health"');

// Mapping of authorities to be replaced
const authorityReplacements = [
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

for (const [from, to] of authorityReplacements) {
    manifest = manifest.split(from).join(to);
}

// Permission replacements in manifest
const permissionReplacements = [
    ['com.sec.android.app.shealth.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION', 'com.dokra.health.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION'],
    ['com.samsung.android.app.shealth.permission.READ_CONTENT', 'com.dokra.health.permission.READ_CONTENT'],
    ['com.samsung.android.app.shealth.watch.settings.permission.READ_PERMISSION', 'com.dokra.health.watch.settings.permission.READ_PERMISSION'],
    ['com.samsung.android.app.shealth.hearing.permission.SET_VOLUME_DATA', 'com.dokra.health.hearing.permission.SET_VOLUME_DATA']
];

for (const [from, to] of permissionReplacements) {
    manifest = manifest.split(from).join(to);
}

// Satellite property replacement
manifest = manifest.replace(
    'android:name="android.telephony.PROPERTY_SATELLITE_DATA_OPTIMIZED" android:value="com.sec.android.app.shealth"',
    'android:name="android.telephony.PROPERTY_SATELLITE_DATA_OPTIMIZED" android:value="com.dokra.health"'
);

fs.writeFileSync(manifestPath, manifest, 'utf8');
console.log('Updated AndroidManifest.xml successfully.');

// 2. Update res/xml sync adapter files
console.log('\n=== STEP 2: UPDATING RES/XML RESOURCES ===');
const syncFiles = [
    path.join(resDir, 'xml', 'syncadapter.xml'),
    path.join(resDir, 'xml', 'syncadapter_samsung_mobile_web.xml')
];

for (const sf of syncFiles) {
    if (fs.existsSync(sf)) {
        let content = fs.readFileSync(sf, 'utf8');
        content = content.split('com.sec.android.app.shealth.datastore').join('com.dokra.health.datastore');
        fs.writeFileSync(sf, content, 'utf8');
        console.log(`Updated: ${path.relative(rootDir, sf)}`);
    }
}

// 3. Update smali references for authorities and permissions
console.log('\n=== STEP 3: UPDATING SMALI REFERENCES ===');
const allReplacements = [
    ...authorityReplacements,
    ...permissionReplacements
];

function findSmaliFiles(dir) {
    let files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            files = files.concat(findSmaliFiles(full));
        } else if (ent.name.endsWith('.smali')) {
            files.push(full);
        }
    }
    return files;
}

const smaliDirs = fs.readdirSync(apktoolDir)
    .filter(name => name.startsWith('smali'))
    .map(name => path.join(apktoolDir, name));

let modifiedSmaliCount = 0;

for (const sDir of smaliDirs) {
    const smaliFiles = findSmaliFiles(sDir);
    for (const file of smaliFiles) {
        let content = fs.readFileSync(file, 'utf8');
        let fileModified = false;
        for (const [from, to] of allReplacements) {
            if (content.includes(from)) {
                content = content.split(from).join(to);
                fileModified = true;
            }
        }
        if (fileModified) {
            fs.writeFileSync(file, content, 'utf8');
            modifiedSmaliCount++;
        }
    }
}
console.log(`Updated ${modifiedSmaliCount} Smali files with isolated Dokra authorities and permissions.`);

// 4. Rebuild Providers and Inject into Smali
console.log('\n=== STEP 4: COMPILING & INJECTING DOKRA GENERIC PROVIDERS ===');
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
console.log(`Found ${javaFiles.length} Java source files.`);
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

// 5. Final APK Build, Zipalign and Sign
console.log('\n=== STEP 5: FINAL APK BUILD & SIGNING ===');
const unsignedApk = path.join(buildDir, 'DokraHealth-Isolated-unsigned.apk');
const alignedApk = path.join(buildDir, 'DokraHealth-Isolated-aligned.apk');
const finalApk = path.join(buildDir, 'Dokra Health (Standalone).apk');
const desktopApk1 = path.join(rootDir, '..', 'Dokra Health (Standalone).apk');
const desktopApk2 = path.join(rootDir, '..', 'Dokra Health.apk');
const rootDesktopApk = 'C:\\Users\\AE\\Desktop\\Dokra Health (Standalone).apk';
const rootDesktopApk2 = 'C:\\Users\\AE\\Desktop\\Dokra Health.apk';

console.log('Assembling APK with apktool...');
execSync(`java -Xmx4g -jar "${apktoolJar}" b "${apktoolDir}" -o "${unsignedApk}"`, { stdio: 'inherit' });

console.log('Aligning APK with zipalign...');
execSync(`"${zipalign}" -f -v 4 "${unsignedApk}" "${alignedApk}"`, { stdio: 'ignore' });

console.log('Signing with apksigner (v1+v2+v3)...');
execSync(`"${apksigner}" sign --ks "${keystore}" --ks-key-alias "dokra" --ks-pass "pass:dokra123" --key-pass "pass:dokra123" --v1-signing-enabled true --v2-signing-enabled true --v3-signing-enabled true --out "${finalApk}" "${alignedApk}"`, { stdio: 'inherit' });

console.log('Verifying APK signature...');
execSync(`"${apksigner}" verify --verbose "${finalApk}"`, { stdio: 'inherit' });

console.log('\nInspecting package identity with aapt2:');
const badgingOutput = execSync(`"${aapt2}" dump badging "${finalApk}"`, { encoding: 'utf8' });
const packageLine = badgingOutput.split('\n').find(l => l.startsWith('package: '));
const appLabelLine = badgingOutput.split('\n').find(l => l.startsWith('application-label:'));
console.log('  ->', packageLine);
console.log('  ->', appLabelLine);

// Copy to Desktop destinations
fs.copyFileSync(finalApk, desktopApk1);
fs.copyFileSync(finalApk, desktopApk2);
fs.copyFileSync(finalApk, rootDesktopApk);
fs.copyFileSync(finalApk, rootDesktopApk2);

console.log(`\nSuccessfully saved final isolated Dokra APKs to:`);
console.log(` - ${rootDesktopApk}`);
console.log(` - ${rootDesktopApk2}`);
console.log('\n=== DOKRA PACKAGE ISOLATION COMPLETED SUCCESSFULLY ===');
