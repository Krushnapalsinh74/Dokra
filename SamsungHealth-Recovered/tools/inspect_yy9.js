const fs = require('fs');
const path = require('path');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool';

['yy9.smali', 'yt9.smali', 'uy9.smali'].forEach(f => {
    const p = path.join(apktoolDir, 'smali_classes5', f);
    if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8');
        const lines = content.split('\n');
        console.log('=== ' + f + ' ===');
        console.log(lines.slice(0, 10).join('\n'));
        const methods = lines.filter(l => l.startsWith('.method '));
        console.log('Methods:', methods.slice(0, 15).join('\n'));
    }
});
