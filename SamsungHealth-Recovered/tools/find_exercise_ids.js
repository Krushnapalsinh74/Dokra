const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool';

// Search for exercise type constants
function searchSmali(str) {
    const list = fs.readdirSync(apktoolDir + '/smali_classes5/com/samsung/android/app/shealth/tracker/sport/common/sportinfo', {withFileTypes: true});
    for (const f of list) {
        if (f.name.endsWith('.smali')) {
            const c = fs.readFileSync(apktoolDir + '/smali_classes5/com/samsung/android/app/shealth/tracker/sport/common/sportinfo/' + f.name, 'utf8');
            if (c.includes(str)) console.log(f.name);
        }
    }
}
searchSmali('walking');
searchSmali('running');
searchSmali('cycling');
