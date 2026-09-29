const fs = require('fs');
const path = require('path');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool';
const smaliDirs = fs.readdirSync(apktoolDir).filter(n => n.startsWith('smali')).map(n => path.join(apktoolDir, n));

const target = String.fromCharCode(34) + 'start_workout' + String.fromCharCode(34);
for (const d of smaliDirs) {
    function walk(dir) {
        const list = fs.readdirSync(dir, {withFileTypes: true});
        for (const item of list) {
            const p = path.join(dir, item.name);
            if (item.isDirectory()) walk(p);
            else if (item.name.endsWith('.smali')) {
                const c = fs.readFileSync(p, 'utf8');
                if (c.includes(target)) {
                    console.log('Matches start_workout:', p.replace(apktoolDir, ''));
                }
            }
        }
    }
    walk(d);
}
