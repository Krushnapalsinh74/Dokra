const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const apktoolDir = path.join(rootDir, 'apktool');
const buildDir = path.join(rootDir, 'build');
const desktopDir = path.resolve(rootDir, '..');

const buildTools = 'C:\\AndroidEnv\\android-sdk\\build-tools\\35.0.0';
const zipalign = path.join(buildTools, 'zipalign.exe');
const apksigner = path.join(buildTools, 'apksigner.bat');
const apktoolJar = path.join(rootDir, 'tools', 'apktool.jar');
const keystore = path.join(buildDir, 'dokra-release.keystore');

console.log('=== Building Final Installable Dokra Health APKs ===');

// 1. Build Original Package APK (com.sec.android.app.shealth)
console.log('\n[1/2] Building Dokra Health.apk (Original Package)...');
const unsigned1 = path.join(buildDir, 'DokraHealth-unsigned.apk');
const aligned1 = path.join(buildDir, 'DokraHealth-aligned.apk');
const signed1Build = path.join(buildDir, 'Dokra Health.apk');
const signed1Desktop = path.join(desktopDir, 'Dokra Health.apk');

console.log('Running Apktool build...');
execSync(`java -Xmx4g -jar "${apktoolJar}" b "${apktoolDir}" -o "${unsigned1}"`, { stdio: 'inherit' });

console.log('Running Zipalign...');
execSync(`"${zipalign}" -f -v 4 "${unsigned1}" "${aligned1}"`, { stdio: 'ignore' });

console.log('Signing with apksigner (v1+v2+v3)...');
execSync(`"${apksigner}" sign --ks "${keystore}" --ks-key-alias "dokra" --ks-pass "pass:dokra123" --key-pass "pass:dokra123" --v1-signing-enabled true --v2-signing-enabled true --v3-signing-enabled true --out "${signed1Build}" "${aligned1}"`, { stdio: 'inherit' });

console.log('Verifying signature...');
execSync(`"${apksigner}" verify --verbose "${signed1Build}"`, { stdio: 'inherit' });

fs.copyFileSync(signed1Build, signed1Desktop);
console.log(`Copied: ${signed1Desktop}`);

// 2. Build Standalone Package APK (com.dokra.health)
console.log('\n[2/2] Building Dokra Health (Standalone).apk (Package: com.dokra.health)...');

const manifestPath = path.join(apktoolDir, 'AndroidManifest.xml');
let manifestContent = fs.readFileSync(manifestPath, 'utf8');

// Replace package name and authority prefixes to prevent signature conflicts on Samsung devices
const updatedManifest = manifestContent
    .replaceAll('package="com.sec.android.app.shealth"', 'package="com.dokra.health"')
    .replaceAll('android:authorities="com.sec.android.app.shealth', 'android:authorities="com.dokra.health')
    .replaceAll('android:authorities="com.samsung.android.app.shealth', 'android:authorities="com.dokra.health');

const tempManifestDir = path.join(buildDir, 'apktool-standalone');
if (fs.existsSync(tempManifestDir)) {
    fs.rmSync(tempManifestDir, { recursive: true, force: true });
}

console.log('Copying apktool source for standalone build...');
fs.cpSync(apktoolDir, tempManifestDir, { recursive: true });
fs.writeFileSync(path.join(tempManifestDir, 'AndroidManifest.xml'), updatedManifest, 'utf8');

// Also update apktool.yml if present
const apktoolYmlPath = path.join(tempManifestDir, 'apktool.yml');
if (fs.existsSync(apktoolYmlPath)) {
    let ymlContent = fs.readFileSync(apktoolYmlPath, 'utf8');
    ymlContent = ymlContent.replace(/renameManifestPackage:\s*null/, 'renameManifestPackage: com.dokra.health');
    fs.writeFileSync(apktoolYmlPath, ymlContent, 'utf8');
}

const unsigned2 = path.join(buildDir, 'DokraHealth-Standalone-unsigned.apk');
const aligned2 = path.join(buildDir, 'DokraHealth-Standalone-aligned.apk');
const signed2Build = path.join(buildDir, 'Dokra Health (Standalone).apk');
const signed2Desktop = path.join(desktopDir, 'Dokra Health (Standalone).apk');

console.log('Running Apktool build for Standalone package...');
execSync(`java -Xmx4g -jar "${apktoolJar}" b "${tempManifestDir}" -o "${unsigned2}"`, { stdio: 'inherit' });

console.log('Running Zipalign...');
execSync(`"${zipalign}" -f -v 4 "${unsigned2}" "${aligned2}"`, { stdio: 'ignore' });

console.log('Signing with apksigner (v1+v2+v3)...');
execSync(`"${apksigner}" sign --ks "${keystore}" --ks-key-alias "dokra" --ks-pass "pass:dokra123" --key-pass "pass:dokra123" --v1-signing-enabled true --v2-signing-enabled true --v3-signing-enabled true --out "${signed2Build}" "${aligned2}"`, { stdio: 'inherit' });

console.log('Verifying standalone signature...');
execSync(`"${apksigner}" verify --verbose "${signed2Build}"`, { stdio: 'inherit' });

fs.copyFileSync(signed2Build, signed2Desktop);
console.log(`Copied: ${signed2Desktop}`);

console.log('\n=== BUILD COMPLETE SUCCESSFULLY! ===');
