const fs = require('fs');
const path = require('path');

const trackerPath = path.resolve(__dirname, '..', 'apktool', 'smali_classes5', 'com', 'samsung', 'android', 'app', 'shealth', 'tracker', 'sport', 'track', 'view', 'TrackerSportCardMainActivity.smali');
const content = fs.readFileSync(trackerPath, 'utf8');

const methodRegex = /\.method ([^{]+)/g;
let m;
const methods = [];
while ((m = methodRegex.exec(content)) !== null) {
    methods.push(m[1].trim());
}

console.log('Methods in TrackerSportCardMainActivity:');
console.log(methods);
