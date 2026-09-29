const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5';

['fsi.smali', 'hsi.smali', 'isi.smali', 'lsi.smali'].forEach(f => {
    const c = fs.readFileSync(apktoolDir + '/' + f, 'utf8');
    const firstLine = c.split('\n')[0];
    const srcLine = c.split('\n').find(l => l.startsWith('.source '));
    console.log(f + ' -> ' + firstLine + ' ' + (srcLine || ''));
});
