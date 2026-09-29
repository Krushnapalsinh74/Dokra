const fs = require('fs');
const path = require('path');

const apktoolDir = path.resolve(__dirname, '..', 'apktool');

const manifest = fs.readFileSync(path.join(apktoolDir, 'AndroidManifest.xml'), 'utf8');

const activityRegex = /<activity[^>]*android:name="([^"]+)"[^>]*>/g;
let match;
const activities = [];
while ((match = activityRegex.exec(manifest)) !== null) {
    activities.push(match[1]);
}

const sportActivities = activities.filter(a => 
    a.toLowerCase().includes('sport') || 
    a.toLowerCase().includes('tracker') || 
    a.toLowerCase().includes('exercise') ||
    a.toLowerCase().includes('permission') ||
    a.toLowerCase().includes('workout') ||
    a.toLowerCase().includes('map')
);

console.log('Sport/Tracker/Permission activities in manifest:');
console.log(JSON.stringify(sportActivities, null, 2));
