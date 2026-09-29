# Dokra Health 🩺⚡

> High-Performance Health Platform & Android Integration Architecture.

Dokra Health provides a complete health intelligence infrastructure, including a mobile client layer, backend card services, studio builder, and custom data providers.

---

## 📁 Repository Structure

- **`SamsungHealth-Recovered/`**: Android application source code, custom providers (`DokraAuthManager`), and build/deployment automation tools.
  - `src/main/java/`: Java source code for Dokra provider services, authentication managers, and runtime crash shield.
  - `tools/`: Build scripts, activity flows, manifest inspectors, and APK re-packagers.
- **`backend/`**: Backend services, including `card-service`, REST APIs, and health data providers.
- **`data/`**: Studio card configurations, screen layouts, and application state definitions.
- **`build-studio-ui.js`**: Studio UI build and generation script.
- **`test-endpoints.js`**: Backend endpoint validation and health verification suite.

---

## 🚀 Getting Started

### Backend
```bash
cd backend/card-service
npm install
npm start
```

### Studio UI & Admin
```bash
node build-studio-ui.js
```

---

## 🔒 Security & Crash Shield
Equipped with `DokraAuthManager` global exception shields for robust background operation and Android looper resilience.
