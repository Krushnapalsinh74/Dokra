const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool';

const smaliDirs = fs.readdirSync(apktoolDir).filter(n => n.startsWith('smali')).map(n => apktoolDir + '/' + n);

for (const d of smaliDirs) {
    const list = fs.readdirSync(d, {recursive: true});
    for (const f of list) {
        if (f.includes('InteractiveCoachingEngineNative')) {
            console.log(d + '/' + f);
        }
    }
}
