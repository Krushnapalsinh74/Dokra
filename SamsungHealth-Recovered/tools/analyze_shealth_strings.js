const fs = require('fs');
const path = require('path');

const list = [];
function checkFile(p) {
  const txt = fs.readFileSync(p, 'utf8');
  const lines = txt.split(/\r?\n/);
  lines.forEach((l, i) => {
    if (l.includes('"com.sec.android.app.shealth"')) {
      list.push({ file: p, line: i + 1, content: l.trim() });
    }
  });
}

function walk(dir) {
  const items = fs.readdirSync(dir);
  for (const it of items) {
    const p = path.join(dir, it);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (it.endsWith('.smali')) {
      checkFile(p);
    }
  }
}

for (let i = 0; i <= 8; i++) {
  const dir = path.join('c:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool', i === 0 ? 'smali' : 'smali_classes' + i);
  if (fs.existsSync(dir)) walk(dir);
}

console.log('Total occurrences of "com.sec.android.app.shealth":', list.length);
list.forEach(x => {
  console.log(path.relative('c:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool', x.file) + ':' + x.line);
});
