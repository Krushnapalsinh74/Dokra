const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5';

const c = fs.readFileSync(apktoolDir + '/jp80.smali', 'utf8');
const lines = c.split('\n');
console.log('=== jp80.smali ===');
console.log(lines.slice(0, 25).join('\n'));
const methods = lines.filter(l => l.startsWith('.method '));
console.log('Methods in jp80:');
console.log(methods.slice(0, 15).join('\n'));
