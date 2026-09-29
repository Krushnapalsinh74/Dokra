const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5';

['fsi.smali', 'lsi.smali'].forEach(f => {
    const c = fs.readFileSync(apktoolDir + '/' + f, 'utf8');
    const methods = c.split('\n').filter(l => l.startsWith('.method '));
    console.log('=== ' + f + ' ===');
    console.log(methods.slice(0, 15).join('\n'));
});
