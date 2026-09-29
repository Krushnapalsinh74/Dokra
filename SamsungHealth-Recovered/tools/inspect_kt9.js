const fs = require('fs');
const path = require('path');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool';
const smaliDirs = fs.readdirSync(apktoolDir).filter(n => n.startsWith('smali')).map(n => path.join(apktoolDir, n));
let kt9Path = null;
for (const dir of smaliDirs) {
    const candidate = path.join(dir, 'kt9.smali');
    if (fs.existsSync(candidate)) { kt9Path = candidate; break; }
}
console.log('kt9Path:', kt9Path);
if (kt9Path) {
    const content = fs.readFileSync(kt9Path, 'utf8');
    const idx5 = content.indexOf(':pswitch_5');
    if (idx5 !== -1) {
        console.log(content.substring(idx5, idx5 + 1500));
    }
}
