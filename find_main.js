const fs = require('fs');
const content = fs.readFileSync('SamsungHealth-Recovered/apktool/AndroidManifest.xml', 'utf8');

const regex = /<activity[\s\S]*?android\.intent\.action\.MAIN[\s\S]*?<\/activity>/g;
let match;
while ((match = regex.exec(content)) !== null) {
  const name = match[0].match(/android:name="([^"]+)"/);
  console.log('Main Activity:', name ? name[1] : 'unknown');
}
