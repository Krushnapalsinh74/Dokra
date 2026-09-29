const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool';

// Check where 0x3e9 (Walking) vs 0x3ea (Running) vs 0x2aff (Cycling) are used in sport tracker
const list = fs.readdirSync(apktoolDir + '/smali_classes5', {withFileTypes: true});
for (const f of list) {
    if (f.name.endsWith('.smali')) {
        const c = fs.readFileSync(apktoolDir + '/smali_classes5/' + f.name, 'utf8');
        if (c.includes('0x3e9') && (c.includes('0x3ea') || c.includes('0x2aff'))) {
            console.log('Sport logic file:', f.name);
        }
    }
}
