/**
 * auth.js - User Registration & Login Module
 * Case-insensitive password support, Supabase schema alignment, and exported sha256
 */
const AuthModule = (function () {
  let authMode = 'login';

  async function sha256(str) {
    try {
      if (window.crypto && crypto.subtle) {
        const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (e) {}
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
  }

  async function getDeterministicUserHash(username) {
    const clean = (username || '').trim().toUpperCase();
    return await sha256(`CW26_USER_${clean}`);
  }

  function promptAuthModal(mode = 'login') {
    switchMode(mode);
    document.getElementById('auth-username').value = localStorage.getItem(AppConfig.STORAGE_KEYS.PLAYER_NAME) || '';
    document.getElementById('auth-password').value = '';
    document.getElementById('auth-error-msg').style.display = 'none';
    document.getElementById('auth-modal').style.display = 'flex';
    setTimeout(() => document.getElementById('auth-username').focus(), 60);
  }

  function closeAuthModal() {
    document.getElementById('auth-modal').style.display = 'none';
  }

  function switchMode(mode) {
    authMode = mode;
    const isLogin = mode === 'login';
    document.getElementById('auth-title').innerText = isLogin ? 'PELICAN TOWN FARM REGISTRY' : 'CREATE NEW FARMER ACCOUNT';
    document.getElementById('auth-subtitle').innerText = isLogin 
      ? 'Enter your username and password to log in.' 
      : 'Register your username and password to track predictions!';
    document.getElementById('tab-mode-login').classList.toggle('active', isLogin);
    document.getElementById('tab-mode-register').classList.toggle('active', !isLogin);
    document.getElementById('auth-submit-btn').innerText = isLogin ? 'SIGN IN' : 'REGISTER FARMER';
    document.getElementById('auth-error-msg').style.display = 'none';
  }

  async function handleAuthSubmit() {
    const usernameInput = document.getElementById('auth-username').value.trim();
    const rawPass = document.getElementById('auth-password').value.trim();
    const errElem = document.getElementById('auth-error-msg');

    if (!usernameInput) {
      showError("Please enter your username.");
      return;
    }

    const cleanUsername = usernameInput.toUpperCase().replace(/[^A-Z0-9\-_'\s]/g, '').trim();
    if (cleanUsername.length < 2) {
      showError("Username must be at least 2 characters.");
      return;
    }

    if (!rawPass || rawPass.length < 3) {
      showError("Password must be at least 3 characters.");
      return;
    }

    // Password is case-insensitive
    const caseInsensitivePass = rawPass.toLowerCase();
    const passwordHash = await sha256(`CW26_PASS_${cleanUsername}_${caseInsensitivePass}`);
    const userHash = await getDeterministicUserHash(cleanUsername);

    if (authMode === 'register') {
      const checkRes = await executeSupabaseRest(`chicken_wars_users?username=eq.${encodeURIComponent(cleanUsername)}&select=id`);
      if (checkRes.success && Array.isArray(checkRes.data) && checkRes.data.length > 0) {
        showError("That username is already taken! Please choose another or login.");
        return;
      }

      const createRes = await executeSupabaseRest('chicken_wars_users', 'POST', {
        username: cleanUsername,
        password_hash: passwordHash,
        last_login: new Date().toISOString()
      });

      if (!createRes.success) {
        showError(`Registration Error: ${createRes.error || 'Database unavailable'}`);
        return;
      }

      await executeSupabaseRest('chicken_wars_scores', 'POST', {
        user_hash: userHash,
        player_name: cleanUsername,
        score: 0,
        correct_picks: 0,
        last_active_date: getTodayDateString(),
        updated_at: new Date().toISOString()
      });

      finalizeLogin(cleanUsername, userHash);

    } else {
      const userRes = await executeSupabaseRest(`chicken_wars_users?username=eq.${encodeURIComponent(cleanUsername)}&select=*`);
      if (!userRes.success || !Array.isArray(userRes.data) || userRes.data.length === 0) {
        showError("Farmer not found. Please click 'NEW FARMER' to register!");
        return;
      }

      const user = userRes.data[0];
      if (user.password_hash !== passwordHash) {
        showError("Incorrect password! Please try again.");
        return;
      }

      await executeSupabaseRest(`chicken_wars_users?username=eq.${encodeURIComponent(cleanUsername)}`, 'PATCH', {
        last_login: new Date().toISOString()
      });

      finalizeLogin(cleanUsername, userHash);
    }
  }

  function finalizeLogin(username, userHash) {
    const prevName = localStorage.getItem(AppConfig.STORAGE_KEYS.PLAYER_NAME);
    if (prevName && prevName !== username) {
      localStorage.removeItem(AppConfig.STORAGE_KEYS.VOTE_LEDGER);
    }

    localStorage.setItem(AppConfig.STORAGE_KEYS.PLAYER_NAME, username);
    localStorage.setItem(AppConfig.STORAGE_KEYS.USER_HASH, userHash);
    localStorage.setItem(AppConfig.STORAGE_KEYS.LAST_LOGIN, getTodayDateString());

    document.getElementById('current-player-name').innerText = username;
    closeAuthModal();
    AudioModule.sfxFanfare();

    BracketModule.onUserLogin(username, userHash);
  }

  function showError(msg) {
    const err = document.getElementById('auth-error-msg');
    err.innerText = msg;
    err.style.display = 'block';
    AudioModule.sfxBuzz();
  }

  function getTodayDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  async function executeSupabaseRest(endpoint, method = 'GET', body = null) {
    const cleanUrl = AppConfig.SUPABASE_URL.replace(/\/+$/, '');
    const headers = {
      'apikey': AppConfig.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${AppConfig.SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
    try {
      const opts = { method, headers };
      if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
        opts.body = JSON.stringify(body);
      }
      const res = await fetch(`${cleanUrl}/rest/v1/${endpoint}`, opts);
      if (!res.ok) {
        const errText = await res.text();
        return { success: false, status: res.status, error: errText };
      }
      const text = await res.text();
      const data = text ? JSON.parse(text) : [];
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  function init() {
    const storedName = localStorage.getItem(AppConfig.STORAGE_KEYS.PLAYER_NAME);
    const lastLogin = localStorage.getItem(AppConfig.STORAGE_KEYS.LAST_LOGIN);
    const today = getTodayDateString();

    if (storedName) {
      document.getElementById('current-player-name').innerText = storedName;
    }

    if (!storedName || lastLogin !== today) {
      promptAuthModal('login');
    }

    document.getElementById('auth-password').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAuthSubmit();
    });
    document.getElementById('auth-username').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('auth-password').focus();
    });
  }

  return {
    init,
    promptAuthModal,
    closeAuthModal,
    switchMode,
    handleAuthSubmit,
    getDeterministicUserHash,
    sha256
  };
})();
