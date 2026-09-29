const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src', 'main', 'java');
const buildDir = path.join(rootDir, 'build');
const classesDir = path.join(buildDir, 'provider-classes');
const dexDir = path.join(buildDir, 'provider-dex');
const apktoolDir = path.join(rootDir, 'apktool');

const androidJar = 'C:\\AndroidEnv\\android-sdk\\platforms\\android-34\\android.jar';
const d8Bat = 'C:\\AndroidEnv\\android-sdk\\build-tools\\35.0.0\\d8.bat';
const apktoolJar = path.join(rootDir, 'tools', 'apktool.jar');
const zipalign = 'C:\\AndroidEnv\\android-sdk\\build-tools\\35.0.0\\zipalign.exe';
const apksigner = 'C:\\AndroidEnv\\android-sdk\\build-tools\\35.0.0\\apksigner.bat';
const keystore = path.join(buildDir, 'dokra-release.keystore');

console.log('=== Step 1: Compiling Java Provider Classes ===');
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
console.log(`Found ${javaFiles.length} Java source files:`);
javaFiles.forEach(f => console.log(' -', path.relative(srcDir, f)));

const fileListArgs = javaFiles.map(f => `"${f}"`).join(' ');
execSync(`javac -d "${classesDir}" -classpath "${androidJar}" ${fileListArgs}`, { stdio: 'inherit' });
console.log('Java compilation successful!\n');

console.log('=== Step 2: Converting .class files to DEX via d8 ===');
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
console.log(`Found ${classFiles.length} compiled class files.`);
const classListArgs = classFiles.map(f => `"${f}"`).join(' ');

execSync(`"${d8Bat}" --output "${dexDir}" --lib "${androidJar}" --min-api 29 ${classListArgs}`, { stdio: 'inherit' });
console.log('D8 conversion successful -> classes.dex generated!\n');

console.log('=== Step 3: Disassembling Provider DEX to Smali ===');
const providerSmaliDir = path.join(buildDir, 'provider-smali');
if (fs.existsSync(providerSmaliDir)) fs.rmSync(providerSmaliDir, { recursive: true, force: true });

console.log('Packaging temp classes.dex into jar...');
const classesDexPath = path.join(dexDir, 'classes.dex');
const tempJarPath = path.join(buildDir, 'providers-dex.jar');
const jarExe = 'C:\\Program Files\\Microsoft\\jdk-17.0.19.10-hotspot\\bin\\jar.exe';
execSync(`"${jarExe}" cvf "${tempJarPath}" -C "${dexDir}" classes.dex`, { stdio: 'ignore' });

console.log('Decompiling generated DEX to smali with apktool...');
execSync(`java -jar "${apktoolJar}" d -f -o "${providerSmaliDir}" "${tempJarPath}"`, { stdio: 'inherit' });

console.log('Provider smali generated:');
const smaliOutputDir = path.join(providerSmaliDir, 'smali', 'com', 'dokra', 'health', 'provider');
if (fs.existsSync(smaliOutputDir)) {
    console.log('Generated smali classes:');
    function printTree(dir, prefix = '') {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const ent of entries) {
            const full = path.join(dir, ent.name);
            if (ent.isDirectory()) printTree(full, prefix + '  ');
            else console.log(`${prefix} - ${ent.name}`);
        }
    }
    printTree(smaliOutputDir);
}

console.log('\n=== Step 4: Injecting Provider Smali into Apktool Source ===');
// Copy the generated smali tree into apktool/smali/com/dokra/health/provider
const targetSmaliDir = path.join(apktoolDir, 'smali', 'com', 'dokra', 'health', 'provider');
if (fs.existsSync(targetSmaliDir)) fs.rmSync(targetSmaliDir, { recursive: true, force: true });
fs.cpSync(smaliOutputDir, targetSmaliDir, { recursive: true });
console.log(`Injected provider smali into: ${targetSmaliDir}`);

console.log('\n=== Step 5: Building, Aligning and Signing Reconstructed APK ===');
const unsignedApk = path.join(buildDir, 'DokraHealth-ProviderInjected-unsigned.apk');
const alignedApk = path.join(buildDir, 'DokraHealth-ProviderInjected-aligned.apk');
const signedApk = path.join(buildDir, 'Dokra Health (Standalone).apk');
const desktopApk = path.join(rootDir, '..', 'Dokra Health (Standalone).apk');

console.log('Running Apktool build...');
execSync(`java -Xmx4g -jar "${apktoolJar}" b "${apktoolDir}" -o "${unsignedApk}"`, { stdio: 'inherit' });

console.log('Running Zipalign...');
execSync(`"${zipalign}" -f -v 4 "${unsignedApk}" "${alignedApk}"`, { stdio: 'ignore' });

console.log('Signing with apksigner (v1+v2+v3)...');
execSync(`"${apksigner}" sign --ks "${keystore}" --ks-key-alias "dokra" --ks-pass "pass:dokra123" --key-pass "pass:dokra123" --v1-signing-enabled true --v2-signing-enabled true --v3-signing-enabled true --out "${signedApk}" "${alignedApk}"`, { stdio: 'inherit' });

console.log('Verifying APK signature & integrity...');
execSync(`"${apksigner}" verify --verbose "${signedApk}"`, { stdio: 'inherit' });

fs.copyFileSync(signedApk, desktopApk);
console.log(`\nCopied verified APK to Desktop: ${desktopApk}`);
console.log('\n=== DOKRA GENERIC PROVIDER BUILD & INJECTION COMPLETE: SUCCESS ===');
