const fs = require('fs');
const path = require('path');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool';

const smaliDirs = fs.readdirSync(apktoolDir).filter(n => n.startsWith('smali')).map(n => path.join(apktoolDir, n));
let srzPath = null;
for (const dir of smaliDirs) {
    const candidate = path.join(dir, 'srz.smali');
    if (fs.existsSync(candidate)) {
        srzPath = candidate;
        break;
    }
}
console.log('srzPath:', srzPath);
if (srzPath) {
    const content = fs.readFileSync(srzPath, 'utf8');
    const idx20 = content.indexOf(':pswitch_14');
    if (idx20 !== -1) {
        console.log(content.substring(idx20, idx20 + 1500));
    } else {
        console.log('pswitch_14 not found, showing invoke:');
        const invIdx = content.indexOf('.method public final invoke(');
        console.log(content.substring(invIdx, invIdx + 1500));
    }
}
