const fs = require('fs');
const c = fs.readFileSync('C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5/yt9.smali', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
    if (l.includes('->s:Z') || l.includes('->t:Z') || l.includes('->u:Z') || l.includes('->v:Z')) {
        console.log(i + ': ' + l.trim());
    }
});
