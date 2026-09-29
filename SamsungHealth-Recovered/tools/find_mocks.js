const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered';

function searchTerms() {
    const list = fs.readdirSync(apktoolDir + '/tools');
    for (const f of list) {
        if (f.endsWith('.js') || f.endsWith('.ps1')) {
            const c = fs.readFileSync(apktoolDir + '/tools/' + f, 'utf8');
            if (c.toLowerCase().includes('mock') || c.toLowerCase().includes('fake') || c.toLowerCase().includes('simulate')) {
                console.log('Mock/Fake found in tool:', f);
            }
        }
    }
}
searchTerms();
