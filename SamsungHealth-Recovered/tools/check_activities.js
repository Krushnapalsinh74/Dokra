const fs = require('fs');
const path = require('path');
const manifestPath = path.resolve(__dirname, '..', 'apktool', 'AndroidManifest.xml');
const manifest = fs.readFileSync(manifestPath, 'utf8');

console.log('Does manifest have HomeDashboardActivity?', manifest.includes('HomeDashboardActivity'));
console.log('Does manifest have HomeMainActivity?', manifest.includes('HomeMainActivity'));
console.log('Does manifest have DokraAuthActivity?', manifest.includes('DokraAuthActivity'));
