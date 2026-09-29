const fs = require('fs');
const path = require('path');

const userLogoPath = 'C:\\Users\\AE\\.gemini\\antigravity-ide\\brain\\75e91d97-e6da-48f4-a131-0225fb4df068\\.user_uploaded\\media_1790232750385.png';
if (!fs.existsSync(userLogoPath)) {
  console.error('User logo not found at:', userLogoPath);
  process.exit(1);
}

const logoBuffer = fs.readFileSync(userLogoPath);
console.log('User logo loaded, size:', logoBuffer.length, 'bytes');

// 1. Save to backend assets directory
const backendAssetsDir = path.resolve(__dirname, 'backend/card-service/public/assets');
if (!fs.existsSync(backendAssetsDir)) fs.mkdirSync(backendAssetsDir, { recursive: true });
fs.writeFileSync(path.join(backendAssetsDir, 'dokra-logo.png'), logoBuffer);
console.log('Saved to:', path.join(backendAssetsDir, 'dokra-logo.png'));

// Also generate base64 data URI for inline use in HTML
const base64Logo = `data:image/png;base64,${logoBuffer.toString('base64')}`;
fs.writeFileSync(path.resolve(__dirname, 'backend/card-service/public/assets/dokra-logo-base64.txt'), base64Logo);
console.log('Saved base64 data URI');

// 2. Save to Android APK resource folders
const resDir = path.resolve(__dirname, 'SamsungHealth-Recovered/apktool/res');
const folders = [
  'drawable', 'drawable-hdpi', 'drawable-mdpi', 'drawable-xhdpi', 
  'drawable-xxhdpi', 'drawable-xxxhdpi', 'drawable-v24',
  'mipmap-hdpi', 'mipmap-mdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi', 'mipmap-xxxhdpi'
];

for (const folder of folders) {
  const targetDir = path.join(resDir, folder);
  if (fs.existsSync(targetDir)) {
    fs.writeFileSync(path.join(targetDir, 'dokra_logo.png'), logoBuffer);
    fs.writeFileSync(path.join(targetDir, 'dokra_running_club.png'), logoBuffer);
    fs.writeFileSync(path.join(targetDir, 'app_icon.png'), logoBuffer);
    fs.writeFileSync(path.join(targetDir, 'ic_launcher.png'), logoBuffer);
    console.log(`Copied logo into ${folder}`);
  }
}
