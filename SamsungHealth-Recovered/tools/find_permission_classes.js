const fs = require('fs');
const path = require('path');

const manifestPath = path.resolve(__dirname, '../apktool/AndroidManifest.xml');
const manifest = fs.readFileSync(manifestPath, 'utf8');

const regex = /<activity[^>]*android:name="([^"]*permission[^"]*)"[^>]*>/gi;
let m;
console.log('=== Permission Activities in AndroidManifest ===');
while ((m = regex.exec(manifest)) !== null) {
    console.log(m[1]);
}
