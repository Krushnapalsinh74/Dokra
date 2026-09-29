const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5/com/samsung/android/app/shealth/tracker/sport/livetracker';
const c = fs.readFileSync(apktoolDir + '/LiveTrackerService.smali', 'utf8');

const lines = c.split('\n');
console.log(lines.slice(5280, 5350).join('\n'));
