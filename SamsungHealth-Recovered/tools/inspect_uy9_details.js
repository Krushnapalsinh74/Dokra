const fs = require('fs');
const content = fs.readFileSync('C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5/uy9.smali', 'utf8');

['.method public static l(', '.method public static m(', '.method public static n(', '.method public static p(', '.method public static r('].forEach(prefix => {
    const s = content.indexOf(prefix);
    if (s !== -1) {
        const e = content.indexOf('.end method', s);
        console.log('=== ' + prefix + ' ===');
        console.log(content.substring(s, Math.min(e + 11, s + 1000)));
    }
});
