const fs = require('fs');
const content = fs.readFileSync('C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5/srz.smali', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
    if (l.includes('TrackerSportCardMainActivity')) {
        console.log(Line : );
        console.log(lines.slice(Math.max(0, i-5), i+20).join('\n'));
    }
});
