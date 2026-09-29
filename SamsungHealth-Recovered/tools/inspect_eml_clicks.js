const fs = require('fs');
const emlPath = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5/com/samsung/android/app/shealth/tracker/sport/exerciselist/ExerciseMainListActivity.smali';
const content = fs.readFileSync(emlPath, 'utf8');

function extractMethod(name) {
    const s = content.indexOf('.method ' + name);
    if (s === -1) return 'NOT FOUND: ' + name;
    const e = content.indexOf('.end method', s);
    return content.substring(s, e + 11);
}

console.log('=== K1 ===');
console.log(extractMethod('public final K1(Lcom/samsung/android/app/shealth/tracker/sport/exerciselist/ExerciseListItemType;)V'));
console.log('=== P1 ===');
console.log(extractMethod('public final P1(Lcom/samsung/android/app/shealth/tracker/sport/exerciselist/ExerciseListItemType;Z)Z'));
console.log('=== R1 ===');
console.log(extractMethod('public final R1(Lcom/samsung/android/app/shealth/tracker/sport/exerciselist/ExerciseListItemType;ZZ)V'));
