const fs = require('fs');
const content = fs.readFileSync('C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5/kt9.smali', 'utf8');
const idx5 = content.indexOf(':pswitch_5');
console.log(content.substring(idx5 + 1000, idx5 + 2500));
