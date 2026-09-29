const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool';

function searchQou() {
    const list = ['smali', 'smali_classes2', 'smali_classes3', 'smali_classes4', 'smali_classes5'];
    for (const d of list) {
        const fullDir = apktoolDir + '/' + d;
        const files = fs.readdirSync(fullDir, {withFileTypes: true});
        for (const f of files) {
            if (f.name.endsWith('.smali')) {
                const c = fs.readFileSync(fullDir + '/' + f.name, 'utf8');
                if (c.includes('new-instance') && c.includes('Lqou;')) {
                    console.log('Creates qou:', d + '/' + f.name);
                }
            }
        }
    }
}
searchQou();
