const fs = require('fs');
const path = require('path');

const st9Path = path.resolve(__dirname, '..', 'apktool', 'smali_classes5', 'st9.smali');
const content = fs.readFileSync(st9Path, 'utf8');

const methodRegex = /\.method ([^{]+)/g;
let m;
const methods = [];
while ((m = methodRegex.exec(content)) !== null) {
    methods.push(m[1].trim());
}

console.log('Methods in st9.smali:');
console.log(methods);
