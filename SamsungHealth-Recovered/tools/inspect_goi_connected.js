const fs = require('fs');
const content = fs.readFileSync('C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5/goi.smali', 'utf8');
const s = content.indexOf('.method public final onServiceConnected()V');
const e = content.indexOf('.end method', s);
console.log(content.substring(s, e + 11));
