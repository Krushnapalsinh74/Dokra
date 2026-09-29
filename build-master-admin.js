const fs = require('fs');
const path = require('path');

const studioHtmlPath = path.resolve(__dirname, 'backend/card-service/src/studio.html');
let content = fs.readFileSync(studioHtmlPath, 'utf8');

console.log('Original studio.html length:', content.length);

// 1. Update Title
content = content.replace(
  /<title>.*?<\/title>/,
  '<title>Dokra Health — Master Admin Suite &amp; Visual Screen Studio (All 7 Health Domains)</title>'
);

// 2. Add Master Header HTML right after <body class="edit-mode">
const masterHeaderHtml = `
<body class="edit-mode">
  <div class="master-app-body">
    <!-- MASTER GLOBAL HEADER -->
    <header class="master-global-header">
      <div class="master-brand-block" onclick="switchMasterSection('section-dashboard')">
        <img src="/assets/dokra-logo.png" class="master-brand-logo" alt="Dokra Health">
        <div class="master-brand-text">
          <div class="master-brand-name">
            Dokra Health <span class="master-version-tag">Suite v2.5</span>
          </div>
          <div class="master-brand-subtitle">Health Intelligence &amp; Mobile Control Plane</div>
        </div>
      </div>

      <nav class="master-nav-tabs-bar">
        <button class="master-tab-btn" onclick="switchMasterSection('section-dashboard')" id="mtab-dashboard">
          📊 Dashboard
        </button>
        <button class="master-tab-btn active" onclick="switchMasterSection('section-screen-studio')" id="mtab-screen-studio">
          📱 Screen Studio
        </button>
        <button class="master-tab-btn" onclick="switchMasterSection('section-cards-cms')" id="mtab-cards-cms">
          🗂️ Cards CMS
        </button>
        <button class="master-tab-btn" onclick="switchMasterSection('section-feature-flags')" id="mtab-feature-flags">
          🚩 Feature Flags
        </button>
        <button class="master-tab-btn" onclick="switchMasterSection('section-app-config')" id="mtab-app-config">
          ⚙️ Remote Config
        </button>
        <button class="master-tab-btn" onclick="switchMasterSection('section-notifications')" id="mtab-notifications">
          📢 Broadcaster
        </button>
        <button class="master-tab-btn" onclick="switchMasterSection('section-users')" id="mtab-users">
          👥 Users
        </button>
        <button class="master-tab-btn" onclick="switchMasterSection('section-apk-releases')" id="mtab-apk-releases">
          📦 APK Releases
        </button>
        <button class="master-tab-btn" onclick="switchMasterSection('section-api-explorer')" id="mtab-api-explorer">
          ⚡ API Explorer
        </button>
      </nav>

      <div class="master-header-right-tools">
        <div class="live-sync-pill" id="live-sync-indicator" title="Server-Sent Events active">
          <div class="status-dot-pulse"></div>
          <span style="font-size:11px; font-weight:700;">Live Sync</span>
        </div>
        <button class="btn-icon" onclick="toggleTheme()" id="global-theme-btn" title="Toggle Theme" style="padding:6px 10px; font-size:12px;">
          🌙 Mode
        </button>
        <div class="admin-pill-badge">
          <div class="admin-pill-avatar">KP</div>
          <div class="admin-pill-meta">
            <span class="admin-pill-name">Krushnapalsinh74</span>
            <span class="admin-pill-role">Super Admin ●</span>
          </div>
        </div>
      </div>
    </header>
`;

content = content.replace('<body class="edit-mode">', masterHeaderHtml);

// 3. Wrap Screen Studio inside <div id="section-screen-studio" class="master-section active">
content = content.replace(
  /<aside class="sidebar">/,
  '<div id="section-screen-studio" class="master-section active">\n  <aside class="sidebar">'
);

