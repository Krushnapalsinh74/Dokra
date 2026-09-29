const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool';

function searchLocation() {
    const list = fs.readdirSync(apktoolDir + '/smali_classes5', {withFileTypes: true});
    for (const f of list) {
        if (f.name.endsWith('.smali')) {
            const c = fs.readFileSync(apktoolDir + '/smali_classes5/' + f.name, 'utf8');
            if (c.includes('onLocationChanged') || c.includes('requestLocationUpdates')) {
                console.log('Location handler:', f.name);
            }
        }
    }
}
searchLocation();
