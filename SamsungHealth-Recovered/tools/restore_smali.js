const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const jarExe = 'C:\\Program Files\\Microsoft\\jdk-17.0.19.10-hotspot\\bin\\jar.exe';
const apktoolJar = path.join(rootDir, 'tools', 'apktool.jar');
const buildDir = path.join(rootDir, 'build');

const c4Dex = path.join(buildDir, 'temp-original-apk', 'classes4.dex');
const targetClassesDex = path.join(buildDir, 'classes.dex');
fs.copyFileSync(c4Dex, targetClassesDex);

const tempJar = path.join(buildDir, 'temp-c4.jar');
execSync(`"${jarExe}" cvf "${tempJar}" -C "${buildDir}" classes.dex`, { stdio: 'inherit' });

const tempSmaliDir = path.join(buildDir, 'temp-c4-smali');
if (fs.existsSync(tempSmaliDir)) fs.rmSync(tempSmaliDir, { recursive: true, force: true });
execSync(`java -jar "${apktoolJar}" d -f -o "${tempSmaliDir}" "${tempJar}"`, { stdio: 'inherit' });

const pristineSmali = path.join(tempSmaliDir, 'smali', 'com', 'samsung', 'android', 'app', 'shealth', 'home', 'HomeDashboardActivity.smali');
const destSmali = path.join(rootDir, 'apktool', 'smali_classes4', 'com', 'samsung', 'android', 'app', 'shealth', 'home', 'HomeDashboardActivity.smali');

fs.copyFileSync(pristineSmali, destSmali);
console.log('Successfully restored pristine HomeDashboardActivity.smali!');