// 4. Close the screen studio section right after </main>
const standaloneSectionsHtml = `
  </main>
</div>

<!-- ========================================================================= -->
<!-- MASTER SECTION: 1. DASHBOARD OVERVIEW & TELEMETRY                         -->
<!-- ========================================================================= -->
<div id="section-dashboard" class="master-section">
  <div class="master-page-container">
    <div class="master-page-header">
      <div class="master-page-title-box">
        <h1>📊 Master Telemetry &amp; Intelligence Overview</h1>
        <p>Real-time platform metrics, mobile app sync performance, and health domain activity.</p>
      </div>
      <div>
        <button class="btn-publish" onclick="loadDashboardMetrics()">🔄 Refresh Live Telemetry</button>
      </div>
    </div>

    <!-- 4 TOP KPI CARDS -->
    <div class="kpi-row-4">
      <div class="kpi-master-card" style="--kpi-accent:#2563eb; --kpi-bg:rgba(37,99,235,0.12);">
        <div class="kpi-icon-bubble">🏃</div>
        <div class="kpi-data-wrap">
          <span class="kpi-data-label">Active Athletes</span>
          <span class="kpi-data-val" id="dash-kpi-athletes">1,420</span>
          <span class="kpi-data-sub">▲ +12% this week</span>
        </div>
      </div>

      <div class="kpi-master-card" style="--kpi-accent:#10b981; --kpi-bg:rgba(16,185,129,0.12);">
        <div class="kpi-icon-bubble">⚡</div>
        <div class="kpi-data-wrap">
          <span class="kpi-data-label">Daily Sync Requests</span>
          <span class="kpi-data-val" id="dash-kpi-requests">48.2k</span>
          <span class="kpi-data-sub">▲ 100% success rate</span>
        </div>
      </div>

      <div class="kpi-master-card" style="--kpi-accent:#8b5cf6; --kpi-bg:rgba(139,92,246,0.12);">
        <div class="kpi-icon-bubble">⏱️</div>
        <div class="kpi-data-wrap">
          <span class="kpi-data-label">Average Feed Latency</span>
          <span class="kpi-data-val" id="dash-kpi-latency">23 ms</span>
          <span class="kpi-data-sub">⚡ Ultra-low latency</span>
        </div>
      </div>

      <div class="kpi-master-card" style="--kpi-accent:#f59e0b; --kpi-bg:rgba(245,158,11,0.12);">
        <div class="kpi-icon-bubble">🩺</div>
        <div class="kpi-data-wrap">
          <span class="kpi-data-label">Health Domains</span>
          <span class="kpi-data-val">7 Active</span>
          <span class="kpi-data-sub">● All 108 screens online</span>
        </div>
      </div>
    </div>

    <!-- 2-COL TELEMETRY & DIAGNOSTICS -->
    <div style="display:grid; grid-template-columns: 2fr 1fr; gap: 20px;">
      <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:18px; padding:20px; display:flex; flex-direction:column; gap:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong style="font-size:15px;">🌐 Health Domain Synchronization Load</strong>
          <span style="font-size:11px; color:var(--text-muted);">Real-Time Distribution</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div>
            <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; margin-bottom:4px;">
              <span>🏠 Home &amp; 3-Ring Activity</span><span>42% of traffic</span>
            </div>
            <div style="height:8px; background:var(--border-subtle); border-radius:4px; overflow:hidden;"><div style="width:42%; height:100%; background:#2563eb;"></div></div>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; margin-bottom:4px;">
              <span>⚡ Vitality &amp; Energy Score</span><span>28% of traffic</span>
            </div>
            <div style="height:8px; background:var(--border-subtle); border-radius:4px; overflow:hidden;"><div style="width:28%; height:100%; background:#8b5cf6;"></div></div>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; margin-bottom:4px;">
              <span>🏃 Sports &amp; GPS Running Club</span><span>14% of traffic</span>
            </div>
            <div style="height:8px; background:var(--border-subtle); border-radius:4px; overflow:hidden;"><div style="width:14%; height:100%; background:#3b82f6;"></div></div>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; margin-bottom:4px;">
              <span>🌙 Sleep &amp; Hypnogram Stages</span><span>9% of traffic</span>
            </div>
            <div style="height:8px; background:var(--border-subtle); border-radius:4px; overflow:hidden;"><div style="width:9%; height:100%; background:#818cf8;"></div></div>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; margin-bottom:4px;">
              <span>💓 Heart &amp; Sinus ECG</span><span>7% of traffic</span>
            </div>
            <div style="height:8px; background:var(--border-subtle); border-radius:4px; overflow:hidden;"><div style="width:7%; height:100%; background:#f43f5e;"></div></div>
          </div>
        </div>
      </div>

      <!-- SERVER HEALTH & DIAGNOSTICS -->
      <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:18px; padding:20px; display:flex; flex-direction:column; gap:16px;">
        <strong style="font-size:15px;">🛡️ Service Diagnostic Health</strong>
        <div style="display:flex; flex-direction:column; gap:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:var(--bg-card-subtle); border-radius:10px;">
            <span style="font-size:12.5px; font-weight:600;">Card Service HTTP</span>
            <span class="status-badge published">Online (Port 8080)</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:var(--bg-card-subtle); border-radius:10px;">
            <span style="font-size:12.5px; font-weight:600;">SQLite Persistence</span>
            <span class="status-badge published">Healthy (WAL Mode)</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:var(--bg-card-subtle); border-radius:10px;">
            <span style="font-size:12.5px; font-weight:600;">Live Sync SSE Stream</span>
            <span class="status-badge published">Connected</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:var(--bg-card-subtle); border-radius:10px;">
            <span style="font-size:12.5px; font-weight:600;">Staging JWT Provider</span>
            <span class="status-badge published">Active</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ========================================================================= -->
<!-- MASTER SECTION: 2. CARDS CMS (MOBILE FEED)                                -->
<!-- ========================================================================= -->
<div id="section-cards-cms" class="master-section">
  <div class="master-page-container">
    <div class="master-page-header">
      <div class="master-page-title-box">
        <h1>🗂️ Mobile Service Cards CMS</h1>
        <p>Manage, prioritize, and publish the dynamic cards displayed on Android mobile feed (/v2/servicecard/list).</p>
      </div>
      <div style="display:flex; gap:10px;">
        <button class="btn-publish" onclick="openNewCardModal()">+ Create New Card</button>
      </div>
    </div>

    <!-- CMS TOOLBAR -->
    <div class="cms-toolbar">
      <input type="text" class="cms-search-input" id="cards-search-input" placeholder="🔍 Search cards by title, slug, or domain..." oninput="handleCardsSearch(this.value)">
      <div class="cms-filter-group">
        <button class="cms-filter-btn active" id="filter-card-all" onclick="filterCardsCms('all')">All Cards (<span id="count-all-cards">24</span>)</button>
        <button class="cms-filter-btn" id="filter-card-published" onclick="filterCardsCms('published')">Published</button>
        <button class="cms-filter-btn" id="filter-card-draft" onclick="filterCardsCms('draft')">Drafts</button>
      </div>
    </div>

    <!-- CARDS TABLE -->
    <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:16px; overflow:hidden; box-shadow:var(--shadow-card);">
      <table class="clean-table">
        <thead>
          <tr>
            <th style="width:70px;">Priority</th>
            <th>Card Title &amp; Details</th>
            <th>Domain</th>
            <th>Template</th>
            <th>Status</th>
            <th style="text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody id="cards-cms-tbody">
          <tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-muted);">Loading cards feed from database...</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- ========================================================================= -->
<!-- MASTER SECTION: 3. FEATURE FLAGS                                          -->
<!-- ========================================================================= -->
<div id="section-feature-flags" class="master-section">
  <div class="master-page-container">
    <div class="master-page-header">
      <div class="master-page-title-box">
        <h1>🚩 Remote Feature Flags &amp; Toggles</h1>
        <p>Dynamically control features, algorithms, and experimental views in real-time across Android APK clients.</p>
      </div>
      <div>
        <button class="btn-publish" onclick="openAddFlagModal()">+ Add Feature Flag</button>
      </div>
    </div>

    <div class="flags-grid" id="flags-grid-container">
      <div style="grid-column:1/-1; text-align:center; padding:32px; color:var(--text-muted);">Loading remote feature flags...</div>
    </div>
  </div>
</div>

<!-- ========================================================================= -->
<!-- MASTER SECTION: 4. REMOTE APP CONFIG                                      -->
<!-- ========================================================================= -->
<div id="section-app-config" class="master-section">
  <div class="master-page-container">
    <div class="master-page-header">
      <div class="master-page-title-box">
        <h1>⚙️ Remote Application Configuration</h1>
        <p>Synchronize live parameters, API endpoints, telemetry intervals, and auth configurations.</p>
      </div>
      <div>
        <button class="btn-publish" onclick="openAddConfigModal()">+ Add Config Key</button>
      </div>
    </div>

    <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:16px; overflow:hidden; box-shadow:var(--shadow-card);">
      <table class="clean-table">
        <thead>
          <tr>
            <th>Config Key</th>
            <th>Category</th>
            <th>Description</th>
            <th style="width:340px;">Value</th>
            <th style="text-align:right;">Action</th>
          </tr>
        </thead>
        <tbody id="app-config-tbody">
          <tr><td colspan="5" style="text-align:center; padding:24px; color:var(--text-muted);">Loading app configurations...</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- ========================================================================= -->
<!-- MASTER SECTION: 5. NOTIFICATIONS BROADCASTER                              -->
<!-- ========================================================================= -->
<div id="section-notifications" class="master-section">
  <div class="master-page-container">
    <div class="master-page-header">
      <div class="master-page-title-box">
        <h1>📢 Push Notification Broadcaster</h1>
        <p>Send real-time alerts, health goals reminders, and marathon announcements to athlete devices.</p>
      </div>
    </div>

    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 24px;">
      <!-- COMPOSER -->
      <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:18px; padding:24px; display:flex; flex-direction:column; gap:16px;">
        <strong style="font-size:16px;">Compose Push Notification</strong>
        <form onsubmit="handleSendNotification(event)" style="display:flex; flex-direction:column; gap:14px;">
          <div class="form-group">
            <label class="control-label">Target Audience</label>
            <select class="control-select" id="notif-audience">
              <option value="all">All Athletes (1,420 devices)</option>
              <option value="runners">Dokra Running Club Members (840 devices)</option>
              <option value="wearables">Connected Galaxy Watches &amp; Bands</option>
            </select>
          </div>
          <div class="form-group">
            <label class="control-label">Notification Title</label>
            <input type="text" class="control-input" id="notif-title-input" placeholder="e.g. Sunday Marathon 10K Preparation" required oninput="updateNotifPreview()">
          </div>
          <div class="form-group">
            <label class="control-label">Message Body</label>
            <textarea class="control-textarea" id="notif-body-input" rows="4" placeholder="e.g. Gather at Central Park 7:00 AM. Hydration stations are ready!" required oninput="updateNotifPreview()"></textarea>
          </div>
          <div class="form-group">
            <label class="control-label">Deep Link URI</label>
            <input type="text" class="control-input" id="notif-deeplink-input" value="dokrahealth://sport/run">
          </div>
          <button type="submit" class="btn-publish" style="padding:12px; justify-content:center;">🚀 Send Broadcast to Athletes</button>
        </form>
      </div>

      <!-- ONE UI NOTIFICATION PREVIEW -->
      <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:18px; padding:24px; display:flex; flex-direction:column; gap:16px;">
        <strong style="font-size:16px;">One UI Notification Preview</strong>
        <div style="background:#090e1c; border:1px solid #1e2c4a; border-radius:24px; padding:20px; display:flex; flex-direction:column; gap:12px; max-width:380px; margin:0 auto; width:100%;">
          <div style="display:flex; justify-content:space-between; font-size:10px; color:#94a3b8; font-weight:700;">
            <span>DOKRA HEALTH ● NOW</span>
            <span>100% 🔋</span>
          </div>
          <div style="background:#16223d; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:14px; display:flex; gap:12px; align-items:flex-start;">
            <img src="/assets/dokra-logo.png" style="width:32px; height:32px; border-radius:8px; background:#fff; padding:2px; flex-shrink:0;">
            <div style="display:flex; flex-direction:column; gap:4px; flex:1;">
              <span style="font-size:13px; font-weight:800; color:#fff;" id="preview-notif-title">Sunday Marathon 10K Preparation</span>
              <span style="font-size:11.5px; color:#94a3b8; line-height:1.4;" id="preview-notif-body">Gather at Central Park 7:00 AM. Hydration stations are ready!</span>
            </div>
          </div>
        </div>

        <!-- PAST BROADCASTS -->
        <div style="margin-top:10px;">
          <strong style="font-size:13px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Recent Broadcasts</strong>
          <table class="clean-table" style="margin-top:8px;">
            <thead><tr><th>Title</th><th>Audience</th><th>Time</th></tr></thead>
            <tbody id="notif-history-tbody">
              <tr><td>Sunday 10K Run</td><td>All Athletes</td><td>Today 08:00 AM</td></tr>
              <tr><td>New Vitality Score v2</td><td>Android App</td><td>Yesterday</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ========================================================================= -->
<!-- MASTER SECTION: 6. USERS DIRECTORY                                        -->
<!-- ========================================================================= -->
<div id="section-users" class="master-section">
  <div class="master-page-container">
    <div class="master-page-header">
      <div class="master-page-title-box">
        <h1>👥 Athletes &amp; Administrator Directory</h1>
        <p>Manage club runners, trainers, and platform permissions.</p>
      </div>
      <div>
        <button class="btn-publish" onclick="openAddUserModal()">+ Add New User</button>
      </div>
    </div>

    <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:16px; overflow:hidden; box-shadow:var(--shadow-card);">
      <table class="clean-table">
        <thead>
          <tr>
            <th>User / Athlete</th>
            <th>Email</th>
            <th>Role</th>
            <th>Auth Provider</th>
            <th>Created</th>
            <th style="text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody id="users-directory-tbody">
          <tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-muted);">Loading users directory...</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- ========================================================================= -->
<!-- MASTER SECTION: 7. APK RELEASES & DEVELOPER PIPELINE                      -->
<!-- ========================================================================= -->
<div id="section-apk-releases" class="master-section">
  <div class="master-page-container">
    <div class="master-page-header">
      <div class="master-page-title-box">
        <h1>📦 Dokra Health APK Releases &amp; Deployments</h1>
        <p>Direct download links and developer build pipelines for compiled Android application packages.</p>
      </div>
      <div>
        <a href="https://github.com/Krushnapalsinh74/Dokra/releases" target="_blank" class="btn-icon" style="text-decoration:none; padding:8px 16px;">
          🌐 View GitHub Releases
        </a>
      </div>
    </div>

    <!-- FEATURED APK CARD -->
    <div class="apk-hero-card">
      <div class="apk-hero-info">
        <div class="apk-title-row">
          <span class="apk-title">Dokra Health v1.0.0 (Standalone Official)</span>
          <span class="apk-badge-verified">✔ Production Verified</span>
        </div>
        <p style="font-size:13px; color:var(--text-muted); line-height:1.5;">
          Complete Android standalone application package containing all 7 health domains, DokraAuthManager crash shield, background looper resilience, and local card synchronization.
        </p>
        <div class="apk-meta-chips">
          <span class="apk-chip">Size: 340.1 MB</span>
          <span class="apk-chip">Package: com.dokra.health</span>
          <span class="apk-chip">Target SDK: 34 (Android 14)</span>
          <span class="apk-chip">Min SDK: 28</span>
          <span class="apk-chip">Arch: arm64-v8a</span>
        </div>
      </div>
      <div>
        <a href="https://github.com/Krushnapalsinh74/Dokra/releases/download/v1.0.0/Dokra-Health.apk" class="btn-download-apk-large" target="_blank">
          ⬇️ Download Dokra-Health.apk
        </a>
      </div>
    </div>

    <!-- HOW TO REBUILD GUIDE -->
    <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:18px; padding:24px; display:flex; flex-direction:column; gap:16px;">
      <strong style="font-size:16px;">🛠️ Developer Guide: How to Decompile, Customize &amp; Rebuild</strong>
      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:16px;">
        <div style="background:var(--bg-card-subtle); padding:16px; border-radius:12px; border:1px solid var(--border-color);">
          <div style="font-weight:800; font-size:13px; color:#2563eb; margin-bottom:6px;">1. Decompile Base APK</div>
          <code style="font-size:11px; color:var(--text-main); display:block; background:rgba(0,0,0,0.2); padding:8px; border-radius:6px;">java -jar tools/apktool.jar d "Dokra-Health.apk" -o apktool</code>
        </div>
        <div style="background:var(--bg-card-subtle); padding:16px; border-radius:12px; border:1px solid var(--border-color);">
          <div style="font-weight:800; font-size:13px; color:#10b981; margin-bottom:6px;">2. Edit Java / Layouts</div>
          <p style="font-size:11.5px; color:var(--text-muted);">Modify custom Java classes in <code style="color:#2563eb;">src/main/java</code> or One UI XML drawables in <code style="color:#2563eb;">apktool/res</code>.</p>
        </div>
        <div style="background:var(--bg-card-subtle); padding:16px; border-radius:12px; border:1px solid var(--border-color);">
          <div style="font-weight:800; font-size:13px; color:#8b5cf6; margin-bottom:6px;">3. Automated One-Command Build</div>
          <code style="font-size:11px; color:var(--text-main); display:block; background:rgba(0,0,0,0.2); padding:8px; border-radius:6px;">node tools/build_fix_and_deploy_apk.js</code>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ========================================================================= -->
<!-- MASTER SECTION: 8. INTERACTIVE API EXPLORER                               -->
<!-- ========================================================================= -->
<div id="section-api-explorer" class="master-section">
  <div class="master-page-container">
    <div class="master-page-header">
      <div class="master-page-title-box">
        <h1>⚡ Interactive REST API Explorer</h1>
        <p>Execute and verify live mobile feed, telemetry metrics, and screen synchronization endpoints.</p>
      </div>
    </div>

    <!-- QUICK PRESETS -->
    <div style="display:flex; flex-wrap:wrap; gap:8px;">
      <button class="btn-icon" onclick="setApiExplorerPreset('GET', '/health')">GET /health</button>
      <button class="btn-icon" onclick="setApiExplorerPreset('GET', '/v2/servicecard/list')">GET /v2/servicecard/list</button>
      <button class="btn-icon" onclick="setApiExplorerPreset('GET', '/admin/v1/dashboard/metrics')">GET /admin/v1/dashboard/metrics</button>
      <button class="btn-icon" onclick="setApiExplorerPreset('GET', '/admin/v2/screens')">GET /admin/v2/screens</button>
      <button class="btn-icon" onclick="setApiExplorerPreset('GET', '/admin/v1/feature-flags')">GET /admin/v1/feature-flags</button>
      <button class="btn-icon" onclick="setApiExplorerPreset('GET', '/admin/v1/app-config')">GET /admin/v1/app-config</button>
      <button class="btn-icon" onclick="setApiExplorerPreset('GET', '/admin/v1/users')">GET /admin/v1/users</button>
    </div>

    <!-- REQUEST CONTROLLER -->
    <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:16px; padding:20px; display:flex; flex-direction:column; gap:16px;">
      <div style="display:flex; gap:10px;">
        <select class="control-select" id="api-req-method" style="width:120px;">
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
        </select>
        <input type="text" class="control-input" id="api-req-url" value="/v2/servicecard/list" style="flex:1;">
        <button class="btn-publish" onclick="executeInteractiveApiTest()">Execute Request 🚀</button>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Response Viewer</span>
        <span class="status-badge" id="api-res-status">Awaiting request...</span>
      </div>

      <pre id="api-res-body" style="background:#090e1c; border:1px solid #1e2c4a; border-radius:12px; padding:16px; font-family:'JetBrains Mono', monospace; font-size:12px; color:#38bdf8; max-height:420px; overflow:auto;"></pre>
    </div>
  </div>
</div>
`;

