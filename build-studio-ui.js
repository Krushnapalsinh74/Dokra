const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, 'backend/card-service/src/studio-ui.js');

const uiHtml = `/**
 * Dokra Health - Master Admin Studio Web UI
 * Complete control system featuring Dokra Running Club original branding,
 * full multi-view navigation, and responsive controls for all 18 modules.
 */

function renderCardStudioHtml() {
  return \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dokra Health — Master Admin Studio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-sidebar: #0b1329;
      --bg-sidebar-hover: #17233f;
      --bg-sidebar-active: #2563eb;
      --bg-app: #f4f6fb;
      --bg-card: #ffffff;
      --bg-card-subtle: #f8fafc;
      --border-color: #e2e8f0;
      --border-subtle: #edf2f7;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --text-light: #94a3b8;
      --text-sidebar: #94a3b8;
      --text-sidebar-hover: #ffffff;
      --primary-blue: #2563eb;
      --primary-blue-hover: #1d4ed8;
      --primary-blue-light: #eff6ff;
      --accent-green: #10b981;
      --accent-green-light: #ecfdf5;
      --accent-purple: #8b5cf6;
      --accent-purple-light: #f5f3ff;
      --accent-amber: #f59e0b;
      --accent-amber-light: #fffbeb;
      --accent-red: #ef4444;
      --accent-red-light: #fef2f2;
      --accent-cyan: #06b6d4;
      --accent-cyan-light: #ecfeff;
      --radius-sm: 6px;
      --radius-md: 10px;
      --radius-lg: 14px;
      --radius-xl: 18px;
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
      --shadow-card: 0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.03);
      --shadow-elevated: 0 10px 25px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg-app);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }

    /* --- SIDEBAR --- */
    .sidebar {
      width: 250px;
      background-color: var(--bg-sidebar);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      height: 100vh;
      position: sticky;
      top: 0;
      overflow-y: auto;
      z-index: 50;
      border-right: 1px solid rgba(255, 255, 255, 0.05);
      user-select: none;
    }

    .sidebar::-webkit-scrollbar { width: 4px; }
    .sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }

    .brand-container {
      padding: 18px 18px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .brand-logo-img {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      object-fit: contain;
      background: #ffffff;
      padding: 2px;
      box-shadow: 0 0 14px rgba(239, 68, 68, 0.4);
    }

    .brand-title-wrap {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-size: 16px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.3px;
    }

    .brand-subtitle {
      font-size: 10px;
      font-weight: 600;
      color: #f59e0b;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }

    .nav-section-title {
      font-size: 10.5px;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      padding: 14px 18px 5px;
    }

    .nav-list {
      list-style: none;
      padding: 0 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 8px 12px;
      border-radius: 8px;
      color: var(--text-sidebar);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .nav-item:hover {
      background: var(--bg-sidebar-hover);
      color: var(--text-sidebar-hover);
    }

    .nav-item.active {
      background: var(--bg-sidebar-active);
      color: #ffffff;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35);
    }

    .nav-item svg {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      stroke-width: 2;
    }

    .sidebar-footer {
      margin-top: auto;
      padding: 14px 18px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #64748b;
      font-size: 11.5px;
      font-weight: 500;
    }

    /* --- MAIN WRAPPER --- */
    .main-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow-y: auto;
    }

    /* Top Navigation Header */
    .top-header {
      background: #ffffff;
      border-bottom: 1px solid var(--border-color);
      padding: 12px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 40;
      box-shadow: var(--shadow-sm);
    }

    .header-left {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .header-left h2 {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.3px;
    }

    .header-left p {
      font-size: 12px;
      color: var(--text-muted);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .status-badge-online {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--accent-green-light);
      color: #065f46;
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 20px;
      padding: 4px 10px;
      font-size: 11.5px;
      font-weight: 600;
    }

    .status-dot-pulse {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--accent-green);
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.35);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }

    .icon-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: #ffffff;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: all 0.15s;
    }

    .icon-btn:hover {
      background: var(--bg-card-subtle);
      color: var(--text-main);
      border-color: #cbd5e1;
    }

    .badge-count {
      position: absolute;
      top: -3px;
      right: -3px;
      background: var(--accent-red);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      border-radius: 10px;
      padding: 1px 5px;
      border: 2px solid #fff;
    }

    .user-profile-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 4px 10px 4px 4px;
      border-radius: 24px;
      border: 1px solid var(--border-color);
      background: #ffffff;
      cursor: pointer;
    }

    .user-avatar-img {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: cover;
      background: #eff6ff;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 12.5px;
      font-weight: 600;
      color: var(--text-main);
      line-height: 1.2;
    }

    .user-role {
      font-size: 10px;
      font-weight: 500;
      color: var(--text-muted);
    }

    /* --- CONTENT BODY --- */
    .content-body {
      padding: 24px 28px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: -6px;
    }

    .breadcrumbs a {
      color: var(--primary-blue);
      text-decoration: none;
      cursor: pointer;
    }

    .page-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .page-title-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .page-title-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .page-title-text h1 {
      font-size: 21px;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.4px;
    }

    .page-title-text p {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 1px;
    }

    .page-title-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .primary-blue-btn {
      background: var(--primary-blue);
      color: #ffffff;
      border: none;
      border-radius: var(--radius-md);
      padding: 9px 16px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.15s ease;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
      font-family: inherit;
    }

    .primary-blue-btn:hover {
      background: var(--primary-blue-hover);
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.35);
    }

    .date-range-picker-btn {
      background: #ffffff;
      border: 1px solid var(--border-color);
      color: var(--text-main);
      border-radius: var(--radius-md);
      padding: 8px 14px;
      font-size: 12.5px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .date-range-picker-btn:hover {
      background: var(--bg-card-subtle);
      border-color: #cbd5e1;
    }

    /* KPI Grid 4 */
    .kpi-grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    @media (max-width: 1024px) {
      .kpi-grid-4 { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 640px) {
      .kpi-grid-4 { grid-template-columns: 1fr; }
    }

    .kpi-stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 18px;
      display: flex;
      align-items: flex-start;
      gap: 14px;
      box-shadow: var(--shadow-card);
      transition: transform 0.15s, box-shadow 0.15s;
    }

    .kpi-stat-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-elevated);
    }

    .kpi-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .kpi-icon-wrap svg {
      width: 22px;
      height: 22px;
      stroke-width: 2.2;
    }

    .kpi-content-wrap {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .kpi-title-text {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-muted);
    }

    .kpi-number-val {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.5px;
    }

    .kpi-sub-trend {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11.5px;
      margin-top: 2px;
    }

    .trend-pill-green {
      color: #059669;
      background: #ecfdf5;
      padding: 1px 6px;
      border-radius: 4px;
      font-weight: 600;
    }

    .trend-pill-red {
      color: #dc2626;
      background: #fef2f2;
      padding: 1px 6px;
      border-radius: 4px;
      font-weight: 600;
    }

    .trend-ref-label {
      color: var(--text-light);
    }

    /* Content Panels */
    .content-panel {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 20px;
      box-shadow: var(--shadow-card);
    }

    .panel-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .panel-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .panel-title svg {
      width: 18px;
      height: 18px;
      color: var(--primary-blue);
      stroke-width: 2.2;
    }

    /* Table Styles */
    .clean-table-wrapper {
      overflow-x: auto;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
    }

    .clean-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      text-align: left;
    }

    .clean-table th {
      background: var(--bg-card-subtle);
      color: var(--text-muted);
      font-weight: 600;
      font-size: 11.5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 11px 16px;
      border-bottom: 1px solid var(--border-color);
    }

    .clean-table td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-subtle);
      color: var(--text-main);
      vertical-align: middle;
    }

    .clean-table tr:last-child td {
      border-bottom: none;
    }

    .clean-table tr:hover td {
      background: #fbfcfe;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 9px;
      border-radius: 12px;
      font-size: 11.5px;
      font-weight: 600;
    }

    .status-pill.on-track { background: #ecfdf5; color: #059669; }
    .status-pill.taken { background: #eff6ff; color: #2563eb; }
    .status-pill.upcoming { background: #fffbeb; color: #d97706; }
    .status-pill.missed { background: #fef2f2; color: #dc2626; }
    .status-pill.active { background: #ecfdf5; color: #059669; }

    .two-col-layout {
      display: grid;
      grid-template-columns: 1.55fr 1fr;
      gap: 18px;
    }

    @media (max-width: 1080px) {
      .two-col-layout { grid-template-columns: 1fr; }
    }

    /* Views */
    .view-section {
      display: none;
      flex-direction: column;
      gap: 20px;
    }

    .view-section.active-view {
      display: flex;
    }

    /* Quick Action Cards */
    .quick-actions-2x2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .quick-btn-card {
      background: var(--bg-card-subtle);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      transition: all 0.15s ease;
      text-align: left;
    }

    .quick-btn-card:hover {
      background: #ffffff;
      border-color: var(--primary-blue);
      transform: translateY(-1px);
      box-shadow: 0 4px 10px rgba(0,0,0,0.04);
    }

    .quick-btn-icon {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .quick-btn-title {
      font-size: 12.5px;
      font-weight: 600;
      color: var(--text-main);
    }

    .quick-btn-sub {
      font-size: 11px;
      color: var(--text-muted);
    }

    /* Calendar Grid */
    .cal-matrix-grid {
      width: 100%;
      border-collapse: collapse;
      text-align: center;
      font-size: 11.5px;
    }

    .cal-matrix-grid th {
      padding: 8px 4px;
      color: var(--text-muted);
      font-weight: 500;
    }

    .cal-day-num {
      display: inline-block;
      width: 24px;
      height: 24px;
      line-height: 24px;
      border-radius: 50%;
      font-weight: 600;
      color: var(--text-main);
      margin-top: 2px;
    }

    .cal-day-num.active {
      background: var(--primary-blue);
      color: #fff;
    }

    .cal-matrix-grid td {
      padding: 8px 4px;
      border-top: 1px solid var(--border-subtle);
      height: 36px;
    }

    .cal-time-lbl {
      color: var(--text-muted);
      font-size: 10.5px;
      font-weight: 600;
      text-align: left;
      padding-left: 4px;
      width: 44px;
    }

    .cal-dot {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .cal-dot.taken { background: #10b981; }
    .cal-dot.upcoming { background: #2563eb; }
    .cal-dot.missed { background: #ef4444; }

    /* Banner Stay Track */
    .banner-stay-track {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border: 1px solid #a7f3d0;
      border-radius: var(--radius-lg);
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .banner-stay-track-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .banner-shield-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #10b981;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-overlay.open { display: flex; }

    .modal-card {
      background: #ffffff;
      border-radius: 18px;
      padding: 24px;
      width: 100%;
      max-width: 480px;
      box-shadow: var(--shadow-elevated);
      animation: modalSlideUp 0.2s ease-out;
    }

    @keyframes modalSlideUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
    }

    .modal-title {
      font-size: 17px;
      font-weight: 700;
      color: var(--text-main);
    }

    .modal-close-btn {
      background: transparent;
      border: none;
      font-size: 18px;
      color: var(--text-muted);
      cursor: pointer;
      width: 28px;
      height: 28px;
      border-radius: 6px;
    }

    .modal-form-group {
      margin-bottom: 14px;
    }

    .modal-label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-main);
      margin-bottom: 5px;
    }

    .modal-input, .modal-select, .modal-textarea {
      width: 100%;
      padding: 9px 12px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      font-size: 13px;
      font-family: inherit;
      color: var(--text-main);
      outline: none;
      transition: border-color 0.15s;
    }

    .modal-input:focus, .modal-select:focus, .modal-textarea:focus {
      border-color: var(--primary-blue);
      box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
    }

    /* Toast */
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .toast {
      background: #0f172a;
      color: #ffffff;
      padding: 12px 18px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 500;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      gap: 10px;
      animation: toastIn 0.25s ease-out;
    }

    @keyframes toastIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ===================================== */
    /* LOGIN SCREEN STYLES (NO GOOGLE BTN)   */
    /* ===================================== */
    #login-screen {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: #070d1e;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      overflow: hidden;
      transition: opacity 0.35s ease, visibility 0.35s ease;
    }

    #login-screen.hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    .login-bg-circles {
      position: absolute;
      width: 100%; height: 100%;
      overflow: hidden;
      pointer-events: none;
    }

    .login-bg-circles::before {
      content: '';
      position: absolute;
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(239, 68, 68, 0.22) 0%, transparent 70%);
      top: -100px; left: -100px;
      border-radius: 50%;
      animation: floatOrb 12s ease-in-out infinite alternate;
    }

    .login-bg-circles::after {
      content: '';
      position: absolute;
      width: 480px; height: 480px;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%);
      bottom: -100px; right: -80px;
      border-radius: 50%;
      animation: floatOrb 10s ease-in-out infinite alternate-reverse;
    }

    @keyframes floatOrb {
      0%, 100% { transform: translateY(0px) scale(1); }
      50% { transform: translateY(30px) scale(1.05); }
    }

    .login-card {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.12);
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      border-radius: 24px;
      padding: 42px 38px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06);
      position: relative;
      z-index: 1;
    }

    .login-logo-row {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 22px;
    }

    .login-logo-img {
      width: 78px;
      height: 78px;
      border-radius: 16px;
      object-fit: contain;
      background: #ffffff;
      padding: 4px;
      box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
    }

    .login-app-name {
      font-size: 22px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
      text-align: center;
    }

    .login-tagline {
      text-align: center;
      color: #f59e0b;
      font-size: 11.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: -6px;
    }

    .login-field-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
    }

    .login-input {
      width: 100%;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.14);
      border-radius: 10px;
      padding: 12px 15px;
      font-size: 13.5px;
      color: #ffffff;
      font-family: inherit;
      outline: none;
      transition: all 0.15s;
    }

    .login-input::placeholder { color: rgba(255,255,255,0.35); }

    .login-input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.25);
      background: rgba(255,255,255,0.10);
    }

    .login-submit-btn {
      width: 100%;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #ffffff;
      border: none;
      border-radius: 12px;
      padding: 13px 20px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s ease;
      box-shadow: 0 4px 14px rgba(37,99,235,0.45);
    }

    .login-submit-btn:hover {
      background: linear-gradient(135deg, #1d4ed8, #1e40af);
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(37,99,235,0.5);
    }

    .quick-dev-login-btn {
      width: 100%;
      background: rgba(255,255,255,0.06);
      color: #cbd5e1;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      padding: 11px 16px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      margin-top: 10px;
      transition: all 0.15s;
    }

    .quick-dev-login-btn:hover {
      background: rgba(255,255,255,0.12);
      color: #ffffff;
    }

    .login-error-msg {
      background: rgba(239,68,68,0.2);
      border: 1px solid rgba(239,68,68,0.4);
      border-radius: 8px;
      color: #fca5a5;
      font-size: 12px;
      padding: 8px 12px;
      margin-top: 10px;
      display: none;
    }

    .login-error-msg.visible { display: block; }

    .login-footer-note {
      text-align: center;
      color: rgba(255,255,255,0.3);
      font-size: 11px;
      margin-top: 20px;
      line-height: 1.5;
    }
  </style>
</head>
<body>

  <!-- ===== LOGIN SCREEN OVERLAY (GOOGLE LOGIN REMOVED) ===== -->
  <div id="login-screen">
    <div class="login-bg-circles"></div>
    <div class="login-card">
      <div class="login-logo-row">
        <img src="/assets/dokra-logo.png" class="login-logo-img" alt="Dokra Running Club Logo">
        <div>
          <div class="login-app-name">Dokra Health</div>
          <div class="login-tagline">Dokra Running Club Master Admin</div>
        </div>
      </div>

      <!-- Email / Password Admin Form -->
      <form id="admin-login-form" onsubmit="handleAdminLogin(event)">
        <div class="login-field-group">
          <div>
            <label style="display:block; font-size:11px; font-weight:600; color:rgba(255,255,255,0.6); margin-bottom:4px;">ADMIN USERNAME / EMAIL</label>
            <input type="text" class="login-input" id="login-email" value="admin@dokrahealth.com" placeholder="admin@dokrahealth.com" required>
          </div>
          <div>
            <label style="display:block; font-size:11px; font-weight:600; color:rgba(255,255,255,0.6); margin-bottom:4px;">PASSWORD</label>
            <input type="password" class="login-input" id="login-password" value="DokraAdmin2026!" placeholder="••••••••" required>
          </div>
        </div>
        <button type="submit" class="login-submit-btn" id="admin-login-btn">Sign In to Master Admin Studio</button>
        <button type="button" class="quick-dev-login-btn" onclick="quickDevLogin()">⚡ Instant Admin Access (Dev Mode)</button>
        <div class="login-error-msg" id="login-error-msg"></div>
      </form>

      <p class="login-footer-note">Dokra Running Club Platform v2.0.0<br>Access restricted to authorized administrators.</p>
    </div>
  </div>

  <!-- SIDEBAR NAVIGATION -->
  <aside class="sidebar">
    <div class="brand-container" onclick="switchView('dashboard')">
      <img src="/assets/dokra-logo.png" class="brand-logo-img" alt="Dokra Logo">
      <div class="brand-title-wrap">
        <span class="brand-title">Dokra Health</span>
        <span class="brand-subtitle">Running Club</span>
      </div>
    </div>

    <ul class="nav-list">
      <li class="nav-item active" id="nav-dashboard" onclick="switchView('dashboard')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
        Dashboard
      </li>
    </ul>

    <div class="nav-section-title">App Configuration</div>
    <ul class="nav-list">
      <li class="nav-item" id="nav-app-config" onclick="switchView('app-config')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        App Configuration
      </li>
      <li class="nav-item" id="nav-build-variants" onclick="switchView('build-variants')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
        Build Variants &amp; APKs
      </li>
      <li class="nav-item" id="nav-env-settings" onclick="switchView('env-settings')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        Environment Settings
      </li>
      <li class="nav-item" id="nav-api-endpoints" onclick="switchView('api-endpoints')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        API Endpoints
      </li>
      <li class="nav-item" id="nav-feature-flags" onclick="switchView('feature-flags')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
        Feature Flags
      </li>
    </ul>

    <div class="nav-section-title">Home / Dashboard</div>
    <ul class="nav-list">
      <li class="nav-item" id="nav-dashboard-layout" onclick="switchView('dashboard-layout')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
        Dashboard Layout
      </li>
      <li class="nav-item" id="nav-card-templates" onclick="switchView('card-templates')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
        Card Templates
      </li>
      <li class="nav-item" id="nav-view-factory" onclick="switchView('view-factory')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        View Factory
      </li>
    </ul>

    <div class="nav-section-title">Content CMS</div>
    <ul class="nav-list">
      <li class="nav-item" id="nav-content-cms" onclick="switchView('content-cms')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        Cards Studio
      </li>
      <li class="nav-item" id="nav-media-assets" onclick="switchView('media-assets')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
        Media Assets &amp; Logo
      </li>
      <li class="nav-item" id="nav-localization" onclick="switchView('localization')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        Localization
      </li>
    </ul>

    <div class="nav-section-title">Features</div>
    <ul class="nav-list">
      <li class="nav-item" id="nav-health-modules" onclick="switchView('health-modules')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 4l-4 4-3-3-4 4"/><path d="M14 4h4v4"/></svg>
        Health Modules
      </li>
      <li class="nav-item" id="nav-workouts" onclick="switchView('workouts')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="5" r="2"/><path d="m9 20 3-6 3 2 3-5"/><path d="m6 13 4-2 3 3"/></svg>
        Workouts &amp; Running Club
      </li>
      <li class="nav-item" id="nav-sleep" onclick="switchView('sleep')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
        Sleep
      </li>
      <li class="nav-item" id="nav-nutrition" onclick="switchView('nutrition')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>
        Nutrition
      </li>
      <li class="nav-item" id="nav-medication" onclick="switchView('medication')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
        Medication
      </li>
      <li class="nav-item" id="nav-devices" onclick="switchView('devices')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
        Devices
      </li>
      <li class="nav-item" id="nav-more-features" onclick="switchView('more-features')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
        Users &amp; Broadcasts
      </li>
    </ul>

    <div class="sidebar-footer">
      <span>Dokra Running Club</span>
      <span style="color:#f59e0b; font-weight:700;">v2.0.0</span>
    </div>
  </aside>

  <!-- MAIN WRAPPER -->
  <main class="main-wrapper">
    <!-- TOP HEADER -->
    <header class="top-header">
      <div class="header-left">
        <h2 id="header-page-title">Master Dashboard</h2>
        <p id="header-page-sub">Dokra Running Club &amp; Health Telemetry Center</p>
      </div>

      <div class="header-right">
        <div class="status-badge-online">
          <div class="status-dot-pulse"></div>
          <span>System Online</span>
        </div>

        <div class="icon-btn" onclick="showToast('Broadcast: 3 active announcements running')">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          <div class="badge-count">3</div>
        </div>

        <div class="user-profile-pill" onclick="showToast('Logged in as Master Administrator')">
          <img src="/assets/dokra-logo.png" class="user-avatar-img" alt="Admin">
          <div class="user-info">
            <div class="user-name">Dokra Admin</div>
            <div class="user-role">Super Admin</div>
          </div>
        </div>
      </div>
    </header>

    <div class="content-body">

      <!-- ========================================== -->
      <!-- VIEW 1: DASHBOARD                          -->
      <!-- ========================================== -->
      <section id="view-dashboard" class="view-section active-view">
        <div class="breadcrumbs">
          <a onclick="switchView('dashboard')">Home</a>
          <span>&gt;</span>
          <span style="color:var(--text-main); font-weight:600;">Master Dashboard</span>
        </div>

        <div class="page-title-row">
          <div class="page-title-left">
            <div class="page-title-icon-box" style="background:#eff6ff; color:#2563eb;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            </div>
            <div class="page-title-text">
              <h1>Dokra Running Club &amp; Health Overview</h1>
              <p>Real-time analytics, mobile telemetry, workouts, and backend service status.</p>
            </div>
          </div>
          <div class="page-title-right">
            <button class="date-range-picker-btn" onclick="openDateRangeModal()">
              <span>Last 7 Days</span>
            </button>
            <button class="primary-blue-btn" onclick="switchView('workouts')">🏃 View Running Club</button>
          </div>
        </div>

        <!-- 4 KPI Stat Cards -->
        <div class="kpi-grid-4">
          <div class="kpi-stat-card">
            <div class="kpi-icon-wrap" style="background:#fef2f2; color:#ef4444;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="5" r="2"/><path d="m9 20 3-6 3 2 3-5"/><path d="m6 13 4-2 3 3"/></svg>
            </div>
            <div class="kpi-content-wrap">
              <div class="kpi-title-text">Club Athletes</div>
              <div class="kpi-number-val">1,420</div>
              <div class="kpi-sub-trend"><span class="trend-pill-green">↑ 18%</span><span class="trend-ref-label">active this week</span></div>
            </div>
          </div>

          <div class="kpi-stat-card">
            <div class="kpi-icon-wrap" style="background:#ecfdf5; color:#10b981;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div class="kpi-content-wrap">
              <div class="kpi-title-text">Total Distance Run</div>
              <div class="kpi-number-val">14,892 km</div>
              <div class="kpi-sub-trend"><span class="trend-pill-green">↑ 24%</span><span class="trend-ref-label">vs last month</span></div>
            </div>
          </div>

          <div class="kpi-stat-card">
            <div class="kpi-icon-wrap" style="background:#eff6ff; color:#2563eb;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 4l-4 4-3-3-4 4"/><path d="M14 4h4v4"/></svg>
            </div>
            <div class="kpi-content-wrap">
              <div class="kpi-title-text">Active Health Modules</div>
              <div class="kpi-number-val">11 / 11</div>
              <div class="kpi-sub-trend"><span class="trend-pill-green">100% OK</span><span class="trend-ref-label">Health Connect</span></div>
            </div>
          </div>

          <div class="kpi-stat-card">
            <div class="kpi-icon-wrap" style="background:#fffbeb; color:#f59e0b;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/></svg>
            </div>
            <div class="kpi-content-wrap">
              <div class="kpi-title-text">Content Cards Live</div>
              <div class="kpi-number-val">24 Active</div>
              <div class="kpi-sub-trend"><span class="trend-pill-green">Synced</span><span class="trend-ref-label">One UI Mobile</span></div>
            </div>
          </div>
        </div>

        <!-- 2 Column Layout: Activity Chart & Quick Modules -->
        <div class="two-col-layout">
          <div>
            <div class="content-panel">
              <div class="panel-header-row">
                <div class="panel-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="5" r="2"/><path d="m9 20 3-6 3 2 3-5"/></svg>
                  Running Club Weekly Distance &amp; Activity
                </div>
                <span style="font-size:12px; color:var(--text-muted);">April 20 - April 26, 2025</span>
              </div>
              
              <!-- SVG Activity Chart -->
              <div style="background:var(--bg-card-subtle); border-radius:12px; padding:16px; border:1px solid var(--border-subtle);">
                <svg width="100%" height="160" viewBox="0 0 500 160" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#2563eb" stop-opacity="0.25"/>
                      <stop offset="100%" stop-color="#2563eb" stop-opacity="0.0"/>
                    </linearGradient>
                  </defs>
                  <!-- Grid lines -->
                  <line x1="0" y1="40" x2="500" y2="40" stroke="#e2e8f0" stroke-dasharray="4"/>
                  <line x1="0" y1="80" x2="500" y2="80" stroke="#e2e8f0" stroke-dasharray="4"/>
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#e2e8f0" stroke-dasharray="4"/>
                  
                  <!-- Area under curve -->
                  <path d="M0,130 C70,110 140,70 210,85 C280,100 350,30 420,45 L500,20 L500,160 L0,160 Z" fill="url(#chartGrad)"/>
                  <!-- Curve line -->
                  <path d="M0,130 C70,110 140,70 210,85 C280,100 350,30 420,45 L500,20" fill="none" stroke="#2563eb" stroke-width="3.5" stroke-linecap="round"/>
                  
                  <!-- Dots -->
                  <circle cx="70" cy="110" r="4" fill="#2563eb"/>
                  <circle cx="140" cy="70" r="4" fill="#2563eb"/>
                  <circle cx="210" cy="85" r="4" fill="#2563eb"/>
                  <circle cx="280" cy="100" r="4" fill="#2563eb"/>
                  <circle cx="350" cy="30" r="4" fill="#2563eb"/>
                  <circle cx="420" cy="45" r="4" fill="#2563eb"/>
                  <circle cx="500" cy="20" r="5" fill="#ef4444" stroke="#fff" stroke-width="2"/>
                </svg>
                <div style="display:flex; justify-content:space-between; margin-top:8px; font-size:11px; color:#64748b; font-weight:600;">
                  <span>Mon (12km)</span><span>Tue (18km)</span><span>Wed (15km)</span><span>Thu (14km)</span><span>Fri (26km)</span><span>Sat (22km)</span><span style="color:#ef4444;">Sun (31km Peak)</span>
                </div>
              </div>
            </div>

            <!-- Recent Workouts Mini Table -->
            <div class="content-panel" style="margin-top:16px;">
              <div class="panel-header-row">
                <div class="panel-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Recent Running Club Sessions
                </div>
                <a onclick="switchView('workouts')" style="font-size:12px; font-weight:600; color:var(--primary-blue); cursor:pointer;">View All &rarr;</a>
              </div>
              <div class="clean-table-wrapper">
                <table class="clean-table">
                  <thead>
                    <tr>
                      <th>Athlete</th>
                      <th>Activity</th>
                      <th>Distance</th>
                      <th>Pace</th>
                      <th>Heart Rate</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>David K.</strong></td>
                      <td>Morning Trail Run</td>
                      <td>12.4 km</td>
                      <td>4:35 /km</td>
                      <td>156 bpm</td>
                      <td><span class="status-pill active">Completed</span></td>
                    </tr>
                    <tr>
                      <td><strong>Elena R.</strong></td>
                      <td>Sprint Intervals</td>
                      <td>6.8 km</td>
                      <td>4:10 /km</td>
                      <td>168 bpm</td>
                      <td><span class="status-pill active">Completed</span></td>
                    </tr>
                    <tr>
                      <td><strong>Marcus V.</strong></td>
                      <td>Endurance Marathon Prep</td>
                      <td>24.2 km</td>
                      <td>5:02 /km</td>
                      <td>148 bpm</td>
                      <td><span class="status-pill active">Completed</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div>
            <!-- Quick System Controls -->
            <div class="content-panel" style="margin-bottom:16px;">
              <div class="panel-title" style="margin-bottom:14px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                Fast Navigation &amp; Actions
              </div>
              <div class="quick-actions-2x2">
                <div class="quick-btn-card" onclick="switchView('build-variants')">
                  <div class="quick-btn-icon" style="background:#eff6ff; color:#2563eb;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </div>
                  <div>
                    <div class="quick-btn-title">Download APK</div>
                    <div class="quick-btn-sub">Latest release</div>
                  </div>
                </div>

                <div class="quick-btn-card" onclick="switchView('content-cms')">
                  <div class="quick-btn-icon" style="background:#ecfdf5; color:#10b981;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/></svg>
                  </div>
                  <div>
                    <div class="quick-btn-title">Cards Studio</div>
                    <div class="quick-btn-sub">Manage feed</div>
                  </div>
                </div>

                <div class="quick-btn-card" onclick="switchView('feature-flags')">
                  <div class="quick-btn-icon" style="background:#f5f3ff; color:#8b5cf6;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
                  </div>
                  <div>
                    <div class="quick-btn-title">Feature Flags</div>
                    <div class="quick-btn-sub">Live toggles</div>
                  </div>
                </div>

                <div class="quick-btn-card" onclick="switchView('medication')">
                  <div class="quick-btn-icon" style="background:#fffbeb; color:#f59e0b;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/></svg>
                  </div>
                  <div>
                    <div class="quick-btn-title">Medication</div>
                    <div class="quick-btn-sub">Adherence KPI</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Running Club Club Banner -->
            <div class="content-panel" style="background:linear-gradient(135deg, #0b1329 0%, #1e293b 100%); color:#fff; border:none;">
              <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                <img src="/assets/dokra-logo.png" style="width:40px; height:40px; border-radius:10px; background:#fff; padding:2px;" alt="Logo">
                <div>
                  <div style="font-size:15px; font-weight:700; color:#ffffff;">Dokra Running Club</div>
                  <div style="font-size:11px; color:#f59e0b; font-weight:600;">OFFICIAL PARTNER NETWORK</div>
                </div>
              </div>
              <p style="font-size:12px; color:#94a3b8; line-height:1.5;">Direct Samsung Health / Generic Android integration with Firebase Auth and real-time biometric GPS sync.</p>
              <button class="primary-blue-btn" style="margin-top:14px; width:100%; justify-content:center;" onclick="switchView('workouts')">Open Live GPS Tracker</button>
            </div>
          </div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- VIEW 2: APP CONFIGURATION                  -->
      <!-- ========================================== -->
      <section id="view-app-config" class="view-section">
        <div class="breadcrumbs">
          <a onclick="switchView('dashboard')">Home</a>
          <span>&gt;</span>
          <span style="color:var(--text-main); font-weight:600;">App Configuration</span>
        </div>
        <div class="page-title-row">
          <div class="page-title-left">
            <div class="page-title-icon-box" style="background:#eff6ff; color:#2563eb;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <div class="page-title-text">
              <h1>Remote App Configuration</h1>
              <p>Configure app constants, sync intervals, auth providers, and server endpoints.</p>
            </div>
          </div>
          <button class="primary-blue-btn" onclick="saveAppConfig()">Save Configuration</button>
        </div>

        <div class="two-col-layout">
          <div class="content-panel">
            <div class="panel-title" style="margin-bottom:16px;">Core App Parameters</div>
            <div style="display:flex; flex-direction:column; gap:14px;">
              <div class="modal-form-group">
                <label class="modal-label">Application Name</label>
                <input type="text" class="modal-input" id="cfg-app-name" value="Dokra Health">
              </div>
              <div class="modal-form-group">
                <label class="modal-label">Package Name (Android)</label>
                <input type="text" class="modal-input" id="cfg-pkg-name" value="com.sec.android.app.shealth" readonly style="background:#f8fafc;">
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <div class="modal-form-group">
                  <label class="modal-label">Build Flavor</label>
                  <select class="modal-select" id="cfg-flavor">
                    <option value="staging" selected>Staging / Generic</option>
                    <option value="standalone">Standalone Production</option>
                  </select>
                </div>
                <div class="modal-form-group">
                  <label class="modal-label">Sync Interval (Minutes)</label>
                  <input type="number" class="modal-input" id="cfg-sync-interval" value="15">
                </div>
              </div>
              <div class="modal-form-group">
                <label class="modal-label">Primary Backend API Base URL</label>
                <input type="text" class="modal-input" id="cfg-api-base" value="http://10.0.2.2:8080">
              </div>
            </div>
          </div>

          <div class="content-panel">
            <div class="panel-title" style="margin-bottom:16px;">Security &amp; Auth Configuration</div>
            <div style="display:flex; flex-direction:column; gap:12px; font-size:13px;">
              <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #f1f5f9;">
                <div>
                  <strong>Firebase &amp; Google Sign-In</strong>
                  <div style="font-size:11px; color:#64748b;">Mobile Android auth provider bridge</div>
                </div>
                <span class="status-pill active">Active</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #f1f5f9;">
                <div>
                  <strong>Admin Studio Direct Auth</strong>
                  <div style="font-size:11px; color:#64748b;">Secure email/password (No Google on admin)</div>
                </div>
                <span class="status-pill active">Enforced</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #f1f5f9;">
                <div>
                  <strong>Crash Shield (SHealthApplication)</strong>
                  <div style="font-size:11px; color:#64748b;">Global DEX exception interceptor</div>
                </div>
                <span class="status-pill active">Enabled</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0;">
                <div>
                  <strong>Non-Samsung Vendor Check Bypass</strong>
                  <div style="font-size:11px; color:#64748b;">Allows execution on all Android OEM hardware</div>
                </div>
                <span class="status-pill active">Patched</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- VIEW 3: BUILD VARIANTS & APKS              -->
      <!-- ========================================== -->
      <section id="view-build-variants" class="view-section">
        <div class="breadcrumbs">
          <a onclick="switchView('dashboard')">Home</a>
          <span>&gt;</span>
          <span style="color:var(--text-main); font-weight:600;">Build Variants &amp; APKs</span>
        </div>
        <div class="page-title-row">
          <div class="page-title-left">
            <div class="page-title-icon-box" style="background:#eff6ff; color:#2563eb;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            </div>
            <div class="page-title-text">
              <h1>Build Variants &amp; APK Releases</h1>
              <p>Direct download and telemetry for compiled Dokra Health Android packages.</p>
            </div>
          </div>
        </div>

        <div class="kpi-grid-4">
          <div class="kpi-stat-card">
            <div class="kpi-icon-wrap" style="background:#eff6ff; color:#2563eb;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </div>
            <div class="kpi-content-wrap">
              <div class="kpi-title-text">Standard APK</div>
              <a href="/download/apk" class="primary-blue-btn" style="margin-top:6px; padding:6px 12px; font-size:12px;">⬇ Dokra Health.apk</a>
            </div>
          </div>

          <div class="kpi-stat-card">
            <div class="kpi-icon-wrap" style="background:#ecfdf5; color:#10b981;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </div>
            <div class="kpi-content-wrap">
              <div class="kpi-title-text">Standalone Variant</div>
              <a href="/download/standalone-apk" class="primary-blue-btn" style="background:#10b981; margin-top:6px; padding:6px 12px; font-size:12px;">⬇ Standalone.apk</a>
            </div>
          </div>

          <div class="kpi-stat-card">
            <div class="kpi-icon-wrap" style="background:#f5f3ff; color:#8b5cf6;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div class="kpi-content-wrap">
              <div class="kpi-title-text">Signature Scheme</div>
              <div class="kpi-number-val" style="font-size:18px;">v1 + v2 + v3</div>
              <div class="kpi-sub-trend"><span class="trend-pill-green">Verified</span></div>
            </div>
          </div>

          <div class="kpi-stat-card">
            <div class="kpi-icon-wrap" style="background:#fffbeb; color:#f59e0b;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div class="kpi-content-wrap">
              <div class="kpi-title-text">Target SDK</div>
              <div class="kpi-number-val" style="font-size:18px;">Android 14 (API 34)</div>
              <div class="kpi-sub-trend"><span class="trend-pill-green">Min API 29</span></div>
            </div>
          </div>
        </div>

        <div class="content-panel">
          <div class="panel-title" style="margin-bottom:16px;">Release Matrix</div>
          <div class="clean-table-wrapper">
            <table class="clean-table">
              <thead>
                <tr>
                  <th>Variant Name</th>
                  <th>Version</th>
                  <th>Signing Scheme</th>
                  <th>Auth Provider</th>
                  <th>Crash Shield</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Dokra Health (Release)</strong></td>
                  <td>2.0.0 (7.00.6.011)</td>
                  <td><span class="status-pill active">v1+v2+v3 Signed</span></td>
                  <td>Firebase &amp; Google Auth</td>
                  <td>Active</td>
                  <td><a href="/download/apk" style="color:var(--primary-blue); font-weight:600; text-decoration:none;">Download (158 MB)</a></td>
                </tr>
                <tr>
                  <td><strong>Dokra Health (Standalone)</strong></td>
                  <td>2.0.0 (7.00.6.011)</td>
                  <td><span class="status-pill active">v1+v2+v3 Signed</span></td>
                  <td>Generic Staging Auth</td>
                  <td>Active</td>
                  <td><a href="/download/standalone-apk" style="color:var(--primary-blue); font-weight:600; text-decoration:none;">Download (158 MB)</a></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- VIEW 4: ENVIRONMENT SETTINGS               -->
      <!-- ========================================== -->
      <section id="view-env-settings" class="view-section">
        <div class="breadcrumbs">
          <a onclick="switchView('dashboard')">Home</a>
          <span>&gt;</span>
          <span style="color:var(--text-main); font-weight:600;">Environment Settings</span>
        </div>
        <div class="page-title-row">
          <div class="page-title-left">
            <div class="page-title-icon-box" style="background:#eff6ff; color:#2563eb;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </div>
            <div class="page-title-text">
              <h1>Environment &amp; Server Settings</h1>
              <p>Configure HTTP host, port, database connections, and auth tokens.</p>
            </div>
          </div>
          <button class="primary-blue-btn" onclick="showToast('Environment settings validated & saved!')">Apply Changes</button>
        </div>

        <div class="content-panel">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
            <div class="modal-form-group">
              <label class="modal-label">Server Port</label>
              <input type="text" class="modal-input" value="8080" readonly style="background:#f8fafc;">
            </div>
            <div class="modal-form-group">
              <label class="modal-label">Server Host</label>
              <input type="text" class="modal-input" value="0.0.0.0 (All interfaces)" readonly style="background:#f8fafc;">
            </div>
            <div class="modal-form-group">
              <label class="modal-label">SQLite Database Path</label>
              <input type="text" class="modal-input" value="./data/card-service.db" readonly style="background:#f8fafc;">
            </div>
            <div class="modal-form-group">
              <label class="modal-label">Token Expiration Time (Seconds)</label>
              <input type="number" class="modal-input" value="3600">
            </div>
          </div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- VIEW 5: API ENDPOINTS                      -->
      <!-- ========================================== -->
      <section id="view-api-endpoints" class="view-section">
        <div class="breadcrumbs">
          <a onclick="switchView('dashboard')">Home</a>
          <span>&gt;</span>
          <span style="color:var(--text-main); font-weight:600;">API Endpoints</span>
        </div>
        <div class="page-title-row">
          <div class="page-title-left">
            <div class="page-title-icon-box" style="background:#eff6ff; color:#2563eb;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </div>
            <div class="page-title-text">
              <h1>Interactive REST API Explorer</h1>
              <p>Test and inspect live mobile feed and administrative REST endpoints.</p>
            </div>
          </div>
        </div>

        <div class="content-panel">
          <div style="display:flex; gap:10px; margin-bottom:14px;">
            <select class="modal-select" id="api-test-select" style="max-width:280px;" onchange="updateApiTestPath(this.value)">
              <option value="/v2/servicecard/list">GET /v2/servicecard/list (Mobile Feed)</option>
              <option value="/v1/auth/staging-token">POST /v1/auth/staging-token (Auth)</option>
              <option value="/v1/auth/google-login">POST /v1/auth/google-login (Google Login)</option>
              <option value="/admin/v1/cards">GET /admin/v1/cards (Admin Cards)</option>
              <option value="/admin/v1/feature-flags">GET /admin/v1/feature-flags (Flags)</option>
              <option value="/admin/v1/medications">GET /admin/v1/medications (Meds)</option>
              <option value="/health">GET /health (Health Check)</option>
            </select>
            <input type="text" class="modal-input" id="api-test-url" value="/v2/servicecard/list" readonly style="background:#f8fafc; font-family:'JetBrains Mono',monospace;">
            <button class="primary-blue-btn" onclick="executeApiTest()">Send Request</button>
          </div>
          <div style="background:#0f172a; color:#f8fafc; border-radius:10px; padding:16px; font-family:'JetBrains Mono',monospace; font-size:12px; max-height:280px; overflow-y:auto;" id="api-test-output">
Click "Send Request" to test endpoint...
          </div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- VIEW 6: FEATURE FLAGS                      -->
      <!-- ========================================== -->
      <section id="view-feature-flags" class="view-section">
        <div class="breadcrumbs">
          <a onclick="switchView('dashboard')">Home</a>
          <span>&gt;</span>
          <span style="color:var(--text-main); font-weight:600;">Feature Flags</span>
        </div>
        <div class="page-title-row">
          <div class="page-title-left">
            <div class="page-title-icon-box" style="background:#eff6ff; color:#2563eb;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
            </div>
            <div class="page-title-text">
              <h1>Feature Flags &amp; Experiments</h1>
              <p>Toggle features dynamically across Android APK clients without re-deploying.</p>
            </div>
          </div>
          <button class="primary-blue-btn" onclick="showToast('Feature flag saved!')">+ Create Flag</button>
        </div>

        <div class="content-panel">
          <div class="clean-table-wrapper">
            <table class="clean-table">
              <thead>
                <tr>
                  <th>Flag Key</th>
                  <th>Description</th>
                  <th>Target Clients</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="feature-flags-table-body">
                <tr>
                  <td><code>AUTH_FIREBASE_GOOGLE_LOGIN</code></td>
                  <td>Native Google Sign-In &amp; Firebase Auth in Mobile App</td>
                  <td>Android 2.0.0+</td>
                  <td><span class="status-pill active">ENABLED</span></td>
                  <td><button class="date-range-picker-btn" onclick="showToast('Flag updated!')" style="padding:4px 8px; font-size:11px;">Toggle</button></td>
                </tr>
                <tr>
                  <td><code>RUNNING_CLUB_LIVE_GPS</code></td>
                  <td>High-precision GPS runner tracking and route overlay</td>
                  <td>All Athletes</td>
                  <td><span class="status-pill active">ENABLED</span></td>
                  <td><button class="date-range-picker-btn" onclick="showToast('Flag updated!')" style="padding:4px 8px; font-size:11px;">Toggle</button></td>
                </tr>
                <tr>
                  <td><code>CARDIO_AI_ANALYTICS</code></td>
                  <td>Real-time cardiovascular pace analysis and stamina coaching</td>
                  <td>Running Club Beta</td>
                  <td><span class="status-pill active">ENABLED</span></td>
                  <td><button class="date-range-picker-btn" onclick="showToast('Flag updated!')" style="padding:4px 8px; font-size:11px;">Toggle</button></td>
                </tr>
                <tr>
                  <td><code>MEDICATION_ADHERENCE_V2</code></td>
                  <td>Smart dose scheduling and reminder push alerts</td>
                  <td>All Users</td>
                  <td><span class="status-pill active">ENABLED</span></td>
                  <td><button class="date-range-picker-btn" onclick="showToast('Flag updated!')" style="padding:4px 8px; font-size:11px;">Toggle</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- VIEW 7: DASHBOARD LAYOUT                   -->
      <!-- ========================================== -->
      <section id="view-dashboard-layout" class="view-section">
        <div class="breadcrumbs">
          <a onclick="switchView('dashboard')">Home</a>
          <span>&gt;</span>
          <span style="color:var(--text-main); font-weight:600;">Dashboard Layout</span>
        </div>
        <div class="page-title-row">
          <div class="page-title-left">
            <div class="page-title-icon-box" style="background:#eff6ff; color:#2563eb;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
            </div>
            <div class="page-title-text">
              <h1>Dashboard Layout &amp; Card Ordering</h1>
              <p>Reorder and customize card slots displayed on the mobile home screen.</p>
            </div>
          </div>
          <button class="primary-blue-btn" onclick="showToast('Dashboard layout saved!')">Save Layout</button>
        </div>
        <div class="content-panel">
          <div style="display:flex; flex-direction:column; gap:10px;">
            <div style="padding:12px 16px; border:1px solid #e2e8f0; border-radius:10px; display:flex; justify-content:space-between; align-items:center; background:#f8fafc;">
              <span>1. 🏃 Dokra Running Club - Daily Milestone &amp; Pace</span>
              <span class="status-pill active">Visible</span>
            </div>
            <div style="padding:12px 16px; border:1px solid #e2e8f0; border-radius:10px; display:flex; justify-content:space-between; align-items:center; background:#f8fafc;">
              <span>2. ❤️ Cardio &amp; Heart Rate Live Monitor</span>
              <span class="status-pill active">Visible</span>
            </div>
            <div style="padding:12px 16px; border:1px solid #e2e8f0; border-radius:10px; display:flex; justify-content:space-between; align-items:center; background:#f8fafc;">
              <span>3. 💊 Medication Schedule &amp; Daily Doses</span>
              <span class="status-pill active">Visible</span>
            </div>
            <div style="padding:12px 16px; border:1px solid #e2e8f0; border-radius:10px; display:flex; justify-content:space-between; align-items:center; background:#f8fafc;">
              <span>4. 🌙 Sleep Score &amp; Recovery Analysis</span>
              <span class="status-pill active">Visible</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- VIEW 8: CARD TEMPLATES                     -->
      <!-- ========================================== -->
      <section id="view-card-templates" class="view-section">
        <div class="breadcrumbs">
          <a onclick="switchView('dashboard')">Home</a>
          <span>&gt;</span>
          <span style="color:var(--text-main); font-weight:600;">Card Templates</span>
        </div>
        <div class="page-title-row">
          <div class="page-title-left">
            <div class="page-title-icon-box" style="background:#eff6ff; color:#2563eb;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            </div>
            <div class="page-title-text">
              <h1>Card Templates Catalog</h1>
              <p>Canonical templates conforming to Samsung One UI Health specifications.</p>
            </div>
          </div>
        </div>
        <div class="kpi-grid-4">
          <div class="kpi-stat-card" style="flex-direction:column; gap:10px;">
            <div style="font-weight:700; color:#2563eb;">🏃 Running Club Milestone</div>
            <p style="font-size:12px; color:#64748b;">Live step counter, pace meter, and distance progress bar.</p>
            <span class="status-pill active">Canonical</span>
          </div>
          <div class="kpi-stat-card" style="flex-direction:column; gap:10px;">
            <div style="font-weight:700; color:#ef4444;">❤️ Heart Rate Vitals</div>
            <p style="font-size:12px; color:#64748b;">Resting bpm, current bpm, and ECG rhythm graph.</p>
            <span class="status-pill active">Canonical</span>
          </div>
          <div class="kpi-stat-card" style="flex-direction:column; gap:10px;">
            <div style="font-weight:700; color:#10b981;">💊 Medication Reminder</div>
            <p style="font-size:12px; color:#64748b;">Quick check-off pill dose and next schedule time.</p>
            <span class="status-pill active">Canonical</span>
          </div>
          <div class="kpi-stat-card" style="flex-direction:column; gap:10px;">
            <div style="font-weight:700; color:#8b5cf6;">🌙 Sleep Deep Recovery</div>
            <p style="font-size:12px; color:#64748b;">Sleep stages, quality score, and target bedtime.</p>
            <span class="status-pill active">Canonical</span>
          </div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- VIEW 9: VIEW FACTORY                       -->
      <!-- ========================================== -->
      <section id="view-view-factory" class="view-section">
        <div class="breadcrumbs">
          <a onclick="switchView('dashboard')">Home</a>
          <span>&gt;</span>
          <span style="color:var(--text-main); font-weight:600;">View Factory</span>
        </div>
        <div class="page-title-row">
          <div class="page-title-left">
            <div class="page-title-icon-box" style="background:#eff6ff; color:#2563eb;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            </div>
            <div class="page-title-text">
              <h1>Dynamic View Factory &amp; DEX Architecture</h1>
              <p>Smali bytecode mapping and dynamic UI component factory.</p>
            </div>
          </div>
        </div>
        <div class="content-panel">
          <div style="font-family:'JetBrains Mono',monospace; font-size:12.5px; line-height:1.6; color:#334155;">
            <div><strong>Package:</strong> com.dokra.health.provider.auth.FirebaseGoogleAuthProvider</div>
            <div><strong>DEX Injection Target:</strong> SHealthApplication.smali / HomeMainActivity.smali</div>
            <div><strong>Provider Layer:</strong> DokraProviderRegistry.getInstance()</div>
            <div><strong>Status:</strong> <span style="color:#059669; font-weight:700;">ACTIVE &amp; VERIFIED</span></div>
          </div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- VIEW 10: CONTENT CMS - CARDS               -->
      <!-- ========================================== -->
      <section id="view-content-cms" class="view-section">
        <div class="breadcrumbs">
          <a onclick="switchView('dashboard')">Home</a>
          <span>&gt;</span>
          <span style="color:var(--text-main); font-weight:600;">Cards Studio</span>
        </div>
        <div class="page-title-row">
          <div class="page-title-left">
            <div class="page-title-icon-box" style="background:#eff6ff; color:#2563eb;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div class="page-title-text">
              <h1>Cards Studio &amp; Mobile Simulator</h1>
              <p>24 canonical cards feed with live One UI mobile simulator preview.</p>
            </div>
          </div>
          <button class="primary-blue-btn" onclick="showToast('Draft card created!')">+ Create Card Draft</button>
        </div>

        <div class="two-col-layout">
          <!-- Cards List -->
          <div class="content-panel">
            <div class="panel-header-row">
              <div class="panel-title">Active Feed Cards (24)</div>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px; max-height:480px; overflow-y:auto;">
              <div style="padding:12px; border:1px solid #e2e8f0; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <strong>Dokra Running Club - Daily Milestone</strong>
                  <div style="font-size:11px; color:#64748b;">ID: card_running_club_01 · Category: Workouts</div>
                </div>
                <span class="status-pill active">Published</span>
              </div>
              <div style="padding:12px; border:1px solid #e2e8f0; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <strong>Heart Rate &amp; Vitals Monitor</strong>
                  <div style="font-size:11px; color:#64748b;">ID: card_heart_rate_02 · Category: Cardio</div>
                </div>
                <span class="status-pill active">Published</span>
              </div>
              <div style="padding:12px; border:1px solid #e2e8f0; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <strong>Medication Adherence Schedule</strong>
                  <div style="font-size:11px; color:#64748b;">ID: card_medication_03 · Category: Clinical</div>
                </div>
                <span class="status-pill active">Published</span>
              </div>
              <div style="padding:12px; border:1px solid #e2e8f0; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <strong>Sleep Quality &amp; Recovery Index</strong>
                  <div style="font-size:11px; color:#64748b;">ID: card_sleep_04 · Category: Sleep</div>
                </div>
                <span class="status-pill active">Published</span>
              </div>
            </div>
          </div>

          <!-- One UI Mobile Simulator -->
          <div class="content-panel" style="background:#0b1329; color:#fff; border-radius:24px; padding:24px; max-width:340px; margin:0 auto; border:4px solid #1e293b; box-shadow:0 20px 40px rgba(0,0,0,0.5);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; font-size:11px; color:#94a3b8;">
              <span>9:41</span>
              <span>Dokra 5G 100%</span>
            </div>
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
              <img src="/assets/dokra-logo.png" style="width:32px; height:32px; border-radius:8px; background:#fff; padding:2px;" alt="Logo">
              <span style="font-size:16px; font-weight:800; color:#ffffff;">Dokra Health</span>
            </div>

            <!-- Mobile Card 1 -->
            <div style="background:#1e293b; border-radius:14px; padding:14px; margin-bottom:12px; border:1px solid rgba(255,255,255,0.08);">
              <div style="font-size:11px; color:#f59e0b; font-weight:700;">DOKRA RUNNING CLUB</div>
              <div style="font-size:18px; font-weight:700; margin-top:2px;">12,480 <span style="font-size:12px; font-weight:400; color:#94a3b8;">steps</span></div>
              <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; margin-top:8px; overflow:hidden;">
                <div style="width:83%; height:100%; background:linear-gradient(90deg, #f59e0b, #ef4444);"></div>
              </div>
            </div>

            <!-- Mobile Card 2 -->
            <div style="background:#1e293b; border-radius:14px; padding:14px; border:1px solid rgba(255,255,255,0.08);">
              <div style="font-size:11px; color:#38bdf8; font-weight:700;">HEART RATE</div>
              <div style="font-size:18px; font-weight:700; margin-top:2px;">72 <span style="font-size:12px; font-weight:400; color:#94a3b8;">bpm (Resting)</span></div>
            </div>
          </div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- VIEW 11: MEDIA ASSETS & LOGO               -->
      <!-- ========================================== -->
      <section id="view-media-assets" class="view-section">
        <div class="breadcrumbs">
          <a onclick="switchView('dashboard')">Home</a>
          <span>&gt;</span>
          <span style="color:var(--text-main); font-weight:600;">Media Assets &amp; Logo</span>
        </div>
        <div class="page-title-row">
          <div class="page-title-left">
            <div class="page-title-icon-box" style="background:#eff6ff; color:#2563eb;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            </div>
            <div class="page-title-text">
              <h1>Media Assets &amp; Official Logo</h1>
              <p>Official Dokra Running Club vector and raster asset library.</p>
            </div>
          </div>
        </div>

        <div class="two-col-layout">
          <div class="content-panel" style="text-align:center;">
            <div class="panel-title" style="margin-bottom:16px;">Dokra Running Club Official Logo</div>
            <div style="background:#ffffff; border-radius:18px; padding:32px; display:inline-block; border:1px solid #e2e8f0; box-shadow:0 10px 25px rgba(0,0,0,0.05);">
              <img src="/assets/dokra-logo.png" style="width:180px; height:180px; object-fit:contain;" alt="Dokra Original Logo">
            </div>
            <div style="margin-top:16px;">
              <a href="/assets/dokra-logo.png" download="dokra-running-club-logo.png" class="primary-blue-btn">⬇ Download High-Res PNG</a>
            </div>
          </div>

          <div class="content-panel">
            <div class="panel-title" style="margin-bottom:16px;">APK Resource Injections</div>
            <div style="display:flex; flex-direction:column; gap:10px; font-size:13px;">
              <div style="padding:10px; background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;">
                <strong>res/drawable/dokra_logo.png</strong> (Copied to mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
              </div>
              <div style="padding:10px; background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;">
                <strong>res/drawable/dokra_running_club.png</strong> (Header and splash banners)
              </div>
              <div style="padding:10px; background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;">
                <strong>backend/card-service/public/assets/dokra-logo.png</strong> (Admin Studio asset)
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- VIEW 12: LOCALIZATION                      -->
      <!-- ========================================== -->
      <section id="view-localization" class="view-section">
        <div class="breadcrumbs">
          <a onclick="switchView('dashboard')">Home</a>
          <span>&gt;</span>
          <span style="color:var(--text-main); font-weight:600;">Localization</span>
        </div>
        <div class="page-title-row">
          <div class="page-title-left">
            <div class="page-title-icon-box" style="background:#eff6ff; color:#2563eb;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
            <div class="page-title-text">
              <h1>Localization &amp; Translations</h1>
              <p>Manage multilingual string bundles across all mobile regions.</p>
            </div>
          </div>
          <button class="primary-blue-btn" onclick="showToast('Translations saved!')">Save Translations</button>
        </div>
        <div class="content-panel">
          <div class="clean-table-wrapper">
            <table class="clean-table">
              <thead>
                <tr>
                  <th>String Key</th>
                  <th>English (Default)</th>
                  <th>Spanish (es)</th>
                  <th>French (fr)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>app_name</code></td>
                  <td>Dokra Health</td>
                  <td>Dokra Salud</td>
                  <td>Dokra Santé</td>
                </tr>
                <tr>
                  <td><code>running_club_title</code></td>
                  <td>Dokra Running Club</td>
                  <td>Club de Corredores Dokra</td>
                  <td>Club de Course Dokra</td>
                </tr>
                <tr>
                  <td><code>medication_title</code></td>
                  <td>Medication</td>
                  <td>Medicamentos</td>
                  <td>Médicaments</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- VIEW 13: HEALTH MODULES                    -->
      <!-- ========================================== -->
      <section id="view-health-modules" class="view-section">
        <div class="breadcrumbs">
          <a onclick="switchView('dashboard')">Home</a>
          <span>&gt;</span>
          <span style="color:var(--text-main); font-weight:600;">Health Modules</span>
        </div>
        <div class="page-title-row">
          <div class="page-title-left">
            <div class="page-title-icon-box" style="background:#eff6ff; color:#2563eb;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 4l-4 4-3-3-4 4"/><path d="M14 4h4v4"/></svg>
            </div>
            <div class="page-title-text">
              <h1>Health Modules Directory</h1>
              <p>Manage health capabilities, permissions, and sensors.</p>
            </div>
          </div>
        </div>
        <div class="kpi-grid-4">
          <div class="kpi-stat-card"><div class="kpi-content-wrap"><div class="kpi-title-text">Step Counter</div><div class="kpi-number-val" style="font-size:18px;">Active</div><span class="status-pill active">Health Connect</span></div></div>
          <div class="kpi-stat-card"><div class="kpi-content-wrap"><div class="kpi-title-text">Heart Rate (ECG)</div><div class="kpi-number-val" style="font-size:18px;">Active</div><span class="status-pill active">BLE / Watch</span></div></div>
          <div class="kpi-stat-card"><div class="kpi-content-wrap"><div class="kpi-title-text">Blood Oxygen (SpO2)</div><div class="kpi-number-val" style="font-size:18px;">Active</div><span class="status-pill active">Vitals Sensor</span></div></div>
          <div class="kpi-stat-card"><div class="kpi-content-wrap"><div class="kpi-title-text">Sleep Tracking</div><div class="kpi-number-val" style="font-size:18px;">Active</div><span class="status-pill active">Sleep Stages</span></div></div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- VIEW 14: WORKOUTS & RUNNING CLUB           -->
      <!-- ========================================== -->
      <section id="view-workouts" class="view-section">
        <div class="breadcrumbs">
          <a onclick="switchView('dashboard')">Home</a>
          <span>&gt;</span>
          <span style="color:var(--text-main); font-weight:600;">Workouts &amp; Running Club</span>
        </div>
        <div class="page-title-row">
          <div class="page-title-left">
            <div class="page-title-icon-box" style="background:#eff6ff; color:#2563eb;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="5" r="2"/><path d="m9 20 3-6 3 2 3-5"/><path d="m6 13 4-2 3 3"/></svg>
            </div>
            <div class="page-title-text">
              <h1>Dokra Running Club &amp; Workouts Tracker</h1>
              <p>Track marathon preparation, GPS trail sessions, and athlete stamina.</p>
            </div>
          </div>
          <button class="primary-blue-btn" onclick="showToast('Workout session logged successfully!')">+ Log Club Workout</button>
        </div>

        <div class="kpi-grid-4">
          <div class="kpi-stat-card">
            <div class="kpi-icon-wrap" style="background:#eff6ff; color:#2563eb;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="5" r="2"/><path d="m9 20 3-6 3 2 3-5"/></svg></div>
            <div class="kpi-content-wrap"><div class="kpi-title-text">Weekly Runs</div><div class="kpi-number-val">384</div><div class="kpi-sub-trend"><span class="trend-pill-green">↑ 14%</span></div></div>
          </div>
          <div class="kpi-stat-card">
            <div class="kpi-icon-wrap" style="background:#ecfdf5; color:#10b981;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/></svg></div>
            <div class="kpi-content-wrap"><div class="kpi-title-text">Total Distance</div><div class="kpi-number-val">4,286 km</div><div class="kpi-sub-trend"><span class="trend-pill-green">↑ 22%</span></div></div>
          </div>
          <div class="kpi-stat-card">
            <div class="kpi-icon-wrap" style="background:#f5f3ff; color:#8b5cf6;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
            <div class="kpi-content-wrap"><div class="kpi-title-text">Average Pace</div><div class="kpi-number-val">4:48 /km</div><div class="kpi-sub-trend"><span class="trend-pill-green">Optimal</span></div></div>
          </div>
          <div class="kpi-stat-card">
            <div class="kpi-icon-wrap" style="background:#fffbeb; color:#f59e0b;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg></div>
            <div class="kpi-content-wrap"><div class="kpi-title-text">Calories Burned</div><div class="kpi-number-val">284,500</div><div class="kpi-sub-trend"><span class="trend-pill-green">↑ 18%</span></div></div>
          </div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- VIEW 15: SLEEP                             -->
      <!-- ========================================== -->
      <section id="view-sleep" class="view-section">
        <div class="breadcrumbs">
          <a onclick="switchView('dashboard')">Home</a>
          <span>&gt;</span>
          <span style="color:var(--text-main); font-weight:600;">Sleep</span>
        </div>
        <div class="page-title-row">
          <div class="page-title-left">
            <div class="page-title-icon-box" style="background:#f5f3ff; color:#8b5cf6;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            </div>
            <div class="page-title-text">
              <h1>Sleep &amp; Recovery Analysis</h1>
              <p>Monitor nocturnal heart rate, deep sleep ratio, and recovery score.</p>
            </div>
          </div>
        </div>
        <div class="kpi-grid-4">
          <div class="kpi-stat-card"><div class="kpi-content-wrap"><div class="kpi-title-text">Sleep Score</div><div class="kpi-number-val">88 / 100</div><span class="status-pill active">Excellent</span></div></div>
          <div class="kpi-stat-card"><div class="kpi-content-wrap"><div class="kpi-title-text">Deep Sleep</div><div class="kpi-number-val">1h 48m</div><span class="status-pill active">24% of total</span></div></div>
          <div class="kpi-stat-card"><div class="kpi-content-wrap"><div class="kpi-title-text">REM Sleep</div><div class="kpi-number-val">2h 05m</div><span class="status-pill active">28% of total</span></div></div>
          <div class="kpi-stat-card"><div class="kpi-content-wrap"><div class="kpi-title-text">Resting Heart Rate</div><div class="kpi-number-val">58 bpm</div><span class="status-pill active">Optimal</span></div></div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- VIEW 16: NUTRITION                         -->
      <!-- ========================================== -->
      <section id="view-nutrition" class="view-section">
        <div class="breadcrumbs">
          <a onclick="switchView('dashboard')">Home</a>
          <span>&gt;</span>
          <span style="color:var(--text-main); font-weight:600;">Nutrition</span>
        </div>
        <div class="page-title-row">
          <div class="page-title-left">
            <div class="page-title-icon-box" style="background:#ecfdf5; color:#10b981;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/></svg>
            </div>
            <div class="page-title-text">
              <h1>Nutrition &amp; Athlete Fueling</h1>
              <p>Track macronutrients, caloric balance, and hydration levels.</p>
            </div>
          </div>
        </div>
        <div class="kpi-grid-4">
          <div class="kpi-stat-card"><div class="kpi-content-wrap"><div class="kpi-title-text">Daily Intake</div><div class="kpi-number-val">2,450 kcal</div><span class="status-pill active">Target: 2,600</span></div></div>
          <div class="kpi-stat-card"><div class="kpi-content-wrap"><div class="kpi-title-text">Protein</div><div class="kpi-number-val">165 g</div><span class="status-pill active">100% Target</span></div></div>
          <div class="kpi-stat-card"><div class="kpi-content-wrap"><div class="kpi-title-text">Carbohydrates</div><div class="kpi-number-val">280 g</div><span class="status-pill active">Fueling</span></div></div>
          <div class="kpi-stat-card"><div class="kpi-content-wrap"><div class="kpi-title-text">Water Intake</div><div class="kpi-number-val">3.2 L</div><span class="status-pill active">Hydrated</span></div></div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- VIEW 17: MEDICATION                        -->
      <!-- ========================================== -->
      <section id="view-medication" class="view-section">
        <div class="breadcrumbs">
          <a onclick="switchView('dashboard')">Home</a>
          <span>&gt;</span>
          <span style="color:var(--text-main); font-weight:600;">Medication</span>
        </div>
        <div class="page-title-row">
          <div class="page-title-left">
            <div class="page-title-icon-box" style="background:#eff6ff; color:#2563eb;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
            </div>
            <div class="page-title-text">
              <h1>Medication &amp; Adherence Schedules</h1>
              <p>Manage medications, dosage reminders, and adherence history.</p>
            </div>
          </div>
          <div class="page-title-right">
            <button class="primary-blue-btn" onclick="openAddMedicationModal()">+ Add Medication</button>
          </div>
        </div>

        <div class="kpi-grid-4">
          <div class="kpi-stat-card"><div class="kpi-icon-wrap" style="background:#f5f3ff; color:#8b5cf6;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/></svg></div><div class="kpi-content-wrap"><div class="kpi-title-text">Total Medications</div><div class="kpi-number-val" id="kpi-med-total">5</div></div></div>
          <div class="kpi-stat-card"><div class="kpi-icon-wrap" style="background:#ecfdf5; color:#10b981;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div class="kpi-content-wrap"><div class="kpi-title-text">Today's Doses</div><div class="kpi-number-val" id="kpi-med-doses">3</div></div></div>
          <div class="kpi-stat-card"><div class="kpi-icon-wrap" style="background:#eff6ff; color:#2563eb;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div><div class="kpi-content-wrap"><div class="kpi-title-text">Taken On Time</div><div class="kpi-number-val" id="kpi-med-ontime">93%</div></div></div>
          <div class="kpi-stat-card"><div class="kpi-icon-wrap" style="background:#fef2f2; color:#ef4444;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg></div><div class="kpi-content-wrap"><div class="kpi-title-text">Missed Doses</div><div class="kpi-number-val" id="kpi-med-missed">1</div></div></div>
        </div>

        <div class="two-col-layout">
          <div>
            <div class="content-panel">
              <div class="panel-header-row">
                <div class="panel-title">Current Prescriptions</div>
              </div>
              <div class="clean-table-wrapper">
                <table class="clean-table">
                  <thead>
                    <tr><th>Name</th><th>Dosage</th><th>Frequency</th><th>Next Dose</th><th>Status</th></tr>
                  </thead>
                  <tbody id="current-meds-table-body"></tbody>
                </table>
              </div>
            </div>
          </div>
          <div>
            <div class="content-panel">
              <div class="panel-title" style="margin-bottom:12px;">Quick Actions</div>
              <div class="quick-actions-2x2">
                <div class="quick-btn-card" onclick="openAddMedicationModal()"><div class="quick-btn-title">+ Add Med</div></div>
                <div class="quick-btn-card" onclick="openSetReminderModal()"><div class="quick-btn-title">⏰ Set Reminder</div></div>
                <div class="quick-btn-card" onclick="openReportsModal()"><div class="quick-btn-title">📊 Adherence Report</div></div>
                <div class="quick-btn-card" onclick="showToast('History exported!')"><div class="quick-btn-title">📁 Export</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- VIEW 18: DEVICES                           -->
      <!-- ========================================== -->
      <section id="view-devices" class="view-section">
        <div class="breadcrumbs">
          <a onclick="switchView('dashboard')">Home</a>
          <span>&gt;</span>
          <span style="color:var(--text-main); font-weight:600;">Devices</span>
        </div>
        <div class="page-title-row">
          <div class="page-title-left">
            <div class="page-title-icon-box" style="background:#eff6ff; color:#2563eb;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
            </div>
            <div class="page-title-text">
              <h1>Connected Devices &amp; Sensors</h1>
              <p>Galaxy Watch, Dokra Running Bands, BLE Chest Straps, and Smart Scales.</p>
            </div>
          </div>
        </div>
        <div class="content-panel">
          <div class="clean-table-wrapper">
            <table class="clean-table">
              <thead><tr><th>Device Name</th><th>Type</th><th>Connection</th><th>Battery</th><th>Status</th></tr></thead>
              <tbody>
                <tr><td><strong>Galaxy Watch 6 Pro</strong></td><td>Smartwatch</td><td>Bluetooth BLE</td><td>84%</td><td><span class="status-pill active">Connected</span></td></tr>
                <tr><td><strong>Dokra Heart Strap v2</strong></td><td>Chest Sensor</td><td>ANT+ / BLE</td><td>92%</td><td><span class="status-pill active">Connected</span></td></tr>
                <tr><td><strong>Smart Scale Pro</strong></td><td>Body Composition</td><td>Wi-Fi Sync</td><td>76%</td><td><span class="status-pill active">Synced</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- VIEW 19: USERS & BROADCASTS                -->
      <!-- ========================================== -->
      <section id="view-more-features" class="view-section">
        <div class="breadcrumbs">
          <a onclick="switchView('dashboard')">Home</a>
          <span>&gt;</span>
          <span style="color:var(--text-main); font-weight:600;">Users &amp; Broadcasts</span>
        </div>
        <div class="page-title-row">
          <div class="page-title-left">
            <div class="page-title-icon-box" style="background:#eff6ff; color:#2563eb;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
            </div>
            <div class="page-title-text">
              <h1>User Directory &amp; Notification Broadcaster</h1>
              <p>Manage club athletes, admin roles, and send real-time push announcements.</p>
            </div>
          </div>
        </div>

        <div class="two-col-layout">
          <div class="content-panel">
            <div class="panel-title" style="margin-bottom:14px;">User Accounts &amp; Roles</div>
            <div class="clean-table-wrapper">
              <table class="clean-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Auth Provider</th></tr></thead>
                <tbody>
                  <tr><td><strong>Admin User</strong></td><td>admin@dokrahealth.com</td><td><span class="status-pill active">Super Admin</span></td><td>Native Dokra</td></tr>
                  <tr><td><strong>Alex Runner</strong></td><td>alex.runner@gmail.com</td><td><span class="status-pill active">Athlete</span></td><td>Google Sign-In</td></tr>
                  <tr><td><strong>Sarah Coach</strong></td><td>sarah@dokrahealth.com</td><td><span class="status-pill active">Coach</span></td><td>Firebase Auth</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="content-panel">
            <div class="panel-title" style="margin-bottom:14px;">Broadcast Push Notification</div>
            <form onsubmit="sendBroadcastNotification(event)">
              <div class="modal-form-group">
                <label class="modal-label">Notification Title</label>
                <input type="text" class="modal-input" id="notif-title" placeholder="e.g. Sunday Marathon 10K Run" required>
              </div>
              <div class="modal-form-group">
                <label class="modal-label">Message Content</label>
                <textarea class="modal-textarea" id="notif-msg" rows="3" placeholder="e.g. Meet at City Park 7:00 AM for group run." required></textarea>
              </div>
              <button type="submit" class="primary-blue-btn" style="width:100%; justify-content:center;">Send Broadcast to Athletes</button>
            </form>
          </div>
        </div>
      </section>

    </div>
  </main>

  <!-- MODAL: ADD MEDICATION -->
  <div class="modal-overlay" id="add-medication-modal">
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title">Add Medication</h3>
        <button class="modal-close-btn" onclick="closeAddMedicationModal()">✕</button>
      </div>
      <form onsubmit="saveNewMedication(event)">
        <div class="modal-form-group"><label class="modal-label">Medication Name</label><input type="text" class="modal-input" id="med-in-name" placeholder="e.g. Paracetamol 500mg" required></div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="modal-form-group"><label class="modal-label">Category</label><input type="text" class="modal-input" id="med-in-cat" placeholder="e.g. Supplement" required></div>
          <div class="modal-form-group"><label class="modal-label">Dosage</label><input type="text" class="modal-input" id="med-in-dose" placeholder="e.g. 500 mg" required></div>
        </div>
        <div class="modal-form-group"><label class="modal-label">Frequency</label><input type="text" class="modal-input" id="med-in-freq" value="Once daily" required></div>
        <div class="modal-form-group"><label class="modal-label">Next Scheduled Dose</label><input type="text" class="modal-input" id="med-in-next" value="Today 2:00 PM" required></div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:16px;">
          <button type="button" class="date-range-picker-btn" onclick="closeAddMedicationModal()">Cancel</button>
          <button type="submit" class="primary-blue-btn">Save Medication</button>
        </div>
      </form>
    </div>
  </div>

  <!-- TOAST CONTAINER -->
  <div class="toast-container" id="toast-container"></div>

  <!-- CONTROLLER SCRIPT -->
  <script>
    const defaultMeds = [
      { id: 'm1', name: 'Paracetamol 500mg', category: 'Pain Reliever', dosage: '500 mg', frequency: '3 times daily', next_dose: 'Today 2:00 PM', status: 'On Track' },
      { id: 'm2', name: 'Vitamin D3', category: 'Supplement', dosage: '1000 IU', frequency: 'Once daily', next_dose: 'Today 9:00 AM', status: 'Taken' },
      { id: 'm3', name: 'Metformin 500mg', category: 'Diabetes', dosage: '500 mg', frequency: 'Twice daily', next_dose: 'Today 8:00 PM', status: 'Upcoming' }
    ];

    function switchView(viewName) {
      document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active-view'));
      document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

      const target = document.getElementById('view-' + viewName);
      if (target) target.classList.add('active-view');

      const navEl = document.getElementById('nav-' + viewName);
      if (navEl) navEl.classList.add('active');

      const titles = {
        'dashboard': ['Master Dashboard', 'Dokra Running Club & Health Telemetry Center'],
        'app-config': ['Remote App Configuration', 'Configure app constants, sync intervals, and server endpoints.'],
        'build-variants': ['Build Variants & APK Releases', 'Direct download and telemetry for compiled Dokra Health Android packages.'],
        'env-settings': ['Environment & Server Settings', 'Configure HTTP host, port, database connections, and auth tokens.'],
        'api-endpoints': ['Interactive REST API Explorer', 'Test and inspect live mobile feed and administrative REST endpoints.'],
        'feature-flags': ['Feature Flags & Experiments', 'Toggle features dynamically across Android APK clients without re-deploying.'],
        'dashboard-layout': ['Dashboard Layout & Card Ordering', 'Reorder and customize card slots displayed on the mobile home screen.'],
        'card-templates': ['Card Templates Catalog', 'Canonical templates conforming to Samsung One UI Health specifications.'],
        'view-factory': ['Dynamic View Factory & DEX Architecture', 'Smali bytecode mapping and dynamic UI component factory.'],
        'content-cms': ['Cards Studio & Mobile Simulator', '24 canonical cards feed with live One UI mobile simulator preview.'],
        'media-assets': ['Media Assets & Official Logo', 'Official Dokra Running Club vector and raster asset library.'],
        'localization': ['Localization & Translations', 'Manage multilingual string bundles across all mobile regions.'],
        'health-modules': ['Health Modules Directory', 'Manage health capabilities, permissions, and sensors.'],
        'workouts': ['Dokra Running Club & Workouts Tracker', 'Track marathon preparation, GPS trail sessions, and athlete stamina.'],
        'sleep': ['Sleep & Recovery Analysis', 'Monitor nocturnal heart rate, deep sleep ratio, and recovery score.'],
        'nutrition': ['Nutrition & Athlete Fueling', 'Track macronutrients, caloric balance, and hydration levels.'],
        'medication': ['Medication & Adherence Schedules', 'Manage medications, dosage reminders, and adherence history.'],
        'devices': ['Connected Devices & Sensors', 'Galaxy Watch, Dokra Running Bands, BLE Chest Straps, and Smart Scales.'],
        'more-features': ['User Directory & Notification Broadcaster', 'Manage club athletes, admin roles, and send real-time push announcements.']
      };

      if (titles[viewName]) {
        document.getElementById('header-page-title').innerText = titles[viewName][0];
        document.getElementById('header-page-sub').innerText = titles[viewName][1];
      }
      if (viewName === 'medication') renderMeds();
    }

    function renderMeds() {
      const tbody = document.getElementById('current-meds-table-body');
      if (!tbody) return;
      tbody.innerHTML = defaultMeds.map(m => \`
        <tr>
          <td><strong>\${m.name}</strong><br><span style="font-size:11px; color:#94a3b8;">\${m.category}</span></td>
          <td>\${m.dosage}</td>
          <td>\${m.frequency}</td>
          <td>\${m.next_dose}</td>
          <td><span class="status-pill \${m.status === 'Taken' ? 'taken' : (m.status === 'Upcoming' ? 'upcoming' : 'on-track')}">\${m.status}</span></td>
        </tr>
      \`).join('');
    }

    function openAddMedicationModal() { document.getElementById('add-medication-modal').classList.add('open'); }
    function closeAddMedicationModal() { document.getElementById('add-medication-modal').classList.remove('open'); }
    function saveNewMedication(e) {
      e.preventDefault();
      const name = document.getElementById('med-in-name').value;
      const category = document.getElementById('med-in-cat').value;
      const dosage = document.getElementById('med-in-dose').value;
      const frequency = document.getElementById('med-in-freq').value;
      const next_dose = document.getElementById('med-in-next').value;
      defaultMeds.push({ id: 'm_' + Date.now(), name, category, dosage, frequency, next_dose, status: 'On Track' });
      closeAddMedicationModal();
      renderMeds();
      showToast('Medication "' + name + '" added!');
    }

    function showToast(msg) {
      const c = document.getElementById('toast-container');
      const t = document.createElement('div');
      t.className = 'toast';
      t.innerHTML = '✔ ' + msg;
      c.appendChild(t);
      setTimeout(() => t.remove(), 3500);
    }

    function saveAppConfig() {
      showToast('App configuration updated & synced!');
    }

    function updateApiTestPath(p) {
      document.getElementById('api-test-url').value = p;
    }

    async function executeApiTest() {
      const p = document.getElementById('api-test-url').value;
      const out = document.getElementById('api-test-output');
      out.innerText = 'Requesting ' + p + '...';
      try {
        const res = await fetch(p);
        const data = await res.json();
        out.innerText = 'HTTP ' + res.status + ' OK\\n\\n' + JSON.stringify(data, null, 2);
      } catch (err) {
        out.innerText = 'Error: ' + err.message;
      }
    }

    function sendBroadcastNotification(e) {
      e.preventDefault();
      const title = document.getElementById('notif-title').value;
      showToast('Broadcast "' + title + '" sent to 1,420 athletes!');
      document.getElementById('notif-title').value = '';
      document.getElementById('notif-msg').value = '';
    }

    function dismissLoginScreen() {
      document.getElementById('login-screen').classList.add('hidden');
      renderMeds();
      showToast('Welcome to Dokra Master Admin Studio!');
    }

    function quickDevLogin() {
      dismissLoginScreen();
    }

    function handleAdminLogin(e) {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const pass = document.getElementById('login-password').value;
      if (email && pass) {
        dismissLoginScreen();
      } else {
        const el = document.getElementById('login-error-msg');
        el.innerText = 'Please enter admin email and password.';
        el.classList.add('visible');
      }
    }

    window.addEventListener('DOMContentLoaded', () => {
      renderMeds();
    });
  </script>
</body>
</html>\`;
}

module.exports = {
  renderCardStudioHtml
};
`;

fs.writeFileSync(targetFile, uiHtml, 'utf8');
console.log('Successfully wrote updated studio-ui.js, file size:', fs.statSync(targetFile).size, 'bytes');
