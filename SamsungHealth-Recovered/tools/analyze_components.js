const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '..', 'apktool', 'AndroidManifest.xml');
const manifest = fs.readFileSync(manifestPath, 'utf8');

// Check relative class names (.ClassName)
const relativeComponents = [...manifest.matchAll(/<(?:activity|service|receiver|provider)[^>]+android:name="(\.[^"]+)"/g)].map(m => m[1]);
console.log('Relative component declarations count:', relativeComponents.length);
relativeComponents.forEach(c => console.log(' -', c));

// Check all component names
const allComponents = [...manifest.matchAll(/<(?:activity|service|receiver|provider)[^>]+android:name="([^"]+)"/g)].map(m => m[1]);
console.log('\nTotal component declarations count:', allComponents.length);
const nonSecNonSamsung = allComponents.filter(c => !c.startsWith('com.samsung') && !c.startsWith('com.sec') && !c.startsWith('androidx') && !c.startsWith('com.google'));
console.log('Other components count:', nonSecNonSamsung.length);
nonSecNonSamsung.forEach(c => console.log(' -', c));
