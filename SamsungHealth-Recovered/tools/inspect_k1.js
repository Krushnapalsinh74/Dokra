const fs = require('fs');
const emlPath = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5/com/samsung/android/app/shealth/tracker/sport/exerciselist/ExerciseMainListActivity.smali';
const content = fs.readFileSync(emlPath, 'utf8');

const s = content.indexOf('.method public final K1(Lcom/samsung/android/app/shealth/tracker/sport/exerciselist/ExerciseListItemType;)V');
const e = content.indexOf('.end method', s);
console.log(content.substring(s, e + 11));
