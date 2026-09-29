const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5';
const c = fs.readFileSync(apktoolDir + '/fsi.smali', 'utf8');
const s = c.indexOf('.method public final onLocationChanged(Landroid/location/Location;)V');
const e = c.indexOf('.end method', s);
console.log(c.substring(s, e + 11));
