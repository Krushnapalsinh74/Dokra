const fs = require('fs');
const emlPath = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5/com/samsung/android/app/shealth/tracker/sport/exerciselist/ExerciseMainListActivity.smali';
const content = fs.readFileSync(emlPath, 'utf8');

const regex = /\.method ([^{]+)/g;
let m;
const methods = [];
while ((m = regex.exec(content)) !== null) {
    methods.push(m[1].trim().split('\n')[0]);
}

console.log('Methods in ExerciseMainListActivity (' + methods.length + '):');
methods.forEach(me => console.log(' ', me));
