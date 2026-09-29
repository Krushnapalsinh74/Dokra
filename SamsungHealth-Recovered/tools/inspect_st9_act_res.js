const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5';
const c = fs.readFileSync(apktoolDir + '/st9.smali', 'utf8');

const s = c.indexOf('.method public final onActivityResult(IILandroid/content/Intent;)V');
const e = c.indexOf('.end method', s);
console.log(c.substring(s, e + 11));
