const fs = require('fs');
const toolsDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/tools';

['rebuild_perfect_dokra_apk.js', 'isolate_dokra_package.js'].forEach(f => {
    const p = toolsDir + '/' + f;
    if (fs.existsSync(p)) {
        console.log('=== ' + f + ' ===');
        console.log(fs.readFileSync(p, 'utf8').slice(0, 2000));
    }
});
