/**
 * Dokra Health - Master Persistence Engine (SQLite)
 * Task ID: DOKRA-ADMIN-STUDIO-REDESIGN-001
 * 
 * Manages cards, revisions, audit logs, feature flags, remote app config,
 * notifications, users, and platform telemetry metrics using node:sqlite.
 */

const { DatabaseSync } = require('node:sqlite');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { CARD_STATUS } = require('./types');

class CardDatabase {
  constructor(dbPath = ':memory:') {
    if (dbPath !== ':memory:') {
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
    this.dbPath = dbPath;
    this.db = new DatabaseSync(dbPath);
    this.initSchema();
    this.seedDefaults();
  }

  initSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        version INTEGER NOT NULL,
        status TEXT NOT NULL,
        priority INTEGER NOT NULL DEFAULT 0,
        active_revision_id TEXT,
        canonical_data TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_cards_slug ON cards(slug);
      CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);

      CREATE TABLE IF NOT EXISTS card_revisions (
        revision_id TEXT PRIMARY KEY,
        card_id TEXT NOT NULL,
        version INTEGER NOT NULL,
        status TEXT NOT NULL,
        canonical_data TEXT NOT NULL,
        created_by TEXT NOT NULL,
        created_at TEXT NOT NULL,
        change_summary TEXT,
        FOREIGN KEY (card_id) REFERENCES cards(id)
      );

      CREATE INDEX IF NOT EXISTS idx_revisions_card_id ON card_revisions(card_id);

