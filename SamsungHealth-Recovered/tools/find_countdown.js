const fs = require('fs');
const path = require('path');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool';

const smaliDirs = fs.readdirSync(apktoolDir).filter(n => n.startsWith('smali')).map(n => path.join(apktoolDir, n));

for (const dir of smaliDirs) {
    function walk(d) {
        const list = fs.readdirSync(d, { withFileTypes: true });
        for (const item of list) {
            const full = path.join(d, item.name);
            if (item.isDirectory()) {
                walk(full);
            } else if (item.name.endsWith('.smali')) {
                const content = fs.readFileSync(full, 'utf8');
                if (content.includes('start_countdown_view')) {
                    console.log('Found start_countdown_view:', full.replace(apktoolDir, ''));
                }
            }
        }
    }
    walk(dir);
}
