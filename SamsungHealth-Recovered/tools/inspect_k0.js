const fs = require('fs');
const st9Path = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5/st9.smali';
const content = fs.readFileSync(st9Path, 'utf8');

const s = content.indexOf('.method public final k0()V');
const e = content.indexOf('.end method', s);
console.log(content.substring(s, e + 11));
