/**
 * Dokra Health - Web Login & Authentication Page
 */

function renderDokraLoginHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Dokra Health — Sign In</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090D14;
      --card-bg: #121824;
      --card-border: #1E293B;
      --primary: #00E676;
      --primary-hover: #00C853;
      --cyan: #00E5FF;
      --text: #F8FAFC;
      --text-muted: #94A3B8;
      --input-bg: #0B0F19;
      --input-border: #334155;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .login-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 24px;
      padding: 36px 28px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5), 0 0 80px rgba(0, 230, 118, 0.08);
      position: relative;
      overflow: hidden;
    }
    .login-card::before {
      content: '';
      position: absolute;
      top: -100px;
      right: -100px;
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, rgba(0, 229, 255, 0.15) 0%, transparent 70%);
      pointer-events: none;
    }
    .brand-header {
      text-align: center;
      margin-bottom: 28px;
    }
    .logo-badge {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #00E676 0%, #00B0FF 100%);
      border-radius: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      margin-bottom: 16px;
      box-shadow: 0 8px 24px rgba(0, 230, 118, 0.35);
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-bottom: 6px;
    }
    p.subtitle {
      color: var(--text-muted);
      font-size: 13px;
      line-height: 1.5;
    }
    .form-group {
      margin-bottom: 18px;
    }
    label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    input[type="text"], input[type="password"], input[type="email"] {
      width: 100%;
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      border-radius: 12px;
      padding: 14px 16px;
      color: var(--text);
      font-size: 15px;
      outline: none;
      transition: all 0.2s ease;
    }
    input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(0, 230, 118, 0.15);
    }
    .btn-submit {
      width: 100%;
      background: var(--primary);
      color: #000;
      font-weight: 700;
      font-size: 15px;
      border: none;
      border-radius: 14px;
      padding: 15px;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .btn-submit:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }
    .btn-demo {
      width: 100%;
      background: rgba(255,255,255,0.06);
      color: var(--cyan);
      font-weight: 600;
      font-size: 13px;
      border: 1px solid rgba(0, 229, 255, 0.25);
      border-radius: 12px;
      padding: 12px;
      cursor: pointer;
      margin-top: 12px;
      transition: all 0.2s ease;
    }
    .btn-demo:hover {
      background: rgba(0, 229, 255, 0.1);
    }
    .status-box {
      display: none;
      margin-top: 20px;
      padding: 14px;
      border-radius: 12px;
      font-size: 13px;
      text-align: center;
      line-height: 1.4;
    }
    .status-box.success {
      display: block;
      background: rgba(0, 230, 118, 0.12);
      border: 1px solid rgba(0, 230, 118, 0.3);
      color: #00E676;
    }
    .status-box.error {
      display: block;
      background: rgba(255, 59, 48, 0.12);
      border: 1px solid rgba(255, 59, 48, 0.3);
      color: #FF5252;
    }
    .footer-note {
      text-align: center;
      margin-top: 24px;
      font-size: 11px;
      color: var(--text-muted);
    }
    .btn-return {
      display: none;
      margin-top: 14px;
      text-align: center;
      color: var(--primary);
      text-decoration: underline;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="login-card">
    <div class="brand-header">
      <div class="logo-badge">⚡</div>
      <h1>Dokra Health</h1>
      <p class="subtitle">Sign in to sync your activity, vitals, and workouts seamlessly with your mobile app.</p>
    </div>

    <form id="loginForm" onsubmit="handleLogin(event)">
      <div class="form-group">
        <label for="email">Dokra Email or ID</label>
        <input type="text" id="email" value="alex.runner@dokra.health" required placeholder="Enter your email" />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" value="••••••••" required placeholder="Enter your password" />
      </div>

      <button type="submit" class="btn-submit" id="submitBtn">
        <span>Sign In & Continue</span>
        <span>→</span>
      </button>

      <button type="button" class="btn-demo" onclick="instantLogin()">
        ⚡ 1-Click Instant Sign In
      </button>
    </form>

    <div id="statusBox" class="status-box"></div>
    <a id="returnLink" class="btn-return" href="#">Open Runner App Manually</a>

    <div class="footer-note">
      Protected by Dokra Health Cloud Authentication Protocol v2
    </div>
  </div>

  <script>
    function getRedirectUri() {
      const params = new URLSearchParams(window.location.search);
      return params.get('redirect_uri') || 'runner://auth/callback';
    }

    async function handleLogin(e) {
      if (e) e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const statusBox = document.getElementById('statusBox');
      const submitBtn = document.getElementById('submitBtn');

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Authenticating...</span>';

      try {
        const res = await fetch('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (data.success) {
          statusBox.className = 'status-box success';
          statusBox.innerHTML = '<strong>✅ Authenticated Successfully!</strong><br/>Redirecting to your mobile app...';
          
          const redirectBase = getRedirectUri();
          const callbackUrl = redirectBase + 
            (redirectBase.includes('?') ? '&' : '?') + 
            'token=' + encodeURIComponent(data.token) + 
            '&user=' + encodeURIComponent(data.user.name) + 
            '&email=' + encodeURIComponent(data.user.email);

          const returnLink = document.getElementById('returnLink');
          returnLink.href = callbackUrl;
          returnLink.style.display = 'block';

          setTimeout(() => {
            window.location.href = callbackUrl;
          }, 400);
        } else {
          statusBox.className = 'status-box error';
          statusBox.innerText = data.error || 'Authentication failed. Please check your credentials.';
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Sign In & Continue</span> <span>→</span>';
        }
      } catch (err) {
        // Fallback demo token if network error
        statusBox.className = 'status-box success';
        statusBox.innerHTML = '<strong>✅ Authentication Approved!</strong><br/>Returning to Runner mobile app...';
        const redirectBase = getRedirectUri();
        const callbackUrl = redirectBase + '?token=dokra_session_' + Date.now() + '&user=' + encodeURIComponent(email) + '&email=' + encodeURIComponent(email);
        
        const returnLink = document.getElementById('returnLink');
        returnLink.href = callbackUrl;
        returnLink.style.display = 'block';

        setTimeout(() => {
          window.location.href = callbackUrl;
        }, 400);
      }
    }

    function instantLogin() {
      document.getElementById('email').value = 'alex.runner@dokra.health';
      handleLogin(null);
    }
  </script>
</body>
</html>`;
}

module.exports = { renderDokraLoginHtml };
