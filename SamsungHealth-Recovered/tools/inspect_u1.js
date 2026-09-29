const fs = require('fs');
const trackerPath = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5/com/samsung/android/app/shealth/tracker/sport/track/view/TrackerSportCardMainActivity.smali';
const content = fs.readFileSync(trackerPath, 'utf8');

const start = content.indexOf('.method public final U1()V');
const end = content.indexOf('.end method', start);
console.log(content.substring(start, end + 11));
