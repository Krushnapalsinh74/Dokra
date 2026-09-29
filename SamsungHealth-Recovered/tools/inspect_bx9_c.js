const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool';
const content = fs.readFileSync(apktoolDir + '/smali_classes5/bx9.smali', 'utf8');
const s = content.indexOf('.method public static c(');
const e = content.indexOf('.end method', s);
console.log(content.substring(s, e + 11));
