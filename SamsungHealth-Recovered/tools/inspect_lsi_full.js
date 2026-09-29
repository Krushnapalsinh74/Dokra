const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5';
const c = fs.readFileSync(apktoolDir + '/lsi.smali', 'utf8');
console.log(c);
