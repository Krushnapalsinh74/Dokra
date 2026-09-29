const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5/com/samsung/android/app/shealth/tracker/sport/livetracker';
const c = fs.readFileSync(apktoolDir + '/LiveTrackerService.smali', 'utf8');

const s = c.indexOf('lambda');
const methodStart = c.lastIndexOf('.method ', s);
const e = c.indexOf('.end method', s);
console.log(c.substring(methodStart, e + 11));