content = content.replace('  </main>', standaloneSectionsHtml);

// 5. Add Modals: Edit Card Modal, Add Feature Flag Modal, Add Config Key Modal, Add User Modal
const extraModalsHtml = `
  <!-- MODAL: EDIT CARD -->
  <div class="modal-overlay" id="modal-edit-card">
    <div class="modal-dialog" style="max-width:580px;">
      <div class="modal-header">
        <strong style="font-size:14px;">✏️ Edit Service Card</strong>
        <button class="btn-icon" onclick="closeModal('modal-edit-card')">✕</button>
      </div>
      <form onsubmit="saveCardEdit(event)" style="display:flex; flex-direction:column;">
        <div class="modal-body" style="display:flex; flex-direction:column; gap:12px;">
          <input type="hidden" id="edit-card-id">
          <div class="form-group">
            <label class="control-label">Card Title</label>
            <input type="text" class="control-input" id="edit-card-title" required>
          </div>
          <div class="form-group">
            <label class="control-label">Card Subtitle / Body</label>
            <textarea class="control-textarea" id="edit-card-body" rows="3" required></textarea>
          </div>
          <div class="control-grid-2">
            <div class="form-group">
              <label class="control-label">Priority (Higher = Top)</label>
              <input type="number" class="control-input" id="edit-card-priority" min="0" max="1000" required>
            </div>
            <div class="form-group">
              <label class="control-label">Target Domain</label>
              <select class="control-select" id="edit-card-domain">
                <option value="daily_activity">Daily Activity</option>
                <option value="vitality">Vitality &amp; Energy</option>
                <option value="running">Sports &amp; Running</option>
                <option value="sleep">Sleep &amp; Recovery</option>
                <option value="heart">Heart &amp; ECG</option>
                <option value="bp">Blood Pressure</option>
                <option value="cgm">Blood Glucose (CGM)</option>
              </select>
            </div>
          </div>
          <div class="control-grid-2">
            <div class="form-group">
              <label class="control-label">CTA Button Label</label>
              <input type="text" class="control-input" id="edit-card-cta-label" placeholder="e.g. View Analysis">
            </div>
            <div class="form-group">
              <label class="control-label">CTA Deep Link URL</label>
              <input type="text" class="control-input" id="edit-card-cta-url" placeholder="dokrahealth://...">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-icon" onclick="closeModal('modal-edit-card')">Cancel</button>
          <button type="submit" class="btn-publish">💾 Save &amp; Sync to Feed</button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: ADD FEATURE FLAG -->
  <div class="modal-overlay" id="modal-add-flag">
    <div class="modal-dialog" style="max-width:480px;">
      <div class="modal-header">
        <strong style="font-size:14px;">🚩 Create Feature Flag</strong>
        <button class="btn-icon" onclick="closeModal('modal-add-flag')">✕</button>
      </div>
      <form onsubmit="handleCreateFlag(event)" style="display:flex; flex-direction:column;">
        <div class="modal-body" style="display:flex; flex-direction:column; gap:12px;">
          <div class="form-group"><label class="control-label">Flag Key (slug)</label><input type="text" class="control-input" id="new-flag-key" placeholder="e.g. enable_ecg_v2" required></div>
          <div class="form-group"><label class="control-label">Flag Name</label><input type="text" class="control-input" id="new-flag-name" placeholder="e.g. ECG Real-Time Lead I" required></div>
          <div class="form-group"><label class="control-label">Category</label><input type="text" class="control-input" id="new-flag-cat" placeholder="e.g. cardiology" required></div>
          <div class="form-group"><label class="control-label">Description</label><textarea class="control-textarea" id="new-flag-desc" rows="2" placeholder="e.g. Enables 60Hz ECG sensor stream in mobile app."></textarea></div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-icon" onclick="closeModal('modal-add-flag')">Cancel</button>
          <button type="submit" class="btn-publish">Create Flag</button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: ADD USER -->
  <div class="modal-overlay" id="modal-add-user">
    <div class="modal-dialog" style="max-width:480px;">
      <div class="modal-header">
        <strong style="font-size:14px;">👥 Register New User</strong>
        <button class="btn-icon" onclick="closeModal('modal-add-user')">✕</button>
      </div>
      <form onsubmit="handleCreateUser(event)" style="display:flex; flex-direction:column;">
        <div class="modal-body" style="display:flex; flex-direction:column; gap:12px;">
          <div class="form-group"><label class="control-label">Full Name</label><input type="text" class="control-input" id="new-user-name" placeholder="e.g. Jordan Miles" required></div>
          <div class="form-group"><label class="control-label">Email Address</label><input type="email" class="control-input" id="new-user-email" placeholder="e.g. jordan@dokrahealth.com" required></div>
          <div class="form-group">
            <label class="control-label">Role</label>
            <select class="control-select" id="new-user-role">
              <option value="athlete">Athlete</option>
              <option value="coach">Coach / Trainer</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-icon" onclick="closeModal('modal-add-user')">Cancel</button>
          <button type="submit" class="btn-publish">Save User</button>
        </div>
      </form>
    </div>
  </div>
`;

