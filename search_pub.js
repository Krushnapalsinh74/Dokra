const fs = require('fs');
const pub = fs.readFileSync('SamsungHealth-Recovered/apktool/res/values/public.xml', 'utf8');

const idx = pub.indexOf('0x7f0e068a');
if (idx !== -1) {
  console.log(pub.substring(idx - 100, idx + 100));
} else {
  console.log('Not found');
}
