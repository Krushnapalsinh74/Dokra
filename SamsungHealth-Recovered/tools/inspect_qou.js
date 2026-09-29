const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool';
const content = fs.readFileSync(apktoolDir + '/smali_classes2/qou.smali', 'utf8');

const lines = content.split('\n');
lines.forEach((l, idx) => {
    if (l.includes('start_countdown_view')) {
        console.log(Line : );
        console.log(lines.slice(Math.max(0, idx - 15), idx + 25).join('\n'));
    }
});
