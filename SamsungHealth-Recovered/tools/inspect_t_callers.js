const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5';

['goi.smali', 'qk9.smali', 'tt9.smali', 'ut9.smali', 'z300.smali'].forEach(f => {
    const content = fs.readFileSync(apktoolDir + '/' + f, 'utf8');
    const lines = content.split('\n');
    console.log('=== ' + f + ' ===');
    lines.forEach((l, idx) => {
        if (l.includes('Lyt9;->t(Z)V')) {
            console.log(lines.slice(Math.max(0, idx - 10), idx + 10).join('\n'));
        }
    });
});
