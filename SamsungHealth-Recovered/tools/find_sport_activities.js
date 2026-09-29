const fs = require('fs');
const path = require('path');

const apktoolDir = path.resolve(__dirname, '..', 'apktool');
const manifest = fs.readFileSync(path.join(apktoolDir, 'AndroidManifest.xml'), 'utf8');

const activityRegex = /<activity[^>]*android:name="([^"]+)"[^>]*>/g;
let match;
const activities = [];
while ((match = activityRegex.exec(manifest)) !== null) {
    if (match[1].toLowerCase().includes('tracker.sport')) {
        activities.push(match[1]);
    }
}

console.log('tracker.sport Activities:');
console.log(activities);
