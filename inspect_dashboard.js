const fs = require('fs');

const smali = fs.readFileSync('SamsungHealth-Recovered/apktool/smali_classes4/com/samsung/android/app/shealth/home/HomeDashboardActivity.smali', 'utf8');

const m = smali.match(/layout::[a-zA-Z0-9_]+/g);
console.log('Layouts matched:', m);

const rLayout = smali.match(/const\s+v[0-9]+,\s+0x7f0[a-f0-9]+/g);
console.log('R.layout candidates:', rLayout ? rLayout.slice(0, 10) : 'none');
