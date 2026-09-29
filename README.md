# Dokra Health 🩺⚡

> High-Performance Health Platform & Android Integration Architecture.

Dokra Health provides a complete health intelligence infrastructure, including a mobile client layer, backend card services, studio builder, and custom data providers.

---

## 📦 Releases & Pre-Built APK

Download the latest standalone APK directly from GitHub Releases:
- 🚀 **[Download Dokra-Health.apk (v1.0.0)](https://github.com/Krushnapalsinh74/Dokra/releases/download/v1.0.0/Dokra-Health.apk)**
- 📋 **[View Release Notes & Assets](https://github.com/Krushnapalsinh74/Dokra/releases/tag/v1.0.0)**

---

## 📁 Repository Structure

- **`SamsungHealth-Recovered/`**: Android application source code, custom providers (`DokraAuthManager`), and build/deployment automation tools.
  - `src/main/java/`: Java source code for Dokra provider services, authentication managers, and runtime crash shield.
  - `tools/`: Automated APK compilation, DEX injection, manifest patchers, and `apktool.jar`.
- **`backend/`**: Backend services, including `card-service`, REST APIs, and health data providers.
- **`data/`**: Studio card configurations, screen layouts, and application state definitions.
- **`build-studio-ui.js`**: Studio UI build and generation script.
- **`test-endpoints.js`**: Backend endpoint validation and health verification suite.

---

## 🛠️ How to Modify Code & Build a New APK

Anyone who clones this repository can modify the app and build a new APK by following these steps:

### 1. Download Base APK & Decompile
Download the base APK into `SamsungHealth-Recovered/`:
```bash
# Decompile using the included apktool.jar
cd SamsungHealth-Recovered
java -jar tools/apktool.jar d "Dokra-Health.apk" -o apktool
```

### 2. Make Your Custom Changes
- **Java Provider & Crash Shield**: Edit source files under `src/main/java/com/dokra/health/provider/`.
- **UI & Layouts**: Customize screen layouts or string resources in `apktool/res/`.
- **Card Service & Studio**: Update `backend/card-service` or customize card definitions in `data/`.

### 3. Rebuild & Sign New APK
Run the automated build script:
```bash
node tools/build_fix_and_deploy_apk.js
```
This script will:
1. Re-compile your Java source files into DEX format.
2. Inject updated classes and fix smali mappings.
3. Repack and zipalign the APK.
4. Sign the output APK with the release keystore ready for installation.

---

## 🚀 Running Backend & Studio UI

### Backend Service
```bash
cd backend/card-service
npm install
npm start
```

### Studio UI Builder
```bash
node build-studio-ui.js
```

---

## 🔒 Security & Crash Shield
Equipped with `DokraAuthManager` global exception shields for robust background operation and Android looper resilience.
