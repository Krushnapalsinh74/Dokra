const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5';

const files = ['af40.smali', 'dy8.smali', 'es9.smali', 'h49.smali', 'j100.smali', 'noa.smali', 'oy9.smali', 'uca.smali', 'v1p.smali'];
files.forEach(f => {
    const c = fs.readFileSync(apktoolDir + '/' + f, 'utf8');
    const firstLine = c.split('\n')[0];
    const srcLine = c.split('\n').find(l => l.startsWith('.source '));
    console.log(f + ' -> ' + firstLine + ' ' + (srcLine || ''));
});
