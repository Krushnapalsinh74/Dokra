const fs = require('fs');
const content = fs.readFileSync('C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5/dy8.smali', 'utf8');

const lines = content.split('\n');
lines.forEach((l, idx) => {
    if (l.includes('0x3e9') || l.includes('0x3ea') || l.includes('0x2aff')) {
        console.log('Line ' + idx + ': ' + l.trim());
        console.log(lines.slice(Math.max(0, idx - 5), idx + 10).join('\n'));
    }
});
