const fs = require('fs');
const path = require('path');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool';

const files = [
    'smali_classes2/qou.smali',
    'smali_classes3/go1.smali',
    'smali_classes4/j13.smali',
    'smali_classes4/xvs.smali',
    'smali_classes5/ar9.smali',
    'smali_classes5/bo9.smali',
    'smali_classes5/bx9.smali',
    'smali_classes5/jx9.smali',
    'smali_classes5/p500.smali',
    'smali_classes6/hk20.smali',
    'smali_classes7/uo0.smali'
];

files.forEach(f => {
    const p = path.join(apktoolDir, f);
    if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8');
        const lines = content.split('\n');
        const cls = lines[0];
        const src = lines.find(l => l.startsWith('.source '));
        console.log(f + ' -> ' + cls + ' ' + (src || ''));
    }
});
