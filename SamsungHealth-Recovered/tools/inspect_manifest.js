const fs = require('fs');
const path = require('path');

const manifestPath = path.resolve(__dirname, '..', 'apktool', 'AndroidManifest.xml');
const manifest = fs.readFileSync(manifestPath, 'utf8');

const regex = /<activity\b([^>]*)>/g;
let match;
const activities = [];

while ((match = regex.exec(manifest)) !== null) {
    const actBody = match[1];
    const nameMatch = actBody.match(/android:name="([^"]+)"/);
    if (nameMatch) {
        activities.push(nameMatch[1]);
    }
}

console.log('Total activities in Manifest:', activities.length);
console.log('Activities related to home/main/dash:');
activities.filter(a => a.toLowerCase().includes('home') || a.toLowerCase().includes('main') || a.toLowerCase().includes('dash') || a.toLowerCase().includes('dokra')).forEach(a => console.log(' -', a));
