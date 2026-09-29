const fs = require('fs');
const c = fs.readFileSync('C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5/yt9.smali', 'utf8');
const lines = c.split('\n');
console.log(lines.slice(3380, 3430).join('\n'));
