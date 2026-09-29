const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool';

function searchPerm() {
    const list = ['smali_classes5'];
    for (const d of list) {
        const fullDir = apktoolDir + '/' + d;
        const files = fs.readdirSync(fullDir, {withFileTypes: true});
        for (const f of files) {
            if (f.name.endsWith('.smali')) {
                const c = fs.readFileSync(fullDir + '/' + f.name, 'utf8');
                if (c.includes('ACCESS_FINE_LOCATION')) {
                    console.log('Requests location:', f.name);
                }
            }
        }
    }
}
searchPerm();
