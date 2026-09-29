const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5';
const c = fs.readFileSync(apktoolDir + '/st9.smali', 'utf8');

const lines = c.split('\n');
console.log(lines.slice(3310, 3370).join('\n'));
