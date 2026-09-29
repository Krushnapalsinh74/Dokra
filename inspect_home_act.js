const fs = require('fs');
const smali = fs.readFileSync('SamsungHealth-Recovered/apktool/smali/com/samsung/android/app/shealth/home/HomeMainActivity.smali', 'utf8');

const lines = smali.split('\n');
console.log('Superclass:', lines.slice(0, 10).filter(l => l.startsWith('.super') || l.startsWith('.class')));

const onCreateIdx = lines.findIndex(l => l.includes('onCreate('));
if (onCreateIdx !== -1) {
  console.log('onCreate lines:');
  console.log(lines.slice(onCreateIdx, onCreateIdx + 40).join('\n'));
}
