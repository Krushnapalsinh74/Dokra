const fs = require('fs');
const path = require('path');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool';

const trackerPath = path.join(apktoolDir, 'smali_classes5/com/samsung/android/app/shealth/tracker/sport/track/view/TrackerSportCardMainActivity.smali');
const content = fs.readFileSync(trackerPath, 'utf8');

function extractMethod(name) {
    const start = content.indexOf('.method ' + name);
    if (start === -1) return 'NOT FOUND: ' + name;
    const end = content.indexOf('.end method', start);
    return content.substring(start, end + 11);
}

console.log(extractMethod('public final R1(Landroid/content/Intent;)V'));
