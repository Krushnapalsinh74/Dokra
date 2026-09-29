const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool';
const ltsPath = apktoolDir + '/smali_classes5/com/samsung/android/app/shealth/tracker/sport/livetracker/LiveTrackerService.smali';
const lts = fs.readFileSync(ltsPath, 'utf8');

const s = lts.indexOf('.method public initializeCoachingEngine()V');
const e = lts.indexOf('.end method', s);
console.log(lts.substring(s, e + 11));
