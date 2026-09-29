const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool/smali_classes5';

const files = fs.readdirSync(apktoolDir);
files.filter(f => f.endsWith('.smali')).forEach(f => {
    const c = fs.readFileSync(apktoolDir + '/' + f, 'utf8');
    if (c.includes('->H:Landroidx/lifecycle/MutableLiveData')) {
        console.log('Observes H:', f);
    }
});
