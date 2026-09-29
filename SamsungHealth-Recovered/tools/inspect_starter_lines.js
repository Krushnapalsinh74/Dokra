const fs = require('fs');
const path = require('path');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool';

const files = [
    'smali_classes2/qou.smali',
    'smali_classes4/j13.smali',
    'smali_classes4/xvs.smali',
    'smali_classes5/bx9.smali',
    'smali_classes5/jx9.smali',
    'smali_classes5/p500.smali',
    'smali_classes6/hk20.smali'
];

files.forEach(f => {
    const p = path.join(apktoolDir, f);
    if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8');
        const lines = content.split('\n');
        console.log('=== ' + f + ' ===');
        lines.filter(l => l.includes('TrackerSportCardMainActivity')).forEach(l => console.log('  ' + l.trim()));
    }
});
