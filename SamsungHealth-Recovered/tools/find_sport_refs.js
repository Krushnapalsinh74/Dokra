const fs = require('fs');
const path = require('path');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool';

// Let's search for exercise type constants or references to running and cycling
function searchSmali(query) {
    const smaliDirs = fs.readdirSync(apktoolDir)
        .filter(n => n.startsWith('smali'))
        .map(n => path.join(apktoolDir, n));
    
    const results = [];
    for (const dir of smaliDirs) {
        function walk(d) {
            const list = fs.readdirSync(d, { withFileTypes: true });
            for (const item of list) {
                const full = path.join(d, item.name);
                if (item.isDirectory()) {
                    walk(full);
                } else if (item.name.endsWith('.smali')) {
                    const content = fs.readFileSync(full, 'utf8');
                    if (content.includes(query)) {
                        results.push(full);
                    }
                }
            }
        }
        walk(dir);
    }
    return results;
}

const res = searchSmali('TrackerSportCardMainActivity');
console.log('Files referencing TrackerSportCardMainActivity:', res.length);
res.slice(0, 15).forEach(f => console.log(' ', f.replace(apktoolDir, '')));
