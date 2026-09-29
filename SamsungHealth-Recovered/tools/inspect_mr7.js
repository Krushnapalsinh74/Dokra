const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5';
const c = fs.readFileSync(apktoolDir + '/mr7.smali', 'utf8');
const lines = c.split('\n');
console.log(lines.slice(0, 30).join('\n'));
const target = String.fromCharCode(34) + 'start_workout' + String.fromCharCode(34);
lines.forEach((l, i) => {
    if (l.includes(target)) {
        console.log(lines.slice(Math.max(0, i - 10), i + 15).join('\n'));
    }
});
