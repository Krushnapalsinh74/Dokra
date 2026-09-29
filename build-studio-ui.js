/**
 * Dokra Health - Master Studio UI Builder
 * Runs build-master-admin.js to compile and verify Master Admin Suite & Screen Studio.
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('Building Dokra Master Admin Studio...');
execSync('node ' + path.resolve(__dirname, 'build-master-admin.js'), { stdio: 'inherit' });
console.log('Dokra Master Admin Studio successfully compiled and ready!');