content = content.replace('<div class="toast-container" id="toast-container"></div>', extraModalsHtml + '\n  <div class="toast-container" id="toast-container"></div>');

// 6. Inject the JavaScript controller functions for Master Sections, Cards CMS, Flags, Config, etc.
const masterJs = `
    // =========================================================================
    // MASTER GLOBAL CONTROLLER LOGIC
    // =========================================================================
    let currentMasterSection = 'section-screen-studio';
    let allCardsData = [];

    function switchMasterSection(sectionId) {
      document.querySelectorAll('.master-section').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.master-tab-btn').forEach(el => el.classList.remove('active'));

      const target = document.getElementById(sectionId);
      if (target) target.classList.add('active');

      const tabId = 'mtab-' + sectionId.replace('section-', '');
      const tabEl = document.getElementById(tabId);
      if (tabEl) tabEl.classList.add('active');

      currentMasterSection = sectionId;

      if (sectionId === 'section-dashboard') loadDashboardMetrics();
      if (sectionId === 'section-cards-cms') loadCardsCms();
      if (sectionId === 'section-feature-flags') loadFeatureFlags();
      if (sectionId === 'section-app-config') loadAppConfig();
      if (sectionId === 'section-users') loadUsersDirectory();
    }

    async function loadDashboardMetrics() {
      try {
        const res = await fetch('/admin/v1/dashboard/metrics');
        if (res.ok) {
          const d = await res.json();
          if (d.activeUsers) document.getElementById('dash-kpi-athletes').innerText = Number(d.activeUsers).toLocaleString();
          if (d.dailySyncCalls) document.getElementById('dash-kpi-requests').innerText = d.dailySyncCalls;
          if (d.avgFeedLatencyMs) document.getElementById('dash-kpi-latency').innerText = d.avgFeedLatencyMs + ' ms';
        }
      } catch (err) {
        console.log('Telemetry load err:', err);
      }
    }

    async function loadCardsCms() {
      const tbody = document.getElementById('cards-cms-tbody');
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--text-muted);">Fetching cards feed...</td></tr>';
      try {
        const res = await fetch('/admin/v1/cards');
        if (res.ok) {
          allCardsData = await res.json();
          renderCardsTable(allCardsData);
          document.getElementById('count-all-cards').innerText = allCardsData.length;
        }
      } catch (err) {
        tbody.innerHTML = \`<tr><td colspan="6" style="color:var(--accent-red); padding:16px;">Error loading cards: \${err.message}</td></tr>\`;
      }
    }

    function renderCardsTable(cards) {
      const tbody = document.getElementById('cards-cms-tbody');
      if (!cards || cards.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-muted);">No service cards found.</td></tr>';
        return;
      }
      tbody.innerHTML = cards.map(c => {
        const isPub = c.status === 'PUBLISHED';
        const meta = c.metadata || {};
        const content = c.content || {};
        const title = content.title || meta.title || c.slug;
        const body = content.body || content.description || 'No description';
        return \`
          <tr>
            <td><span class="selected-element-badge" style="font-size:11px; padding:2px 8px;">\${c.priority || 0}</span></td>
            <td>
              <strong style="font-size:13px; color:var(--text-main);">\${title}</strong><br>
              <span style="font-size:11px; color:var(--text-muted);">\${c.slug} &bull; v\${c.version}</span>
            </td>
            <td><span style="font-size:11.5px; font-weight:700; color:var(--primary-blue);">\${meta.domain || 'general'}</span></td>
            <td><code style="font-size:11px; background:rgba(255,255,255,0.06); padding:2px 6px; border-radius:4px;">Template \${c.templateType || 0}</code></td>
            <td>
              <span class="status-badge \${isPub ? 'published' : 'draft'}">\${c.status}</span>
            </td>
            <td style="text-align:right;">
              <div style="display:inline-flex; gap:6px;">
                <button class="btn-icon" style="padding:4px 8px; font-size:11px;" onclick="openEditCardModal('\${c.id}')">✏️ Edit</button>
                <button class="\${isPub ? 'btn-red' : 'btn-green'}" style="padding:4px 8px; font-size:11px; border-radius:6px; border:none; cursor:pointer;" onclick="toggleCardPublish('\${c.id}', \${isPub})">
                  \${isPub ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            </td>
          </tr>
        \`;
      }).join('');
    }

    function filterCardsCms(status) {
      document.querySelectorAll('.cms-filter-btn').forEach(b => b.classList.remove('active'));
      const btn = document.getElementById('filter-card-' + status);
      if (btn) btn.classList.add('active');

      if (status === 'all') renderCardsTable(allCardsData);
      else if (status === 'published') renderCardsTable(allCardsData.filter(c => c.status === 'PUBLISHED'));
      else if (status === 'draft') renderCardsTable(allCardsData.filter(c => c.status === 'DRAFT'));
    }

    function handleCardsSearch(q) {
      if (!q || q.trim() === '') {
        renderCardsTable(allCardsData);
        return;
      }
      const needle = q.toLowerCase();
      const filtered = allCardsData.filter(c => {
        const title = (c.content?.title || c.slug || '').toLowerCase();
        const domain = (c.metadata?.domain || '').toLowerCase();
        return title.includes(needle) || domain.includes(needle) || c.slug.includes(needle);
      });
      renderCardsTable(filtered);
    }

    function openEditCardModal(cardId) {
      const card = allCardsData.find(c => c.id === cardId);
      if (!card) return;
      document.getElementById('edit-card-id').value = card.id;
      document.getElementById('edit-card-title').value = card.content?.title || card.metadata?.title || '';
      document.getElementById('edit-card-body').value = card.content?.body || card.content?.description || '';
      document.getElementById('edit-card-priority').value = card.priority || 0;
      document.getElementById('edit-card-domain').value = card.metadata?.domain || 'daily_activity';
      document.getElementById('edit-card-cta-label').value = card.actions?.[0]?.label || '';
      document.getElementById('edit-card-cta-url').value = card.actions?.[0]?.url || '';
      document.getElementById('modal-edit-card').classList.add('open');
    }

    async function saveCardEdit(e) {
      e.preventDefault();
      const id = document.getElementById('edit-card-id').value;
      const title = document.getElementById('edit-card-title').value;
      const body = document.getElementById('edit-card-body').value;
      const priority = parseInt(document.getElementById('edit-card-priority').value) || 0;
      const domain = document.getElementById('edit-card-domain').value;
      const ctaLabel = document.getElementById('edit-card-cta-label').value;
      const ctaUrl = document.getElementById('edit-card-cta-url').value;

      try {
        const payload = {
          priority,
          metadata: { domain, title },
          content: { title, body },
          actions: ctaUrl ? [{ label: ctaLabel || 'Open', url: ctaUrl }] : []
        };
        const res = await fetch('/admin/v1/cards/' + id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-Actor-Id': 'super_admin' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast('Card updated and synced to database!');
          closeModal('modal-edit-card');
          loadCardsCms();
        }
      } catch (err) {
        showToast('Error updating card: ' + err.message);
      }
    }

    async function toggleCardPublish(id, isPublished) {
      const action = isPublished ? 'unpublish' : 'publish';
      try {
        const res = await fetch(\`/admin/v1/cards/\${id}/\${action}\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Actor-Id': 'super_admin' },
          body: JSON.stringify({ reason: 'Admin toggle ' + action })
        });
        if (res.ok) {
          showToast(\`Card successfully \${isPublished ? 'unpublished' : 'published to feed'}!\`);
          loadCardsCms();
        }
      } catch (err) {
        showToast('Action failed: ' + err.message);
      }
    }

    // FEATURE FLAGS
    async function loadFeatureFlags() {
      const container = document.getElementById('flags-grid-container');
      container.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:24px; color:var(--text-muted);">Fetching feature flags...</div>';
      try {
        const res = await fetch('/admin/v1/feature-flags');
        if (res.ok) {
          const flags = await res.json();
          container.innerHTML = flags.map(f => \`
            <div class="flag-card">
              <div class="flag-header">
                <span class="flag-name">\${f.name}</span>
                <label class="toggle-switch">
                  <input type="checkbox" \${f.enabled ? 'checked' : ''} onchange="toggleFeatureFlag('\${f.key}', this.checked)">
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <span class="flag-key">\${f.key}</span>
              <p class="flag-desc">\${f.description || 'Feature gate for mobile clients.'}</p>
              <div class="flag-footer">
                <span style="font-size:10px; font-weight:800; background:rgba(37,99,235,0.15); color:var(--primary-blue); padding:2px 6px; border-radius:4px;">\${f.category}</span>
                <span style="font-size:11px; color:var(--text-muted);">Rollout: \${f.rollout_pct || 100}%</span>
              </div>
            </div>
          \`).join('');
        }
      } catch (err) {
        container.innerHTML = \`<div style="grid-column:1/-1; color:var(--accent-red); padding:16px;">Error: \${err.message}</div>\`;
      }
    }

    async function toggleFeatureFlag(key, enabled) {
      try {
        const res = await fetch('/admin/v1/feature-flags/' + key, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-Actor-Id': 'super_admin' },
          body: JSON.stringify({ enabled })
        });
        if (res.ok) {
          showToast(\`Feature Flag '\${key}' is now \${enabled ? 'ENABLED' : 'DISABLED'}!\`);
        }
      } catch (err) {
        showToast('Error updating flag: ' + err.message);
      }
    }

    // REMOTE APP CONFIG
    async function loadAppConfig() {
      const tbody = document.getElementById('app-config-tbody');
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">Loading configurations...</td></tr>';
      try {
        const res = await fetch('/admin/v1/app-config');
        if (res.ok) {
          const configs = await res.json();
          tbody.innerHTML = configs.map(c => \`
            <tr>
              <td><code>\${c.key}</code></td>
              <td><span style="font-size:10.5px; font-weight:700; background:rgba(255,255,255,0.06); padding:2px 6px; border-radius:4px;">\${c.category}</span></td>
              <td style="font-size:12px; color:var(--text-muted);">\${c.description || '-'}</td>
              <td>
                <input type="text" class="control-input" id="cfg-val-\${c.key}" value="\${c.value}" style="font-family:'JetBrains Mono', monospace; font-size:11.5px;">
              </td>
              <td style="text-align:right;">
                <button class="btn-publish" style="padding:4px 10px; font-size:11px;" onclick="saveAppConfigKey('\${c.key}')">💾 Save</button>
              </td>
            </tr>
          \`).join('');
        }
      } catch (err) {
        tbody.innerHTML = \`<tr><td colspan="5" style="color:var(--accent-red); padding:16px;">Error: \${err.message}</td></tr>\`;
      }
    }

    async function saveAppConfigKey(key) {
      const val = document.getElementById('cfg-val-' + key).value;
      try {
        const res = await fetch('/admin/v1/app-config/' + key, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-Actor-Id': 'super_admin' },
          body: JSON.stringify({ value: val })
        });
        if (res.ok) {
          showToast(\`Configuration '\${key}' updated successfully!\`);
        }
      } catch (err) {
        showToast('Save failed: ' + err.message);
      }
    }

    // NOTIFICATIONS
    function updateNotifPreview() {
      const title = document.getElementById('notif-title-input').value;
      const body = document.getElementById('notif-body-input').value;
      document.getElementById('preview-notif-title').innerText = title || 'Notification Title';
      document.getElementById('preview-notif-body').innerText = body || 'Message text preview will appear here...';
    }

    async function handleSendNotification(e) {
      e.preventDefault();
      const title = document.getElementById('notif-title-input').value;
      const body = document.getElementById('notif-body-input').value;
      const audience = document.getElementById('notif-audience').value;
      const deep_link = document.getElementById('notif-deeplink-input').value;

      try {
        const res = await fetch('/admin/v1/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Actor-Id': 'super_admin' },
          body: JSON.stringify({ title, body, audience, deep_link })
        });
        if (res.ok) {
          showToast(\`Broadcast "\${title}" dispatched to athletes!\`);
          document.getElementById('notif-title-input').value = '';
          document.getElementById('notif-body-input').value = '';
          updateNotifPreview();
        }
      } catch (err) {
        showToast('Broadcast error: ' + err.message);
      }
    }

    // USERS DIRECTORY
    async function loadUsersDirectory() {
      const tbody = document.getElementById('users-directory-tbody');
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--text-muted);">Loading users directory...</td></tr>';
      try {
        const res = await fetch('/admin/v1/users');
        if (res.ok) {
          const users = await res.json();
          tbody.innerHTML = users.map(u => \`
            <tr>
              <td><strong>\${u.name}</strong></td>
              <td>\${u.email}</td>
              <td><span class="status-badge published">\${u.role}</span></td>
              <td>\${u.auth_provider || 'Native Dokra'}</td>
              <td style="font-size:11px; color:var(--text-muted);">\${new Date(u.created_at || Date.now()).toLocaleDateString()}</td>
              <td style="text-align:right;">
                <button class="btn-icon" style="padding:3px 8px; font-size:11px;" onclick="showToast('User profile active')">Manage</button>
              </td>
            </tr>
          \`).join('');
        }
      } catch (err) {
        tbody.innerHTML = \`<tr><td colspan="6" style="color:var(--accent-red); padding:16px;">Error: \${err.message}</td></tr>\`;
      }
    }

    // API EXPLORER
    function setApiExplorerPreset(method, url) {
      document.getElementById('api-req-method').value = method;
      document.getElementById('api-req-url').value = url;
      executeInteractiveApiTest();
    }

    async function executeInteractiveApiTest() {
      const method = document.getElementById('api-req-method').value;
      const url = document.getElementById('api-req-url').value;
      const statusBadge = document.getElementById('api-res-status');
      const bodyBox = document.getElementById('api-res-body');

      statusBadge.innerText = 'Requesting...';
      statusBadge.className = 'status-badge draft';
      bodyBox.innerText = 'Sending request to ' + url + '...';

      const t0 = performance.now();
      try {
        const res = await fetch(url, { method });
        const latency = Math.round(performance.now() - t0);
        statusBadge.innerText = \`HTTP \${res.status} \${res.statusText} (\${latency}ms)\`;
        statusBadge.className = res.ok ? 'status-badge published' : 'status-badge draft';
        const data = await res.json();
        bodyBox.innerText = JSON.stringify(data, null, 2);
      } catch (err) {
        statusBadge.innerText = 'Network Error';
        statusBadge.className = 'status-badge draft';
        bodyBox.innerText = 'Error: ' + err.message;
      }
    }
`;

