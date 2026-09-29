const fs = require('fs');
const content = fs.readFileSync('C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5/kt9.smali', 'utf8');
const idx0 = content.indexOf(':pswitch_0');
console.log(content.substring(idx0, idx0 + 1500));
