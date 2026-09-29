const fs = require('fs');
const st9Path = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5/st9.smali';
const content = fs.readFileSync(st9Path, 'utf8');

function extractMethod(name) {
    const s = content.indexOf('.method ' + name);
    if (s === -1) return 'NOT FOUND: ' + name;
    const e = content.indexOf('.end method', s);
    return content.substring(s, e + 11);
}

console.log('=== onViewCreated ===');
console.log(extractMethod('public final onViewCreated(Landroid/view/View;Landroid/os/Bundle;)V'));
console.log('=== onResume ===');
console.log(extractMethod('public final onResume()V'));
