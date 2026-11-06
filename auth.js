/**
 * auth.js
 * First-access prompt, username registration matching chicken_wars_users columns:
 * (id, username, password_hash, created_at, last_login)
 */
const AuthModule = (() => {
  let authMode = 'choice'; // 'choice' | 'login' | 'register'
  const STORAGE_USER_KEY = 'CW26_FARMER_LAST_NAME';
  const STORAGE_HASH_KEY = 'CW26_FARMER_USER_HASH';

  function init() {
    const savedName = localStorage.getItem(STORAGE_USER_KEY);
    if (!savedName) {
      promptAuthModal();
    } else {
      updateFarmerDisplay(savedName);
    }
  }

  function promptAuthModal() {
    resetToChoice();
    document.getElementById('auth-gate-modal').style.display = 'flex';
  }

  function promptSwitchUser() {
    promptAuthModal();
  }

  function resetToChoice() {
    authMode = 'choice';
    document.getElementById('auth-step-choice').style.display = 'flex';
    document.getElementById('auth-form').style.display = 'none';
    document.getElementById('auth-title').innerText = "WELCOME TO THE COOP!";
    document.getElementById('auth-message').innerText = "Are you a returning Farmer or setting up a new coop?";
    document.getElementById('auth-error-msg').innerText = '';
    document.getElementById('auth-username').value = '';
    document.getElementById('auth-password').value = '';
  }

  function setAuthMode(mode) {
    authMode = mode;
    document.getElementById('auth-step-choice').style.display = 'none';
    document.getElementById('auth-form').style.display = 'block';
    document.getElementById('auth-error-msg').innerText = '';

    if (mode === 'login') {
      document.getElementById('auth-title').innerText = "FARMER LOGIN";
      document.getElementById('auth-message').innerText = "Enter your LAST NAME (Username) and password.";
      document.getElementById('auth-action-submit').innerText = "LOGIN";
    } else {
      document.getElementById('auth-title').innerText = "REGISTER COOP BALLOT";
      document.getElementById('auth-message').innerText = "Create an account with your LAST NAME and a password.";
      document.getElementById('auth-action-submit').innerText = "REGISTER";
    }
    document.getElementById('auth-username').focus();
  }

  async function sha256(str) {
    try {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch(e) {
      let h = 0;
      for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
      return String(h);
    }
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    const errorEl = document.getElementById('auth-error-msg');
    errorEl.innerText = '';

    const rawName = document.getElementById('auth-username').value.trim();
    // CASE-INSENSITIVE USER PASSWORD:
    // Standardize to lowercase and trim spaces before hashing
    const rawPass = (document.getElementById('auth-password').value || '').trim().toLowerCase();

    const username = rawName.toUpperCase().replace(/[^A-Z0-9\-\'\s]/g, '').trim();
    if (!username) {
      errorEl.innerText = "Please enter a valid last name / username.";
      return;
    }

    if (!rawPass || rawPass.length < 4) {
      errorEl.innerText = "Password must be at least 4 characters.";
      return;
    }

    const passHash = await sha256(rawPass + "_CW26_SALT");
    const userHash = await sha256(username + "_CW26_USER");

    if (!window.supabaseClient) {
      errorEl.innerText = "Database offline. Check Supabase URL & Key in config.js.";
      return;
    }

    if (authMode === 'register') {
      // 1. Check if username already exists in chicken_wars_users
      const { data: existing, error: checkError } = await window.supabaseClient
        .from('chicken_wars_users')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      if (checkError) {
        errorEl.innerText = "Registration query error: " + checkError.message;
        return;
      }

      if (existing) {
        errorEl.innerText = "This username is already registered. Please click 'BACK' and choose Login.";
        return;
      }

      // 2. Insert into chicken_wars_users matching schema:
      // (username, password_hash, last_login)
      const nowIso = new Date().toISOString();
      const { error: insertError } = await window.supabaseClient
        .from('chicken_wars_users')
        .insert([{
          username: username,
          password_hash: passHash,
          last_login: nowIso
        }]);

      if (insertError) {
        errorEl.innerText = "Registration error: " + insertError.message;
        return;
      }

      // 3. Initialize user score row
      await window.supabaseClient
        .from('chicken_wars_scores')
        .upsert([{
          user_hash: userHash,
          player_name: username,
          score: 0,
          correct_picks: 0
        }], { onConflict: 'user_hash' });

      completeAuth(username, userHash);

    } else if (authMode === 'login') {
      // Authenticate against chicken_wars_users
      const { data: user, error } = await window.supabaseClient
        .from('chicken_wars_users')
        .select('*')
        .eq('username', username)
        .eq('password_hash', passHash)
        .maybeSingle();

      if (error || !user) {
        errorEl.innerText = "Invalid username or password.";
        return;
      }

      // Update last_login timestamp
      await window.supabaseClient
        .from('chicken_wars_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      completeAuth(user.username, userHash);
    }
  }

  function completeAuth(username, userHash) {
    localStorage.setItem(STORAGE_USER_KEY, username);
    localStorage.setItem(STORAGE_HASH_KEY, userHash);
    document.getElementById('auth-gate-modal').style.display = 'none';
    updateFarmerDisplay(username);
    AudioModule.playCluck();
    if (window.BracketModule) {
      BracketModule.onUserAuthenticated();
    }
  }

  function updateFarmerDisplay(name) {
    const el = document.getElementById('current-player-name');
    if (el) el.innerText = name;
  }

  function getCurrentUser() {
    return {
      lastName: localStorage.getItem(STORAGE_USER_KEY) || '',
      userHash: localStorage.getItem(STORAGE_HASH_KEY) || ''
    };
  }

  return {
    init,
    setAuthMode,
    resetToChoice,
    handleAuthSubmit,
    promptSwitchUser,
    getCurrentUser,
    sha256
  };
})();