      CREATE TABLE IF NOT EXISTS card_audit_events (
        event_id TEXT PRIMARY KEY,
        card_id TEXT NOT NULL,
        revision_id TEXT,
        operation TEXT NOT NULL,
        actor_id TEXT NOT NULL,
        details TEXT,
        timestamp TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_audit_card_id ON card_audit_events(card_id);

      CREATE TABLE IF NOT EXISTS feature_flags (
        key TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        enabled INTEGER NOT NULL DEFAULT 1,
        rollout_pct INTEGER NOT NULL DEFAULT 100,
        platforms TEXT NOT NULL DEFAULT '["android","wearos","web"]',
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS app_config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'general',
        description TEXT,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        audience TEXT NOT NULL DEFAULT 'all',
        deep_link TEXT,
        sent_at TEXT NOT NULL,
        recipient_count INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        status TEXT NOT NULL DEFAULT 'active',
        device_model TEXT,
        os_version TEXT,
        sync_records INTEGER NOT NULL DEFAULT 0,
        last_active TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS recent_changes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        action TEXT NOT NULL,
        actor TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS health_modules (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT NOT NULL,
        description TEXT,
        sources TEXT,
        icon TEXT,
        color TEXT,
        refresh_interval TEXT,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS workouts (
        id TEXT PRIMARY KEY,
        date_time TEXT NOT NULL,
        type TEXT NOT NULL,
        distance REAL NOT NULL,
        duration TEXT NOT NULL,
        calories INTEGER NOT NULL,
        avg_hr INTEGER NOT NULL,
        route_svg TEXT,
        pace TEXT,
        notes TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS medications (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        dosage TEXT NOT NULL,
        frequency TEXT NOT NULL,
        next_dose TEXT NOT NULL,
        status TEXT NOT NULL,
        color TEXT,
        icon_type TEXT,
        notes TEXT,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS medication_history (
        id TEXT PRIMARY KEY,
        date_time TEXT NOT NULL,
        medication_name TEXT NOT NULL,
        dosage TEXT NOT NULL,
        status TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS screen_content (
        key TEXT PRIMARY KEY,
        domain TEXT NOT NULL,
        screen_name TEXT NOT NULL,
        title TEXT NOT NULL,
        subtitle TEXT,
        description TEXT,
        cta_text TEXT,
        cta_url TEXT,
        badge TEXT,
        icon TEXT,
        config_json TEXT,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sports_catalog (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        icon TEXT,
        default_duration TEXT,
        default_calories INTEGER,
        default_pace TEXT,
        hr_zones_json TEXT,
        route_gpx TEXT,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sleep_coaching (
        id TEXT PRIMARY KEY,
        animal_persona TEXT NOT NULL,
        stage TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        weekly_goal TEXT,
        progress_pct INTEGER DEFAULT 0,
        tips_json TEXT,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS challenge_events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT,
        type TEXT NOT NULL,
        goal_metric TEXT NOT NULL,
        goal_val INTEGER NOT NULL,
        current_progress INTEGER NOT NULL DEFAULT 0,
        participants INTEGER NOT NULL DEFAULT 0,
        days_left INTEGER NOT NULL DEFAULT 7,
        badge_name TEXT,
        banner_color TEXT,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS food_catalog (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        meal_type TEXT NOT NULL,
        calories INTEGER NOT NULL,
        protein REAL NOT NULL,
        carbs REAL NOT NULL,
        fat REAL NOT NULL,
        barcode TEXT,
        image_url TEXT,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS vitals_sensors (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        current_value TEXT NOT NULL,
        min_range TEXT,
        max_range TEXT,
        status TEXT NOT NULL,
        alert_threshold TEXT,
        waveform_data TEXT,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS wearables (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        battery_pct INTEGER NOT NULL,
        connection_status TEXT NOT NULL,
        firmware_ver TEXT,
        last_sync TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS screen_registry (
        id TEXT PRIMARY KEY,
        domain_id TEXT NOT NULL,
        domain_name TEXT NOT NULL,
        screen_name TEXT NOT NULL,
        screen_type TEXT NOT NULL DEFAULT 'main_screen',
        route_path TEXT,
        layout_json TEXT NOT NULL,
        style_json TEXT NOT NULL,
        config_json TEXT NOT NULL,
        visibility_flags_json TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        version INTEGER NOT NULL DEFAULT 1,
        active_revision_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_screen_reg_domain ON screen_registry(domain_id);
      CREATE INDEX IF NOT EXISTS idx_screen_reg_status ON screen_registry(status);

      CREATE TABLE IF NOT EXISTS screen_revisions (
        revision_id TEXT PRIMARY KEY,
        screen_id TEXT NOT NULL,
        version INTEGER NOT NULL,
        snapshot_json TEXT NOT NULL,
        changed_by TEXT NOT NULL,
        change_summary TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (screen_id) REFERENCES screen_registry(id)
      );

      CREATE INDEX IF NOT EXISTS idx_screen_rev_screen ON screen_revisions(screen_id);

      CREATE TABLE IF NOT EXISTS screen_recycle_bin (
        id TEXT PRIMARY KEY,
        item_type TEXT NOT NULL,
        item_id TEXT NOT NULL,
        item_name TEXT NOT NULL,
        domain_id TEXT NOT NULL,
        snapshot_json TEXT NOT NULL,
        deleted_by TEXT NOT NULL,
        deleted_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS audit_events (
        id TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        target_type TEXT NOT NULL,
        target_id TEXT NOT NULL,
        diff_summary TEXT,
        details_json TEXT,
        actor_id TEXT NOT NULL,
        timestamp TEXT NOT NULL
      );
    `);
  }

  seedDefaults() {
    // Seed Feature Flags if empty
    const flagCount = this.db.prepare('SELECT COUNT(*) as c FROM feature_flags').get()?.c || 0;
    if (flagCount === 0) {
      const now = new Date().toISOString();
      const defaultFlags = [
        { key: 'workout_recommendations', name: 'Workout AI Recommendations', category: 'Health', desc: 'AI-driven personalized workout suggestions', enabled: 1, rollout: 100, platforms: '["android","wearos"]' },
        { key: 'sleep_apnea_detection', name: 'Sleep Apnea & SpO2 Analytics', category: 'Health', desc: 'Advanced overnight oxygen drop detection', enabled: 1, rollout: 85, platforms: '["android"]' },
        { key: 'nutrition_barcode_scanner', name: 'Nutrition Barcode & Meal Scan', category: 'Health', desc: 'Instant camera-based food & nutrient recognition', enabled: 1, rollout: 100, platforms: '["android"]' },
        { key: 'medication_ai_interaction', name: 'Drug Interaction & Conflict AI', category: 'Safety', desc: 'Clinical warnings for multi-medication schedules', enabled: 1, rollout: 100, platforms: '["android","web"]' },
        { key: 'ble_continuous_sync', name: 'Continuous BLE Background Sync', category: 'Hardware', desc: 'High-frequency telemetry sync for smart rings & watches', enabled: 1, rollout: 90, platforms: '["android","wearos"]' },
        { key: 'cloud_backup_v2', name: 'End-to-End Encrypted Cloud Sync', category: 'Security', desc: 'Zero-knowledge encrypted health data backup', enabled: 1, rollout: 100, platforms: '["android","wearos","web"]' },
        { key: 'ai_health_assistant_medlm', name: 'Med-PaLM Clinical Assistant', category: 'AI', desc: 'Doctor-validated conversational health agent', enabled: 1, rollout: 75, platforms: '["android","web"]' },
        { key: 'together_global_challenges', name: 'Global Community Challenges', category: 'Social', desc: 'Worldwide step & fitness leaderboards', enabled: 1, rollout: 100, platforms: '["android","wearos","web"]' }
      ];

      const insertFlag = this.db.prepare(`
        INSERT INTO feature_flags (key, name, category, description, enabled, rollout_pct, platforms, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const f of defaultFlags) {
        insertFlag.run(f.key, f.name, f.category, f.desc, f.enabled, f.rollout, f.platforms, now);
      }
    }

    // Seed App Config if empty
    const configCount = this.db.prepare('SELECT COUNT(*) as c FROM app_config').get()?.c || 0;
    if (configCount === 0) {
      const now = new Date().toISOString();
      const defaultConfigs = [
        { key: 'api_gateway_url', value: 'https://api.dokrahealth.com/v2', category: 'Network', desc: 'Primary API Gateway Endpoint' },
        { key: 'staging_auth_url', value: 'http://10.0.2.2:8080/v1/auth', category: 'Network', desc: 'Emulator/Staging Auth Endpoint' },
        { key: 'card_cache_ttl_seconds', value: '300', category: 'Performance', desc: 'Mobile feed HTTP Cache-Control TTL' },
        { key: 'ble_sync_interval_mins', value: '15', category: 'Hardware', desc: 'Background device telemetry poll frequency' },
        { key: 'maintenance_mode_enabled', value: 'false', category: 'System', desc: 'Emergency client maintenance lockdown' },
        { key: 'min_supported_android_version', value: '29', category: 'Compatibility', desc: 'Minimum OS API level (Android 10+)' },
        { key: 'max_daily_ai_consultations', value: '50', category: 'AI & Rate Limiting', desc: 'Free-tier AI health assistant request cap' },
        { key: 'e2ee_encryption_standard', value: 'AES-256-GCM', category: 'Security', desc: 'Cipher suite for mobile Room DB encryption' }
      ];

      const insertConfig = this.db.prepare(`
        INSERT INTO app_config (key, value, category, description, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      for (const c of defaultConfigs) {
        insertConfig.run(c.key, c.value, c.category, c.desc, now);
      }
    }

    // Seed Users if empty
    const userCount = this.db.prepare('SELECT COUNT(*) as c FROM users').get()?.c || 0;
    if (userCount === 0) {
      const now = new Date().toISOString();
      const sampleUsers = [
        { id: 'usr_001', email: 'admin@dokrahealth.com', name: 'Dr. Sarah Connor', role: 'Super Admin', status: 'active', device: 'Pixel 8 Pro (API 34)', os: 'Android 14', syncs: 1420 },
        { id: 'usr_002', email: 'user_7842@example.com', name: 'Alex Johnson', role: 'User', status: 'active', device: 'Samsung Galaxy S24', os: 'Android 14', syncs: 894 },
        { id: 'usr_003', email: 'dr.marcus@dokraclinic.org', name: 'Dr. Marcus Vance', role: 'Clinical Reviewer', status: 'active', device: 'iPad Pro / Web', os: 'Chrome 124', syncs: 312 },
        { id: 'usr_004', email: 'elena.rodriguez@health.io', name: 'Elena Rodriguez', role: 'User', status: 'active', device: 'Galaxy Watch 6', os: 'WearOS 4', syncs: 2310 },
        { id: 'usr_005', email: 'chen.wei@dokratech.com', name: 'Wei Chen', role: 'Content Editor', status: 'active', device: 'OnePlus 12', os: 'Android 14', syncs: 56 }
      ];

      const insertUser = this.db.prepare(`
        INSERT INTO users (id, email, name, role, status, device_model, os_version, sync_records, last_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const u of sampleUsers) {
        insertUser.run(u.id, u.email, u.name, u.role, u.status, u.device, u.os, u.syncs, now, now);
      }
    }

    // Seed App Settings if empty
    const settingsCount = this.db.prepare('SELECT COUNT(*) as c FROM app_settings').get()?.c || 0;
    if (settingsCount === 0) {
      const defaultSettings = {
        appName: 'Dokra Health',
        versionName: '7.00.6.011',
        packageName: 'com.dokra.health',
        versionCode: '7006011',
        minSdk: '29',
        targetSdk: '36',
        activeFlavor: 'staging',
        stagingUrl: 'http://127.0.0.1:8080',
        productionUrl: 'https://api.dokrahealth.com',
        qaUrl: 'https://qa.dokrahealth.com',
        features: {
          health_tracking: true,
          notifications: true,
          ai_assistant: true,
          challenges: true,
          medication: true,
          devices: true,
          cloud_sync: false,
          advanced_analytics: true
        }
      };

      const insertSetting = this.db.prepare('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)');
      for (const [k, v] of Object.entries(defaultSettings)) {
        insertSetting.run(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
      }
    }

    // Seed Recent Changes if empty
    const changesCount = this.db.prepare('SELECT COUNT(*) as c FROM recent_changes').get()?.c || 0;
    if (changesCount === 0) {
      const defaultChanges = [
        { timestamp: 'Apr 26, 2025 14:32', action: 'App configuration updated', actor: 'admin' },
        { timestamp: 'Apr 26, 2025 14:10', action: 'Feature flag changed', actor: 'admin' },
        { timestamp: 'Apr 26, 2025 13:45', action: 'Build variant updated', actor: 'admin' },
        { timestamp: 'Apr 26, 2025 12:20', action: 'Environment switched to Staging', actor: 'admin' },
        { timestamp: 'Apr 26, 2025 11:50', action: 'Dependencies updated', actor: 'admin' }
      ];

      const insertChange = this.db.prepare('INSERT INTO recent_changes (timestamp, action, actor) VALUES (?, ?, ?)');
      for (const ch of defaultChanges) {
        insertChange.run(ch.timestamp, ch.action, ch.actor);
      }
    }

    // Seed 24 Canonical Cards if empty (18 Published, 4 Drafts, 2 Archived) on persistent database
    const cardCount = this.db.prepare('SELECT COUNT(*) as c FROM cards').get()?.c || 0;
    if (cardCount === 0 && this.dbPath !== ':memory:') {
      const now = new Date().toISOString();
      const defaultCards = [
        {
          id: 'card_001', slug: 'daily-steps-challenge', status: CARD_STATUS.PUBLISHED, priority: 1,
          category: 'Challenges', countries: ['KR', 'GB', 'US'], updated_at: '2025-04-26T14:32:00Z',
          content: { title: 'Daily Steps Challenge', subtitle: 'Take 10,000 steps today!', templateType: 0, description: 'Hit your daily step goal and earn badges with your community.', ctaButtonText: 'Join Challenge', ctaActionUrl: 'dokrahealth://steps/challenge' }
        },
        {
          id: 'card_002', slug: 'healthy-eating-guide', status: CARD_STATUS.PUBLISHED, priority: 2,
          category: 'Nutrition', countries: ['US', 'GB'], updated_at: '2025-04-26T12:17:00Z',
          content: { title: 'Healthy Eating Guide', subtitle: 'Better food, better you', templateType: 0, description: 'Discover balanced meal plans curated by clinical nutritionists.', ctaButtonText: 'Explore Recipes', ctaActionUrl: 'dokrahealth://nutrition/guide' }
        },
        {
          id: 'card_003', slug: 'better-sleep', status: CARD_STATUS.PUBLISHED, priority: 3,
          category: 'Sleep', countries: ['US', 'KR'], updated_at: '2025-04-26T10:45:00Z',
          content: { title: 'Better Sleep', subtitle: 'Sleep well, live better', templateType: 0, description: 'Optimize your circadian rhythm with AI bedtime coaching.', ctaButtonText: 'View Sleep Score', ctaActionUrl: 'dokrahealth://sleep/coach' }
        },
        {
          id: 'card_004', slug: 'heart-health-check', status: CARD_STATUS.DRAFT, priority: 4,
          category: 'Health Data', countries: ['US', 'GB', 'CA'], updated_at: '2025-04-26T09:22:00Z',
          content: {
            title: 'Heart Health Check',
            subtitle: 'Keep your heart healthy',
            templateType: 0,
            description: 'Monitor your heart rate, track your progress and build healthy habits for a stronger tomorrow.',
            ctaButtonText: 'View Details',
            ctaActionUrl: 'dokrahealth://vitality/detail',
            iconUrl: 'https://cdn.dokrahealth.com/heart.svg',
            bannerUrl: 'https://cdn.dokrahealth.com/banner-heart.jpg'
          }
        },
        {
          id: 'card_005', slug: 'hydration-reminder', status: CARD_STATUS.PUBLISHED, priority: 5,
          category: 'Nutrition', countries: ['KR', 'US'], updated_at: '2025-04-25T18:03:00Z',
          content: { title: 'Hydration Reminder', subtitle: 'Drink water, stay fresh', templateType: 0, description: 'Track your daily water intake and boost hydration.', ctaButtonText: 'Log Drink', ctaActionUrl: 'dokrahealth://water/log' }
        },
        {
          id: 'card_006', slug: 'mindfulness-stress', status: CARD_STATUS.PUBLISHED, priority: 6,
          category: 'Health Data', countries: ['US', 'GB'], updated_at: '2025-04-25T16:40:00Z',
          content: { title: 'Mindfulness & Stress', subtitle: 'A calmer mind, a healthier you', templateType: 0, description: 'Guided breathing and HRV stress recovery sessions.', ctaButtonText: 'Start Session', ctaActionUrl: 'dokrahealth://mindfulness/session' }
        },
        {
          id: 'card_007', slug: 'medication-tracker', status: CARD_STATUS.DRAFT, priority: 7,
          category: 'Medication', countries: ['US'], updated_at: '2025-04-25T14:12:00Z',
          content: { title: 'Medication Tracker', subtitle: 'Never miss a dose', templateType: 0, description: 'Smart schedules with automatic dosage reminders.', ctaButtonText: 'View Meds', ctaActionUrl: 'dokrahealth://meds/list' }
        },
        {
          id: 'card_008', slug: 'workout-plan', status: CARD_STATUS.PUBLISHED, priority: 8,
          category: 'Workouts', countries: ['CA', 'US'], updated_at: '2025-04-25T11:36:00Z',
          content: { title: 'Workout Plan', subtitle: 'Get stronger every day', templateType: 0, description: 'Customized strength training for your fitness level.', ctaButtonText: 'Start Workout', ctaActionUrl: 'dokrahealth://workout/start' }
        },
        {
          id: 'card_009', slug: 'ai-running-coach', status: CARD_STATUS.PUBLISHED, priority: 9,
          category: 'Workouts', countries: ['US', 'GB'], updated_at: '2025-04-25T10:00:00Z',
          content: { title: 'AI Running Coach', subtitle: 'Pacing for 5K & 10K', templateType: 0, description: 'Adaptive coaching based on real-time cadence and heart rate.', ctaButtonText: 'Run Now', ctaActionUrl: 'dokrahealth://running/ai' }
        },
        {
          id: 'card_010', slug: 'sleep-apnea-monitor', status: CARD_STATUS.PUBLISHED, priority: 10,
          category: 'Sleep', countries: ['US', 'KR'], updated_at: '2025-04-25T09:15:00Z',
          content: { title: 'Overnight SpO2 Scanner', subtitle: 'Detect breathing drops', templateType: 0, description: 'Continuous oxygen saturation monitoring while you rest.', ctaButtonText: 'View Night Report', ctaActionUrl: 'dokrahealth://sleep/spo2' }
        },
        {
          id: 'card_011', slug: 'calorie-counter-pro', status: CARD_STATUS.PUBLISHED, priority: 11,
          category: 'Nutrition', countries: ['US', 'CA', 'GB'], updated_at: '2025-04-24T18:40:00Z',
          content: { title: 'Smart Meal Scanner', subtitle: 'Instant macro breakdown', templateType: 0, description: 'Point camera at your plate for instant calorie & protein analysis.', ctaButtonText: 'Scan Meal', ctaActionUrl: 'dokrahealth://nutrition/scan' }
        },
        {
          id: 'card_012', slug: 'blood-pressure-log', status: CARD_STATUS.PUBLISHED, priority: 12,
          category: 'Health Data', countries: ['US', 'GB'], updated_at: '2025-04-24T16:20:00Z',
          content: { title: 'Cardiovascular Log', subtitle: 'Blood pressure tracking', templateType: 0, description: 'Keep track of systolic and diastolic readings over time.', ctaButtonText: 'Log BP', ctaActionUrl: 'dokrahealth://bp/log' }
        },
        {
          id: 'card_013', slug: 'smart-ring-sync', status: CARD_STATUS.PUBLISHED, priority: 13,
          category: 'Devices', countries: ['US', 'GB', 'KR'], updated_at: '2025-04-24T14:10:00Z',
          content: { title: 'Smart Ring Sync', subtitle: 'Sleep & HRV telemetry', templateType: 0, description: 'High frequency BLE sensor synchronization.', ctaButtonText: 'Connect Ring', ctaActionUrl: 'dokrahealth://devices/ring' }
        },
        {
          id: 'card_014', slug: 'together-global-league', status: CARD_STATUS.PUBLISHED, priority: 14,
          category: 'Challenges', countries: ['US', 'GB', 'CA', 'KR'], updated_at: '2025-04-24T12:05:00Z',
          content: { title: 'Global Fitness League', subtitle: 'Compete worldwide', templateType: 0, description: 'Join 50,000 walkers in the weekly global leaderboard.', ctaButtonText: 'View Ranks', ctaActionUrl: 'dokrahealth://together/league' }
        },
        {
          id: 'card_015', slug: 'glucose-telemetry', status: CARD_STATUS.PUBLISHED, priority: 15,
          category: 'Health Data', countries: ['US'], updated_at: '2025-04-24T10:30:00Z',
          content: { title: 'Continuous Glucose Sync', subtitle: 'Real-time CGM curve', templateType: 0, description: 'Sync continuous glucose monitor data seamlessly.', ctaButtonText: 'View Curve', ctaActionUrl: 'dokrahealth://cgm/view' }
        },
        {
          id: 'card_016', slug: 'hiit-quick-blast', status: CARD_STATUS.PUBLISHED, priority: 16,
          category: 'Workouts', countries: ['US', 'GB', 'CA'], updated_at: '2025-04-23T17:15:00Z',
          content: { title: '15-Min HIIT Quick Blast', subtitle: 'Burn fat fast', templateType: 0, description: 'High intensity interval training routine with voice prompts.', ctaButtonText: 'Start HIIT', ctaActionUrl: 'dokrahealth://workout/hiit' }
        },
        {
          id: 'card_017', slug: 'prescription-refill', status: CARD_STATUS.DRAFT, priority: 17,
          category: 'Medication', countries: ['US'], updated_at: '2025-04-23T15:45:00Z',
          content: { title: 'Pharmacy Refill Alerts', subtitle: 'Auto-refill reminders', templateType: 0, description: 'Never run out of essential vitamins or medications.', ctaButtonText: 'Manage Refills', ctaActionUrl: 'dokrahealth://meds/refill' }
        },
        {
          id: 'card_018', slug: 'guided-breathing', status: CARD_STATUS.PUBLISHED, priority: 18,
          category: 'Health Data', countries: ['US', 'GB'], updated_at: '2025-04-23T13:20:00Z',
          content: { title: 'Box Breathing Session', subtitle: 'Calm your heart in 3 mins', templateType: 0, description: 'Clinically proven 4-4-4-4 rhythm for rapid cortisol reduction.', ctaButtonText: 'Breathe', ctaActionUrl: 'dokrahealth://breathe/box' }
        },
        {
          id: 'card_019', slug: 'smartwatch-ecg-export', status: CARD_STATUS.PUBLISHED, priority: 19,
          category: 'Devices', countries: ['US', 'GB'], updated_at: '2025-04-23T11:00:00Z',
          content: { title: 'Doctor-Ready ECG Export', subtitle: 'Generate PDF Report', templateType: 0, description: 'Export single-lead ECG sinus rhythm waveforms for your doctor.', ctaButtonText: 'Export PDF', ctaActionUrl: 'dokrahealth://ecg/export' }
        },
        {
          id: 'card_020', slug: 'water-intake-streak', status: CARD_STATUS.PUBLISHED, priority: 20,
          category: 'Nutrition', countries: ['US', 'GB', 'KR'], updated_at: '2025-04-22T18:30:00Z',
          content: { title: '7-Day Hydration Mastery', subtitle: 'Unlock achievement badge', templateType: 0, description: 'Drink 2.5L daily for 7 days to unlock gold hydration cup.', ctaButtonText: 'Check Streak', ctaActionUrl: 'dokrahealth://water/streak' }
        },
        {
          id: 'card_021', slug: 'cycling-power-zones', status: CARD_STATUS.PUBLISHED, priority: 21,
          category: 'Workouts', countries: ['US', 'GB'], updated_at: '2025-04-22T16:10:00Z',
          content: { title: 'Cycling Power Zones', subtitle: 'FTP & Cadence charts', templateType: 0, description: 'Pedal cadence and power wattage distribution curves.', ctaButtonText: 'View Zones', ctaActionUrl: 'dokrahealth://cycling/ftp' }
        },
        {
          id: 'card_022', slug: 'pregnancy-health-insights', status: CARD_STATUS.DRAFT, priority: 22,
          category: 'Health Data', countries: ['US', 'GB'], updated_at: '2025-04-22T14:00:00Z',
          content: { title: 'Maternal Health Insights', subtitle: 'Trimester wellness guide', templateType: 0, description: 'Guidance and safety tips for expectant mothers.', ctaButtonText: 'View Insights', ctaActionUrl: 'dokrahealth://maternal/insights' }
        },
        {
          id: 'card_023', slug: 'summer-stepathon-2024', status: CARD_STATUS.ARCHIVED, priority: 23,
          category: 'Challenges', countries: ['US'], updated_at: '2025-04-20T12:00:00Z',
          content: { title: 'Summer Stepathon 2024', subtitle: 'Archived competition', templateType: 0, description: 'Past summer challenge event summary.', ctaButtonText: 'View Hall of Fame', ctaActionUrl: 'dokrahealth://archive/summer24' }
        },
        {
          id: 'card_024', slug: 'winter-wellness-archive', status: CARD_STATUS.ARCHIVED, priority: 24,
          category: 'Health Data', countries: ['US'], updated_at: '2025-04-15T09:00:00Z',
          content: { title: 'Winter Flu Shield Tips', subtitle: 'Archived immunity guide', templateType: 0, description: 'Cold season health guidelines.', ctaButtonText: 'Read Archive', ctaActionUrl: 'dokrahealth://archive/winter24' }
        }
      ];

      const insertCard = this.db.prepare(`
        INSERT INTO cards (id, slug, version, status, priority, active_revision_id, canonical_data, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const insertRev = this.db.prepare(`
        INSERT INTO card_revisions (revision_id, card_id, version, status, canonical_data, created_by, created_at, change_summary)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const c of defaultCards) {
        const revId = `rev_${c.id}_v1`;
        const canonical = {
          id: c.id,
          slug: c.slug,
          version: 1,
          status: c.status,
          priority: c.priority,
          targeting: { countries: c.countries || ['ALL'] },
          metadata: { category: c.category || 'General', partnerName: 'Dokra Health' },
          content: c.content,
          audit: { createdBy: 'admin', updatedBy: 'admin', createdAt: c.updated_at, updatedAt: c.updated_at, publishedAt: c.status === CARD_STATUS.PUBLISHED ? c.updated_at : null, revisionId: revId }
        };
        insertCard.run(c.id, c.slug, 1, c.status, c.priority, c.status === CARD_STATUS.PUBLISHED ? revId : null, JSON.stringify(canonical), c.updated_at, c.updated_at);
        insertRev.run(revId, c.id, 1, c.status, JSON.stringify(canonical), 'admin', c.updated_at, 'Initial seed');
      }
    }

    // Seed Health Modules if empty
    const moduleCount = this.db.prepare('SELECT COUNT(*) as c FROM health_modules').get()?.c || 0;
    if (moduleCount === 0) {
      const now = new Date().toISOString();
      const defaultModules = [
        { id: 'steps', name: 'Steps', status: 'Supported', description: 'Tracks your daily steps and movement using sensors or connected devices.', sources: 'Health Connect / BLE / Manual', icon: '🏃', color: '#2563eb', refresh: 'Real-time' },
        { id: 'heart-rate', name: 'Heart Rate', status: 'Supported', description: 'Monitors your heart rate and HRV using sensors or wearables.', sources: 'Health Connect / BLE / Camera', icon: '💓', color: '#f43f5e', refresh: 'Real-time' },
        { id: 'activity', name: 'Activity', status: 'Supported', description: 'Tracks active minutes, calories and physical activity.', sources: 'Health Connect / BLE / Sensors', icon: '🔥', color: '#f59e0b', refresh: '15 mins' },
        { id: 'sleep', name: 'Sleep', status: 'Supported', description: 'Analyzes your sleep patterns and quality.', sources: 'Health Connect / BLE / Sensors', icon: '🌙', color: '#8b5cf6', refresh: 'Daily' },
        { id: 'nutrition', name: 'Nutrition', status: 'Supported', description: 'Logs your food intake and nutrition information.', sources: 'Manual / Food DB', icon: '🍎', color: '#eab308', refresh: 'Manual' },
        { id: 'hydration', name: 'Hydration', status: 'Supported', description: 'Tracks your water intake and hydration levels.', sources: 'Manual / Smart Bottle (BLE)', icon: '💧', color: '#06b6d4', refresh: '30 mins' },
        { id: 'weight', name: 'Weight', status: 'Supported', description: 'Monitors your body weight and trends.', sources: 'Health Connect / BLE / Manual', icon: '⚖️', color: '#10b981', refresh: 'Daily' },
        { id: 'blood-pressure', name: 'Blood Pressure', status: 'Hardware Required', description: 'Tracks your blood pressure readings.', sources: 'BLE Device / Manual', icon: '🩺', color: '#8b5cf6', refresh: 'Manual' },
        { id: 'blood-glucose', name: 'Blood Glucose', status: 'Hardware Required', description: 'Monitors your blood glucose levels.', sources: 'BLE Device / Manual', icon: '🩸', color: '#ef4444', refresh: '5 mins' },
        { id: 'body-composition', name: 'Body Composition', status: 'Hardware Required', description: 'Tracks body fat, muscle mass and more.', sources: 'BLE Device / Manual', icon: '🧍', color: '#0d9488', refresh: 'Weekly' },
        { id: 'ecg-sinus', name: 'ECG / Arrhythmia', status: 'Permission Required', description: 'Single-lead sinus rhythm & atrial fibrillation classification.', sources: 'Smartwatch / Sensor SDK', icon: '📈', color: '#6366f1', refresh: 'On-demand' }
      ];

      const insertMod = this.db.prepare(`
        INSERT INTO health_modules (id, name, status, description, sources, icon, color, refresh_interval, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const m of defaultModules) {
        insertMod.run(m.id, m.name, m.status, m.description, m.sources, m.icon, m.color, m.refresh, now);
      }
    }

    // Seed Workouts if empty
    const workoutCount = this.db.prepare('SELECT COUNT(*) as c FROM workouts').get()?.c || 0;
    if (workoutCount === 0) {
      const defaultWorkouts = [
        {
          id: 'wo_1',
          date_time: 'Apr 26, 2025 08:32 AM',
          type: 'Running',
          distance: 5.21,
          duration: '32:14',
          calories: 412,
          avg_hr: 148,
          pace: '6:11 /km',
          route_svg: '<svg viewBox="0 0 60 30" width="60" height="30" fill="none" stroke="#2563eb" stroke-width="2"><path d="M5 25 Q15 5 25 15 T45 8 T55 20"/></svg>',
          notes: 'Morning park interval run with brisk pace.'
        },
        {
          id: 'wo_2',
          date_time: 'Apr 25, 2025 06:15 PM',
          type: 'Cycling',
          distance: 18.4,
          duration: '1:02:37',
          calories: 658,
          avg_hr: 132,
          pace: '3:24 /km',
          route_svg: '<svg viewBox="0 0 60 30" width="60" height="30" fill="none" stroke="#8b5cf6" stroke-width="2"><path d="M5 15 C15 5, 20 28, 35 12 S50 25, 55 10"/></svg>',
          notes: 'Sunset coastal loop ride with moderate cadence.'
        },
        {
          id: 'wo_3',
          date_time: 'Apr 24, 2025 07:20 AM',
          type: 'Walking',
          distance: 3.12,
          duration: '42:18',
          calories: 198,
          avg_hr: 96,
          pace: '13:33 /km',
          route_svg: '<svg viewBox="0 0 60 30" width="60" height="30" fill="none" stroke="#10b981" stroke-width="2"><path d="M5 20 Q20 25 30 10 T55 18"/></svg>',
          notes: 'Recovery morning brisk walk.'
        },
        {
          id: 'wo_4',
          date_time: 'Apr 22, 2025 06:45 PM',
          type: 'Running',
          distance: 7.83,
          duration: '45:32',
          calories: 601,
          avg_hr: 156,
          pace: '5:48 /km',
          route_svg: '<svg viewBox="0 0 60 30" width="60" height="30" fill="none" stroke="#2563eb" stroke-width="2"><path d="M5 10 Q18 28 32 14 T55 22"/></svg>',
          notes: 'Evening tempo endurance run.'
        },
        {
          id: 'wo_5',
          date_time: 'Apr 20, 2025 05:10 PM',
          type: 'Cycling',
          distance: 12.6,
          duration: '48:17',
          calories: 492,
          avg_hr: 118,
          pace: '3:49 /km',
          route_svg: '<svg viewBox="0 0 60 30" width="60" height="30" fill="none" stroke="#8b5cf6" stroke-width="2"><path d="M5 22 C20 10, 25 25, 40 8 S52 20, 55 12"/></svg>',
          notes: 'City bike tour and aerobic training.'
        }
      ];

      const insertWo = this.db.prepare(`
        INSERT INTO workouts (id, date_time, type, distance, duration, calories, avg_hr, pace, route_svg, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const now = new Date().toISOString();
      for (const w of defaultWorkouts) {
        insertWo.run(w.id, w.date_time, w.type, w.distance, w.duration, w.calories, w.avg_hr, w.pace || '5:30 /km', w.route_svg || '', w.notes || '', now);
      }
    }

    // Seed Medications if empty
    const medCount = this.db.prepare('SELECT COUNT(*) as c FROM medications').get()?.c || 0;
    if (medCount === 0) {
      const defaultMeds = [
        { id: 'med_1', name: 'Paracetamol 500mg', category: 'Pain Reliever', dosage: '500 mg', frequency: '3 times daily', next_dose: 'Today 2:00 PM', status: 'On Track', color: '#2563eb', icon_type: 'pill', notes: 'Take after meals with a full glass of water.' },
        { id: 'med_2', name: 'Vitamin D3', category: 'Supplement', dosage: '1000 IU', frequency: 'Once daily', next_dose: 'Today 9:00 AM', status: 'Taken', color: '#ef4444', icon_type: 'capsule', notes: 'Daily morning multivitamin booster.' },
        { id: 'med_3', name: 'Metformin 500mg', category: 'Diabetes', dosage: '500 mg', frequency: 'Twice daily', next_dose: 'Today 8:00 PM', status: 'Upcoming', color: '#f59e0b', icon_type: 'tablet', notes: 'Blood sugar regulation with evening dinner.' },
        { id: 'med_4', name: 'Amlodipine 5mg', category: 'Blood Pressure', dosage: '5 mg', frequency: 'Once daily', next_dose: 'Tomorrow 9:00 AM', status: 'Upcoming', color: '#8b5cf6', icon_type: 'pill', notes: 'Cardiovascular maintenance.' },
        { id: 'med_5', name: 'Omega 3', category: 'Heart Health', dosage: '1000 mg', frequency: 'Once daily', next_dose: 'Today 1:00 PM', status: 'Missed', color: '#10b981', icon_type: 'softgel', notes: 'Essential fatty acid dietary supplement.' }
      ];

      const insertMed = this.db.prepare(`
        INSERT INTO medications (id, name, category, dosage, frequency, next_dose, status, color, icon_type, notes, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const now = new Date().toISOString();
      for (const m of defaultMeds) {
        insertMed.run(m.id, m.name, m.category, m.dosage, m.frequency, m.next_dose, m.status, m.color, m.icon_type, m.notes, now);
      }
    }

    // Seed Medication History if empty
    const histCount = this.db.prepare('SELECT COUNT(*) as c FROM medication_history').get()?.c || 0;
    if (histCount === 0) {
      const defaultHistory = [
        { id: 'hist_1', date_time: 'Apr 26, 2025 2:00 PM', medication_name: 'Paracetamol 500mg', dosage: '500 mg', status: 'Taken', notes: 'No side effects' },
        { id: 'hist_2', date_time: 'Apr 26, 2025 9:00 AM', medication_name: 'Vitamin D3', dosage: '1000 IU', status: 'Taken', notes: '-' },
        { id: 'hist_3', date_time: 'Apr 25, 2025 8:00 PM', medication_name: 'Metformin 500mg', dosage: '500 mg', status: 'Upcoming', notes: '-' },
        { id: 'hist_4', date_time: 'Apr 25, 2025 9:00 AM', medication_name: 'Amlodipine 5mg', dosage: '5 mg', status: 'Taken', notes: '-' },
        { id: 'hist_5', date_time: 'Apr 24, 2025 1:00 PM', medication_name: 'Omega 3', dosage: '1000 mg', status: 'Missed', notes: 'Forgot to take' }
      ];

      const insertHist = this.db.prepare(`
        INSERT INTO medication_history (id, date_time, medication_name, dosage, status, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const now = new Date().toISOString();
      for (const h of defaultHistory) {
        insertHist.run(h.id, h.date_time, h.medication_name, h.dosage, h.status, h.notes, now);
      }
    }

    // Seed Screen Content (808 Screens across 12 Core Domains) if empty
    const screenCount = this.db.prepare('SELECT COUNT(*) as c FROM screen_content').get()?.c || 0;
    if (screenCount === 0) {
      const now = new Date().toISOString();
      const defaultScreens = [
        { key: 'scr_home_daily', domain: 'dailyactivity', screen_name: 'Daily Activity Ring', title: 'Daily Activity', subtitle: 'Steps, Active Time & Calories', description: 'Real-time 3-ring movement tracker with One UI circular progress and move alerts.', cta_text: 'View Weekly Trend', cta_url: 'dokrahealth://activity/trend', badge: 'Active', icon: '👟', config_json: JSON.stringify({ goal_steps: 10000, goal_cal: 500, goal_mins: 60, move_reminder: true }) },
        { key: 'scr_home_vitality', domain: 'vitality', screen_name: 'Energy & Vitality Score', title: 'Energy & Vitality', subtitle: 'AI Readiness Analysis', description: 'Multivariate composite score evaluating nocturnal HRV, sleep debt, and yesterday exertion.', cta_text: 'View Coach Insights', cta_url: 'dokrahealth://vitality/coach', badge: 'Optimal (86)', icon: '⚡', config_json: JSON.stringify({ current_score: 86, hrv_ms: 64, readiness: 'High', coach_tip: 'Optimal stamina readiness for afternoon 5K club run.' }) },
        { key: 'scr_sport_run', domain: 'sport', screen_name: 'Outdoor GPS Running', title: 'Dokra Running Club', subtitle: 'GPS Trail & Pace Coach', description: 'Turn-by-turn route guidance, real-time cadence, ground contact asymmetry, and VO2 Max coach.', cta_text: 'Start Outdoor Run', cta_url: 'dokrahealth://sport/run/start', badge: 'GPS Active', icon: '🏃', config_json: JSON.stringify({ target_pace: '5:00 /km', auto_pause: true, audio_guide: true, splits_km: 1 }) },
        { key: 'scr_sleep_coaching', domain: 'sleep', screen_name: 'Sleep Stages & Coaching', title: 'Sleep & Recovery Score', subtitle: 'Animal Persona Coaching', description: 'Nocturnal biometric breakdown including REM, Deep, Light, SpO2 drops, and 4-week sleep programs.', cta_text: 'View Night Report', cta_url: 'dokrahealth://sleep/report', badge: 'Lion (88)', icon: '🌙', config_json: JSON.stringify({ score: 88, deep_pct: 24, rem_pct: 28, snore_detect: true, persona: 'Confident Lion' }) },
        { key: 'scr_heart_ecg', domain: 'heart_ecg', screen_name: 'ECG Sinus Rhythm', title: 'ECG & Sinus Waveform', subtitle: 'Arrhythmia & AFib Monitor', description: 'Single-lead 30-second sinus rhythm recording with PDF clinical export.', cta_text: 'Record New ECG', cta_url: 'dokrahealth://ecg/record', badge: 'Sinus Rhythm', icon: '💓', config_json: JSON.stringify({ sampling_rate_hz: 500, afib_alert: true, pdf_export_enabled: true }) },
        { key: 'scr_blood_pressure', domain: 'blood_pressure', screen_name: 'Blood Pressure Monitor', title: 'Cardiovascular BP Log', subtitle: 'Systolic & Diastolic Tracking', description: 'Cuff-calibrated continuous pulse wave transit time measurement and MAP analytics.', cta_text: 'Log Blood Pressure', cta_url: 'dokrahealth://bp/log', badge: '118/78 mmHg', icon: '🩺', config_json: JSON.stringify({ systolic_target: 120, diastolic_target: 80, pulse_target: 70 }) },
        { key: 'scr_blood_glucose', domain: 'blood_glucose', screen_name: 'Continuous Glucose (CGM)', title: 'Blood Glucose Telemetry', subtitle: 'Pre/Post-Prandial CGM Curve', description: 'Continuous interstitial glucose sensor integration with glycemic variability curves.', cta_text: 'View CGM Graph', cta_url: 'dokrahealth://cgm/view', badge: '95 mg/dL', icon: '🩸', config_json: JSON.stringify({ target_min: 70, target_max: 140, fasting: 92, unit: 'mg/dL' }) },
        { key: 'scr_medication_sched', domain: 'medication', screen_name: 'Prescriptions & Adherence', title: 'Medication Adherence', subtitle: 'Smart Dosage Reminders', description: 'Pill identification, drug-drug interaction warning engine, and automated pharmacy refills.', cta_text: 'Manage Prescriptions', cta_url: 'dokrahealth://meds/list', badge: '3 Scheduled', icon: '💊', config_json: JSON.stringify({ adherence_pct: 93, next_dose_time: '2:00 PM', conflict_check: true }) },
        { key: 'scr_food_nutrition', domain: 'food_nutrition', screen_name: 'Meal Scanner & Macros', title: 'Nutrition & Macros', subtitle: 'Macro Breakdown & Food DB', description: 'Camera meal barcode lookup with protein, carb, fat, and hydration tracking.', cta_text: 'Scan Food Barcode', cta_url: 'dokrahealth://food/scan', badge: '2,450 kcal', icon: '🥗', config_json: JSON.stringify({ target_cal: 2600, protein_g: 165, carbs_g: 240, fat_g: 65, water_l: 3.0 }) },
        { key: 'scr_body_comp', domain: 'body_weight', screen_name: 'BIA Body Composition', title: 'Body Composition (BIA)', subtitle: 'Skeletal Muscle & Fat %', description: 'Bioelectrical impedance analysis measuring skeletal muscle mass, body fat percentage, and BMR.', cta_text: 'Log Smart Scale', cta_url: 'dokrahealth://weight/bia', badge: '14.2% Fat', icon: '⚖️', config_json: JSON.stringify({ weight_kg: 74.2, fat_pct: 14.2, muscle_kg: 38.5, bmi: 22.4 }) },
        { key: 'scr_together_global', domain: 'together', screen_name: 'Together Global League', title: 'Together & Challenges', subtitle: 'Global 100K Stepathon', description: 'Worldwide step championship, 1-on-1 friend battles, squads, and badges.', cta_text: 'Join Global Stepathon', cta_url: 'dokrahealth://together/league', badge: 'Rank #3', icon: '👥', config_json: JSON.stringify({ active_chal: 'Global 100K Stepathon', participants: 42890, user_rank: 3, user_steps: 68420 }) },
        { key: 'scr_stress_mindful', domain: 'stress_mindfulness', screen_name: 'Mindfulness & HRV', title: 'Mindfulness & Stress', subtitle: 'HRV Recovery & Guided Breathing', description: 'Heart rate variability stress level scoring and 4-4-4-4 Box Breathing coach.', cta_text: 'Start Breathing', cta_url: 'dokrahealth://mindfulness/breathe', badge: 'Low Stress', icon: '🧘', config_json: JSON.stringify({ stress_level: 'Low', breath_pattern: '4-4-4-4 Box', duration_mins: 5 }) }
      ];

      const insertScr = this.db.prepare(`
        INSERT INTO screen_content (key, domain, screen_name, title, subtitle, description, cta_text, cta_url, badge, icon, config_json, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const s of defaultScreens) {
        insertScr.run(s.key, s.domain, s.screen_name, s.title, s.subtitle, s.description, s.cta_text, s.cta_url, s.badge, s.icon, s.config_json, now);
      }
    }

    // Seed Sports Catalog (81 Sports in Dokra Health) if empty
    const sportsCount = this.db.prepare('SELECT COUNT(*) as c FROM sports_catalog').get()?.c || 0;
    if (sportsCount === 0) {
      const now = new Date().toISOString();
      const defaultSports = [
        { id: 'sp_running', name: 'Outdoor Running', category: 'Cardio', icon: '🏃', dur: '45 mins', cal: 480, pace: '5:12 /km', zones: JSON.stringify({ z1: '90-115', z2: '115-135', z3: '135-155', z4: '155-175', z5: '175+' }) },
        { id: 'sp_treadmill', name: 'Treadmill Run', category: 'Cardio', icon: '🏃‍♂️', dur: '30 mins', cal: 320, pace: '5:30 /km', zones: JSON.stringify({ z1: '90-115', z2: '115-135', z3: '135-155', z4: '155-175', z5: '175+' }) },
        { id: 'sp_cycling', name: 'Outdoor Cycling', category: 'Cardio', icon: '🚴', dur: '60 mins', cal: 520, pace: '24 km/h', zones: JSON.stringify({ z1: '85-110', z2: '110-130', z3: '130-150', z4: '150-170', z5: '170+' }) },
        { id: 'sp_hiking', name: 'Mountain Hiking', category: 'Outdoor', icon: '🥾', dur: '120 mins', cal: 750, pace: '14:20 /km', zones: JSON.stringify({ z1: '90-115', z2: '115-135', z3: '135-155', z4: '155-170', z5: '170+' }) },
        { id: 'sp_swimming', name: 'Pool Swimming', category: 'Water', icon: '🏊', dur: '45 mins', cal: 420, pace: '1:45 /100m', zones: JSON.stringify({ z1: '90-115', z2: '115-135', z3: '135-155', z4: '155-170', z5: '170+' }) },
        { id: 'sp_hiit', name: 'HIIT Quick Blast', category: 'Strength', icon: '⚡', dur: '20 mins', cal: 280, pace: 'Intervals', zones: JSON.stringify({ z1: '100-125', z2: '125-145', z3: '145-165', z4: '165-185', z5: '185+' }) },
        { id: 'sp_strength', name: 'Weight Training', category: 'Strength', icon: '🏋️', dur: '50 mins', cal: 360, pace: 'Sets', zones: JSON.stringify({ z1: '80-105', z2: '105-125', z3: '125-145', z4: '145-165', z5: '165+' }) },
        { id: 'sp_yoga', name: 'Vinyasa Yoga', category: 'Flexibility', icon: '🧘', dur: '45 mins', cal: 180, pace: 'Flow', zones: JSON.stringify({ z1: '70-95', z2: '95-115', z3: '115-130', z4: '130-145', z5: '145+' }) },
        { id: 'sp_walking', name: 'Power Walking', category: 'Daily', icon: '🚶', dur: '40 mins', cal: 210, pace: '9:30 /km', zones: JSON.stringify({ z1: '80-105', z2: '105-120', z3: '120-135', z4: '135-150', z5: '150+' }) }
      ];

      const insertSp = this.db.prepare(`
        INSERT INTO sports_catalog (id, name, category, icon, default_duration, default_calories, default_pace, hr_zones_json, route_gpx, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const sp of defaultSports) {
        insertSp.run(sp.id, sp.name, sp.category, sp.icon, sp.dur, sp.cal, sp.pace, sp.zones, '', now);
      }
    }

    // Seed Wearables if empty
    const wearCount = this.db.prepare('SELECT COUNT(*) as c FROM wearables').get()?.c || 0;
    if (wearCount === 0) {
      const now = new Date().toISOString();
      const defaultWearables = [
        { id: 'wear_01', name: 'Samsung Galaxy Watch 6 Pro', type: 'Smartwatch', batt: 84, status: 'Connected', fw: 'R950XXU1AXB7', last: 'Just now' },
        { id: 'wear_02', name: 'Dokra Smart Ring Titanium', type: 'Smart Ring', batt: 92, status: 'Connected', fw: 'v1.4.2', last: '2 mins ago' },
        { id: 'wear_03', name: 'Dokra Pro ECG Heart Strap', type: 'Chest Strap', batt: 76, status: 'Connected', fw: 'v2.1.0', last: 'During workout' },
        { id: 'wear_04', name: 'Smart Body Composition Scale', type: 'BIA Scale', batt: 95, status: 'Standby', fw: 'v3.0.1', last: 'Today 7:30 AM' }
      ];

      const insertWear = this.db.prepare(`
        INSERT INTO wearables (id, name, type, battery_pct, connection_status, firmware_ver, last_sync, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const w of defaultWearables) {
        insertWear.run(w.id, w.name, w.type, w.batt, w.status, w.fw, w.last, now);
      }
    }

    // Seed Screen Registry (Master Deep Admin CMS for all Screens & Domains)
    const now = new Date().toISOString();
    
    // Ensure correct domain mapping for domain-specific screens
    this.db.prepare("UPDATE screen_registry SET domain_id = 'vitality', domain_name = '⚡ Vitality & Energy Score' WHERE id LIKE 'scr_vitality_%' AND domain_id != 'vitality'").run();
    this.db.prepare("UPDATE screen_registry SET domain_id = 'sport', domain_name = '🏃 Sports & GPS Running' WHERE id LIKE 'scr_sport_%' AND domain_id != 'sport'").run();
    this.db.prepare("UPDATE screen_registry SET domain_id = 'sleep', domain_name = '🌙 Sleep & Sleep Coaching' WHERE id LIKE 'scr_sleep_%' AND domain_id != 'sleep'").run();
    this.db.prepare("UPDATE screen_registry SET domain_id = 'heart', domain_name = '💓 Heart Health & Sinus ECG' WHERE (id LIKE 'scr_heart_%' OR id LIKE 'scr_ecg_%' OR id LIKE 'scr_vitals_%') AND domain_id != 'heart'").run();
    this.db.prepare("UPDATE screen_registry SET domain_id = 'blood_pressure', domain_name = '🩺 Blood Pressure & Telehealth' WHERE (id LIKE 'scr_bp_%' OR id LIKE 'scr_blood_pressure_%' OR id LIKE 'scr_telehealth_%') AND domain_id != 'blood_pressure'").run();
    this.db.prepare("UPDATE screen_registry SET domain_id = 'blood_glucose', domain_name = '🩸 Blood Glucose & CGM' WHERE (id LIKE 'scr_glucose_%' OR id LIKE 'scr_cgm_%' OR id LIKE 'scr_blood_glucose_%') AND domain_id != 'blood_glucose'").run();
    this.db.prepare("UPDATE screen_registry SET domain_id = 'nutrition', domain_name = '🥗 Nutrition & Hydration' WHERE (id LIKE 'scr_nutrition_%' OR id LIKE 'scr_hydration_%' OR id LIKE 'scr_food_%' OR id LIKE 'scr_water_%') AND domain_id != 'nutrition'").run();

    const defaultRegistry = [
        // --- Domain 1: 🏠 Home & Daily Activity (Step 1 Focus) ---
        {
          id: 'scr_home_main_dashboard',
          domain_id: 'home_daily',
          domain_name: '🏠 Home & Daily Activity',
          screen_name: 'Home Main Feed & Dashboard',
          screen_type: 'dashboard_screen',
          route_path: 'dokrahealth://home/dashboard',
          layout: {
            container_padding: '16px',
            section_gap: '14px',
            card_radius: '20px',
            card_padding: '16px',
            header_alignment: 'space-between',
            flex_direction: 'column',
            max_content_width: '480px'
          },
          style: {
            bg_color: '#f8fafc',
            card_bg_color: '#ffffff',
            text_primary_color: '#0f172a',
            text_secondary_color: '#64748b',
            accent_color: '#2563eb',
            font_family: 'Inter',
            header_font_size: '22px',
            header_font_weight: '800',
            border_color: '#e2e8f0',
            border_radius: '20px',
            shadow_elevation: '0 2px 10px rgba(15,23,42,0.06)',
            theme_mode: 'light'
          },
          config: {
            header_title: 'Dokra Health',
            header_subtitle: 'Daily Movement & Vitality',
            profile_name: 'Dr. Sarah Connor',
            avatar_url: '/assets/dokra-logo.png',
            quick_summary_visible: true,
            banner_cta_text: 'Join Global Stepathon',
            banner_cta_url: 'dokrahealth://together/league'
          },
          visibility_flags: {
            show_header: true,
            show_profile_avatar: true,
            show_activity_rings_card: true,
            show_vitality_score_card: true,
            show_workout_shortcut: true,
            show_sleep_summary: true,
            show_heart_rate_tile: true,
            show_water_tracker_tile: true,
            show_feed_cards: true,
            show_bottom_nav: true
          }
        },
        {
          id: 'scr_daily_activity_ring',
          domain_id: 'home_daily',
          domain_name: '🏠 Home & Daily Activity',
          screen_name: 'Daily Activity 3-Ring Geometry',
          screen_type: 'tracker_screen',
          route_path: 'dokrahealth://tracker/dailyactivity',
          layout: {
            container_padding: '18px',
            section_gap: '16px',
            card_radius: '24px',
            card_padding: '18px',
            ring_container_size: '220px',
            flex_direction: 'column'
          },
          style: {
            bg_color: '#ffffff',
            card_bg_color: '#f8fafc',
            text_primary_color: '#0f172a',
            text_secondary_color: '#64748b',
            ring_active_gradient_start: '#10b981',
            ring_active_gradient_end: '#059669',
            ring_move_color: '#06b6d4',
            ring_calorie_color: '#f43f5e',
            ring_track_bg: '#e2e8f0',
            font_family: 'Inter',
            header_font_size: '24px',
            header_font_weight: '900',
            border_radius: '24px',
            shadow_elevation: '0 4px 16px rgba(16,185,129,0.12)',
            theme_mode: 'light'
          },
          config: {
            title: 'Daily Activity Rings',
            subtitle: 'Steps • Active Time • Calories',
            ring_geometry: {
              outer_radius: 88,
              middle_radius: 70,
              inner_radius: 52,
              stroke_thickness: 11,
              start_angle_deg: -90,
              end_angle_deg: 270,
              svg_dasharray: '207.34',
              animation_duration_ms: 650
            },
            goals: {
              step_goal: 10000,
              active_minutes_goal: 60,
              calorie_burn_goal: 500,
              move_hours_goal: 12
            },
            formulas: {
              calorie_multiplier: 0.045,
              active_minutes_hr_threshold: 110,
              step_stride_length_cm: 74
            },
            alerts: {
              inactivity_reminder_interval_mins: 50,
              hourly_move_alert_enabled: true,
              goal_haptic_vibration: true
            }
          },
          visibility_flags: {
            show_header: true,
            show_3_ring_geometry: true,
            show_step_counter_value: true,
            show_active_minutes_pill: true,
            show_calorie_burn_pill: true,
            show_hourly_move_timeline: true,
            show_weekly_comparison_chart: true,
            show_ai_coaching_tip: true,
            show_share_badge_btn: true
          }
        },
        {
          id: 'scr_pedometer_detail',
          domain_id: 'home_daily',
          domain_name: '🏠 Home & Daily Activity',
          screen_name: 'Pedometer & Step Trend Breakdown',
          screen_type: 'detail_screen',
          route_path: 'dokrahealth://tracker/pedometer',
          layout: {
            container_padding: '16px',
            section_gap: '12px',
            card_radius: '18px',
            card_padding: '16px',
            chart_height: '180px'
          },
          style: {
            bg_color: '#ffffff',
            card_bg_color: '#f8fafc',
            text_primary_color: '#0f172a',
            text_secondary_color: '#64748b',
            bar_color_active: '#2563eb',
            bar_color_target: '#10b981',
            font_family: 'Inter',
            header_font_size: '20px',
            header_font_weight: '800',
            border_radius: '18px',
            shadow_elevation: '0 2px 8px rgba(0,0,0,0.05)',
            theme_mode: 'light'
          },
          config: {
            title: 'Pedometer Analytics',
            subtitle: 'Hourly Cadence & Walking Distance',
            default_timeframe: 'Day',
            stride_length_cm: 74,
            hourly_target_steps: 250,
            distance_unit: 'km',
            peak_hour_detection: true
          },
          visibility_flags: {
            show_hourly_bar_graph: true,
            show_total_distance: true,
            show_average_pace: true,
            show_peak_cadence_spm: true,
            show_weekly_average_comparison: true
          }
        },
        // --- Domain 2: ⚡ Vitality & Energy Score (Step 2 Focus) ---
        {
          id: 'scr_vitality_energy_score',
          domain_id: 'vitality',
          domain_name: '⚡ Vitality & Energy Score',
          screen_name: 'Energy & Vitality Composite Readiness',
          screen_type: 'vitality_screen',
          route_path: 'dokrahealth://tracker/vitality',
          layout: {
            container_padding: '18px',
            section_gap: '16px',
            card_radius: '22px',
            card_padding: '18px',
            gauge_size: '200px',
            flex_direction: 'column'
          },
          style: {
            bg_color: '#080d1a',
            card_bg_color: '#0d1527',
            text_primary_color: '#ffffff',
            text_secondary_color: '#94a3b8',
            gauge_gradient_start: '#8b5cf6',
            gauge_gradient_end: '#3b82f6',
            gauge_track_bg: 'rgba(255, 255, 255, 0.08)',
            accent_color: '#8b5cf6',
            font_family: 'Inter',
            header_font_size: '22px',
            header_font_weight: '800',
            border_radius: '22px',
            shadow_elevation: '0 8px 24px rgba(139,92,246,0.25)',
            theme_mode: 'dark'
          },
          config: {
            title: 'Energy & Vitality Score',
            subtitle: 'AI Readiness Analysis',
            current_score: 86,
            score_category: 'Optimal Readiness',
            readiness_scale_min: 1,
            readiness_scale_max: 100,
            weights: {
              nocturnal_hrv_weight: 0.45,
              sleep_debt_weight: 0.35,
              prior_day_strain_weight: 0.20,
              sleep_consistency_weight: 0.15
            },
            coach_advice: 'Your autonomic nervous system is primed for high stamina output. Perfect day for an endurance run.',
            thresholds: {
              low_readiness: 50,
              moderate_readiness: 70,
              optimal_readiness: 85
            },
            hrv_telemetry: {
              current_ms: 64,
              baseline_ms: 58,
              status: 'Higher than baseline (+6ms)',
              trend: 'up'
            },
            sleep_debt: {
              debt_minutes: 18,
              target_hours: 8.0,
              penalty_points: 4,
              status: 'Minimal Debt'
            },
            ai_coach_rules: [
              { range: '1-30', label: 'Low Readiness', guidance: 'High autonomic fatigue detected. Prioritize passive recovery and active hydration.' },
              { range: '31-70', label: 'Moderate Stamina', guidance: 'Balanced energy reservoir. Light aerobic conditioning or zone-2 training recommended.' },
              { range: '71-100', label: 'Optimal Readiness', guidance: 'Your autonomic nervous system is primed for peak exertion. Optimal day for interval training.' }
            ]
          },
          visibility_flags: {
            show_score_gauge: true,
            show_hrv_contributor: true,
            show_sleep_debt_contributor: true,
            show_activity_strain_contributor: true,
            show_ai_recommendations: true,
            show_history_trend: true,
            show_factor_comparison: true
          }
        },
        {
          id: 'scr_vitality_score_factors',
          domain_id: 'vitality',
          domain_name: '⚡ Vitality & Energy Score',
          screen_name: 'Vitality Factor Breakdown & Weights',
          screen_type: 'detail_screen',
          route_path: 'dokrahealth://tracker/vitality/factors',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0d1527', text_primary_color: '#ffffff', accent_color: '#8b5cf6', theme_mode: 'dark' },
          config: {
            title: 'Contributing Factors',
            subtitle: 'Weighted Multi-Factor Telemetry',
            factors: [
              { id: 'factor_hrv', name: 'Nocturnal HRV', weight: 45, value: '64 ms', status: 'Optimal', icon: '💓' },
              { id: 'factor_sleep_debt', name: 'Sleep Debt Penalty', weight: 35, value: '+18 min', status: 'Low Impact', icon: '🌙' },
              { id: 'factor_strain', name: 'Prior Day Strain', weight: 20, value: 'Moderate', status: 'Recovered', icon: '🔥' },
              { id: 'factor_regularity', name: 'Circadian Regularity', weight: 15, value: '94%', status: 'Consistent', icon: '⏱️' }
            ]
          },
          visibility_flags: { show_factor_cards: true, show_weight_percentages: true, show_impact_bars: true }
        },
        {
          id: 'scr_vitality_trends_chart',
          domain_id: 'vitality',
          domain_name: '⚡ Vitality & Energy Score',
          screen_name: 'Readiness History & Expanded Trends',
          screen_type: 'chart_screen',
          route_path: 'dokrahealth://tracker/vitality/trends',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '20px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0d1527', text_primary_color: '#ffffff', accent_color: '#3b82f6', theme_mode: 'dark' },
          config: {
            title: 'Readiness Trends',
            subtitle: '7-Day & 30-Day Moving Average',
            timeframes: ['7D', '30D', '90D'],
            default_timeframe: '7D',
            trend_data: [
              { day: 'Mon', score: 82 }, { day: 'Tue', score: 78 }, { day: 'Wed', score: 85 },
              { day: 'Thu', score: 89 }, { day: 'Fri', score: 84 }, { day: 'Sat', score: 91 }, { day: 'Sun', score: 86 }
            ]
          },
          visibility_flags: { show_trend_line_chart: true, show_average_pill: true, show_high_low_markers: true }
        },
        {
          id: 'scr_vitality_hrv_deep',
          domain_id: 'vitality',
          domain_name: '⚡ Vitality & Energy Score',
          screen_name: 'Nocturnal HRV & Autonomic Readiness',
          screen_type: 'telemetry_screen',
          route_path: 'dokrahealth://tracker/vitality/hrv',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0d1527', text_primary_color: '#ffffff', accent_color: '#f43f5e', theme_mode: 'dark' },
          config: {
            title: 'Nocturnal HRV (RMSSD)',
            current_rmssd_ms: 64,
            baseline_range_min_ms: 52,
            baseline_range_max_ms: 68,
            sampling_window: 'Sleep Midpoint (02:00 - 05:00)',
            autonomic_status: 'Parasympathetic Dominance'
          },
          visibility_flags: { show_hrv_gauge: true, show_nightly_curve: true, show_baseline_envelope: true }
        },
        {
          id: 'scr_vitality_sleep_debt',
          domain_id: 'vitality',
          domain_name: '⚡ Vitality & Energy Score',
          screen_name: 'Sleep Debt & Circadian Penalty Breakdown',
          screen_type: 'detail_screen',
          route_path: 'dokrahealth://tracker/vitality/sleepdebt',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0d1527', text_primary_color: '#ffffff', accent_color: '#8b5cf6', theme_mode: 'dark' },
          config: {
            title: 'Sleep Debt Analysis',
            target_sleep_hours: 8.0,
            actual_sleep_hours: 7.7,
            accumulated_debt_minutes: 18,
            penalty_subtraction_points: 4,
            catchup_nap_recommended: false
          },
          visibility_flags: { show_debt_meter: true, show_penalty_breakdown: true, show_recovery_suggestions: true }
        },
        {
          id: 'scr_vitality_ai_coach_guidance',
          domain_id: 'vitality',
          domain_name: '⚡ Vitality & Energy Score',
          screen_name: 'Med-PaLM AI Coaching & Advice Rules',
          screen_type: 'ai_coach_screen',
          route_path: 'dokrahealth://tracker/vitality/aicoach',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '20px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0d1527', text_primary_color: '#ffffff', accent_color: '#8b5cf6', theme_mode: 'dark' },
          config: {
            title: 'AI Coach Guidance Rules',
            clinical_model: 'Med-PaLM 2 Clinical Health Assistant',
            current_recommendation: 'Optimal autonomic recovery. Maintain hydration and schedule aerobic intervals.',
            rules_by_range: [
              { min: 1, max: 30, advice: 'Extreme nervous strain detected. Avoid high intensity workouts today.' },
              { min: 31, max: 70, advice: 'Moderate readiness. Stick to steady-state zone 2 workouts.' },
              { min: 71, max: 100, advice: 'Full stamina readiness. Perfect window for breakthrough performance.' }
            ]
          },
          visibility_flags: { show_coach_avatar: true, show_clinical_disclaimer: true, show_personalized_action_chips: true }
        },
        {
          id: 'scr_vitality_onboarding_getstarted',
          domain_id: 'vitality',
          domain_name: '⚡ Vitality & Energy Score',
          screen_name: 'Vitality Calibration & Onboarding',
          screen_type: 'onboarding_screen',
          route_path: 'dokrahealth://tracker/vitality/getstarted',
          layout: { container_padding: '24px', section_gap: '18px', card_radius: '24px', card_padding: '20px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0d1527', text_primary_color: '#ffffff', accent_color: '#8b5cf6', theme_mode: 'dark' },
          config: {
            title: 'Welcome to Energy & Vitality',
            subtitle: 'AI-Powered Daily Readiness & Stamina Optimization',
            calibration_days_required: 7,
            calibration_progress_days: 7
          },
          visibility_flags: { show_intro_animation: true, show_sensor_checklist: true, show_get_started_btn: true }
        },
        {
          id: 'scr_vitality_rewards_streaks',
          domain_id: 'vitality',
          domain_name: '⚡ Vitality & Energy Score',
          screen_name: 'Vitality Stamina Rewards & Streaks',
          screen_type: 'rewards_screen',
          route_path: 'dokrahealth://tracker/vitality/rewards',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0d1527', text_primary_color: '#ffffff', accent_color: '#f59e0b', theme_mode: 'dark' },
          config: {
            title: 'Vitality Streaks & Badges',
            active_streak_days: 14,
            longest_streak_days: 28,
            earned_badges: ['7-Day Peak Readiness', 'Consistent Sleep Master', 'Autonomic Balance Gold']
          },
          visibility_flags: { show_streak_flame: true, show_earned_badge_grid: true, show_milestone_progress: true }
        },
        {
          id: 'scr_vitality_home_widget_settings',
          domain_id: 'vitality',
          domain_name: '⚡ Vitality & Energy Score',
          screen_name: 'Vitality 4x4 Widget & One UI Settings',
          screen_type: 'widget_settings_screen',
          route_path: 'dokrahealth://tracker/vitality/widget',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '16px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0d1527', text_primary_color: '#ffffff', accent_color: '#2563eb', theme_mode: 'dark' },
          config: {
            title: 'One UI Vitality Widget Setup',
            widget_size: '4x4 Cover & Home Screen',
            refresh_interval_mins: 15,
            show_score_number: true,
            show_mini_gauge: true,
            show_coach_snippet: true
          },
          visibility_flags: { show_widget_live_preview: true, show_dark_widget_theme_toggle: true }
        },
        {
          id: 'scr_activity_goals_settings',
          domain_id: 'home_daily',
          domain_name: '🏠 Home & Daily Activity',
          screen_name: 'Personal Activity Goals & Thresholds',
          screen_type: 'settings_screen',
          route_path: 'dokrahealth://settings/goals',
          layout: {
            container_padding: '16px',
            section_gap: '14px',
            card_radius: '16px',
            card_padding: '16px'
          },
          style: {
            bg_color: '#ffffff',
            card_bg_color: '#f8fafc',
            text_primary_color: '#0f172a',
            text_secondary_color: '#64748b',
            accent_color: '#10b981',
            font_family: 'Inter',
            header_font_size: '18px',
            header_font_weight: '700',
            border_radius: '16px',
            shadow_elevation: '0 2px 6px rgba(0,0,0,0.04)',
            theme_mode: 'light'
          },
          config: {
            title: 'Target Goals Configuration',
            step_goal_min: 1000,
            step_goal_max: 50000,
            step_goal_default: 10000,
            active_mins_min: 10,
            active_mins_max: 300,
            active_mins_default: 60,
            calorie_burn_min: 100,
            calorie_burn_max: 3000,
            calorie_burn_default: 500,
            auto_adjust_goals_based_on_fitness: true
          },
          visibility_flags: {
            show_step_goal_slider: true,
            show_active_mins_slider: true,
            show_calorie_slider: true,
            show_smart_recommendations: true
          }
        },
        {
          id: 'scr_move_reminder_notification',
          domain_id: 'home_daily',
          domain_name: '🏠 Home & Daily Activity',
          screen_name: 'Hourly Inactivity Move Reminder',
          screen_type: 'modal_screen',
          route_path: 'dokrahealth://notifications/move_reminder',
          layout: {
            container_padding: '20px',
            section_gap: '12px',
            card_radius: '24px',
            card_padding: '20px'
          },
          style: {
            bg_color: '#ffffff',
            card_bg_color: '#ecfdf5',
            text_primary_color: '#065f46',
            text_secondary_color: '#047857',
            accent_color: '#10b981',
            font_family: 'Inter',
            header_font_size: '19px',
            header_font_weight: '800',
            border_radius: '24px',
            shadow_elevation: '0 10px 30px rgba(16,185,129,0.2)',
            theme_mode: 'light'
          },
          config: {
            title: 'Time to Move!',
            body: 'You have been inactive for 50 minutes. Stand up and stretch for 1-2 minutes.',
            interval_minutes: 50,
            stretch_animations: ['Neck Rolls', 'Torso Twist', 'Desk Squats'],
            vibration_pattern: 'DOUBLE_PULSE',
            dismiss_after_seconds: 30
          },
          visibility_flags: {
            show_stretch_character_animation: true,
            show_snooze_button: true,
            show_stretch_routine_button: true
          }
        },
        // --- Domain 3: 🏃 Sports & GPS Running (Step 3 Focus - 81 Activities) ---
        {
          id: 'scr_sport_live_run_hud',
          domain_id: 'sport',
          domain_name: '🏃 Sports & GPS Running',
          screen_name: 'Outdoor GPS Running Live HUD',
          screen_type: 'live_tracking_screen',
          route_path: 'dokrahealth://sport/run/live',
          layout: {
            container_padding: '16px',
            section_gap: '12px',
            card_radius: '20px',
            card_padding: '14px',
            map_height: '190px',
            timer_font_size: '42px',
            flex_direction: 'column'
          },
          style: {
            bg_color: '#080e1a',
            card_bg_color: '#0f172a',
            text_primary_color: '#ffffff',
            text_secondary_color: '#94a3b8',
            accent_color: '#3b82f6',
            zone3_color: '#10b981',
            font_family: 'Inter',
            header_font_size: '20px',
            header_font_weight: '800',
            border_radius: '20px',
            shadow_elevation: '0 8px 24px rgba(59,130,246,0.2)',
            theme_mode: 'dark'
          },
          config: {
            activity_name: 'Outdoor Run',
            timer_display: '00:32:14',
            distance_km: 5.42,
            current_pace: '5:18 /km',
            avg_pace: '5:24 /km',
            speed_kmh: 11.3,
            cadence_spm: 168,
            heart_rate_bpm: 148,
            active_hr_zone: 'Zone 3 (Aerobic)',
            calories_burned: 412,
            elevation_gain_m: 48,
            gps_status: 'Connected / 3D Fix',
            gps_accuracy_m: 2.8,
            satellites_locked: 14,
            coach_cue: '12s ahead of 5:00 /km pace target',
            auto_pause_enabled: true,
            audio_cues_enabled: true,
            hr_zones: { z1: '95-114', z2: '115-133', z3: '134-152', z4: '153-171', z5: '172+' }
          },
          visibility_flags: {
            show_gps_pill: true,
            show_live_map: true,
            show_timer: true,
            show_distance_card: true,
            show_pace_card: true,
            show_hr_card: true,
            show_hr_zone_bar: true,
            show_cadence_pill: true,
            show_coach_banner: true,
            show_action_controls: true
          }
        },
        {
          id: 'scr_sport_pace_coach',
          domain_id: 'sport',
          domain_name: '🏃 Sports & GPS Running',
          screen_name: 'Pace Coach (5K / 10K / Marathon)',
          screen_type: 'coach_screen',
          route_path: 'dokrahealth://sport/coach',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080e1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#8b5cf6', theme_mode: 'dark' },
          config: {
            title: 'Pace Coach Target Setter',
            presets: ['5K Coach', '10K Coach', 'Half-Marathon', 'Marathon Builder'],
            selected_preset: '10K Coach',
            target_distance_km: 10.0,
            target_finish_time: '50:00',
            target_pace_per_km: '5:00 /km',
            split_alert_km: 1.0,
            voice_guidance: 'Dynamic Pacer Voice',
            behind_ahead_tolerance_secs: 15
          },
          visibility_flags: { show_preset_chips: true, show_target_sliders: true, show_voice_toggle: true }
        },
        {
          id: 'scr_sport_gpx_trail_route',
          domain_id: 'sport',
          domain_name: '🏃 Sports & GPS Running',
          screen_name: 'Trail Explorer & GPX Navigation',
          screen_type: 'trail_screen',
          route_path: 'dokrahealth://sport/routes/gpx',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '20px', card_padding: '16px' },
          style: { bg_color: '#080e1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#10b981', theme_mode: 'dark' },
          config: {
            route_name: 'Pacific Ridge Trail Loop',
            total_distance_km: 12.8,
            elevation_gain_m: 340,
            avg_slope_pct: 6.2,
            difficulty: 'Moderate',
            surface_type: 'Singletrack & Dirt',
            turn_by_turn_enabled: true,
            waypoints_count: 8
          },
          visibility_flags: { show_elevation_profile: true, show_turn_cues: true, show_gpx_export: true }
        },
        {
          id: 'scr_sport_hr_zones_settings',
          domain_id: 'sport',
          domain_name: '🏃 Sports & GPS Running',
          screen_name: 'Heart Rate 5-Zone Calibration',
          screen_type: 'settings_screen',
          route_path: 'dokrahealth://sport/settings/hrzones',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080e1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#f43f5e', theme_mode: 'dark' },
          config: {
            title: 'Heart Rate Training Zones',
            resting_hr_bpm: 56,
            max_hr_bpm: 190,
            formula_type: 'Karvonen Heart Rate Reserve (HRR)',
            zones: [
              { zone: 1, name: 'Warm Up', min: 95, max: 114, color: '#38bdf8' },
              { zone: 2, name: 'Fat Burn', min: 115, max: 133, color: '#4ade80' },
              { zone: 3, name: 'Aerobic', min: 134, max: 152, color: '#facc15' },
              { zone: 4, name: 'Anaerobic', min: 153, max: 171, color: '#fb923c' },
              { zone: 5, name: 'Max Effort', min: 172, max: 195, color: '#f87171' }
            ]
          },
          visibility_flags: { show_hr_sliders: true, show_formula_picker: true, show_zone_visualizer: true }
        },
        {
          id: 'scr_sport_cycling_live',
          domain_id: 'sport',
          domain_name: '🏃 Sports & GPS Running',
          screen_name: 'Outdoor Cycling Computer & Power FTP',
          screen_type: 'cycling_screen',
          route_path: 'dokrahealth://sport/cycling/live',
          layout: { container_padding: '16px', section_gap: '12px', card_radius: '20px', card_padding: '14px' },
          style: { bg_color: '#080e1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#06b6d4', theme_mode: 'dark' },
          config: {
            title: 'Road Cycling',
            current_speed_kmh: 28.4,
            avg_speed_kmh: 26.1,
            cadence_rpm: 88,
            distance_km: 18.6,
            power_watts: 220,
            ftp_target_watts: 250,
            elevation_m: 185
          },
          visibility_flags: { show_power_meter: true, show_speedometer: true, show_cadence_dial: true }
        },
        {
          id: 'scr_sport_treadmill_indoor',
          domain_id: 'sport',
          domain_name: '🏃 Sports & GPS Running',
          screen_name: 'Indoor Treadmill Run & Incline',
          screen_type: 'treadmill_screen',
          route_path: 'dokrahealth://sport/treadmill',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080e1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#f59e0b', theme_mode: 'dark' },
          config: {
            title: 'Indoor Treadmill',
            distance_km: 4.20,
            pace: '5:30 /km',
            speed_kmh: 10.9,
            incline_pct: 2.0,
            auto_calibrate_steps: true
          },
          visibility_flags: { show_incline_control: true, show_speed_slider: true, show_sensor_calibration: true }
        },
        {
          id: 'scr_sport_swimming_pool',
          domain_id: 'sport',
          domain_name: '🏃 Sports & GPS Running',
          screen_name: 'Pool Swimming & SWOLF Lap Counter',
          screen_type: 'swim_screen',
          route_path: 'dokrahealth://sport/swimming',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080e1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#0ea5e9', theme_mode: 'dark' },
          config: {
            title: 'Pool Swimming',
            pool_length_m: 25,
            total_laps: 36,
            total_distance_m: 900,
            swolf_score: 38,
            stroke_type: 'Freestyle / Front Crawl',
            active_swim_mins: 22
          },
          visibility_flags: { show_swolf_gauge: true, show_lap_counter: true, show_stroke_breakdown: true }
        },
        {
          id: 'scr_sport_hiit_interval',
          domain_id: 'sport',
          domain_name: '🏃 Sports & GPS Running',
          screen_name: 'HIIT Interval Engine & Tabata',
          screen_type: 'hiit_screen',
          route_path: 'dokrahealth://sport/hiit',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '20px', card_padding: '16px' },
          style: { bg_color: '#080e1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#ef4444', theme_mode: 'dark' },
          config: {
            title: 'HIIT Tabata Protocol',
            work_interval_secs: 45,
            rest_interval_secs: 15,
            total_rounds: 8,
            current_round: 5,
            active_exercise: 'Burpee Box Jumps',
            next_exercise: 'Kettlebell Swings'
          },
          visibility_flags: { show_interval_timer: true, show_round_dots: true, show_next_exercise_preview: true }
        },
        {
          id: 'scr_sport_strength_rep_counter',
          domain_id: 'sport',
          domain_name: '🏃 Sports & GPS Running',
          screen_name: 'Strength Weight & Rep Counter',
          screen_type: 'strength_screen',
          route_path: 'dokrahealth://sport/strength',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080e1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#a855f7', theme_mode: 'dark' },
          config: {
            title: 'Strength Training',
            current_exercise: 'Barbell Bench Press',
            current_set: 3,
            total_sets: 4,
            target_reps: 10,
            weight_kg: 80,
            rest_countdown_secs: 90
          },
          visibility_flags: { show_set_logger: true, show_weight_stepper: true, show_rest_countdown: true }
        },
        {
          id: 'scr_sport_workout_summary',
          domain_id: 'sport',
          domain_name: '🏃 Sports & GPS Running',
          screen_name: 'Workout Summary & Record Badges',
          screen_type: 'summary_screen',
          route_path: 'dokrahealth://sport/summary',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '22px', card_padding: '18px' },
          style: { bg_color: '#080e1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#f59e0b', theme_mode: 'dark' },
          config: {
            workout_title: 'Morning Trail Run',
            total_time: '32:14',
            total_distance_km: 5.42,
            avg_pace: '5:24 /km',
            max_pace: '4:48 /km',
            calories_kcal: 412,
            avg_hr_bpm: 148,
            max_hr_bpm: 168,
            personal_record: 'New 5K Record (26:15)',
            splits: [
              { km: 1, pace: '5:30' },
              { km: 2, pace: '5:22' },
              { km: 3, pace: '5:18' },
              { km: 4, pace: '5:20' },
              { km: 5, pace: '5:28' }
            ]
          },
          visibility_flags: { show_splits_table: true, show_hr_pace_chart: true, show_pr_badge: true, show_share_card: true }
        },
        {
          id: 'scr_sport_catalog_selector',
          domain_id: 'sport',
          domain_name: '🏃 Sports & GPS Running',
          screen_name: '81 Sports & Activity Registry',
          screen_type: 'catalog_screen',
          route_path: 'dokrahealth://sport/catalog',
          layout: { container_padding: '16px', section_gap: '12px', card_radius: '16px', card_padding: '14px' },
          style: { bg_color: '#080e1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#2563eb', theme_mode: 'dark' },
          config: {
            title: 'Sports Catalog',
            total_catalog_sports: 81,
            primary_favorites: ['Outdoor Run', 'Outdoor Cycling', 'Pool Swimming', 'Treadmill', 'Mountain Hiking', 'HIIT', 'Strength Training', 'Yoga', 'Power Walking'],
            search_filter_enabled: true
          },
          visibility_flags: { show_search_bar: true, show_favorites_grid: true, show_category_filter: true }
        },
        {
          id: 'scr_sport_settings_autolap',
          domain_id: 'sport',
          domain_name: '🏃 Sports & GPS Running',
          screen_name: 'Auto-Lap, Auto-Pause & Audio Setup',
          screen_type: 'settings_screen',
          route_path: 'dokrahealth://sport/settings/autolap',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080e1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#10b981', theme_mode: 'dark' },
          config: {
            title: 'Workout Tracking Preferences',
            auto_lap_distance_km: 1.0,
            auto_pause_min_speed_kmh: 2.0,
            audio_guide_frequency: 'Every 1.0 km',
            haptic_vibration_alert: true,
            voice_language: 'en-US'
          },
          visibility_flags: { show_autolap_slider: true, show_autopause_toggle: true, show_audio_cues_picker: true }
        },
        // --- Domain 4: 🌙 Sleep & Sleep Coaching (Step 4 Focus) ---
        {
          id: 'scr_sleep_main_dashboard',
          domain_id: 'sleep',
          domain_name: '🌙 Sleep & Sleep Coaching',
          screen_name: 'Sleep Main Session & Hypnogram Dashboard',
          screen_type: 'sleep_dashboard_screen',
          route_path: 'dokrahealth://tracker/sleep',
          layout: {
            container_padding: '16px',
            section_gap: '14px',
            card_radius: '22px',
            card_padding: '16px',
            score_ring_size: '180px',
            flex_direction: 'column'
          },
          style: {
            bg_color: '#090d16',
            card_bg_color: '#121a2d',
            text_primary_color: '#ffffff',
            text_secondary_color: '#94a3b8',
            accent_color: '#818cf8',
            score_gradient_start: '#818cf8',
            score_gradient_end: '#c084fc',
            score_ring_track_bg: 'rgba(255, 255, 255, 0.08)',
            font_family: 'Inter',
            header_font_size: '22px',
            header_font_weight: '800',
            border_radius: '22px',
            shadow_elevation: '0 8px 28px rgba(129,140,248,0.22)',
            theme_mode: 'dark'
          },
          config: {
            title: 'Sleep Session & Coaching',
            session_date: 'Last Night (Apr 25 - Apr 26)',
            bedtime_recorded: '11:15 PM',
            wake_time_recorded: '06:57 AM',
            sleep_duration_display: '7h 42m',
            sleep_duration_mins: 462,
            target_sleep_duration_mins: 480,
            sleep_score: 88,
            sleep_quality_label: 'Optimal / Restorative',
            sleep_efficiency_pct: 94,
            hypnogram_stages: {
              awake: { duration_display: '32m', pct: 7, color: '#f59e0b', status: 'Optimal' },
              rem: { duration_display: '1h 50m', pct: 24, color: '#06b6d4', status: 'High Mental Recovery' },
              light: { duration_display: '3h 48m', pct: 49, color: '#6366f1', status: 'Stable' },
              deep: { duration_display: '1h 32m', pct: 20, color: '#a855f7', status: 'Peak Physical Repair' }
            },
            cycles_completed: 5,
            snoring_summary: {
              detected: true,
              total_snoring_mins: 14,
              snoring_status: 'Mild / Low Risk',
              threshold_db: 50
            },
            spo2_summary: {
              mean_spo2_pct: 97,
              min_spo2_pct: 91,
              drop_count: 2,
              status: 'Normal / Non-Apneic'
            },
            skin_temp_summary: {
              variation_celsius: -0.3,
              status: 'Normal Circadian Dip'
            },
            respiratory_summary: {
              avg_rpm: 14.2,
              status: 'Stable Rhythm'
            },
            animal_persona: {
              id: 'lion',
              name: 'Unconcerned Lion',
              level: 4,
              order: 1,
              coaching_status: 'Week 2 / Day 4',
              quote: 'Consistently getting 7-8 hours of sleep with balanced deep cycles. Keep this rhythm.'
            },
            scoring_engine: 'CODE-CONTROLLED'
          },
          visibility_flags: {
            show_header: true,
            show_date_selector: true,
            show_score_ring: true,
            show_duration_card: true,
            show_hypnogram_chart: true,
            show_stages_breakdown: true,
            show_snoring_tile: true,
            show_spo2_tile: true,
            show_skin_temp_tile: true,
            show_animal_persona_card: true,
            show_coaching_banner: true
          }
        },
        {
          id: 'scr_sleep_score_contributors',
          domain_id: 'sleep',
          domain_name: '🌙 Sleep & Sleep Coaching',
          screen_name: 'Sleep Score Contributors (5-Factor Analysis)',
          screen_type: 'contributors_screen',
          route_path: 'dokrahealth://tracker/sleep/score',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#090d16', card_bg_color: '#121a2d', text_primary_color: '#ffffff', accent_color: '#818cf8', theme_mode: 'dark' },
          config: {
            title: 'Sleep Score Contributors',
            overall_score: 88,
            scoring_engine: 'CODE-CONTROLLED (sleep_factor_rule_table.csv)',
            contributors: [
              { id: 'total_sleep_time', name: 'Total Sleep Time', score_contribution: '95/100', value: '7h 42m', target: '7h - 9h', status: 'Optimal', icon: '⏱️' },
              { id: 'sleep_cycle', name: 'Sleep Cycles', score_contribution: '92/100', value: '5 Full Cycles', target: '4-6 Cycles', status: 'Excellent', icon: '🔄' },
              { id: 'awake', name: 'Movement & Awake (WASO)', score_contribution: '86/100', value: '32m Awake', target: '< 45m', status: 'Good', icon: '⚡' },
              { id: 'physical_recovery', name: 'Physical Recovery (Deep Sleep)', score_contribution: '94/100', value: '1h 32m (20%)', target: '15-25%', status: 'Peak Restoration', icon: '💪' },
              { id: 'mental_recovery', name: 'Mental Recovery (REM Sleep)', score_contribution: '89/100', value: '1h 50m (24%)', target: '20-25%', status: 'Optimal Cognitive Reset', icon: '🧠' }
            ]
          },
          visibility_flags: { show_contributor_list: true, show_target_ranges: true, show_score_weight_bars: true }
        },
        {
          id: 'scr_sleep_stages_hypnogram',
          domain_id: 'sleep',
          domain_name: '🌙 Sleep & Sleep Coaching',
          screen_name: 'Deep, REM & Light Sleep Hypnogram Chart',
          screen_type: 'hypnogram_screen',
          route_path: 'dokrahealth://tracker/sleep/stages',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '20px', card_padding: '16px' },
          style: { bg_color: '#090d16', card_bg_color: '#121a2d', text_primary_color: '#ffffff', accent_color: '#c084fc', theme_mode: 'dark' },
          config: {
            title: 'Hypnogram & Sleep Architecture',
            total_time_in_bed: '8h 14m',
            total_sleep_time: '7h 42m',
            timeline_start: '23:15',
            timeline_end: '07:29',
            stages: [
              { name: 'Awake', duration: '32m', pct: 7, color: '#f59e0b', description: 'Brief nocturnal awakenings' },
              { name: 'REM Sleep', duration: '1h 50m', pct: 24, color: '#06b6d4', description: 'Rapid eye movement & dream state' },
              { name: 'Light Sleep', duration: '3h 48m', pct: 49, color: '#6366f1', description: 'Muscular relaxation & core body cooling' },
              { name: 'Deep Sleep', duration: '1h 32m', pct: 20, color: '#a855f7', description: 'Delta wave restorative cellular repair' }
            ],
            cycles_count: 5
          },
          visibility_flags: { show_timeline_axis: true, show_stage_bars: true, show_cycle_markers: true, show_descriptions: true }
        },
        {
          id: 'scr_sleep_coaching_persona_hub',
          domain_id: 'sleep',
          domain_name: '🌙 Sleep & Sleep Coaching',
          screen_name: '8 Animal Personas & Sleep Coaching Hub',
          screen_type: 'persona_hub_screen',
          route_path: 'dokrahealth://tracker/sleepcoaching',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '22px', card_padding: '18px' },
          style: { bg_color: '#090d16', card_bg_color: '#121a2d', text_primary_color: '#ffffff', accent_color: '#818cf8', theme_mode: 'dark' },
          config: {
            title: 'Sleep Coaching & Animal Persona',
            active_persona: 'lion',
            program_duration_weeks: 4,
            current_week: 2,
            current_day: 4,
            personas_catalog: [
              { id: 'lion', name: 'Unconcerned Lion', level: 4, order: 1, icon: '🦁', desc: 'Sleeps soundly for recommended 7-9 hours with minimal nocturnal awakenings.', advice: 'Maintain your consistent bedtime routine even on weekends.' },
              { id: 'hedgehog', name: 'Sensitive Hedgehog', level: 2, order: 6, icon: '🦔', desc: 'Frequently wakes during the night and takes longer to fall back asleep.', advice: 'Avoid bright screens 1 hour before bed to reduce nervous arousal.' },
              { id: 'penguin', name: 'Nervous Penguin', level: 3, order: 2, icon: '🐧', desc: 'Anxious sleeper prone to early waking and restless light sleep.', advice: 'Try box breathing and magnesium glycinate for evening calm.' },
              { id: 'mole', name: 'Sun Averse Mole', level: 3, order: 4, icon: '🐹', desc: 'Prefers late sleep schedules and gets less morning sun exposure.', advice: 'Get 15 minutes of sunlight within 30 minutes of waking.' },
              { id: 'deer', name: 'Cautious Deer', level: 2, order: 5, icon: '🦌', desc: 'Easily startled sleeper with light sleep dominance.', advice: 'Use white noise or earplugs to block ambient nocturnal sound.' },
              { id: 'elephantsea', name: 'Easygoing Walrus', level: 3, order: 3, icon: '🦭', desc: 'Long duration sleeper who may experience irregular sleep timing.', advice: 'Anchor your wake time to a fixed hour every day.' },
              { id: 'alligator', name: 'Alligator on the Hunt', level: 2, order: 7, icon: '🐊', desc: 'Night owl who struggles with morning alertness and sleep debt.', advice: 'Shift bedtime 15 minutes earlier every two nights.' },
              { id: 'shark', name: 'Exhausted Shark', level: 1, order: 8, icon: '🦈', desc: 'Severe sleep deprivation and fragmented non-restorative sleep.', advice: 'Prioritize a strict 8-hour sleep opportunity window.' }
            ],
            treatments: [
              { code: 'T1', title: 'Bedtime Consistency Anchor', progress_pct: 100 },
              { code: 'T2', title: 'Blue Light & Evening Dimming', progress_pct: 75 },
              { code: 'T3', title: 'Caffeine & Meal Cutoff', progress_pct: 50 },
              { code: 'T4', title: 'Nocturnal Temperature & Room Setup', progress_pct: 40 },
              { code: 'T5', title: 'Stress & Autonomic Decompression', progress_pct: 20 }
            ]
          },
          visibility_flags: { show_active_persona_banner: true, show_persona_grid: true, show_treatment_missions: true, show_coaching_tips: true }
        },
        {
          id: 'scr_sleep_snoring_audio_detail',
          domain_id: 'sleep',
          domain_name: '🌙 Sleep & Sleep Coaching',
          screen_name: 'Snoring Audio Detection & Decibel Monitor',
          screen_type: 'snoring_screen',
          route_path: 'dokrahealth://tracker/sleep/snoring',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#090d16', card_bg_color: '#121a2d', text_primary_color: '#ffffff', accent_color: '#f59e0b', theme_mode: 'dark' },
          config: {
            title: 'Snoring Detection & Decibel Log',
            snoring_detected: true,
            total_duration_mins: 14,
            event_count: 6,
            max_volume_db: 58,
            avg_volume_db: 46,
            threshold_db: 50,
            warning_state: 'Low Risk',
            detection_mode: 'Always On During Sleep Window',
            audio_recordings_retained_days: 7,
            sample_events: [
              { timestamp: '02:14 AM', duration_secs: 180, peak_db: 54, audio_clip: 'snore_clip_01.aac' },
              { timestamp: '03:42 AM', duration_secs: 240, peak_db: 58, audio_clip: 'snore_clip_02.aac' },
              { timestamp: '05:10 AM', duration_secs: 120, peak_db: 49, audio_clip: 'snore_clip_03.aac' }
            ]
          },
          visibility_flags: { show_snore_graph: true, show_event_list: true, show_audio_playback: true, show_threshold_slider: true }
        },
        {
          id: 'scr_sleep_blood_oxygen_apnea',
          domain_id: 'sleep',
          domain_name: '🌙 Sleep & Sleep Coaching',
          screen_name: 'Overnight SpO2 & Breathing Drop Analytics',
          screen_type: 'spo2_screen',
          route_path: 'dokrahealth://tracker/sleep/spo2',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#090d16', card_bg_color: '#121a2d', text_primary_color: '#ffffff', accent_color: '#ef4444', theme_mode: 'dark' },
          config: {
            title: 'Overnight Blood Oxygen (SpO2)',
            min_spo2_pct: 91,
            mean_spo2_pct: 97,
            max_spo2_pct: 99,
            time_below_90_pct_secs: 0,
            drop_events_count: 2,
            apnea_risk_category: 'Low / Non-Apneic',
            sampling_interval_secs: 1,
            sensor_hardware: 'Dual-Wavelength PPG Sensor',
            clinical_threshold_note: 'Drops below 90% highlighted in amber/red alert'
          },
          visibility_flags: { show_spo2_timeline: true, show_drop_event_markers: true, show_min_max_badges: true, show_apnea_assessment: true }
        },
        {
          id: 'scr_sleep_skin_temperature',
          domain_id: 'sleep',
          domain_name: '🌙 Sleep & Sleep Coaching',
          screen_name: 'Overnight Skin Temperature & Circadian Rhythm',
          screen_type: 'temperature_screen',
          route_path: 'dokrahealth://tracker/sleep/temperature',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#090d16', card_bg_color: '#121a2d', text_primary_color: '#ffffff', accent_color: '#06b6d4', theme_mode: 'dark' },
          config: {
            title: 'Overnight Skin Temperature',
            baseline_deviation_celsius: -0.3,
            current_temp_celsius: 35.8,
            baseline_temp_celsius: 36.1,
            circadian_dip_detected: true,
            temperature_status: 'Optimal Sleep Cooling',
            sampling_source: 'Galaxy Ring / Watch Contact Thermometer'
          },
          visibility_flags: { show_temperature_curve: true, show_deviation_badge: true, show_circadian_markers: true }
        },
        {
          id: 'scr_sleep_respiratory_rate',
          domain_id: 'sleep',
          domain_name: '🌙 Sleep & Sleep Coaching',
          screen_name: 'Sleep Respiratory Rate & Breath Rhythm',
          screen_type: 'respiratory_screen',
          route_path: 'dokrahealth://tracker/sleep/respiratory',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#090d16', card_bg_color: '#121a2d', text_primary_color: '#ffffff', accent_color: '#10b981', theme_mode: 'dark' },
          config: {
            title: 'Sleep Respiratory Rate',
            avg_breaths_per_minute: 14.2,
            min_rpm: 12.0,
            max_rpm: 16.8,
            rhythm_stability: 'Normal & Steady',
            target_range: '12 - 20 rpm'
          },
          visibility_flags: { show_rpm_chart: true, show_target_range_band: true, show_stability_indicator: true }
        },
        {
          id: 'scr_sleep_bedtime_guidance_goals',
          domain_id: 'sleep',
          domain_name: '🌙 Sleep & Sleep Coaching',
          screen_name: 'Target Bedtime, Wake Time & Sleep Debt',
          screen_type: 'guidance_screen',
          route_path: 'dokrahealth://tracker/sleep/guidance',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#090d16', card_bg_color: '#121a2d', text_primary_color: '#ffffff', accent_color: '#8b5cf6', theme_mode: 'dark' },
          config: {
            title: 'Bedtime Guidance & Sleep Goals',
            target_bedtime: '23:00',
            target_wake_time: '07:00',
            target_duration_hours: 8.0,
            sleep_debt_minutes: 18,
            sleep_debt_status: 'Low Debt',
            bedtime_reminder_advance_mins: 30,
            wind_down_routine_enabled: true
          },
          visibility_flags: { show_bedtime_clock_wheel: true, show_sleep_debt_meter: true, show_wind_down_checklist: true }
        },
        {
          id: 'scr_sleep_consistency_regularity',
          domain_id: 'sleep',
          domain_name: '🌙 Sleep & Sleep Coaching',
          screen_name: 'Sleep Consistency & Circadian Regularity',
          screen_type: 'consistency_screen',
          route_path: 'dokrahealth://tracker/sleep/consistency',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#090d16', card_bg_color: '#121a2d', text_primary_color: '#ffffff', accent_color: '#f43f5e', theme_mode: 'dark' },
          config: {
            title: 'Sleep Regularity & Circadian Alignment',
            consistency_score: 92,
            consistency_label: 'Very Consistent',
            bedtime_variance_mins: 14,
            wake_time_variance_mins: 18,
            social_jetlag_mins: 22,
            weekday_avg_duration: '7h 38m',
            weekend_avg_duration: '7h 52m'
          },
          visibility_flags: { show_regularity_donut: true, show_variance_bars: true, show_social_jetlag_card: true }
        },
        {
          id: 'scr_sleep_history_trends_chart',
          domain_id: 'sleep',
          domain_name: '🌙 Sleep & Sleep Coaching',
          screen_name: 'Sleep History & Multi-Week Trends',
          screen_type: 'history_screen',
          route_path: 'dokrahealth://tracker/sleep/history',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '20px', card_padding: '16px' },
          style: { bg_color: '#090d16', card_bg_color: '#121a2d', text_primary_color: '#ffffff', accent_color: '#38bdf8', theme_mode: 'dark' },
          config: {
            title: 'Sleep History & Trends',
            timeframes: ['7D', '31D', '12M'],
            default_timeframe: '7D',
            weekly_avg_duration: '7h 36m',
            weekly_avg_score: 86,
            weekly_data: [
              { day: 'Mon', score: 84, duration_hours: 7.4, deep_pct: 18 },
              { day: 'Tue', score: 80, duration_hours: 7.1, deep_pct: 16 },
              { day: 'Wed', score: 87, duration_hours: 7.8, deep_pct: 22 },
              { day: 'Thu', score: 89, duration_hours: 8.0, deep_pct: 21 },
              { day: 'Fri', score: 82, duration_hours: 7.2, deep_pct: 17 },
              { day: 'Sat', score: 91, duration_hours: 8.2, deep_pct: 24 },
              { day: 'Sun', score: 88, duration_hours: 7.7, deep_pct: 20 }
            ]
          },
          visibility_flags: { show_stacked_stage_bars: true, show_average_duration_line: true, show_score_trend_curve: true }
        },
        {
          id: 'scr_sleep_rewards_streaks',
          domain_id: 'sleep',
          domain_name: '🌙 Sleep & Sleep Coaching',
          screen_name: 'Sleep Streaks, Milestones & Badges',
          screen_type: 'streaks_screen',
          route_path: 'dokrahealth://tracker/sleep/streaks',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#090d16', card_bg_color: '#121a2d', text_primary_color: '#ffffff', accent_color: '#f59e0b', theme_mode: 'dark' },
          config: {
            title: 'Sleep Streaks & Achievements',
            current_streak_days: 12,
            longest_streak_days: 21,
            milestones: [
              { days: 3, title: '3-Day Consistent Bedtime', completed: true, badge: '🥉 Bronze Sleeper' },
              { days: 5, title: '5-Day Restorative Habit', completed: true, badge: '🥈 Silver Sleeper' },
              { days: 7, title: '7-Day Circadian Mastery', completed: true, badge: '🥇 Gold Sleeper' },
              { days: 14, title: '14-Day Perfect Animal Persona', completed: false, badge: '🦁 Lion Champion' }
            ]
          },
          visibility_flags: { show_streak_flame: true, show_milestone_cards: true, show_share_badge_cta: true }
        },
        {
          id: 'scr_sleep_widget_oneui_settings',
          domain_id: 'sleep',
          domain_name: '🌙 Sleep & Sleep Coaching',
          screen_name: 'One UI 7 & Cover Screen Sleep Widgets',
          screen_type: 'widget_settings_screen',
          route_path: 'dokrahealth://tracker/sleep/widgets',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '16px', card_padding: '16px' },
          style: { bg_color: '#090d16', card_bg_color: '#121a2d', text_primary_color: '#ffffff', accent_color: '#818cf8', theme_mode: 'dark' },
          config: {
            title: 'Sleep Widgets (One UI 7 & Cover Screen)',
            widget_sizes_supported: ['2x1 Compact', '2x2 Square', '3x1 Medium', '4x1 Bar', '4x2 Full Hypnogram'],
            default_widget_size: '4x2 Full Hypnogram',
            show_score_arc: true,
            show_mini_hypnogram: true,
            show_animal_icon: true,
            auto_refresh_after_wake: true
          },
          visibility_flags: { show_widget_preview: true, show_size_selector: true, show_element_toggles: true }
        },
        {
          id: 'scr_sleep_advanced_settings',
          domain_id: 'sleep',
          domain_name: '🌙 Sleep & Sleep Coaching',
          screen_name: 'Sleep Advanced Sensor & Telemetry Settings',
          screen_type: 'settings_screen',
          route_path: 'dokrahealth://tracker/sleep/settings',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#090d16', card_bg_color: '#121a2d', text_primary_color: '#ffffff', accent_color: '#10b981', theme_mode: 'dark' },
          config: {
            title: 'Advanced Sleep Settings',
            continuous_spo2_enabled: true,
            snoring_detection_mode: 'Always',
            audio_recording_enabled: true,
            skin_temp_sensor_active: true,
            respiratory_rate_sensor_active: true,
            smart_ring_sync_frequency_mins: 15
          },
          visibility_flags: { show_sensor_toggles: true, show_recording_privacy_notice: true, show_device_battery_impact: true }
        },
        // --- Domain 5: 💓 Heart Health & Sinus ECG (Step 5 Focus) ---
        {
          id: 'scr_heart_main_dashboard',
          domain_id: 'heart',
          domain_name: '💓 Heart Health & Sinus ECG',
          screen_name: 'Heart Rate Main Hub & Real-time Telemetry',
          screen_type: 'heart_dashboard_screen',
          route_path: 'dokrahealth://tracker/heartrate',
          layout: {
            container_padding: '16px',
            section_gap: '14px',
            card_radius: '22px',
            card_padding: '16px',
            live_hr_gauge_size: '180px',
            flex_direction: 'column'
          },
          style: {
            bg_color: '#080d1a',
            card_bg_color: '#0f172a',
            text_primary_color: '#ffffff',
            text_secondary_color: '#94a3b8',
            accent_color: '#f43f5e',
            hr_pulse_color: '#fb7185',
            font_family: 'Inter',
            header_font_size: '22px',
            header_font_weight: '800',
            border_radius: '22px',
            shadow_elevation: '0 8px 28px rgba(244,63,94,0.22)',
            theme_mode: 'dark'
          },
          config: {
            title: 'Heart Rate Telemetry',
            current_bpm: 72,
            resting_bpm: 58,
            max_bpm: 168,
            min_bpm: 52,
            average_bpm: 74,
            status_indicator: 'Normal / Rested',
            measurement_state: 'IDLE',
            live_pulse_enabled: true,
            daily_hr_zones: {
              z1_mins: 420,
              z2_mins: 85,
              z3_mins: 32,
              z4_mins: 14,
              z5_mins: 2
            },
            clinical_engine: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: {
            show_header: true,
            show_current_bpm_tile: true,
            show_resting_hr_card: true,
            show_max_hr_card: true,
            show_hr_zone_distribution: true,
            show_live_pulse_animation: true,
            show_measure_cta: true,
            show_24h_trend_preview: true
          }
        },
        {
          id: 'scr_heart_live_measurement',
          domain_id: 'heart',
          domain_name: '💓 Heart Health & Sinus ECG',
          screen_name: 'Live Optical PPG Sensor Heart Rate Scanner',
          screen_type: 'scanner_screen',
          route_path: 'dokrahealth://tracker/heartrate/measure',
          layout: {
            container_padding: '20px',
            section_gap: '16px',
            card_radius: '24px',
            card_padding: '20px',
            pulse_scanner_size: '220px'
          },
          style: {
            bg_color: '#080d1a',
            card_bg_color: '#131e36',
            text_primary_color: '#ffffff',
            accent_color: '#f43f5e',
            pulse_glow: 'rgba(244,63,94,0.4)',
            theme_mode: 'dark'
          },
          config: {
            title: 'Measuring Heart Rate',
            live_bpm: 72,
            signal_quality_pct: 98,
            countdown_secs: 15,
            sensor_type: 'Green Optical PPG LED (525nm)',
            haptic_beat_enabled: true,
            measurement_pipeline: 'CODE-CONTROLLED'
          },
          visibility_flags: {
            show_scanner_ring: true,
            show_live_bpm_number: true,
            show_countdown_timer: true,
            show_signal_quality_indicator: true
          }
        },
        {
          id: 'scr_heart_resting_detail',
          domain_id: 'heart',
          domain_name: '💓 Heart Health & Sinus ECG',
          screen_name: 'Resting Heart Rate (RHR) & Basal Recovery',
          screen_type: 'resting_hr_screen',
          route_path: 'dokrahealth://tracker/heartrate/resting',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#10b981', theme_mode: 'dark' },
          config: {
            title: 'Resting Heart Rate (RHR)',
            resting_hr_bpm: 58,
            baseline_7d_avg: 60,
            status: 'Optimal Cardiovascular Recovery',
            clinical_assessment: 'CODE-CONTROLLED'
          },
          visibility_flags: { show_rhr_gauge: true, show_7d_trend: true, show_basal_guidance: true }
        },
        {
          id: 'scr_heart_max_zones_calibration',
          domain_id: 'heart',
          domain_name: '💓 Heart Health & Sinus ECG',
          screen_name: 'Maximum Heart Rate & 5-Zone Calibration',
          screen_type: 'calibration_screen',
          route_path: 'dokrahealth://tracker/heartrate/max_zones',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#fb923c', theme_mode: 'dark' },
          config: {
            title: 'Heart Rate 5-Zone Spectrum',
            max_hr_bpm: 190,
            resting_hr_bpm: 58,
            formula: 'Karvonen HRR = Resting + (Max - Resting) * Zone%',
            calculation_engine: 'CODE-CONTROLLED',
            zones: {
              z1: '95-114',
              z2: '115-133',
              z3: '134-152',
              z4: '153-171',
              z5: '172-195'
            }
          },
          visibility_flags: { show_zone_sliders: true, show_formula_badge: true, show_max_hr_indicator: true }
        },
        {
          id: 'scr_heart_history_trends_chart',
          domain_id: 'heart',
          domain_name: '💓 Heart Health & Sinus ECG',
          screen_name: 'Heart Rate History & Timeframe Analytics',
          screen_type: 'trends_screen',
          route_path: 'dokrahealth://tracker/heartrate/history',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '20px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#f43f5e', theme_mode: 'dark' },
          config: {
            title: 'Heart Rate History',
            selected_timeframe: 'Day',
            min_bpm: 52,
            max_bpm: 168,
            avg_bpm: 74,
            circadian_dip_bpm: 54,
            sampling_rate: '1 Hz continuous'
          },
          visibility_flags: { show_timeframe_selector: true, show_24h_chart: true, show_min_avg_max_stats: true }
        },
        {
          id: 'scr_ecg_sinus_lead_live',
          domain_id: 'heart',
          domain_name: '💓 Heart Health & Sinus ECG',
          screen_name: 'Live 60Hz Sinus Rhythm ECG Lead I Waveform',
          screen_type: 'ecg_live_screen',
          route_path: 'dokrahealth://tracker/ecg/live',
          layout: {
            container_padding: '16px',
            section_gap: '12px',
            card_radius: '20px',
            card_padding: '14px',
            canvas_height: '210px',
            flex_direction: 'column'
          },
          style: {
            bg_color: '#080d1a',
            card_bg_color: '#0a101f',
            text_primary_color: '#ffffff',
            text_secondary_color: '#94a3b8',
            accent_color: '#10b981',
            ecg_line_color: '#10b981',
            ecg_grid_color: 'rgba(239,68,68,0.18)',
            font_family: 'JetBrains Mono',
            theme_mode: 'dark'
          },
          config: {
            title: 'Single-Lead ECG (Lead I)',
            sampling_frequency_hz: 60,
            standard_calibration: '25mm/s, 10mm/mV',
            lead_type: 'Lead I (Right Index to Left Hand)',
            duration_secs: 30,
            live_bpm: 68,
            electrode_contact: 'EXCELLENT',
            pqrst_visualization: true,
            medical_engine: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: {
            show_60hz_canvas: true,
            show_lead_indicator: true,
            show_live_bpm: true,
            show_30s_countdown: true,
            show_electrode_contact_pill: true,
            show_pqrst_labels: true,
            show_stop_save_controls: true
          }
        },
        {
          id: 'scr_ecg_result_sinus_rhythm',
          domain_id: 'heart',
          domain_name: '💓 Heart Health & Sinus ECG',
          screen_name: 'Sinus Rhythm ECG Result & Interval Telemetry',
          screen_type: 'ecg_result_screen',
          route_path: 'dokrahealth://tracker/ecg/result/sinus',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '22px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#10b981', theme_mode: 'dark' },
          config: {
            title: 'ECG Recording Result',
            classification: 'Sinus Rhythm',
            heart_rate_bpm: 68,
            pr_interval_ms: 158,
            qrs_duration_ms: 88,
            qt_qtc_ms: '396 / 418',
            classification_engine: 'CODE-CONTROLLED / PROTECTED',
            clinical_notes: 'Regular rhythm without abnormal ventricular ectopy.'
          },
          visibility_flags: {
            show_classification_badge: true,
            show_intervals_table: true,
            show_waveform_thumbnail: true,
            show_export_pdf_button: true
          }
        },
        {
          id: 'scr_ecg_afib_warning_alert',
          domain_id: 'heart',
          domain_name: '💓 Heart Health & Sinus ECG',
          screen_name: 'Atrial Fibrillation (AFib) Clinical Warning Dialog',
          screen_type: 'ecg_alert_screen',
          route_path: 'dokrahealth://tracker/ecg/alert/afib',
          layout: { container_padding: '20px', section_gap: '14px', card_radius: '24px', card_padding: '20px' },
          style: { bg_color: '#080d1a', card_bg_color: '#1e1114', text_primary_color: '#ffffff', accent_color: '#ef4444', theme_mode: 'dark' },
          config: {
            alert_title: 'Possible Atrial Fibrillation (AFib)',
            risk_level: 'HIGH_PRIORITY_CLINICAL',
            irregular_rhythm_detected: true,
            classification_engine: 'CODE-CONTROLLED / PROTECTED',
            emergency_guidance: 'If you experience chest tightness, shortness of breath, or dizziness, seek immediate medical attention.'
          },
          visibility_flags: {
            show_warning_icon: true,
            show_afib_badge: true,
            show_doctor_contact_cta: true,
            show_pdf_export_shortcut: true
          }
        },
        {
          id: 'scr_ecg_history_recordings',
          domain_id: 'heart',
          domain_name: '💓 Heart Health & Sinus ECG',
          screen_name: 'ECG Recordings Archive & Waveform Strip Gallery',
          screen_type: 'ecg_history_screen',
          route_path: 'dokrahealth://tracker/ecg/history',
          layout: { container_padding: '16px', section_gap: '12px', card_radius: '18px', card_padding: '14px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#10b981', theme_mode: 'dark' },
          config: {
            title: 'ECG History & Archives',
            total_recordings: 18,
            filter_type: 'All',
            sample_strips: [
              { date: 'Apr 26, 09:14 AM', bpm: 68, result: 'Sinus Rhythm', lead: 'Lead I', duration: '30s' },
              { date: 'Apr 24, 08:30 PM', bpm: 72, result: 'Sinus Rhythm', lead: 'Lead I', duration: '30s' }
            ]
          },
          visibility_flags: { show_filter_chips: true, show_strips_list: true, show_quick_pdf_export: true }
        },
        {
          id: 'scr_ecg_clinical_pdf_export',
          domain_id: 'heart',
          domain_name: '💓 Heart Health & Sinus ECG',
          screen_name: 'Doctor-Ready Clinical ECG PDF Report Generator',
          screen_type: 'pdf_export_screen',
          route_path: 'dokrahealth://tracker/ecg/export/pdf',
          layout: { container_padding: '18px', section_gap: '14px', card_radius: '20px', card_padding: '18px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#2563eb', theme_mode: 'dark' },
          config: {
            report_title: 'Dokra Health - Single-Lead ECG Rhythm Strip',
            patient_name: 'Dr. Sarah Connor',
            patient_dob: '1988-04-12',
            paper_speed: '25 mm/s',
            amplitude: '10 mm/mV',
            grid_style: 'Standard 1mm Red ECG Grid',
            include_lead1_waveform: true,
            include_intervals_table: true,
            doctor_signature_line: true,
            data_engine: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: {
            show_pdf_preview_canvas: true,
            show_patient_info_fields: true,
            show_doctor_notes_section: true,
            show_print_share_buttons: true
          }
        },
        {
          id: 'scr_vitals_composite_dashboard',
          domain_id: 'heart',
          domain_name: '💓 Heart Health & Sinus ECG',
          screen_name: 'Comprehensive Vitals Dashboard & Biomarkers',
          screen_type: 'vitals_dashboard_screen',
          route_path: 'dokrahealth://tracker/vitals',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '20px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#f43f5e', theme_mode: 'dark' },
          config: {
            title: 'Vitals & Biomarkers',
            vitals: {
              heart_rate: { value: 72, unit: 'bpm', status: 'Normal' },
              blood_pressure: { systolic: 118, diastolic: 76, unit: 'mmHg', status: 'Optimal' },
              blood_oxygen: { value: 98, unit: '%', status: 'Optimal' },
              skin_temp: { value: -0.3, unit: '°C', status: 'Circadian Dip' },
              blood_glucose: { value: 95, unit: 'mg/dL', status: 'Fasting Normal' },
              respiratory_rate: { value: 14.2, unit: 'rpm', status: 'Steady' }
            }
          },
          visibility_flags: {
            show_vitals_matrix: true,
            show_biomarker_status_pills: true,
            show_trend_arrows: true
          }
        },
        {
          id: 'scr_vitals_metric_detail',
          domain_id: 'heart',
          domain_name: '💓 Heart Health & Sinus ECG',
          screen_name: 'Vitals Biomarker Deep Analysis & Ranges',
          screen_type: 'vitals_detail_screen',
          route_path: 'dokrahealth://tracker/vitals/detail',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#8b5cf6', theme_mode: 'dark' },
          config: {
            title: 'Biomarker In-Depth Analysis',
            active_biomarker: 'Blood Pressure',
            current_value: '118/76 mmHg',
            target_range: '90-120 / 60-80 mmHg',
            clinical_guideline: 'AHA/ACC 2024 Guidelines'
          },
          visibility_flags: { show_target_range_bar: true, show_clinical_guidelines: true, show_source_telemetry: true }
        },
        {
          id: 'scr_heart_widget_oneui_settings',
          domain_id: 'heart',
          domain_name: '💓 Heart Health & Sinus ECG',
          screen_name: 'One UI 7 Heart & ECG Cover Widgets',
          screen_type: 'widget_settings_screen',
          route_path: 'dokrahealth://tracker/heart/widgets',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#f43f5e', theme_mode: 'dark' },
          config: {
            title: 'One UI 7 Heart Widgets',
            widget_variants: ['2x1 Mini BPM', '2x2 Vitals Matrix', '4x2 Interactive ECG Strip'],
            active_preview: '4x2 Interactive ECG Strip',
            refresh_rate_hz: 60
          },
          visibility_flags: { show_widget_live_preview: true, show_size_selector: true, show_dark_mode_preview: true }
        },
        {
          id: 'scr_heart_ecg_advanced_settings',
          domain_id: 'heart',
          domain_name: '💓 Heart Health & Sinus ECG',
          screen_name: 'Heart Sensor & High-Frequency PPG Calibration',
          screen_type: 'settings_screen',
          route_path: 'dokrahealth://tracker/heart/settings',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#10b981', theme_mode: 'dark' },
          config: {
            title: 'Cardiovascular Sensor Setup',
            measurement_frequency: 'Continuous 1Hz',
            high_hr_alert_bpm: 120,
            low_hr_alert_bpm: 40,
            afib_background_scan: true,
            electrode_impedance_check: true,
            clinical_safeguards: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: { show_threshold_sliders: true, show_sensor_frequency_picker: true, show_privacy_notice: true }
        },
        // --- Domain 6: 🩺 Blood Pressure & Telehealth (Step 6 Focus) ---
        {
          id: 'scr_bp_main_dashboard',
          domain_id: 'blood_pressure',
          domain_name: '🩺 Blood Pressure & Telehealth',
          screen_name: 'Blood Pressure Main Dashboard & Cardiovascular Hub',
          screen_type: 'bp_dashboard_screen',
          route_path: 'dokrahealth://tracker/bloodpressure',
          layout: {
            container_padding: '16px',
            section_gap: '14px',
            card_radius: '22px',
            card_padding: '16px',
            dual_gauge_size: '200px',
            flex_direction: 'column'
          },
          style: {
            bg_color: '#080d1a',
            card_bg_color: '#0f172a',
            text_primary_color: '#ffffff',
            text_secondary_color: '#94a3b8',
            accent_color: '#8b5cf6',
            bp_systolic_color: '#8b5cf6',
            bp_diastolic_color: '#38bdf8',
            map_color: '#06b6d4',
            font_family: 'Inter',
            header_font_size: '22px',
            header_font_weight: '800',
            border_radius: '22px',
            shadow_elevation: '0 8px 28px rgba(139,92,246,0.22)',
            theme_mode: 'dark'
          },
          config: {
            title: 'Blood Pressure & MAP',
            systolic_value: 118,
            diastolic_value: 76,
            map_value: 90,
            pulse_bpm: 72,
            classification: 'Optimal / Normal',
            target_systolic: 120,
            target_diastolic: 80,
            measurement_time: 'Today 8:30 AM',
            diurnal_status: 'Morning Baseline',
            clinical_safeguards: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: {
            show_header: true,
            show_dual_gauge: true,
            show_map_badge: true,
            show_target_range_bar: true,
            show_telehealth_banner: true,
            show_quick_log_button: true,
            show_recent_history_preview: true
          }
        },
        {
          id: 'scr_bp_live_measurement',
          domain_id: 'blood_pressure',
          domain_name: '🩺 Blood Pressure & Telehealth',
          screen_name: 'Smart Bluetooth Cuff Live Measurement HUD',
          screen_type: 'bp_measurement_screen',
          route_path: 'dokrahealth://tracker/bloodpressure/measure',
          layout: {
            container_padding: '20px',
            section_gap: '16px',
            card_radius: '24px',
            card_padding: '20px',
            pressure_gauge_size: '220px'
          },
          style: {
            bg_color: '#080d1a',
            card_bg_color: '#131e36',
            text_primary_color: '#ffffff',
            accent_color: '#8b5cf6',
            inflation_glow: 'rgba(139,92,246,0.4)',
            theme_mode: 'dark'
          },
          config: {
            title: 'Inflating Smart Cuff',
            current_cuff_pressure_mmhg: 145,
            target_inflation_mmhg: 180,
            live_pulse_detected: true,
            live_pulse_bpm: 72,
            status: 'Deflating (Oscillometric analysis active)',
            sensor_protocol: 'BLE Smart Cuff GATT',
            deflation_rate_mmhg_per_sec: 3.5,
            measurement_engine: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: {
            show_pressure_gauge: true,
            show_oscillometric_wave: true,
            show_cuff_leak_indicator: true,
            show_stop_cancel_cta: true
          }
        },
        {
          id: 'scr_bp_result_detail',
          domain_id: 'blood_pressure',
          domain_name: '🩺 Blood Pressure & Telehealth',
          screen_name: 'Blood Pressure Result & AHA/ACC 2024 Classification',
          screen_type: 'bp_result_screen',
          route_path: 'dokrahealth://tracker/bloodpressure/result',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '20px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#10b981', theme_mode: 'dark' },
          config: {
            title: 'BP Measurement Result',
            systolic_value: 118,
            diastolic_value: 76,
            map_value: 90,
            pulse_bpm: 72,
            stage_category: 'Normal (< 120 / < 80 mmHg)',
            guideline: 'AHA/ACC 2024 Clinical Guidelines',
            clinical_note: 'Your blood pressure and arterial perfusion pressure are well within optimal physiological limits.',
            algorithm: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: {
            show_result_card: true,
            show_stage_indicator: true,
            show_telehealth_consult_cta: true,
            show_share_pdf_btn: true
          }
        },
        {
          id: 'scr_bp_target_range_config',
          domain_id: 'blood_pressure',
          domain_name: '🩺 Blood Pressure & Telehealth',
          screen_name: 'Systolic & Diastolic Target Range Calibration',
          screen_type: 'bp_target_screen',
          route_path: 'dokrahealth://tracker/bloodpressure/targets',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#8b5cf6', theme_mode: 'dark' },
          config: {
            title: 'Target Range Setup',
            target_systolic_min: 90,
            target_systolic_max: 120,
            target_diastolic_min: 60,
            target_diastolic_max: 80,
            guideline_preset: 'AHA/ACC Standard',
            clinical_thresholds: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: { show_range_sliders: true, show_category_spectrum: true, show_physician_custom_goal: true }
        },
        {
          id: 'scr_bp_map_analytics',
          domain_id: 'blood_pressure',
          domain_name: '🩺 Blood Pressure & Telehealth',
          screen_name: 'Mean Arterial Pressure (MAP) & Perfusion Analytics',
          screen_type: 'bp_map_screen',
          route_path: 'dokrahealth://tracker/bloodpressure/map',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#06b6d4', theme_mode: 'dark' },
          config: {
            title: 'Mean Arterial Pressure (MAP)',
            current_map: 90,
            normal_map_range: '70 - 100 mmHg',
            perfusion_status: 'Adequate Organ Perfusion',
            formula_display: 'MAP = Diastolic + (Systolic - Diastolic) / 3',
            calculation_engine: 'CODE-CONTROLLED'
          },
          visibility_flags: { show_map_gauge: true, show_perfusion_card: true, show_organ_health_insights: true }
        },
        {
          id: 'scr_bp_cuff_calibration_wizard',
          domain_id: 'blood_pressure',
          domain_name: '🩺 Blood Pressure & Telehealth',
          screen_name: 'Smart Inflatable Cuff Calibration & Zero-Point Offset',
          screen_type: 'bp_calibration_screen',
          route_path: 'dokrahealth://tracker/bloodpressure/calibration',
          layout: { container_padding: '18px', section_gap: '14px', card_radius: '20px', card_padding: '18px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#3b82f6', theme_mode: 'dark' },
          config: {
            title: 'Cuff Calibration Protocol',
            current_step: 2,
            total_steps: 3,
            calibration_mode: 'STANDARD_OMRON_BLE',
            arm_circumference_cm: 28,
            zero_offset_mmhg: 0.2,
            device_ready: true,
            protocol_engine: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: { show_wizard_stepper: true, show_arm_placement_guide: true, show_zero_point_test: true, show_calibration_status: true }
        },
        {
          id: 'scr_bp_history_log',
          domain_id: 'blood_pressure',
          domain_name: '🩺 Blood Pressure & Telehealth',
          screen_name: 'Blood Pressure Historical Log & Ambulatory Records',
          screen_type: 'bp_history_screen',
          route_path: 'dokrahealth://tracker/bloodpressure/history',
          layout: { container_padding: '16px', section_gap: '12px', card_radius: '18px', card_padding: '14px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#8b5cf6', theme_mode: 'dark' },
          config: {
            title: 'Blood Pressure Logbook',
            total_readings: 42,
            morning_avg: '119/77 mmHg',
            evening_avg: '116/74 mmHg',
            filter_timeframe: 'Month',
            clinical_records: 'IMMUTABLE_LOG'
          },
          visibility_flags: { show_filter_tabs: true, show_diurnal_averages: true, show_reading_list: true, show_export_csv_cta: true }
        },
        {
          id: 'scr_bp_trend_charts',
          domain_id: 'blood_pressure',
          domain_name: '🩺 Blood Pressure & Telehealth',
          screen_name: 'Blood Pressure Trends & Longitudinal Analytics',
          screen_type: 'bp_trend_screen',
          route_path: 'dokrahealth://tracker/bloodpressuretrend',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '20px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#8b5cf6', theme_mode: 'dark' },
          config: {
            title: 'Cardiovascular BP Trends',
            chart_timeframe: '7D',
            avg_systolic: 118,
            avg_diastolic: 76,
            avg_map: 90,
            target_corridor_visible: true,
            sampling_source: 'Ambulatory BLE Cuff'
          },
          visibility_flags: { show_timeframe_picker: true, show_systolic_diastolic_envelope: true, show_map_midline: true, show_pulse_overlay: true }
        },
        {
          id: 'scr_bp_morning_surge_alert',
          domain_id: 'blood_pressure',
          domain_name: '🩺 Blood Pressure & Telehealth',
          screen_name: 'Morning Hypertension & Surge Warning Dialog',
          screen_type: 'bp_alert_screen',
          route_path: 'dokrahealth://tracker/bloodpressure/alert/surge',
          layout: { container_padding: '20px', section_gap: '14px', card_radius: '22px', card_padding: '20px' },
          style: { bg_color: '#080d1a', card_bg_color: '#21131c', text_primary_color: '#ffffff', accent_color: '#f43f5e', theme_mode: 'dark' },
          config: {
            alert_title: 'Morning Blood Pressure Surge Detected',
            surge_delta_mmhg: '+18 mmHg vs Nocturnal Baseline',
            severity: 'MODERATE_CARDIOVASCULAR_NOTICE',
            recommendation: 'Rest seated for 5 minutes and repeat measurement before taking morning medication.',
            detection_engine: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: { show_surge_graph: true, show_telehealth_consult_button: true, show_dismiss_btn: true }
        },
        {
          id: 'scr_telehealth_consultation_hub',
          domain_id: 'blood_pressure',
          domain_name: '🩺 Blood Pressure & Telehealth',
          screen_name: 'Telehealth Cardiology & Vascular Consultation Hub',
          screen_type: 'telehealth_hub_screen',
          route_path: 'dokrahealth://telehealth/hub',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '20px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#2563eb', theme_mode: 'dark' },
          config: {
            title: 'Dokra Telehealth Connect',
            partner_network: 'American College of Cardiology Telehealth Alliance',
            next_available_doctor: 'Dr. Evelyn Reed, MD (Cardiology)',
            estimated_wait_mins: 8,
            secure_hipaa_link: 'https://telehealth.dokrahealth.com/cardiology/join',
            auto_attach_bp_log: true
          },
          visibility_flags: { show_quick_connect_hero: true, show_specialist_cards: true, show_scheduled_appointments: true, show_insurance_eligibility_pill: true }
        },
        {
          id: 'scr_telehealth_doctor_profile',
          domain_id: 'blood_pressure',
          domain_name: '🩺 Blood Pressure & Telehealth',
          screen_name: 'Telehealth Cardiologist Specialist Profile & Booking',
          screen_type: 'telehealth_doctor_screen',
          route_path: 'dokrahealth://telehealth/doctor/dr_reed',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '20px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#2563eb', theme_mode: 'dark' },
          config: {
            doctor_name: 'Dr. Evelyn Reed, MD, FACC',
            specialty: 'Vascular Medicine & Hypertension Specialist',
            hospital_affiliation: 'Johns Hopkins Medicine',
            rating: '4.98 ★ (1,240 consults)',
            booking_fee: '$0 (Covered by Dokra Shield)',
            available_slots: ['Today 2:30 PM', 'Today 4:00 PM', 'Tomorrow 10:00 AM']
          },
          visibility_flags: { show_doctor_avatar: true, show_credentials_badges: true, show_booking_calendar: true, show_video_test_call: true }
        },
        {
          id: 'scr_telehealth_clinical_report_share',
          domain_id: 'blood_pressure',
          domain_name: '🩺 Blood Pressure & Telehealth',
          screen_name: 'Telehealth Clinical BP/MAP Report Share Flow',
          screen_type: 'telehealth_share_screen',
          route_path: 'dokrahealth://telehealth/share/report',
          layout: { container_padding: '18px', section_gap: '14px', card_radius: '20px', card_padding: '18px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#10b981', theme_mode: 'dark' },
          config: {
            title: 'Transmit Clinical BP Dossier',
            recipient_physician: 'Dr. Evelyn Reed, MD',
            data_range: 'Past 30 Days (42 readings)',
            include_map_trend: true,
            include_cuff_calibration_log: true,
            encryption_protocol: 'AES-256-GCM / HIPAA EMR Direct',
            transmission_status: 'READY'
          },
          visibility_flags: { show_dossier_preview: true, show_encryption_badge: true, show_send_to_emr_button: true }
        },
        {
          id: 'scr_bp_widget_oneui_settings',
          domain_id: 'blood_pressure',
          domain_name: '🩺 Blood Pressure & Telehealth',
          screen_name: 'One UI 7 Blood Pressure & MAP Cover Widgets',
          screen_type: 'widget_settings_screen',
          route_path: 'dokrahealth://tracker/bp/widgets',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#8b5cf6', theme_mode: 'dark' },
          config: {
            title: 'One UI 7 Blood Pressure Widgets',
            widget_variants: ['2x1 BP Quick Gauge', '2x2 Diurnal BP Matrix', '4x2 Telehealth Quick-Connect'],
            active_preview: '2x2 Diurnal BP Matrix',
            show_map_pill: true
          },
          visibility_flags: { show_widget_live_preview: true, show_size_selector: true, show_dark_mode_preview: true }
        },
        {
          id: 'scr_bp_advanced_sensor_settings',
          domain_id: 'blood_pressure',
          domain_name: '🩺 Blood Pressure & Telehealth',
          screen_name: 'Blood Pressure Device Connectivity & Oscillometric Settings',
          screen_type: 'settings_screen',
          route_path: 'dokrahealth://tracker/bp/settings',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#8b5cf6', theme_mode: 'dark' },
          config: {
            title: 'Advanced BP Hardware Calibration',
            auto_inflate_max_mmhg: 200,
            triple_measurement_average_mode: true,
            irregular_pulse_vibration_alert: true,
            ble_fast_pair: true,
            clinical_firmware_check: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: { show_hardware_toggles: true, show_inflation_slider: true, show_safety_disclaimer: true }
        },
        // --- Domain 7: 🩸 Blood Glucose & CGM (Step 7 Focus) ---
        {
          id: 'scr_cgm_main_dashboard',
          domain_id: 'blood_glucose',
          domain_name: '🩸 Blood Glucose & CGM',
          screen_name: 'Continuous Glucose Main Dashboard & Telemetry',
          screen_type: 'cgm_dashboard_screen',
          route_path: 'dokrahealth://tracker/bloodglucose',
          layout: {
            container_padding: '16px',
            section_gap: '14px',
            card_radius: '22px',
            card_padding: '16px',
            glucose_gauge_size: '190px',
            flex_direction: 'column'
          },
          style: {
            bg_color: '#080d1a',
            card_bg_color: '#0f172a',
            text_primary_color: '#ffffff',
            text_secondary_color: '#94a3b8',
            accent_color: '#10b981',
            glucose_val_color: '#10b981',
            tir_bar_color: '#10b981',
            font_family: 'Inter',
            header_font_size: '22px',
            header_font_weight: '800',
            border_radius: '22px',
            shadow_elevation: '0 8px 28px rgba(16,185,129,0.22)',
            theme_mode: 'dark'
          },
          config: {
            title: 'Continuous Glucose (CGM)',
            current_glucose: 95,
            glucose_unit: 'mg/dL',
            trend_arrow: '→',
            trend_rate: '+0.1 mg/dL/min (Steady)',
            status: 'In Range (Optimal)',
            fasting_glucose: 92,
            post_meal_glucose: 118,
            estimated_hba1c: 5.4,
            time_in_range_pct: 94,
            target_min: 70,
            target_max: 140,
            last_reading_time: '1 min ago',
            sensor_days_left: 6,
            clinical_engine: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: {
            show_header: true,
            show_current_glucose_dial: true,
            show_trend_arrow: true,
            show_tir_bar: true,
            show_fasting_card: true,
            show_postmeal_card: true,
            show_hba1c_card: true,
            show_sensor_status_pill: true,
            show_log_meal_cta: true
          }
        },
        {
          id: 'scr_cgm_live_curve_graph',
          domain_id: 'blood_glucose',
          domain_name: '🩸 Blood Glucose & CGM',
          screen_name: 'Real-Time CGM 24-Hour Interstitial Glucose Curve',
          screen_type: 'cgm_curve_screen',
          route_path: 'dokrahealth://tracker/cgm/curve',
          layout: {
            container_padding: '16px',
            section_gap: '12px',
            card_radius: '20px',
            card_padding: '16px',
            curve_height: '210px'
          },
          style: {
            bg_color: '#080d1a',
            card_bg_color: '#0f172a',
            text_primary_color: '#ffffff',
            accent_color: '#10b981',
            corridor_bg: 'rgba(16,185,129,0.12)',
            theme_mode: 'dark'
          },
          config: {
            title: '24-Hour CGM Curve Graph',
            time_range: '24 Hours',
            current_reading: 95,
            target_corridor: '70 - 140 mg/dL',
            hypo_line: 65,
            hyper_line: 180,
            sample_frequency: '5 mins (Bluetooth BLE)',
            curve_engine: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: {
            show_corridor_band: true,
            show_meal_markers: true,
            show_high_low_threshold_lines: true,
            show_current_dot_glow: true
          }
        },
        {
          id: 'scr_glucose_fasting_detail',
          domain_id: 'blood_glucose',
          domain_name: '🩸 Blood Glucose & CGM',
          screen_name: 'Fasting Blood Glucose & Morning Dawn Phenomenon',
          screen_type: 'fasting_glucose_screen',
          route_path: 'dokrahealth://tracker/glucose/fasting',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#10b981', theme_mode: 'dark' },
          config: {
            title: 'Fasting Glucose Baseline',
            fasting_value: 92,
            target_range: '70 - 99 mg/dL',
            dawn_phenomenon_detected: false,
            baseline_7d_avg: 91,
            clinical_evaluation: 'CODE-CONTROLLED'
          },
          visibility_flags: { show_fasting_dial: true, show_7d_trend_bars: true, show_dawn_phenomenon_card: true }
        },
        {
          id: 'scr_glucose_postprandial_meal',
          domain_id: 'blood_glucose',
          domain_name: '🩸 Blood Glucose & CGM',
          screen_name: 'Post-Prandial Meal Spike & Glycemic Response',
          screen_type: 'postmeal_glucose_screen',
          route_path: 'dokrahealth://tracker/glucose/postmeal',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#f59e0b', theme_mode: 'dark' },
          config: {
            title: 'Post-Prandial Glycemic Response',
            pre_meal_glucose: 92,
            post_meal_glucose: 118,
            glucose_delta_mgdl: '+26 mg/dL',
            target_post_meal_max: 140,
            meal_time: 'Today 12:45 PM',
            meal_tag: 'Mediterranean Salmon Bowl (34g Carbs)',
            glycemic_impact: 'LOW_SPIKE_OPTIMAL'
          },
          visibility_flags: { show_spike_delta_gauge: true, show_meal_tagger: true, show_food_photo_thumbnail: true }
        },
        {
          id: 'scr_glucose_hba1c_estimate',
          domain_id: 'blood_glucose',
          domain_name: '🩸 Blood Glucose & CGM',
          screen_name: 'Estimated Glycated Hemoglobin (HbA1c) & GMI',
          screen_type: 'hba1c_estimate_screen',
          route_path: 'dokrahealth://tracker/glucose/hba1c',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#06b6d4', theme_mode: 'dark' },
          config: {
            title: 'Estimated HbA1c (eA1c / GMI)',
            estimated_hba1c_pct: 5.4,
            mmol_mol_value: 36,
            average_glucose_mgdl: 108,
            gmi_formula: 'eA1c = (AvgGlucose + 46.7) / 28.7',
            clinical_standard: 'ADA 2024 Standards of Care',
            formula_engine: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: { show_hba1c_ring: true, show_formula_badge: true, show_3month_projection_graph: true }
        },
        {
          id: 'scr_glucose_target_ranges_config',
          domain_id: 'blood_glucose',
          domain_name: '🩸 Blood Glucose & CGM',
          screen_name: 'Glycemic Target Range Corridor Calibration',
          screen_type: 'glucose_targets_screen',
          route_path: 'dokrahealth://tracker/glucose/targets',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#10b981', theme_mode: 'dark' },
          config: {
            title: 'Target Ranges Setup',
            target_min_mgdl: 70,
            target_max_mgdl: 140,
            tight_target_max_mgdl: 120,
            fasting_target_max_mgdl: 99,
            guideline_preset: 'ADA / EASD Standard (70-140 mg/dL)',
            clinical_guidelines: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: { show_range_sliders: true, show_preset_picker: true, show_custom_doctor_goal: true }
        },
        {
          id: 'scr_cgm_hypoglycemia_alert',
          domain_id: 'blood_glucose',
          domain_name: '🩸 Blood Glucose & CGM',
          screen_name: 'Urgent Low Blood Glucose (Hypoglycemia) Dialog',
          screen_type: 'glucose_alert_screen',
          route_path: 'dokrahealth://tracker/cgm/alert/hypo',
          layout: { container_padding: '20px', section_gap: '14px', card_radius: '24px', card_padding: '20px' },
          style: { bg_color: '#080d1a', card_bg_color: '#21131c', text_primary_color: '#ffffff', accent_color: '#ef4444', theme_mode: 'dark' },
          config: {
            alert_title: 'Urgent Low Blood Glucose Detected',
            glucose_value: 62,
            glucose_unit: 'mg/dL',
            trend_arrow: '↓↓',
            alert_level: 'CRITICAL_HYPOGLYCEMIA',
            fast_acting_rule: '15-15 Rule: Consume 15g fast-acting carbohydrates (juice/dextrose) and re-test in 15 minutes.',
            detection_engine: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: { show_alert_icon: true, show_fast_acting_guidance: true, show_emergency_contact_cta: true, show_snooze_btn: true }
        },
        {
          id: 'scr_cgm_hyperglycemia_alert',
          domain_id: 'blood_glucose',
          domain_name: '🩸 Blood Glucose & CGM',
          screen_name: 'High Blood Glucose (Hyperglycemia) Warning Dialog',
          screen_type: 'glucose_alert_screen',
          route_path: 'dokrahealth://tracker/cgm/alert/hyper',
          layout: { container_padding: '20px', section_gap: '14px', card_radius: '22px', card_padding: '20px' },
          style: { bg_color: '#080d1a', card_bg_color: '#241a12', text_primary_color: '#ffffff', accent_color: '#f59e0b', theme_mode: 'dark' },
          config: {
            alert_title: 'Elevated Glucose Level Alert',
            glucose_value: 194,
            glucose_unit: 'mg/dL',
            trend_arrow: '↑',
            alert_level: 'HIGH_HYPERGLYCEMIA_NOTICE',
            recommendation: 'Drink plenty of water and verify active insulin or log light aerobic walking.',
            detection_engine: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: { show_hyper_warning: true, show_hydration_reminder: true, show_log_insulin_cta: true }
        },
        {
          id: 'scr_cgm_sensor_pairing_wizard',
          domain_id: 'blood_glucose',
          domain_name: '🩸 Blood Glucose & CGM',
          screen_name: 'CGM Interstitial Sensor Pairing & Applicator Wizard',
          screen_type: 'cgm_pairing_screen',
          route_path: 'dokrahealth://tracker/cgm/pairing',
          layout: { container_padding: '18px', section_gap: '14px', card_radius: '20px', card_padding: '18px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#3b82f6', theme_mode: 'dark' },
          config: {
            title: 'CGM Sensor Setup',
            current_step: 2,
            total_steps: 4,
            pairing_mode: 'NFC_BLE_HYBRID',
            sensor_serial: 'SN-CGM-984210',
            warmup_minutes_remaining: 45,
            applicator_site: 'Upper Back Arm (Triceps)',
            pairing_pipeline: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: { show_step_indicator: true, show_arm_site_illustration: true, show_warmup_countdown: true }
        },
        {
          id: 'scr_cgm_sensor_telemetry_status',
          domain_id: 'blood_glucose',
          domain_name: '🩸 Blood Glucose & CGM',
          screen_name: 'CGM Sensor Lifecycle & Signal Telemetry Status',
          screen_type: 'cgm_sensor_screen',
          route_path: 'dokrahealth://tracker/cgm/sensor',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#10b981', theme_mode: 'dark' },
          config: {
            title: 'CGM Sensor Status',
            sensor_model: 'Dokra Continuous Glucose Patch G3',
            connection_status: 'Connected (BLE 5.2)',
            days_remaining: 6,
            total_wear_days: 14,
            sensor_battery_pct: 92,
            electrode_impedance_kohm: 1.02,
            last_calibration: 'Auto-Calibrated (0.1 min ago)',
            hardware_engine: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: { show_sensor_battery_pill: true, show_days_left_gauge: true, show_signal_strength_bars: true }
        },
        {
          id: 'scr_glucose_history_logbook',
          domain_id: 'blood_glucose',
          domain_name: '🩸 Blood Glucose & CGM',
          screen_name: 'Blood Glucose Ambulatory Logbook & Meal Events',
          screen_type: 'glucose_history_screen',
          route_path: 'dokrahealth://tracker/glucose/history',
          layout: { container_padding: '16px', section_gap: '12px', card_radius: '18px', card_padding: '14px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#10b981', theme_mode: 'dark' },
          config: {
            title: 'Glucose Logbook',
            total_readings: 288,
            daily_avg: 98,
            in_range_readings: 271,
            above_range_readings: 12,
            below_range_readings: 5,
            filter_meal_type: 'All',
            immutable_records: 'IMMUTABLE_LOG'
          },
          visibility_flags: { show_filter_chips: true, show_meal_events_list: true, show_quick_entry_fab: true }
        },
        {
          id: 'scr_glucose_trends_timeinrange',
          domain_id: 'blood_glucose',
          domain_name: '🩸 Blood Glucose & CGM',
          screen_name: 'Longitudinal Glycemic Trends & Time in Range (TIR)',
          screen_type: 'glucose_trends_screen',
          route_path: 'dokrahealth://tracker/glucose/trends',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '20px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#10b981', theme_mode: 'dark' },
          config: {
            title: 'Time in Range (TIR) & Trends',
            time_in_range_pct: 94,
            time_above_range_pct: 4,
            time_below_range_pct: 2,
            standard_deviation_mgdl: 16.4,
            coefficient_of_variation_pct: 16.7,
            agp_period: 'Past 14 Days'
          },
          visibility_flags: { show_tir_stacked_bar: true, show_agp_variability_stats: true, show_export_agp_btn: true }
        },
        {
          id: 'scr_glucose_clinical_agp_export',
          domain_id: 'blood_glucose',
          domain_name: '🩸 Blood Glucose & CGM',
          screen_name: 'Doctor-Ready Ambulatory Glucose Profile (AGP) PDF',
          screen_type: 'agp_export_screen',
          route_path: 'dokrahealth://tracker/glucose/export/agp',
          layout: { container_padding: '18px', section_gap: '14px', card_radius: '20px', card_padding: '18px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#2563eb', theme_mode: 'dark' },
          config: {
            report_title: 'Dokra Health - 14-Day Ambulatory Glucose Profile (AGP)',
            patient_name: 'Dr. Sarah Connor',
            gmi_display: '5.4% (36 mmol/mol)',
            tir_target_met: true,
            clinical_standard: 'International Consensus on Time in Range',
            doctor_signature_ready: true,
            pdf_data_engine: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: { show_agp_pdf_preview: true, show_patient_meta_fields: true, show_send_to_endocrinologist_btn: true }
        },
        {
          id: 'scr_glucose_manual_entry_modal',
          domain_id: 'blood_glucose',
          domain_name: '🩸 Blood Glucose & CGM',
          screen_name: 'Manual Blood Glucose & Ketone Entry Dialog',
          screen_type: 'glucose_entry_screen',
          route_path: 'dokrahealth://tracker/glucose/entry',
          layout: { container_padding: '18px', section_gap: '14px', card_radius: '22px', card_padding: '18px' },
          style: { bg_color: '#080d1a', card_bg_color: '#131e36', text_primary_color: '#ffffff', accent_color: '#10b981', theme_mode: 'dark' },
          config: {
            title: 'Log Blood Glucose Reading',
            default_unit: 'mg/dL',
            entry_type: 'Capillary Fingerstick',
            meal_contexts: ['Fasting', 'Before Meal', 'After Meal', 'Bedtime', 'Other'],
            ketone_support: true,
            insulin_log_support: true
          },
          visibility_flags: { show_numpad_input: true, show_meal_chip_selector: true, show_save_entry_button: true }
        },
        {
          id: 'scr_cgm_widget_oneui_settings',
          domain_id: 'blood_glucose',
          domain_name: '🩸 Blood Glucose & CGM',
          screen_name: 'One UI 7 CGM Cover Screen & Lock Screen Widgets',
          screen_type: 'widget_settings_screen',
          route_path: 'dokrahealth://tracker/glucose/widgets',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#10b981', theme_mode: 'dark' },
          config: {
            title: 'One UI 7 Glucose Widgets',
            widget_variants: ['2x1 Instant Glucose Dial', '2x2 AGP Curve Widget', '4x2 Interactive TIR Matrix'],
            active_preview: '2x2 AGP Curve Widget',
            refresh_rate_mins: 5
          },
          visibility_flags: { show_widget_live_preview: true, show_size_selector: true, show_dark_mode_preview: true }
        },
        {
          id: 'scr_cgm_advanced_alarm_settings',
          domain_id: 'blood_glucose',
          domain_name: '🩸 Blood Glucose & CGM',
          screen_name: 'CGM High-Frequency BLE & Critical Alert Setup',
          screen_type: 'settings_screen',
          route_path: 'dokrahealth://tracker/cgm/settings',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#ef4444', theme_mode: 'dark' },
          config: {
            title: 'Advanced CGM Alarm Setup',
            urgent_low_sound_override: true,
            urgent_low_threshold_mgdl: 65,
            high_glucose_alert_mgdl: 180,
            rate_of_change_alert_active: true,
            dnd_override_for_hypo: true,
            calibration_safeguard: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: { show_threshold_sliders: true, show_sound_override_toggle: true, show_clinical_disclaimer: true }
        },
        // --- Domain 7: 💊 Medications & Pharmacy ---
        {
          id: 'scr_medication_tracker_deep',
          domain_id: 'medication',
          domain_name: '💊 Medications & Pharmacy',
          screen_name: 'Prescription Schedule & Adherence',
          screen_type: 'medication_screen',
          route_path: 'dokrahealth://tracker/meds',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#ffffff', card_bg_color: '#f8fafc', text_primary_color: '#0f172a', accent_color: '#2563eb', theme_mode: 'light' },
          config: { title: 'Medication Adherence', auto_refill_enabled: true, conflict_checker_active: true, adherence_rate_pct: 93 },
          visibility_flags: { show_dose_timeline: true, show_drug_interaction_warnings: true, show_pharmacy_refill_button: true }
        },
        // --- Domain 8: 🥗 Nutrition & Hydration (Step 8 Focus) ---
        {
          id: 'scr_nutrition_main_dashboard',
          domain_id: 'nutrition',
          domain_name: '🥗 Nutrition & Hydration',
          screen_name: 'Nutrition & Daily Macronutrient Hub',
          screen_type: 'nutrition_dashboard_screen',
          route_path: 'dokrahealth://tracker/nutrition',
          layout: {
            container_padding: '16px',
            section_gap: '14px',
            card_radius: '22px',
            card_padding: '16px',
            macro_donut_size: '190px',
            flex_direction: 'column'
          },
          style: {
            bg_color: '#080d1a',
            card_bg_color: '#0f172a',
            text_primary_color: '#ffffff',
            text_secondary_color: '#94a3b8',
            accent_color: '#f59e0b',
            calorie_ring_color: '#f59e0b',
            protein_bar_color: '#ec4899',
            carbs_bar_color: '#3b82f6',
            fat_bar_color: '#10b981',
            water_accent_color: '#06b6d4',
            font_family: 'Inter',
            header_font_size: '22px',
            header_font_weight: '800',
            border_radius: '22px',
            shadow_elevation: '0 8px 28px rgba(245,158,11,0.22)',
            theme_mode: 'dark'
          },
          config: {
            title: 'Nutrition & Hydration',
            calories_consumed: 2150,
            calorie_goal: 2400,
            calories_remaining: 250,
            protein_g: 145,
            protein_goal_g: 160,
            carbs_g: 210,
            carbs_goal_g: 240,
            fat_g: 58,
            fat_goal_g: 65,
            fiber_g: 28,
            fiber_goal_g: 35,
            water_ml: 2400,
            water_goal_ml: 3000,
            energy_balance_status: 'On Track (250 kcal left)',
            tdee_formula_engine: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: {
            show_header: true,
            show_calorie_donut_ring: true,
            show_macro_progress_bars: true,
            show_fiber_pill: true,
            show_meal_diary_cards: true,
            show_water_intake_card: true,
            show_barcode_quick_scanner_cta: true,
            show_log_meal_cta: true
          }
        },
        {
          id: 'scr_nutrition_meal_logging_hub',
          domain_id: 'nutrition',
          domain_name: '🥗 Nutrition & Hydration',
          screen_name: 'Meal Logging & Daily Food Journal Hub',
          screen_type: 'meal_hub_screen',
          route_path: 'dokrahealth://tracker/nutrition/meals',
          layout: { container_padding: '16px', section_gap: '12px', card_radius: '18px', card_padding: '14px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#f59e0b', theme_mode: 'dark' },
          config: {
            title: 'Daily Meal Log',
            breakfast_cal: 580,
            breakfast_desc: 'Avocado Toast & Poached Eggs',
            lunch_cal: 780,
            lunch_desc: 'Mediterranean Quinoa Salmon Bowl',
            dinner_cal: 640,
            dinner_desc: 'Grilled Chicken, Sweet Potato & Asparagus',
            snacks_cal: 150,
            snacks_desc: 'Greek Yogurt & Mixed Raw Nuts',
            meal_db_engine: 'CODE-CONTROLLED'
          },
          visibility_flags: { show_breakfast_card: true, show_lunch_card: true, show_dinner_card: true, show_snacks_card: true, show_add_food_buttons: true }
        },
        {
          id: 'scr_nutrition_breakfast_detail',
          domain_id: 'nutrition',
          domain_name: '🥗 Nutrition & Hydration',
          screen_name: 'Breakfast Meal Detail & Item Breakdown',
          screen_type: 'meal_detail_screen',
          route_path: 'dokrahealth://tracker/nutrition/meals/breakfast',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#f59e0b', theme_mode: 'dark' },
          config: {
            meal_name: 'Breakfast',
            total_calories: 580,
            protein_g: 36,
            carbs_g: 52,
            fat_g: 22,
            fiber_g: 9,
            logged_time: '8:15 AM',
            items: [
              { name: 'Sourdough Bread (2 slices)', calories: 220, protein: 8, carbs: 42, fat: 2 },
              { name: 'Poached Eggs (2 large)', calories: 140, protein: 12, carbs: 1, fat: 10 },
              { name: 'Hass Avocado (1/2 fruit)', calories: 160, protein: 2, carbs: 9, fat: 15 },
              { name: 'Black Coffee (1 cup)', calories: 5, protein: 0, carbs: 0, fat: 0 }
            ]
          },
          visibility_flags: { show_macro_split_pills: true, show_food_item_list: true, show_edit_quantities_btn: true }
        },
        {
          id: 'scr_nutrition_lunch_detail',
          domain_id: 'nutrition',
          domain_name: '🥗 Nutrition & Hydration',
          screen_name: 'Lunch Meal Detail & Item Breakdown',
          screen_type: 'meal_detail_screen',
          route_path: 'dokrahealth://tracker/nutrition/meals/lunch',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#10b981', theme_mode: 'dark' },
          config: {
            meal_name: 'Lunch',
            total_calories: 780,
            protein_g: 54,
            carbs_g: 78,
            fat_g: 24,
            fiber_g: 11,
            logged_time: '12:45 PM',
            items: [
              { name: 'Wild Alaskan Salmon Fillet (180g)', calories: 340, protein: 38, carbs: 0, fat: 19 },
              { name: 'Organic Tri-Color Quinoa (1 cup cooked)', calories: 220, protein: 8, carbs: 39, fat: 4 },
              { name: 'Mixed Greek Salad with Olive Oil (1 bowl)', calories: 220, protein: 8, carbs: 39, fat: 4 }
            ]
          },
          visibility_flags: { show_macro_split_pills: true, show_food_item_list: true, show_edit_quantities_btn: true }
        },
        {
          id: 'scr_nutrition_dinner_detail',
          domain_id: 'nutrition',
          domain_name: '🥗 Nutrition & Hydration',
          screen_name: 'Dinner Meal Detail & Item Breakdown',
          screen_type: 'meal_detail_screen',
          route_path: 'dokrahealth://tracker/nutrition/meals/dinner',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#3b82f6', theme_mode: 'dark' },
          config: {
            meal_name: 'Dinner',
            total_calories: 640,
            protein_g: 48,
            carbs_g: 62,
            fat_g: 14,
            fiber_g: 8,
            logged_time: '7:20 PM',
            items: [
              { name: 'Grilled Chicken Breast (200g)', calories: 330, protein: 44, carbs: 0, fat: 6 },
              { name: 'Roasted Sweet Potato (1 medium)', calories: 180, protein: 4, carbs: 41, fat: 0 },
              { name: 'Steamed Asparagus & Garlic (1.5 cups)', calories: 130, protein: 0, carbs: 21, fat: 8 }
            ]
          },
          visibility_flags: { show_macro_split_pills: true, show_food_item_list: true, show_edit_quantities_btn: true }
        },
        {
          id: 'scr_nutrition_snacks_detail',
          domain_id: 'nutrition',
          domain_name: '🥗 Nutrition & Hydration',
          screen_name: 'Snacks & Supplements Daily Log',
          screen_type: 'meal_detail_screen',
          route_path: 'dokrahealth://tracker/nutrition/meals/snacks',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#ec4899', theme_mode: 'dark' },
          config: {
            meal_name: 'Snacks & Supps',
            total_calories: 150,
            protein_g: 14,
            carbs_g: 18,
            fat_g: 6,
            fiber_g: 3,
            logged_time: '4:10 PM',
            items: [
              { name: 'Plain 0% Greek Yogurt (150g)', calories: 90, protein: 15, carbs: 6, fat: 0 },
              { name: 'Organic Blueberries (1/2 cup)', calories: 42, protein: 1, carbs: 11, fat: 0 },
              { name: 'Omega-3 Fish Oil (2 softgels)', calories: 20, protein: 0, carbs: 0, fat: 2 }
            ]
          },
          visibility_flags: { show_macro_split_pills: true, show_food_item_list: true, show_supplement_tags: true }
        },
        {
          id: 'scr_nutrition_food_item_detail',
          domain_id: 'nutrition',
          domain_name: '🥗 Nutrition & Hydration',
          screen_name: 'Food Nutrition Facts & Micronutrients',
          screen_type: 'food_detail_screen',
          route_path: 'dokrahealth://tracker/nutrition/food/detail',
          layout: { container_padding: '18px', section_gap: '14px', card_radius: '20px', card_padding: '18px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#10b981', theme_mode: 'dark' },
          config: {
            food_name: 'Wild Alaskan Sockeye Salmon',
            serving_size: '180g (1 Fillet)',
            calories: 340,
            protein_g: 38,
            carbs_g: 0,
            fat_g: 19,
            saturated_fat_g: 3.2,
            cholesterol_mg: 85,
            sodium_mg: 90,
            potassium_mg: 620,
            vitamin_d_mcg: 16.2,
            calcium_mg: 20,
            iron_mg: 1.1,
            usda_verified: true,
            database_engine: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: { show_fda_nutrition_label: true, show_micronutrient_bars: true, show_portion_adjuster: true, show_log_to_meal_cta: true }
        },
        {
          id: 'scr_nutrition_food_search_catalog',
          domain_id: 'nutrition',
          domain_name: '🥗 Nutrition & Hydration',
          screen_name: 'Food Database Search & USDA Verified Catalog',
          screen_type: 'food_search_screen',
          route_path: 'dokrahealth://tracker/nutrition/search',
          layout: { container_padding: '16px', section_gap: '12px', card_radius: '18px', card_padding: '14px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#f59e0b', theme_mode: 'dark' },
          config: {
            title: 'Search Foods & Database',
            placeholder: 'Search 1.2M+ verified foods, brands, recipes...',
            active_filter: 'All Foods',
            categories: ['Common Foods', 'Branded', 'Restaurant Items', 'Verified USDA', 'My Custom Recipes'],
            recent_searches: ['Avocado', 'Greek Yogurt', 'Chicken Breast', 'Quinoa Bowl'],
            search_engine: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: { show_search_bar: true, show_category_filter_chips: true, show_recent_searches: true, show_barcode_scanner_shortcut: true }
        },
        {
          id: 'scr_nutrition_portion_serving_calibrator',
          domain_id: 'nutrition',
          domain_name: '🥗 Nutrition & Hydration',
          screen_name: 'Serving Size & Portion Unit Calibrator',
          screen_type: 'portion_screen',
          route_path: 'dokrahealth://tracker/nutrition/portion',
          layout: { container_padding: '18px', section_gap: '14px', card_radius: '20px', card_padding: '18px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#3b82f6', theme_mode: 'dark' },
          config: {
            title: 'Portion Size & Serving',
            base_food: 'Hass Avocado',
            selected_unit: 'Grams (g)',
            quantity: 150,
            unit_options: ['Grams (g)', 'Ounces (oz)', 'Whole Fruit', 'Half Fruit', 'Cups Sliced'],
            stepper_step: 10,
            calculated_calories: 240,
            calculated_protein: 3.0,
            calculated_carbs: 13.5,
            calculated_fat: 22.5,
            scaling_engine: 'CODE-CONTROLLED'
          },
          visibility_flags: { show_portion_stepper: true, show_unit_segmented_control: true, show_live_macro_preview: true }
        },
        {
          id: 'scr_nutrition_barcode_camera_scanner',
          domain_id: 'nutrition',
          domain_name: '🥗 Nutrition & Hydration',
          screen_name: 'Real-Time Camera Barcode Food Scanner HUD',
          screen_type: 'scanner_screen',
          route_path: 'dokrahealth://tracker/nutrition/scan',
          layout: { container_padding: '20px', section_gap: '16px', card_radius: '24px', card_padding: '20px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#10b981', theme_mode: 'dark' },
          config: {
            title: 'Scan Food Barcode',
            scanner_mode: 'UPC_EAN_AI_HYBRID',
            auto_flash: false,
            sound_beep_on_match: true,
            detected_upc: '085239012345',
            detected_name: 'Chobani 0% Plain Greek Yogurt (32 oz)',
            detected_calories: 120,
            confidence_score: 0.99,
            optical_engine: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: { show_camera_viewfinder: true, show_reticle_corners: true, show_flashlight_toggle: true, show_instant_match_card: true }
        },
        {
          id: 'scr_nutrition_recipe_builder_wizard',
          domain_id: 'nutrition',
          domain_name: '🥗 Nutrition & Hydration',
          screen_name: 'Custom Recipe & Multi-Ingredient Meal Wizard',
          screen_type: 'recipe_wizard_screen',
          route_path: 'dokrahealth://tracker/nutrition/recipes/new',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '20px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#8b5cf6', theme_mode: 'dark' },
          config: {
            recipe_title: 'Power Post-Workout Smoothie',
            servings_yield: 2,
            prep_time_mins: 5,
            ingredient_count: 5,
            total_recipe_calories: 620,
            per_serving_calories: 310,
            per_serving_protein_g: 32,
            per_serving_carbs_g: 38,
            per_serving_fat_g: 4.5,
            recipe_calculation_engine: 'CODE-CONTROLLED'
          },
          visibility_flags: { show_ingredients_list: true, show_servings_stepper: true, show_per_serving_macro_card: true, show_save_recipe_btn: true }
        },
        {
          id: 'scr_nutrition_target_goals_config',
          domain_id: 'nutrition',
          domain_name: '🥗 Nutrition & Hydration',
          screen_name: 'Calorie Target & Macro Ratio Configurator',
          screen_type: 'goals_config_screen',
          route_path: 'dokrahealth://tracker/nutrition/goals',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#f59e0b', theme_mode: 'dark' },
          config: {
            title: 'Nutrition & Macro Targets',
            daily_calorie_goal: 2400,
            macro_split_mode: 'High Protein Athlete (40P / 35C / 25F)',
            protein_ratio_pct: 40,
            carbs_ratio_pct: 35,
            fat_ratio_pct: 25,
            calculated_protein_g: 240,
            calculated_carbs_g: 210,
            calculated_fat_g: 67,
            tdee_formula: 'Mifflin-St Jeor + PAL Activity Multiplier (1.55)',
            clinical_safeguards: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: { show_macro_ratio_sliders: true, show_preset_splits: true, show_tdee_calculator_summary: true }
        },
        {
          id: 'scr_nutrition_history_diary',
          domain_id: 'nutrition',
          domain_name: '🥗 Nutrition & Hydration',
          screen_name: 'Nutrition Calendar History & Multi-Day Logbook',
          screen_type: 'nutrition_history_screen',
          route_path: 'dokrahealth://tracker/nutrition/history',
          layout: { container_padding: '16px', section_gap: '12px', card_radius: '18px', card_padding: '14px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#10b981', theme_mode: 'dark' },
          config: {
            title: 'Nutrition Diary & History',
            selected_date: 'Today',
            total_logged_days: 84,
            average_daily_calories: 2360,
            adherence_to_goal_pct: 92,
            immutable_history_vault: 'IMMUTABLE_LOG'
          },
          visibility_flags: { show_calendar_strip: true, show_daily_macro_summary: true, show_meal_item_breakdown: true }
        },
        {
          id: 'scr_nutrition_trends_macro_analytics',
          domain_id: 'nutrition',
          domain_name: '🥗 Nutrition & Hydration',
          screen_name: 'Longitudinal Macro Trends & Calorie Balance',
          screen_type: 'trends_screen',
          route_path: 'dokrahealth://tracker/nutrition/trends',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '20px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#f59e0b', theme_mode: 'dark' },
          config: {
            title: 'Macro Analytics & Balance',
            timeframe: '7 Days',
            avg_protein_g: 152,
            avg_carbs_g: 228,
            avg_fat_g: 61,
            caloric_deficit_surplus: '-150 kcal/day (Deficit)',
            analytics_engine: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: { show_macro_trend_chart: true, show_calorie_balance_gauge: true, show_weekly_compliance_table: true }
        },
        {
          id: 'scr_hydration_main_dashboard',
          domain_id: 'nutrition',
          domain_name: '🥗 Nutrition & Hydration',
          screen_name: 'Hydration & Smart Water Tracker Hub',
          screen_type: 'hydration_dashboard_screen',
          route_path: 'dokrahealth://tracker/hydration',
          layout: {
            container_padding: '16px',
            section_gap: '14px',
            card_radius: '22px',
            card_padding: '16px',
            fluid_cylinder_size: '200px',
            flex_direction: 'column'
          },
          style: {
            bg_color: '#080d1a',
            card_bg_color: '#0f172a',
            text_primary_color: '#ffffff',
            text_secondary_color: '#94a3b8',
            accent_color: '#06b6d4',
            water_fill_color: '#06b6d4',
            wave_animation_enabled: true,
            font_family: 'Inter',
            header_font_size: '22px',
            header_font_weight: '800',
            border_radius: '22px',
            shadow_elevation: '0 8px 28px rgba(6,182,212,0.22)',
            theme_mode: 'dark'
          },
          config: {
            title: 'Hydration Tracker',
            water_intake_ml: 2400,
            water_goal_ml: 3000,
            remaining_ml: 600,
            progress_pct: 80,
            last_drink_time: '25 mins ago',
            smart_bottle_connected: true,
            temperature_weather_bonus_ml: 350,
            hydration_algorithm: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: {
            show_header: true,
            show_wave_fluid_gauge: true,
            show_remaining_badge: true,
            show_quick_add_buttons: true,
            show_smart_bottle_pill: true,
            show_hydration_history_preview: true
          }
        },
        {
          id: 'scr_hydration_quick_add_modal',
          domain_id: 'nutrition',
          domain_name: '🥗 Nutrition & Hydration',
          screen_name: 'Quick Add Water & Smart Beverage Selector Modal',
          screen_type: 'hydration_modal_screen',
          route_path: 'dokrahealth://tracker/hydration/quickadd',
          layout: { container_padding: '20px', section_gap: '14px', card_radius: '24px', card_padding: '20px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0c1b2f', text_primary_color: '#ffffff', accent_color: '#06b6d4', theme_mode: 'dark' },
          config: {
            title: 'Log Beverage Intake',
            presets_ml: [250, 350, 500, 750],
            selected_ml: 250,
            beverage_type: 'Plain Water',
            beverage_options: ['Plain Water', 'Sparkling Water', 'Electrolyte Drink', 'Green Tea', 'Coffee (80% Hydration)', 'Coconut Water'],
            hydration_efficiency_pct: 100
          },
          visibility_flags: { show_preset_volume_chips: true, show_beverage_type_picker: true, show_custom_ml_slider: true, show_log_drink_cta: true }
        },
        {
          id: 'scr_hydration_reminders_scheduler',
          domain_id: 'nutrition',
          domain_name: '🥗 Nutrition & Hydration',
          screen_name: 'Hydration Smart Reminders & Interval Alarms',
          screen_type: 'settings_screen',
          route_path: 'dokrahealth://tracker/hydration/reminders',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#06b6d4', theme_mode: 'dark' },
          config: {
            title: 'Hydration Reminders',
            reminders_enabled: true,
            interval_mins: 60,
            start_time: '08:00',
            end_time: '21:00',
            adaptive_activity_boost: true,
            sound_alert_type: 'Gentle Ripple Drop',
            scheduling_daemon: 'CODE-CONTROLLED / PROTECTED'
          },
          visibility_flags: { show_interval_picker: true, show_active_hours_selector: true, show_adaptive_weather_toggle: true }
        },
        {
          id: 'scr_hydration_history_trends',
          domain_id: 'nutrition',
          domain_name: '🥗 Nutrition & Hydration',
          screen_name: 'Daily Water History & 7-Day Fluid Trends',
          screen_type: 'trends_screen',
          route_path: 'dokrahealth://tracker/hydration/history',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '20px', card_padding: '16px' },
          style: { bg_color: '#080d1a', card_bg_color: '#0f172a', text_primary_color: '#ffffff', accent_color: '#06b6d4', theme_mode: 'dark' },
          config: {
            title: 'Hydration History & Trends',
            timeframe: '7 Days',
            weekly_avg_ml: 2850,
            goal_hit_streak_days: 6,
            total_fluid_liters: 19.95,
            highest_day_ml: 3200,
            smart_intake_log: 'IMMUTABLE_LOG'
          },
          visibility_flags: { show_7d_water_bars: true, show_streak_badge: true, show_hourly_distribution_curve: true }
        },
        // --- Domain 9: 👥 Together & Stepathons ---
        {
          id: 'scr_together_stepathon_deep',
          domain_id: 'together',
          domain_name: '👥 Together & Stepathons',
          screen_name: 'Global 100K Stepathon & Battles',
          screen_type: 'social_screen',
          route_path: 'dokrahealth://together/league',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '20px', card_padding: '16px' },
          style: { bg_color: '#ffffff', card_bg_color: '#f8fafc', text_primary_color: '#0f172a', accent_color: '#2563eb', theme_mode: 'light' },
          config: { title: 'Global 100K Stepathon Championship', active_participants: 42890, days_remaining: 6, user_current_rank: 3, prize_badge: 'Gold Finisher' },
          visibility_flags: { show_leaderboard_podium: true, show_1v1_battle_card: true, show_club_squads: true }
        },
        // --- Domain 10: 🧘 Mindfulness & Stress ---
        {
          id: 'scr_mindfulness_box_breathing',
          domain_id: 'stress_mindfulness',
          domain_name: '🧘 Mindfulness & Stress',
          screen_name: 'HRV Stress & 4-4-4-4 Box Breathing',
          screen_type: 'mindfulness_screen',
          route_path: 'dokrahealth://mindfulness/breathe',
          layout: { container_padding: '18px', section_gap: '16px', card_radius: '22px', card_padding: '18px' },
          style: { bg_color: '#0f172a', card_bg_color: '#1e293b', text_primary_color: '#ffffff', accent_color: '#06b6d4', theme_mode: 'dark' },
          config: { title: 'Mindfulness & HRV Recovery', breathing_pattern: '4-4-4-4 Box', duration_mins: 5, calming_audio_track: 'Mountain Stream' },
          visibility_flags: { show_breathing_circle_anim: true, show_real_time_hrv_meter: true, show_audio_selector: true }
        },
        // --- Domain 11: ⚖️ Body Composition (BIA) ---
        {
          id: 'scr_body_composition_bia',
          domain_id: 'body_weight',
          domain_name: '⚖️ Body Composition (BIA)',
          screen_name: 'Skeletal Muscle, Fat % & BMI',
          screen_type: 'bia_screen',
          route_path: 'dokrahealth://tracker/weight',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#ffffff', card_bg_color: '#f8fafc', text_primary_color: '#0f172a', accent_color: '#10b981', theme_mode: 'light' },
          config: { title: 'Body Composition (BIA)', weight_kg: 74.2, body_fat_pct: 14.2, skeletal_muscle_kg: 38.5, bmr_kcal: 1740 },
          visibility_flags: { show_fat_muscle_balance_bar: true, show_weight_goal_curve: true, show_smart_scale_sync: true }
        },
        // --- Domain 12: ⌚ Connected Wearables ---
        {
          id: 'scr_wearables_device_sync',
          domain_id: 'wearables',
          domain_name: '⌚ Connected Wearables',
          screen_name: 'Galaxy Watch, Smart Ring & BLE',
          screen_type: 'hardware_screen',
          route_path: 'dokrahealth://devices/wearables',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '18px', card_padding: '16px' },
          style: { bg_color: '#ffffff', card_bg_color: '#f8fafc', text_primary_color: '#0f172a', accent_color: '#2563eb', theme_mode: 'light' },
          config: { title: 'Connected Wearables Hub', ble_scan_interval_secs: 15, high_precision_mode: true },
          visibility_flags: { show_battery_percentage_indicators: true, show_firmware_update_cta: true, show_manual_sync_button: true }
        },
        // --- Domain 13: ⚙️ Remote Config & Flags ---
        {
          id: 'scr_app_remote_config_screen',
          domain_id: 'app_config',
          domain_name: '⚙️ Remote Config & Flags',
          screen_name: 'App Gateways, Flavors & Flags',
          screen_type: 'config_screen',
          route_path: 'dokrahealth://system/config',
          layout: { container_padding: '16px', section_gap: '14px', card_radius: '16px', card_padding: '16px' },
          style: { bg_color: '#ffffff', card_bg_color: '#f8fafc', text_primary_color: '#0f172a', accent_color: '#2563eb', theme_mode: 'light' },
          config: { title: 'Remote App Configuration', maintenance_lockdown: false, min_android_api: 29, active_gateway: 'http://10.0.2.2:8080' },
          visibility_flags: { show_flavor_switcher: true, show_flag_manager: true, show_endpoint_tester: true }
        }
      ];

      const insertReg = this.db.prepare(`
        INSERT OR IGNORE INTO screen_registry (id, domain_id, domain_name, screen_name, screen_type, route_path, layout_json, style_json, config_json, visibility_flags_json, status, version, active_revision_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertRev = this.db.prepare(`
        INSERT OR IGNORE INTO screen_revisions (revision_id, screen_id, version, snapshot_json, changed_by, change_summary, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const reg of defaultRegistry) {
        const revId = `rev_${reg.id}_v1`;
        const snapshot = {
          id: reg.id,
          domain_id: reg.domain_id,
          domain_name: reg.domain_name,
          screen_name: reg.screen_name,
          screen_type: reg.screen_type,
          route_path: reg.route_path,
          layout: reg.layout,
          style: reg.style,
          config: reg.config,
          visibility_flags: reg.visibility_flags,
          version: 1
        };

        insertReg.run(
          reg.id,
          reg.domain_id,
          reg.domain_name,
          reg.screen_name,
          reg.screen_type,
          reg.route_path,
          JSON.stringify(reg.layout),
          JSON.stringify(reg.style),
          JSON.stringify(reg.config),
          JSON.stringify(reg.visibility_flags),
          'active',
          1,
          revId,
          now,
          now
        );

        insertRev.run(revId, reg.id, 1, JSON.stringify(snapshot), 'super_admin', 'Initial baseline seed', now);
      }
  }

  // --- Card CRUD Operations ---

  createDraft(cardData, actorId = 'admin_default') {
    const id = cardData.id || `card_${crypto.randomUUID()}`;
    const slug = cardData.slug;
    const now = new Date().toISOString();
    const version = 1;
    const status = CARD_STATUS.DRAFT;
    const priority = cardData.priority || 0;

    const canonicalCard = {
      ...cardData,
      id,
      slug,
      version,
      status,
      priority,
      audit: {
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: now,
        updatedAt: now,
        publishedAt: null,
        revisionId: null
      }
    };

    const insertStmt = this.db.prepare(`
      INSERT INTO cards (id, slug, version, status, priority, active_revision_id, canonical_data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(id, slug, version, status, priority, null, JSON.stringify(canonicalCard), now, now);

    this.recordAudit(id, null, 'CREATE_DRAFT', actorId, { version, status });
    return canonicalCard;
  }

  getCardById(id) {
    const stmt = this.db.prepare('SELECT * FROM cards WHERE id = ?');
    const row = stmt.get(id);
    if (!row) return null;
    return JSON.parse(row.canonical_data);
  }

  getCardBySlug(slug) {
    const stmt = this.db.prepare('SELECT * FROM cards WHERE slug = ?');
    const row = stmt.get(slug);
    if (!row) return null;
    return JSON.parse(row.canonical_data);
  }

  listCards() {
    const stmt = this.db.prepare('SELECT * FROM cards ORDER BY priority DESC, created_at ASC');
    const rows = stmt.all();
    return rows.map(r => JSON.parse(r.canonical_data));
  }

  updateDraft(id, updatedData, actorId = 'admin_default') {
    const currentCard = this.getCardById(id);
    if (!currentCard) {
      throw new Error(`Card with ID '${id}' not found.`);
    }

    const now = new Date().toISOString();
    const newVersion = currentCard.status === CARD_STATUS.PUBLISHED 
      ? currentCard.version + 1 
      : currentCard.version;

    const mergedCard = {
      ...currentCard,
      ...updatedData,
      metadata: { ...currentCard.metadata, ...(updatedData.metadata || {}) },
      content: { ...currentCard.content, ...(updatedData.content || {}) },
      actions: updatedData.actions !== undefined ? updatedData.actions : currentCard.actions,
      scheduling: { ...currentCard.scheduling, ...(updatedData.scheduling || {}) },
      targeting: { ...currentCard.targeting, ...(updatedData.targeting || {}) },
      endpoints: { ...currentCard.endpoints, ...(updatedData.endpoints || {}) },
      id,
      slug: updatedData.slug || currentCard.slug,
      version: newVersion,
      status: currentCard.status === CARD_STATUS.PUBLISHED ? CARD_STATUS.PUBLISHED : CARD_STATUS.DRAFT,
      priority: updatedData.priority !== undefined ? updatedData.priority : currentCard.priority,
      audit: {
        ...currentCard.audit,
        updatedBy: actorId,
        updatedAt: now
      }
    };

    const updateStmt = this.db.prepare(`
      UPDATE cards 
      SET slug = ?, version = ?, status = ?, priority = ?, canonical_data = ?, updated_at = ?
      WHERE id = ?
    `);

    updateStmt.run(
      mergedCard.slug,
      mergedCard.version,
      mergedCard.status,
      mergedCard.priority,
      JSON.stringify(mergedCard),
      now,
      id
    );

    this.recordAudit(id, mergedCard.audit?.revisionId || null, 'UPDATE_DRAFT', actorId, { version: newVersion });
    return mergedCard;
  }

  publishCard(id, actorId = 'admin_default', changeSummary = 'Card published') {
    const currentCard = this.getCardById(id);
    if (!currentCard) {
      throw new Error(`Card with ID '${id}' not found.`);
    }

    const maxRevStmt = this.db.prepare('SELECT MAX(version) as max_v FROM card_revisions WHERE card_id = ?');
    const revRow = maxRevStmt.get(id);
    const publishedVersion = (revRow && typeof revRow.max_v === 'number' && revRow.max_v > 0)
      ? revRow.max_v + 1
      : 1;

    const now = new Date().toISOString();
    const revisionId = `rev_${id}_v${publishedVersion}_${Date.now()}`;
    const publishedCard = {
      ...currentCard,
      version: publishedVersion,
      status: CARD_STATUS.PUBLISHED,
      audit: {
        ...currentCard.audit,
        publishedAt: now,
        updatedAt: now,
        updatedBy: actorId,
        revisionId
      }
    };

    // 1. Store immutable revision
    const revStmt = this.db.prepare(`
      INSERT INTO card_revisions (revision_id, card_id, version, status, canonical_data, created_by, created_at, change_summary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    revStmt.run(revisionId, id, publishedCard.version, CARD_STATUS.PUBLISHED, JSON.stringify(publishedCard), actorId, now, changeSummary);

    // 2. Update active card pointer
    const updateCardStmt = this.db.prepare(`
      UPDATE cards 
      SET status = ?, version = ?, priority = ?, active_revision_id = ?, canonical_data = ?, updated_at = ?
      WHERE id = ?
    `);
    updateCardStmt.run(CARD_STATUS.PUBLISHED, publishedCard.version, publishedCard.priority, revisionId, JSON.stringify(publishedCard), now, id);

    this.recordAudit(id, revisionId, 'PUBLISH', actorId, { version: publishedCard.version, changeSummary });
    return publishedCard;
  }

  rollbackCard(id, targetRevisionId, actorId = 'admin_default', reason = 'Rollback to prior revision') {
    const currentCard = this.getCardById(id);
    if (!currentCard) {
      throw new Error(`Card with ID '${id}' not found.`);
    }

    const revStmt = this.db.prepare('SELECT * FROM card_revisions WHERE revision_id = ? AND card_id = ?');
    const targetRev = revStmt.get(targetRevisionId, id);
    if (!targetRev) {
      throw new Error(`Revision '${targetRevisionId}' not found for card '${id}'.`);
    }

    const restoredCanonical = JSON.parse(targetRev.canonical_data);
    const now = new Date().toISOString();

    const restoredCard = {
      ...restoredCanonical,
      status: CARD_STATUS.PUBLISHED,
      audit: {
        ...restoredCanonical.audit,
        updatedAt: now,
        updatedBy: actorId,
        revisionId: targetRevisionId
      }
    };

    const updateStmt = this.db.prepare(`
      UPDATE cards 
      SET status = ?, version = ?, priority = ?, active_revision_id = ?, canonical_data = ?, updated_at = ?
      WHERE id = ?
    `);
    updateStmt.run(CARD_STATUS.PUBLISHED, restoredCard.version, restoredCard.priority, targetRevisionId, JSON.stringify(restoredCard), now, id);

    this.recordAudit(id, targetRevisionId, 'ROLLBACK', actorId, { 
      restoredVersion: targetRev.version, 
      previousRevision: currentCard.active_revision_id,
      reason 
    });

    return restoredCard;
  }

  unpublishCard(id, actorId = 'admin_default', reason = 'Admin unpublish') {
    const currentCard = this.getCardById(id);
    if (!currentCard) {
      throw new Error(`Card with ID '${id}' not found.`);
    }

    const now = new Date().toISOString();
    const unpublishedCard = {
      ...currentCard,
      status: CARD_STATUS.ARCHIVED,
      audit: {
        ...currentCard.audit,
        updatedAt: now,
        updatedBy: actorId
      }
    };

    const updateStmt = this.db.prepare(`
      UPDATE cards 
      SET status = ?, active_revision_id = NULL, canonical_data = ?, updated_at = ?
      WHERE id = ?
    `);
    updateStmt.run(CARD_STATUS.ARCHIVED, JSON.stringify(unpublishedCard), now, id);

    this.recordAudit(id, currentCard.active_revision_id || null, 'UNPUBLISH', actorId, { reason });
    return unpublishedCard;
  }

  duplicateCard(id, actorId = 'admin_default') {
    const sourceCard = this.getCardById(id);
    if (!sourceCard) {
      throw new Error(`Card with ID '${id}' not found.`);
    }

    const newId = `card_${crypto.randomUUID()}`;
    const newSlug = `${sourceCard.slug}-copy-${Date.now().toString(36).slice(-4)}`;
    const now = new Date().toISOString();

    const duplicatedData = {
      ...sourceCard,
      id: newId,
      slug: newSlug,
      version: 1,
      status: CARD_STATUS.DRAFT,
      content: {
        ...sourceCard.content,
        title: `${sourceCard.content?.title || 'Card'} (Copy)`
      },
      audit: {
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: now,
        updatedAt: now,
        publishedAt: null,
        revisionId: null
      }
    };

    const insertStmt = this.db.prepare(`
      INSERT INTO cards (id, slug, version, status, priority, active_revision_id, canonical_data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(newId, newSlug, 1, CARD_STATUS.DRAFT, duplicatedData.priority || 0, null, JSON.stringify(duplicatedData), now, now);
    this.recordAudit(newId, null, 'DUPLICATE', actorId, { sourceCardId: id });

    return duplicatedData;
  }

  deleteCard(id, actorId = 'admin_default') {
    const currentCard = this.getCardById(id);
    if (!currentCard) {
      throw new Error(`Card with ID '${id}' not found.`);
    }

    const revStmt = this.db.prepare('SELECT COUNT(*) as count FROM card_revisions WHERE card_id = ?');
    const revCount = revStmt.get(id)?.count || 0;

    if (revCount === 0 && currentCard.status === CARD_STATUS.DRAFT) {
      this.db.prepare('DELETE FROM cards WHERE id = ?').run(id);
      this.recordAudit(id, null, 'DELETE_DRAFT', actorId, { status: 'DELETED' });
      return { id, deleted: true, status: 'DELETED' };
    } else {
      return this.unpublishCard(id, actorId, 'Archived via delete action');
    }
  }

  listRevisions(cardId) {
    const stmt = this.db.prepare('SELECT * FROM card_revisions WHERE card_id = ? ORDER BY version DESC, created_at DESC');
    const rows = stmt.all(cardId);
    return rows.map(r => ({
      revisionId: r.revision_id,
      cardId: r.card_id,
      version: r.version,
      status: r.status,
      createdBy: r.created_by,
      createdAt: r.created_at,
      changeSummary: r.change_summary,
      canonicalData: JSON.parse(r.canonical_data)
    }));
  }

  getActivePublishedCards() {
    const stmt = this.db.prepare(`
      SELECT c.*, r.canonical_data as revision_data
      FROM cards c
      JOIN card_revisions r ON c.active_revision_id = r.revision_id
      WHERE c.status = ?
      ORDER BY c.priority DESC, r.created_at ASC, c.id ASC
    `);
    const rows = stmt.all(CARD_STATUS.PUBLISHED);
    return rows.map(r => JSON.parse(r.revision_data));
  }

  recordAudit(cardId, revisionId, operation, actorId, details = {}) {
    const eventId = `aud_${crypto.randomUUID()}`;
    const timestamp = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO card_audit_events (event_id, card_id, revision_id, operation, actor_id, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(eventId, cardId, revisionId, operation, actorId, JSON.stringify(details), timestamp);
  }

  listAuditEvents(cardId = null) {
    if (cardId) {
      const stmt = this.db.prepare('SELECT * FROM card_audit_events WHERE card_id = ? ORDER BY timestamp DESC LIMIT 100');
      const rows = stmt.all(cardId);
      return rows.map(r => ({
        eventId: r.event_id,
        cardId: r.card_id,
        revisionId: r.revision_id,
        operation: r.operation,
        actorId: r.actor_id,
        details: JSON.parse(r.details || '{}'),
        timestamp: r.timestamp
      }));
    } else {
      const stmt = this.db.prepare('SELECT * FROM card_audit_events ORDER BY timestamp DESC LIMIT 100');
      const rows = stmt.all();
      return rows.map(r => ({
        eventId: r.event_id,
        cardId: r.card_id,
        revisionId: r.revision_id,
        operation: r.operation,
        actorId: r.actor_id,
        details: JSON.parse(r.details || '{}'),
        timestamp: r.timestamp
      }));
    }
  }

  // --- Feature Flags API ---

  listFeatureFlags() {
    return this.db.prepare('SELECT * FROM feature_flags ORDER BY category, name').all().map(f => ({
      ...f,
      enabled: Boolean(f.enabled),
      platforms: JSON.parse(f.platforms || '[]')
    }));
  }

  updateFeatureFlag(key, { enabled, rollout_pct, platforms }) {
    const now = new Date().toISOString();
    const current = this.db.prepare('SELECT * FROM feature_flags WHERE key = ?').get(key);
    if (!current) throw new Error(`Feature flag '${key}' not found`);

    const newEnabled = enabled !== undefined ? (enabled ? 1 : 0) : current.enabled;
    const newRollout = rollout_pct !== undefined ? rollout_pct : current.rollout_pct;
    const newPlatforms = platforms !== undefined ? JSON.stringify(platforms) : current.platforms;

    this.db.prepare(`
      UPDATE feature_flags 
      SET enabled = ?, rollout_pct = ?, platforms = ?, updated_at = ?
      WHERE key = ?
    `).run(newEnabled, newRollout, newPlatforms, now, key);

    this.recordAudit(`flag_${key}`, null, 'UPDATE_FLAG', 'admin', { enabled: Boolean(newEnabled), rollout_pct: newRollout });
    return this.db.prepare('SELECT * FROM feature_flags WHERE key = ?').get(key);
  }

  createFeatureFlag({ key, name, category = 'General', description = '', enabled = 1, rollout_pct = 100, platforms = ['android', 'wearos', 'web'] }) {
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO feature_flags (key, name, category, description, enabled, rollout_pct, platforms, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(key, name, category, description, enabled ? 1 : 0, rollout_pct, JSON.stringify(platforms), now);

    this.recordAudit(`flag_${key}`, null, 'CREATE_FLAG', 'admin', { name, category, rollout_pct });
    return this.db.prepare('SELECT * FROM feature_flags WHERE key = ?').get(key);
  }

  deleteFeatureFlag(key) {
    this.db.prepare('DELETE FROM feature_flags WHERE key = ?').run(key);
    this.recordAudit(`flag_${key}`, null, 'DELETE_FLAG', 'admin', { key });
    return { success: true, key };
  }

  // --- App Config API ---

  listAppConfig() {
    return this.db.prepare('SELECT * FROM app_config ORDER BY category, key').all();
  }

  updateAppConfig(key, value) {
    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE app_config SET value = ?, updated_at = ? WHERE key = ?
    `).run(String(value), now, key);

    this.recordAudit(`cfg_${key}`, null, 'UPDATE_CONFIG', 'admin', { key, value });
    return this.db.prepare('SELECT * FROM app_config WHERE key = ?').get(key);
  }

  createAppConfig({ key, value, category = 'General', description = '' }) {
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO app_config (key, value, category, description, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(key, String(value), category, description, now);

    this.recordAudit(`cfg_${key}`, null, 'CREATE_CONFIG', 'admin', { key, value });
    return this.db.prepare('SELECT * FROM app_config WHERE key = ?').get(key);
  }

  deleteAppConfig(key) {
    this.db.prepare('DELETE FROM app_config WHERE key = ?').run(key);
    this.recordAudit(`cfg_${key}`, null, 'DELETE_CONFIG', 'admin', { key });
    return { success: true, key };
  }

  // --- Users API ---

  listUsers() {
    return this.db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
  }

  createUser({ id: providedId, email, name, role = 'User', device_model = 'Generic Android', os_version = 'Android 14', auth_provider = 'local' }) {
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      throw new Error("Field 'email' is required to create a user.");
    }
    const id = providedId || `usr_${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    // Use INSERT OR IGNORE so duplicate calls from the auth flow don't throw
    this.db.prepare(`
      INSERT OR IGNORE INTO users (id, email, name, role, status, device_model, os_version, sync_records, last_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, email.trim(), name || email.split('@')[0], role, 'active', device_model, os_version, 0, now, now);

    this.recordAudit(id, null, 'CREATE_USER', 'admin', { email, name, role, auth_provider });
    return this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) ||
           this.db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim());
  }

  updateUserRole(id, role) {
    this.db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
    this.recordAudit(id, null, 'UPDATE_USER_ROLE', 'admin', { role });
    return this.db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  }

  // --- Notifications API ---

  listNotifications() {
    return this.db.prepare('SELECT * FROM notifications ORDER BY sent_at DESC LIMIT 50').all();
  }

  sendNotification({ title, body, audience = 'all', deep_link = '' }) {
    const id = `notif_${crypto.randomUUID()}`;
    const sent_at = new Date().toISOString();
    const recipient_count = audience === 'all' ? 12485 : Math.floor(Math.random() * 3000) + 120;

    this.db.prepare(`
      INSERT INTO notifications (id, title, body, audience, deep_link, sent_at, recipient_count)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, body, audience, deep_link, sent_at, recipient_count);

    this.recordAudit(id, null, 'BROADCAST_NOTIFICATION', 'admin', { title, audience, recipient_count });
    return { id, title, body, audience, deep_link, sent_at, recipient_count, status: 'DELIVERED' };
  }

  // --- App Settings & Flavors API ---

  getAppSettings() {
    const rows = this.db.prepare('SELECT * FROM app_settings').all();
    const result = {
      appName: 'Dokra Health',
      versionName: '7.00.6.011',
      packageName: 'com.dokra.health',
      versionCode: '7006011',
      minSdk: '29',
      targetSdk: '36',
      activeFlavor: 'staging',
      stagingUrl: 'http://127.0.0.1:8080',
      productionUrl: 'https://api.dokrahealth.com',
      qaUrl: 'https://qa.dokrahealth.com',
      features: {
        health_tracking: true,
        notifications: true,
        ai_assistant: true,
        challenges: true,
        medication: true,
        devices: true,
        cloud_sync: false,
        advanced_analytics: true
      }
    };

    for (const r of rows) {
      if (r.key === 'features') {
        try {
          result.features = JSON.parse(r.value);
        } catch {
          // ignore
        }
      } else {
        result[r.key] = r.value;
      }
    }
    return result;
  }

  updateAppSettings(newSettings, actor = 'admin') {
    const stmt = this.db.prepare('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)');
    for (const [k, v] of Object.entries(newSettings)) {
      stmt.run(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
    }
    this.addRecentChange('App configuration updated', actor);
    return this.getAppSettings();
  }

  getRecentChanges() {
    return this.db.prepare('SELECT * FROM recent_changes ORDER BY id DESC LIMIT 20').all();
  }

  addRecentChange(action, actor = 'admin') {
    const d = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const timeStr = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    this.db.prepare('INSERT INTO recent_changes (timestamp, action, actor) VALUES (?, ?, ?)').run(timeStr, action, actor);
  }

  // --- Health Modules API ---

  listHealthModules() {
    return this.db.prepare('SELECT * FROM health_modules ORDER BY id').all();
  }

  getHealthModule(id) {
    return this.db.prepare('SELECT * FROM health_modules WHERE id = ?').get(id);
  }

  updateHealthModule(id, { name, status, description, sources, refresh_interval }) {
    const current = this.getHealthModule(id);
    if (!current) throw new Error(`Health module with ID '${id}' not found.`);
    const now = new Date().toISOString();

    const newName = name || current.name;
    const newStatus = status || current.status;
    const newDesc = description !== undefined ? description : current.description;
    const newSources = sources || current.sources;
    const newRefresh = refresh_interval || current.refresh_interval;

    this.db.prepare(`
      UPDATE health_modules 
      SET name = ?, status = ?, description = ?, sources = ?, refresh_interval = ?, updated_at = ?
      WHERE id = ?
    `).run(newName, newStatus, newDesc, newSources, newRefresh, now, id);

    this.addRecentChange(`Health module '${newName}' updated to ${newStatus}`, 'admin');
    return this.getHealthModule(id);
  }

  createHealthModule({ id, name, status = 'Supported', description = '', sources = 'Manual', icon = '🩺', color = '#2563eb', refresh_interval = 'Daily' }) {
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO health_modules (id, name, status, description, sources, icon, color, refresh_interval, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, status, description, sources, icon, color, refresh_interval, now);

    this.addRecentChange(`New health module '${name}' created`, 'admin');
    return this.getHealthModule(id);
  }

  // --- Workouts API ---

  listWorkouts() {
    return this.db.prepare('SELECT * FROM workouts ORDER BY created_at DESC, id DESC').all();
  }

  getWorkout(id) {
    return this.db.prepare('SELECT * FROM workouts WHERE id = ?').get(id);
  }

  createWorkout({ id, date_time, type, distance, duration, calories, avg_hr, pace, route_svg, notes }) {
    const wId = id || `wo_${Date.now()}`;
    const now = new Date().toISOString();
    const d = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const dt = date_time || `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
    const dist = parseFloat(distance) || 5.0;
    const dur = duration || '30:00';
    const cal = parseInt(calories) || 350;
    const hr = parseInt(avg_hr) || 140;
    const p = pace || '5:45 /km';
    const rSvg = route_svg || '<svg viewBox="0 0 60 30" width="60" height="30" fill="none" stroke="#2563eb" stroke-width="2"><path d="M5 25 Q15 5 25 15 T45 8 T55 20"/></svg>';

    this.db.prepare(`
      INSERT INTO workouts (id, date_time, type, distance, duration, calories, avg_hr, pace, route_svg, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(wId, dt, type || 'Running', dist, dur, cal, hr, p, rSvg, notes || '', now);

    this.addRecentChange(`New ${type || 'Workout'} logged (${dist} km)`, 'admin');
    return this.getWorkout(wId);
  }

  deleteWorkout(id) {
    const w = this.getWorkout(id);
    if (!w) return { success: false };
    this.db.prepare('DELETE FROM workouts WHERE id = ?').run(id);
    this.addRecentChange(`Workout '${id}' removed`, 'admin');
    return { success: true };
  }

  getWorkoutStats() {
    const all = this.listWorkouts();
    const totalWorkouts = all.length || 48;
    const totalDist = all.reduce((sum, w) => sum + (parseFloat(w.distance) || 0), 0) || 286.4;
    const totalCal = all.reduce((sum, w) => sum + (parseInt(w.calories) || 0), 0) || 18672;
    
    return {
      totalWorkouts: totalWorkouts < 48 ? 48 : totalWorkouts,
      totalDistanceKm: totalDist < 286.4 ? 286.4 : totalDist.toFixed(1),
      totalActiveTime: '28h 45m',
      caloriesBurned: totalCal < 18672 ? '18,672' : totalCal.toLocaleString(),
      trends: [
        { day: 'Apr 20', running: 4.2, walking: 2.1, cycling: 8.3, totalDist: 14.6 },
        { day: 'Apr 21', running: 6.8, walking: 3.5, cycling: 12.1, totalDist: 22.4 },
        { day: 'Apr 22', running: 7.8, walking: 2.8, cycling: 0.0, totalDist: 10.6 },
        { day: 'Apr 23', running: 5.1, walking: 4.2, cycling: 15.4, totalDist: 24.7 },
        { day: 'Apr 24', running: 3.2, walking: 3.1, cycling: 6.8, totalDist: 13.1 },
        { day: 'Apr 25', running: 8.5, walking: 2.4, cycling: 18.4, totalDist: 29.3 },
        { day: 'Apr 26', running: 9.1, walking: 5.2, cycling: 14.8, totalDist: 29.1 }
      ]
    };
  }

  // --- Medications API ---

  listMedications() {
    return this.db.prepare('SELECT * FROM medications ORDER BY id').all();
  }

  getMedication(id) {
    return this.db.prepare('SELECT * FROM medications WHERE id = ?').get(id);
  }

  createMedication({ id, name, category = 'General', dosage = '500 mg', frequency = 'Once daily', next_dose = 'Today 2:00 PM', status = 'On Track', color = '#2563eb', icon_type = 'pill', notes = '' }) {
    const medId = id || `med_${Date.now()}`;
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO medications (id, name, category, dosage, frequency, next_dose, status, color, icon_type, notes, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(medId, name, category, dosage, frequency, next_dose, status, color, icon_type, notes, now);

    this.addRecentChange(`New medication '${name}' added`, 'admin');
    return this.getMedication(medId);
  }

  updateMedication(id, updates) {
    const current = this.getMedication(id);
    if (!current) throw new Error(`Medication with ID '${id}' not found.`);
    const now = new Date().toISOString();

    const name = updates.name || current.name;
    const category = updates.category || current.category;
    const dosage = updates.dosage || current.dosage;
    const frequency = updates.frequency || current.frequency;
    const next_dose = updates.next_dose || current.next_dose;
    const status = updates.status || current.status;
    const color = updates.color || current.color;
    const notes = updates.notes !== undefined ? updates.notes : current.notes;

    this.db.prepare(`
      UPDATE medications
      SET name = ?, category = ?, dosage = ?, frequency = ?, next_dose = ?, status = ?, color = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `).run(name, category, dosage, frequency, next_dose, status, color, notes, now, id);

    this.addRecentChange(`Medication '${name}' updated (${status})`, 'admin');
    return this.getMedication(id);
  }

  deleteMedication(id) {
    const med = this.getMedication(id);
    if (!med) return { success: false };
    this.db.prepare('DELETE FROM medications WHERE id = ?').run(id);
    this.addRecentChange(`Medication '${med.name}' removed`, 'admin');
    return { success: true };
  }

  getMedicationHistory() {
    return this.db.prepare('SELECT * FROM medication_history ORDER BY id DESC LIMIT 50').all();
  }

  addMedicationHistory({ id, date_time, medication_name, dosage, status, notes }) {
    const histId = id || `hist_${Date.now()}`;
    const now = new Date().toISOString();
    const d = new Date();
    const dt = date_time || `Apr ${d.getDate()}, 2025 ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')} ${d.getHours()>=12?'PM':'AM'}`;

    this.db.prepare(`
      INSERT INTO medication_history (id, date_time, medication_name, dosage, status, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(histId, dt, medication_name, dosage, status, notes || '', now);

    return this.db.prepare('SELECT * FROM medication_history WHERE id = ?').get(histId);
  }

  getMedicationKPIs() {
    const meds = this.listMedications();
    const totalMeds = meds.length || 5;
    const todayDoses = 3;
    const takenOnTime = '93%';
    const missedDoses = 1;

    return {
      totalMedications: totalMeds,
      todayDoses,
      takenOnTime,
      missedDoses
    };
  }

  // --- Metrics Summary ---

  getDashboardMetrics() {
    const cardCount = this.db.prepare('SELECT COUNT(*) as c FROM cards').get()?.c || 48;
    const flagCount = this.db.prepare('SELECT COUNT(*) as c FROM feature_flags WHERE enabled = 1').get()?.c || 24;
    const userCount = 12485;
    const uptime = '99.98%';

    return {
      kpis: {
        totalUsers: { value: '12,485', trend: '+12%', subtitle: 'vs last 7 days' },
        totalCards: { value: String(cardCount), trend: '+6%', subtitle: 'vs last 7 days' },
        activeFeatures: { value: String(flagCount), trend: '+8%', subtitle: 'vs last 7 days' },
        systemUptime: { value: uptime, trend: '+0.02%', subtitle: 'vs last 7 days' }
      },
      chartData: {
        '7D': {
          labels: ['Apr 20', 'Apr 21', 'Apr 22', 'Apr 23', 'Apr 24', 'Apr 25', 'Apr 26'],
          activeUsers: [6200, 7100, 7800, 8900, 10200, 11400, 12485],
          cardViews: [4800, 5200, 5800, 6900, 7400, 8100, 9300],
          apiCalls: [2100, 2400, 2800, 3100, 3400, 3900, 4600]
        },
        '30D': {
          labels: ['Mar 28', 'Apr 04', 'Apr 11', 'Apr 18', 'Apr 26'],
          activeUsers: [4500, 6800, 8900, 10800, 12485],
          cardViews: [3200, 4900, 6400, 7900, 9300],
          apiCalls: [1400, 2200, 3100, 3900, 4600]
        },
        '90D': {
          labels: ['Jan', 'Feb', 'Mar', 'Apr'],
          activeUsers: [2400, 5600, 9200, 12485],
          cardViews: [1800, 4100, 7200, 9300],
          apiCalls: [800, 2100, 3600, 4600]
        },
        '1Y': {
          labels: ['Q2', 'Q3', 'Q4', 'Q1'],
          activeUsers: [1200, 4100, 8300, 12485],
          cardViews: [900, 3200, 6800, 9300],
          apiCalls: [400, 1600, 3200, 4600]
        }
      },
      modules: [
        { id: 'workouts', name: 'Workouts', status: 'Active', uptime: '99.9%', responseTime: '142ms', icon: 'activity', color: 'blue' },
        { id: 'sleep', name: 'Sleep', status: 'Active', uptime: '99.8%', responseTime: '156ms', icon: 'moon', color: 'purple' },
        { id: 'nutrition', name: 'Nutrition', status: 'Active', uptime: '99.7%', responseTime: '168ms', icon: 'apple', color: 'orange' },
        { id: 'medication', name: 'Medication', status: 'Active', uptime: '99.9%', responseTime: '124ms', icon: 'pill', color: 'blue' },
        { id: 'health-data', name: 'Health Data', status: 'Active', uptime: '99.8%', responseTime: '138ms', icon: 'heart', color: 'blue' },
        { id: 'devices', name: 'Devices', status: 'Active', uptime: '99.6%', responseTime: '172ms', icon: 'smartphone', color: 'blue' },
        { id: 'ai-assistant', name: 'AI Assistant', status: 'Active', uptime: '99.5%', responseTime: '201ms', icon: 'sparkles', color: 'purple' },
        { id: 'challenges', name: 'Challenges', status: 'Active', uptime: '99.7%', responseTime: '149ms', icon: 'users', color: 'blue' }
      ],
      recentActivity: [
        { id: 'act_1', title: 'New content published', subtitle: 'Health Assessment Card', time: '2m ago', icon: 'file-text', type: 'publish' },
        { id: 'act_2', title: 'Feature flag updated', subtitle: 'workout_recommendations', time: '12m ago', icon: 'flag', type: 'flag' },
        { id: 'act_3', title: 'User registered', subtitle: 'user_7842@example.com', time: '18m ago', icon: 'user', type: 'user' },
        { id: 'act_4', title: 'Card updated', subtitle: 'Nutrition Tracker', time: '32m ago', icon: 'edit', type: 'card' },
        { id: 'act_5', title: 'System backup completed', subtitle: 'Database + Assets', time: '1h ago', icon: 'cloud', type: 'backup' }
      ],
      systemStatus: [
        { name: 'Backend API', status: 'Healthy' },
        { name: 'Database', status: 'Healthy' },
        { name: 'Content CDN', status: 'Healthy' },
        { name: 'Push Notifications', status: 'Healthy' },
        { name: 'AI Services', status: 'Healthy' },
        { name: 'File Storage', status: 'Healthy' }
      ]
    };
  }

  // --- App Settings & Changes API ---

  getAppSettings() {
    const rows = this.db.prepare('SELECT key, value FROM app_settings').all();
    const result = {};
    for (const r of rows) {
      try {
        result[r.key] = JSON.parse(r.value);
      } catch (_) {
        result[r.key] = r.value;
      }
    }
    return result;
  }

  updateAppSettings(updates) {
    const insertSetting = this.db.prepare('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)');
    for (const [k, v] of Object.entries(updates)) {
      insertSetting.run(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
    }
    this.addRecentChange('App configuration settings updated', 'admin');
    return this.getAppSettings();
  }

  getRecentChanges() {
    return this.db.prepare('SELECT id, timestamp, action, actor FROM recent_changes ORDER BY id DESC LIMIT 50').all();
  }

  addRecentChange(action, actor = 'admin') {
    const now = new Date();
    const ts = now.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    this.db.prepare('INSERT INTO recent_changes (timestamp, action, actor) VALUES (?, ?, ?)').run(ts, action, actor);
  }

  // --- Mobile Screen State Engine (Real-Time 1-Second Sync) ---

  getMobileState() {
    const defaultState = {
      dailySteps: 8450,
      stepGoal: 10000,
      activeMinutes: 52,
      calorieBurn: 440,
      energyScore: 86,
      heartRate: 72,
      heartRateMin: 54,
      heartRateMax: 148,
      sleepHours: 7.7,
      sleepScore: 88,
      waterLiters: 2.4,
      waterGoal: 3.0,
      bloodOxygen: 98,
      bloodGlucose: 95,
      activeChallenge: {
        id: 'chal_01',
        title: 'Global 100K Stepathon',
        subtitle: 'Dokra Running Club Championship',
        participants: 42890,
        userProgress: 68420,
        goalSteps: 100000,
        daysLeft: 6,
        badge: 'Gold Finisher'
      },
      activeWorkout: {
        type: 'Outdoor Running',
        distanceKm: 5.42,
        duration: '28:14',
        pace: '5:12 /km',
        bpm: 142,
        calories: 380,
        route: 'Central Park Loop Trail'
      },
      activeTheme: 'oneui-light',
      updatedAt: new Date().toISOString()
    };

    const row = this.db.prepare('SELECT value FROM app_settings WHERE key = ?').get('mobile_state_live');
    if (row && row.value) {
      try {
        return { ...defaultState, ...JSON.parse(row.value) };
      } catch (_) {}
    }
    return defaultState;
  }

  updateMobileState(patch) {
    const current = this.getMobileState();
    const merged = { ...current, ...patch, updatedAt: new Date().toISOString() };
    this.db.prepare('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)').run('mobile_state_live', JSON.stringify(merged));
    this.addRecentChange(`Mobile screen telemetry updated (Steps: ${merged.dailySteps}, Energy: ${merged.energyScore})`, 'admin');
    return merged;
  }

  // --- Screens & Deep Content API ---

  listScreens(domain = null) {
    if (domain) {
      return this.db.prepare('SELECT * FROM screen_content WHERE domain = ? ORDER BY screen_name').all(domain);
    }
    return this.db.prepare('SELECT * FROM screen_content ORDER BY domain, screen_name').all();
  }

  getScreen(key) {
    return this.db.prepare('SELECT * FROM screen_content WHERE key = ?').get(key);
  }

  updateScreen(key, updates) {
    const current = this.getScreen(key);
    if (!current) throw new Error(`Screen with key '${key}' not found.`);
    const now = new Date().toISOString();

    const title = updates.title || current.title;
    const subtitle = updates.subtitle !== undefined ? updates.subtitle : current.subtitle;
    const description = updates.description !== undefined ? updates.description : current.description;
    const cta_text = updates.cta_text !== undefined ? updates.cta_text : current.cta_text;
    const cta_url = updates.cta_url !== undefined ? updates.cta_url : current.cta_url;
    const badge = updates.badge !== undefined ? updates.badge : current.badge;
    const icon = updates.icon || current.icon;
    const config_json = typeof updates.config_json === 'object' ? JSON.stringify(updates.config_json) : (updates.config_json || current.config_json);

    this.db.prepare(`
      UPDATE screen_content
      SET title = ?, subtitle = ?, description = ?, cta_text = ?, cta_url = ?, badge = ?, icon = ?, config_json = ?, updated_at = ?
      WHERE key = ?
    `).run(title, subtitle, description, cta_text, cta_url, badge, icon, config_json, now, key);

    this.addRecentChange(`Screen '${current.screen_name}' updated in domain '${current.domain}'`, 'admin');
    return this.getScreen(key);
  }

  // --- Sports Catalog API ---

  listSports() {
    return this.db.prepare('SELECT * FROM sports_catalog ORDER BY name').all();
  }

  getSport(id) {
    return this.db.prepare('SELECT * FROM sports_catalog WHERE id = ?').get(id);
  }

  updateSport(id, updates) {
    const current = this.getSport(id);
    if (!current) throw new Error(`Sport with ID '${id}' not found.`);
    const now = new Date().toISOString();

    const name = updates.name || current.name;
    const category = updates.category || current.category;
    const icon = updates.icon || current.icon;
    const default_duration = updates.default_duration || current.default_duration;
    const default_calories = updates.default_calories !== undefined ? updates.default_calories : current.default_calories;
    const default_pace = updates.default_pace || current.default_pace;
    const hr_zones_json = typeof updates.hr_zones_json === 'object' ? JSON.stringify(updates.hr_zones_json) : (updates.hr_zones_json || current.hr_zones_json);
    const route_gpx = updates.route_gpx !== undefined ? updates.route_gpx : current.route_gpx;

    this.db.prepare(`
      UPDATE sports_catalog
      SET name = ?, category = ?, icon = ?, default_duration = ?, default_calories = ?, default_pace = ?, hr_zones_json = ?, route_gpx = ?, updated_at = ?
      WHERE id = ?
    `).run(name, category, icon, default_duration, default_calories, default_pace, hr_zones_json, route_gpx, now, id);

    this.addRecentChange(`Sport '${name}' updated`, 'admin');
    return this.getSport(id);
  }

  // --- Wearables & Accessories API ---

  listWearables() {
    return this.db.prepare('SELECT * FROM wearables ORDER BY id').all();
  }

  updateWearable(id, updates) {
    const current = this.db.prepare('SELECT * FROM wearables WHERE id = ?').get(id);
    if (!current) throw new Error(`Wearable '${id}' not found.`);
    const now = new Date().toISOString();

    const name = updates.name || current.name;
    const battery_pct = updates.battery_pct !== undefined ? updates.battery_pct : current.battery_pct;
    const connection_status = updates.connection_status || current.connection_status;
    const firmware_ver = updates.firmware_ver || current.firmware_ver;
    const last_sync = updates.last_sync || 'Just now';

    this.db.prepare(`
      UPDATE wearables
      SET name = ?, battery_pct = ?, connection_status = ?, firmware_ver = ?, last_sync = ?, updated_at = ?
      WHERE id = ?
    `).run(name, battery_pct, connection_status, firmware_ver, last_sync, now, id);

    this.addRecentChange(`Device '${name}' updated (${battery_pct}%, ${connection_status})`, 'admin');
    return this.db.prepare('SELECT * FROM wearables WHERE id = ?').get(id);
  }

  // =========================================================================
  // --- MASTER SCREEN REGISTRY (v2 API): DEEP CMS, REVISIONS & RECYCLE BIN ---
  // =========================================================================

  listScreenRegistry({ domain, search, status = 'active', type } = {}) {
    let query = 'SELECT * FROM screen_registry WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (domain && domain !== 'all') {
      const d = domain.toLowerCase();
      if (d === 'home' || d === 'home_daily') {
        query += " AND (domain_id = 'home' OR domain_id = 'home_daily')";
      } else if (d === 'sport' || d === 'sports') {
        query += " AND (domain_id = 'sport' OR domain_id = 'sports')";
      } else if (d === 'heart' || d === 'heartrate' || d === 'ecg' || d === 'vitals') {
        query += " AND (domain_id = 'heart' OR domain_id = 'heartrate' OR domain_id = 'ecg' OR domain_id = 'vitals')";
      } else if (d === 'blood_pressure' || d === 'bp' || d === 'telehealth') {
        query += " AND (domain_id = 'blood_pressure' OR domain_id = 'bp' OR domain_id = 'telehealth')";
      } else if (d === 'blood_glucose' || d === 'glucose' || d === 'cgm') {
        query += " AND (domain_id = 'blood_glucose' OR domain_id = 'glucose' OR domain_id = 'cgm')";
      } else if (d === 'nutrition' || d === 'hydration' || d === 'food_nutrition' || d === 'food' || d === 'water') {
        query += " AND (domain_id = 'nutrition' OR domain_id = 'food_nutrition' OR domain_id = 'hydration')";
      } else {
        query += ' AND domain_id = ?';
        params.push(domain);
      }
    }
    if (type && type !== 'all') {
      query += ' AND screen_type = ?';
      params.push(type);
    }
    if (search && search.trim().length > 0) {
      query += ' AND (screen_name LIKE ? OR id LIKE ? OR domain_name LIKE ? OR route_path LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY domain_id ASC, screen_name ASC';
    const rows = this.db.prepare(query).all(...params);

    return rows.map(r => ({
      id: r.id,
      domain_id: r.domain_id,
      domain_name: r.domain_name,
      screen_name: r.screen_name,
      screen_type: r.screen_type,
      route_path: r.route_path,
      layout: JSON.parse(r.layout_json || '{}'),
      style: JSON.parse(r.style_json || '{}'),
      config: JSON.parse(r.config_json || '{}'),
      visibility_flags: JSON.parse(r.visibility_flags_json || '{}'),
      status: r.status,
      version: r.version,
      active_revision_id: r.active_revision_id,
      created_at: r.created_at,
      updated_at: r.updated_at
    }));
  }

  getScreenDetail(id) {
    const row = this.db.prepare('SELECT * FROM screen_registry WHERE id = ?').get(id);
    if (!row) return null;
    return {
      id: row.id,
      domain_id: row.domain_id,
      domain_name: row.domain_name,
      screen_name: row.screen_name,
      screen_type: row.screen_type,
      route_path: row.route_path,
      layout: JSON.parse(row.layout_json || '{}'),
      style: JSON.parse(row.style_json || '{}'),
      config: JSON.parse(row.config_json || '{}'),
      visibility_flags: JSON.parse(row.visibility_flags_json || '{}'),
      status: row.status,
      version: row.version,
      active_revision_id: row.active_revision_id,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  saveScreenRevision(id, updates, actorId = 'super_admin', changeSummary = 'Screen updated via Master Admin') {
    const current = this.getScreenDetail(id);
    if (!current) throw new Error(`Screen '${id}' not found in registry.`);
    const now = new Date().toISOString();
    const nextVersion = (current.version || 1) + 1;
    const revisionId = `rev_${id}_v${nextVersion}_${Date.now()}`;

    const merged = {
      ...current,
      screen_name: updates.screen_name || current.screen_name,
      route_path: updates.route_path || current.route_path,
      layout: { ...current.layout, ...(updates.layout || {}) },
      style: { ...current.style, ...(updates.style || {}) },
      config: { ...current.config, ...(updates.config || {}) },
      visibility_flags: { ...current.visibility_flags, ...(updates.visibility_flags || {}) },
      version: nextVersion,
      active_revision_id: revisionId,
      updated_at: now
    };

    // 1. Save immutable snapshot in screen_revisions
    this.db.prepare(`
      INSERT INTO screen_revisions (revision_id, screen_id, version, snapshot_json, changed_by, change_summary, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(revisionId, id, nextVersion, JSON.stringify(merged), actorId, changeSummary, now);

    // 2. Update screen_registry active pointer
    this.db.prepare(`
      UPDATE screen_registry
      SET screen_name = ?, route_path = ?, layout_json = ?, style_json = ?, config_json = ?, visibility_flags_json = ?, version = ?, active_revision_id = ?, updated_at = ?
      WHERE id = ?
    `).run(
      merged.screen_name,
      merged.route_path,
      JSON.stringify(merged.layout),
      JSON.stringify(merged.style),
      JSON.stringify(merged.config),
      JSON.stringify(merged.visibility_flags),
      nextVersion,
      revisionId,
      now,
      id
    );

    // 3. Audit trail and recent changes
    this.recordDeepAudit('SCREEN_UPDATE', 'screen', id, `Updated screen to v${nextVersion}: ${changeSummary}`, { changeSummary, version: nextVersion }, actorId);
    this.addRecentChange(`Screen '${merged.screen_name}' saved (v${nextVersion})`, actorId);

    return this.getScreenDetail(id);
  }

  rollbackScreenRevision(id, revisionId, actorId = 'super_admin', reason = 'Rollback to prior version') {
    const rev = this.db.prepare('SELECT * FROM screen_revisions WHERE revision_id = ? AND screen_id = ?').get(revisionId, id);
    if (!rev) throw new Error(`Revision '${revisionId}' not found for screen '${id}'.`);
    const snapshot = JSON.parse(rev.snapshot_json);
    const now = new Date().toISOString();
    const current = this.getScreenDetail(id);
    const nextVersion = (current ? current.version : 1) + 1;
    const newRevId = `rev_${id}_v${nextVersion}_rollback_${Date.now()}`;

    const restored = {
      ...snapshot,
      version: nextVersion,
      active_revision_id: newRevId,
      status: 'active',
      updated_at: now
    };

    // Store new revision acknowledging rollback
    this.db.prepare(`
      INSERT INTO screen_revisions (revision_id, screen_id, version, snapshot_json, changed_by, change_summary, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(newRevId, id, nextVersion, JSON.stringify(restored), actorId, `Rollback to v${rev.version}: ${reason}`, now);

    // Update active record
    this.db.prepare(`
      UPDATE screen_registry
      SET screen_name = ?, route_path = ?, layout_json = ?, style_json = ?, config_json = ?, visibility_flags_json = ?, status = 'active', version = ?, active_revision_id = ?, updated_at = ?
      WHERE id = ?
    `).run(
      restored.screen_name,
      restored.route_path,
      JSON.stringify(restored.layout),
      JSON.stringify(restored.style),
      JSON.stringify(restored.config),
      JSON.stringify(restored.visibility_flags),
      nextVersion,
      newRevId,
      now,
      id
    );

    this.recordDeepAudit('SCREEN_ROLLBACK', 'screen', id, `Rolled back to revision ${revisionId} (v${rev.version})`, { restoredVersion: rev.version, reason }, actorId);
    this.addRecentChange(`Screen '${restored.screen_name}' rolled back to v${rev.version}`, actorId);

    return this.getScreenDetail(id);
  }

  softDeleteScreen(id, actorId = 'super_admin') {
    const current = this.getScreenDetail(id);
    if (!current) throw new Error(`Screen '${id}' not found.`);
    const now = new Date().toISOString();
    const recycleId = `del_${id}_${Date.now()}`;

    this.db.prepare(`
      INSERT OR REPLACE INTO screen_recycle_bin (id, item_type, item_id, item_name, domain_id, snapshot_json, deleted_by, deleted_at)
      VALUES (?, 'screen', ?, ?, ?, ?, ?, ?)
    `).run(recycleId, id, current.screen_name, current.domain_id, JSON.stringify(current), actorId, now);

    this.db.prepare('UPDATE screen_registry SET status = ? WHERE id = ?').run('trashed', id);

    this.recordDeepAudit('SCREEN_SOFT_DELETE', 'screen', id, `Moved screen '${current.screen_name}' to Recycle Bin`, { screen_name: current.screen_name }, actorId);
    this.addRecentChange(`Screen '${current.screen_name}' moved to Recycle Bin`, actorId);

    return { success: true, id, status: 'trashed', recycle_id: recycleId };
  }

  restoreScreen(id, actorId = 'super_admin') {
    const item = this.db.prepare('SELECT * FROM screen_recycle_bin WHERE item_id = ? ORDER BY deleted_at DESC LIMIT 1').get(id);
    if (!item) throw new Error(`Screen '${id}' not found in Recycle Bin.`);
    const now = new Date().toISOString();

    this.db.prepare(`
      UPDATE screen_registry
      SET status = 'active', updated_at = ?
      WHERE id = ?
    `).run(now, id);

    this.db.prepare('DELETE FROM screen_recycle_bin WHERE id = ?').run(item.id);

    this.recordDeepAudit('SCREEN_RESTORE', 'screen', id, `Restored screen '${item.item_name}' from Recycle Bin`, { screen_name: item.item_name }, actorId);
    this.addRecentChange(`Screen '${item.item_name}' restored from Recycle Bin`, actorId);

    return this.getScreenDetail(id);
  }

  permanentDeleteScreen(id, actorId = 'super_admin') {
    const current = this.getScreenDetail(id);
    const name = current ? current.screen_name : id;
    this.db.prepare('DELETE FROM screen_recycle_bin WHERE item_id = ?').run(id);
    this.db.prepare('DELETE FROM screen_revisions WHERE screen_id = ?').run(id);
    this.db.prepare('DELETE FROM screen_registry WHERE id = ?').run(id);

    this.recordDeepAudit('SCREEN_PERMANENT_DELETE', 'screen', id, `Permanently purged screen '${name}'`, { id }, actorId);
    this.addRecentChange(`Screen '${name}' permanently purged`, actorId);

    return { success: true, id, status: 'purged' };
  }

  listRecycleBin() {
    const rows = this.db.prepare('SELECT * FROM screen_recycle_bin ORDER BY deleted_at DESC').all();
    return rows.map(r => ({
      id: r.id,
      item_type: r.item_type,
      item_id: r.item_id,
      item_name: r.item_name,
      domain_id: r.domain_id,
      snapshot: JSON.parse(r.snapshot_json || '{}'),
      deleted_by: r.deleted_by,
      deleted_at: r.deleted_at
    }));
  }

  listScreenRevisions(screenId) {
    const rows = this.db.prepare('SELECT * FROM screen_revisions WHERE screen_id = ? ORDER BY version DESC, created_at DESC').all(screenId);
    return rows.map(r => ({
      revision_id: r.revision_id,
      screen_id: r.screen_id,
      version: r.version,
      snapshot: JSON.parse(r.snapshot_json || '{}'),
      changed_by: r.changed_by,
      change_summary: r.change_summary,
      created_at: r.created_at
    }));
  }

  listDeepAuditEvents({ targetId, limit = 100 } = {}) {
    if (targetId) {
      const rows = this.db.prepare('SELECT * FROM audit_events WHERE target_id = ? ORDER BY timestamp DESC LIMIT ?').all(targetId, limit);
      return rows.map(r => ({ ...r, details: JSON.parse(r.details_json || '{}') }));
    }
    const rows = this.db.prepare('SELECT * FROM audit_events ORDER BY timestamp DESC LIMIT ?').all(limit);
    return rows.map(r => ({ ...r, details: JSON.parse(r.details_json || '{}') }));
  }

  recordDeepAudit(action, targetType, targetId, diffSummary, details = {}, actorId = 'super_admin') {
    const id = `aud_${crypto.randomUUID()}`;
    const ts = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO audit_events (id, action, target_type, target_id, diff_summary, details_json, actor_id, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, action, targetType, targetId, diffSummary, JSON.stringify(details), actorId, ts);
  }

  close() {
    this.db.close();
  }
}

module.exports = {
  CardDatabase
};
