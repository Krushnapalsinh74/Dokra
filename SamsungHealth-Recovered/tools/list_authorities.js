const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '..', 'apktool', 'AndroidManifest.xml');
const manifest = fs.readFileSync(manifestPath, 'utf8');

const authorities = [...manifest.matchAll(/android:authorities="([^"]+)"/g)].map(m => m[1]);
console.log(`Found ${authorities.length} authorities in manifest:`);
authorities.forEach(a => console.log(' -', a));

const permissions = [...manifest.matchAll(/<permission[^>]+android:name="([^"]+)"/g)].map(m => m[1]);
console.log(`\nFound ${permissions.length} declared permissions in manifest:`);
permissions.forEach(p => console.log(' -', p));
