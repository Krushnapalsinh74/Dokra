const fs = require('fs');
const content = fs.readFileSync('C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5/st9.smali', 'utf8');
const idx = content.indexOf('lastTrackingStatusChangedReason');
if (idx !== -1) {
    const methodStart = content.lastIndexOf('.method ', idx);
    const methodLine = content.substring(methodStart, content.indexOf('\n', methodStart));
    console.log('Found in method: ' + methodLine);
    console.log(content.substring(idx - 200, idx + 800));
}
