const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool';
const content = fs.readFileSync(apktoolDir + '/smali_classes5/bx9.smali', 'utf8');
console.log(content);
