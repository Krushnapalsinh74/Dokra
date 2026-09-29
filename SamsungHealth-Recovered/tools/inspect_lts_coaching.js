const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5/com/samsung/android/app/shealth/tracker/sport/livetracker';
const c = fs.readFileSync(apktoolDir + '/LiveTrackerService.smali', 'utf8');

const lines = c.split('\n');
for (let i = 5164; i >= 5000; i--) {
    if (lines[i].startsWith('.method ')) {
        console.log('Method at ' + i + ': ' + lines[i]);
        break;
    }
}
console.log(lines.slice(5160, 5230).join('\n'));
