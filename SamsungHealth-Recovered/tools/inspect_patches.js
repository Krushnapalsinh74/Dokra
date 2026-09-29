const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool';

// 1. Check checkRestartWorkout in LiveTrackerService.smali
const ltsPath = apktoolDir + '/smali_classes5/com/samsung/android/app/shealth/tracker/sport/livetracker/LiveTrackerService.smali';
const lts = fs.readFileSync(ltsPath, 'utf8');
const crwStart = lts.indexOf('.method private checkRestartWorkout()V');
const crwEnd = lts.indexOf('.end method', crwStart);
console.log('=== LiveTrackerService checkRestartWorkout ===');
console.log(lts.substring(crwStart, crwEnd + 11));

// 2. Check dy8.smali lines 2315-2340
const dy8Path = apktoolDir + '/smali_classes5/dy8.smali';
const dy8 = fs.readFileSync(dy8Path, 'utf8');
const lines = dy8.split('\n');
console.log('=== dy8.smali 2315-2340 ===');
console.log(lines.slice(2315, 2345).join('\n'));
