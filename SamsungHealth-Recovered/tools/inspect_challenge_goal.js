const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5/com/samsung/android/app/shealth/tracker/sport/track/view/widget';
const c = fs.readFileSync(apktoolDir + '/ExerciseChallengeGoalView.smali', 'utf8');

const lines = c.split('\n');
console.log(lines.slice(0, 40).join('\n'));