content = content.replace('    let activeScreenId = \'scr_vitality_energy_score\';', masterJs + '\n    let activeScreenId = \'scr_vitality_energy_score\';');

// 7. Fix domain overlap bug in selectScreen
const fixedSelectScreenLogic = `
      // Viewport container 7-way toggle strictly partitioned by domain
      const isCgm = screenId.includes('cgm') || screenId.includes('glucose') || screenId.includes('blood_glucose');
      const isBp = !isCgm && (screenId.includes('bp_') || screenId.includes('blood_pressure') || screenId.includes('telehealth'));
      const isHeart = !isCgm && !isBp && (screenId.includes('heart') || screenId.includes('ecg') || screenId.includes('vitals'));
      const isVitality = !isCgm && !isBp && !isHeart && screenId.includes('vitality');
      const isSleep = !isCgm && !isBp && !isHeart && !isVitality && screenId.includes('sleep');
      const isSport = !isCgm && !isBp && !isHeart && !isVitality && !isSleep && screenId.includes('sport');
      const isHome = !isCgm && !isBp && !isHeart && !isVitality && !isSleep && !isSport;
`;

content = content.replace(
  /\/\/ Viewport container 7-way toggle[\s\S]*?const isHome = [^;]+;/,
  fixedSelectScreenLogic.trim()
);

fs.writeFileSync(studioHtmlPath, content, 'utf8');
console.log('Successfully upgraded studio.html! New length:', fs.statSync(studioHtmlPath).size);
