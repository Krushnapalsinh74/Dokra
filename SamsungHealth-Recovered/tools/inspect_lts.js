const fs = require('fs');
const path = require('path');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool';

// Inspect LiveTrackerService
const ltsPath = path.join(apktoolDir, 'smali_classes5/com/samsung/android/app/shealth/tracker/sport/livetracker/LiveTrackerService.smali');
const lts = fs.readFileSync(ltsPath, 'utf8');

const methods = [];
const regex = /\.method ([^{]+)/g;
let m;
while ((m = regex.exec(lts)) !== null) {
    methods.push(m[1].trim().split('\n')[0]);
}

console.log('Methods in LiveTrackerService (' + methods.length + '):');
methods.forEach(me => {
    if (me.includes('start') || me.includes('pause') || me.includes('stop') || me.includes('init') || me.includes('location') || me.includes('gps') || me.includes('exercise')) {
        console.log(' ', me);
    }
});
