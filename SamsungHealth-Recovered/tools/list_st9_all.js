const fs = require('fs');
const st9Path = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5/st9.smali';
const content = fs.readFileSync(st9Path, 'utf8');

const regex = /\.method ([^{]+)/g;
let m;
const methods = [];
while ((m = regex.exec(content)) !== null) {
    methods.push(m[1].trim().split('\n')[0]);
}

console.log('Methods in st9.smali (' + methods.length + '):');
methods.forEach(me => console.log(' ', me));
