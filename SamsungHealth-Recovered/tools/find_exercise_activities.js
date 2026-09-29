const fs = require('fs');
const path = require('path');

const manifestPath = path.resolve(__dirname, '../apktool/AndroidManifest.xml');
const manifest = fs.readFileSync(manifestPath, 'utf8');

const regex = /<activity\b[^>]*android:name="([^"]+)"[^>]*>/g;
let match;
const found = [];
while ((match = regex.exec(manifest)) !== null) {
  const name = match[1];
  if (name.includes('sport') || name.includes('pedometer') || name.includes('exercise') || name.includes('tracker.pedometer') || name.includes('tracker.sport')) {
    found.push(name);
  }
}

console.log('=== Exercise / Sport / Pedometer Activities ===');
found.forEach(a => console.log(a));
