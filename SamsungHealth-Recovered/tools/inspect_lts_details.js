const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5/com/samsung/android/app/shealth/tracker/sport/livetracker';
const c = fs.readFileSync(apktoolDir + '/LiveTrackerService.smali', 'utf8');

const lines = c.split('\n');
console.log('=== Line 1135 ===');
console.log(lines.slice(1125, 1160).join('\n'));

console.log('=== Line 5164 ===');
console.log(lines.slice(5155, 5200).join('\n'));

console.log('=== Line 10948 ===');
console.log(lines.slice(10940, 10975).join('\n'));
