const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5';
const c = fs.readFileSync(apktoolDir + '/yt9.smali', 'utf8');

['.method public final n()V', '.method public final s()V'].forEach(m => {
    const s = c.indexOf(m);
    if (s !== -1) {
        const e = c.indexOf('.end method', s);
        console.log(c.substring(s, e + 11));
    }
});
