const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5/com/samsung/android/app/shealth/tracker/sport/livetracker';
const c = fs.readFileSync(apktoolDir + '/LiveTrackerService.smali', 'utf8');

['restartInternal', 'prepareRestartInternal', 'finalizeCrashRestart', 'finalizeNonCrashRestart'].forEach(m => {
    const s = c.indexOf(m);
    console.log(m + ' found: ' + (s !== -1));
});
