const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5';

const c = fs.readFileSync(apktoolDir + '/pf50.smali', 'utf8');
const lines = c.split('\n');
console.log('=== pf50.smali ===');
console.log(lines.slice(0, 20).join('\n'));
const qouLines = lines.filter(l => l.includes('qou'));
console.log('qou references in pf50:', qouLines);
