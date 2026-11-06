/**
 * auth.js
 * First-access prompt, last-name username registration, case-insensitive passwords, and Supabase integration
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
      document.getElementById('auth-message').innerText = "Enter your LAST NAME and password to access your ballot.";
      document.getElementById('auth-action-submit').innerText = "LOGIN";
    } else {
      document.getElementById('auth-title').innerText = "REGISTER COOP BALLOT";
      document.getElementById('auth-message').innerText = "Register your LAST NAME and create a password.";
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
    // Convert to lowercase and trim spaces so casing never causes login issues
    const rawPass = (document.getElementById('auth-password').value || '').trim().toLowerCase();

    const lastName = rawName.toUpperCase().replace(/[^A-Z0-9\-\'\s]/g, '').trim();
    if (!lastName) {
      errorEl.innerText = "Please enter a valid last name.";
      return;
    }

    if (!rawPass || rawPass.length < 4) {
      errorEl.innerText = "Password must be at least 4 characters.";
      return;
    }

    const passHash = await sha256(rawPass + "_CW26_SALT");
    const userHash = await sha256(lastName + "_CW26_USER");

    if (!window.supabaseClient) {
      errorEl.innerText = "Database offline. Check Supabase URL & Key in config.js.";
      return;
    }

    if (authMode === 'register') {
      // 1. Check if user already exists
      const { data: existing, error: checkError } = await window.supabaseClient
        .from('chicken_wars_users')
        .select('id')
        .eq('last_name', lastName)
        .maybeSingle();

      if (checkError) {
        errorEl.innerText = "Registration query error: " + checkError.message;
        return;
      }

      if (existing) {
        errorEl.innerText = "This last name is already registered. Please choose Login.";
        return;
      }

      // 2. Create user record
      const { error: insertError } = await window.supabaseClient
        .from('chicken_wars_users')
        .insert([{
          last_name: lastName,
          password_hash: passHash,
          user_hash: userHash
        }]);

      if (insertError) {
        errorEl.innerText = "Registration error: " + insertError.message;
        return;
      }

      // 3. Initialize user score row
      await window.supabaseClient
        .from('chicken_wars_scores')
        .insert([{
          user_hash: userHash,
          player_name: lastName,
          score: 0,
          correct_picks: 0
        }]);

      completeAuth(lastName, userHash);

    } else if (authMode === 'login') {
      // Authenticate
      const { data: user, error } = await window.supabaseClient
        .from('chicken_wars_users')
        .select('*')
        .eq('last_name', lastName)
        .eq('password_hash', passHash)
        .maybeSingle();

      if (error || !user) {
        errorEl.innerText = "Invalid last name or password.";
        return;
      }

      completeAuth(user.last_name, user.user_hash);
    }
  }

  function completeAuth(lastName, userHash) {
    localStorage.setItem(STORAGE_USER_KEY, lastName);
    localStorage.setItem(STORAGE_HASH_KEY, userHash);
    document.getElementById('auth-gate-modal').style.display = 'none';
    updateFarmerDisplay(lastName);
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
