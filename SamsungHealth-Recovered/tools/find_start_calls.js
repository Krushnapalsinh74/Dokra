const fs = require('fs');
const apktoolDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/apktool';

// Search for calls to LtsHelper->start or LiveTrackerService->start or yt9->t
function findCalls(needle) {
    const list = ['smali_classes5'];
    for (const d of list) {
        const fullDir = apktoolDir + '/' + d;
        const files = fs.readdirSync(fullDir, {withFileTypes: true});
        for (const f of files) {
            if (f.name.endsWith('.smali')) {
                const c = fs.readFileSync(fullDir + '/' + f.name, 'utf8');
                if (c.includes(needle)) {
                    console.log(f.name + ' calls ' + needle);
                }
            }
        }
    }
}
findCalls('Lcom/samsung/android/app/shealth/tracker/sport/livetracker/LtsHelper;->startWorkout');
findCalls('Lcom/samsung/android/app/shealth/tracker/sport/livetracker/LiveTrackerService;->startInternal');
findCalls('Lyt9;->t(Z)V');
