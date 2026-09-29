const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool';

['smali_classes5/bx9.smali', 'smali_classes5/p500.smali'].forEach(f => {
    const content = fs.readFileSync(apktoolDir + '/' + f, 'utf8');
    const idx = content.indexOf('TrackerSportCardMainActivity');
    console.log('=== ' + f + ' ===');
    console.log(content.substring(Math.max(0, idx - 400), idx + 600));
});
