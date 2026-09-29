const fs = require('fs');
const c = fs.readFileSync('C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes2/qou.smali', 'utf8');
const lines = c.split('\n');
console.log(lines.slice(0, 30).join('\n'));
