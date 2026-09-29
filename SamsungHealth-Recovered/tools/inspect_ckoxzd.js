const fs = require('fs');
const st9Path = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5/st9.smali';
const content = fs.readFileSync(st9Path, 'utf8');

['C()', 'K()', 'O()', 'X()', 'Z()', 'd()'].forEach(mName => {
    const s = content.indexOf('.method public final ' + mName);
    if (s !== -1) {
        const e = content.indexOf('.end method', s);
        console.log('=== ' + mName + ' ===');
        console.log(content.substring(s, Math.min(e + 11, s + 600)));
    }
});
