/**
 * Auth Module: First access modal gate with Supabase password & last name verification
 */
const AuthModule = (function () {
  let authMode = 'choice'; // 'choice' | 'login' | 'register'
  let currentUser = null;

  async function sha256(str) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function checkSession() {
    const stored = localStorage.getItem(AppConfig.AUTH_USER_KEY);
    if (stored) {
      currentUser = stored.toUpperCase();
      document.getElementById('current-player-name').innerText = currentUser;
      closeGate();
    } else {
      openGate();
    }
  }

  function openGate() {
    resetToChoice();
    document.getElementById('auth-gate-modal').style.display = 'flex';
  }

  function closeGate() {
    document.getElementById('auth-gate-modal').style.display = 'none';
  }

  function resetToChoice() {
    authMode = 'choice';
    document.getElementById('auth-step-choice').style.display = 'flex';
    document.getElementById('auth-form').style.display = 'none';
    document.getElementById('auth-error-msg').innerText = '';
    document.getElementById('auth-title').innerText = "WELCOME TO THE COOP!";
    document.getElementById('auth-message').innerText = "Are you a returning Farmer or setting up a new coop?";
  }

  function setAuthMode(mode) {
    authMode = mode;
    document.getElementById('auth-step-choice').style.display = 'none';
    document.getElementById('auth-form').style.display = 'block';
    document.getElementById('auth-error-msg').innerText = '';
    
    if (mode === 'login') {
      document.getElementById('auth-title').innerText = "FARMER LOGIN";
      document.getElementById('auth-message').innerText = "Enter your Last Name and password to continue your season.";
      document.getElementById('auth-action-submit').innerText = "LOGIN";
    } else {
      document.getElementById('auth-title').innerText = "NEW FARMER SIGNUP";
      document.getElementById('auth-message').innerText = "Register your Last Name and choose a secret password.";
      document.getElementById('auth-action-submit').innerText = "CREATE ACCOUNT";
    }
    document.getElementById('auth-username').focus();
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('auth-username').value.trim().toUpperCase();
    const cleanUsername = usernameInput.replace(/[^A-Z0-9\-']/g, '');
    const password = document.getElementById('auth-password').value;
    const errorEl = document.getElementById('auth-error-msg');

    if (!cleanUsername || password.length < 4) {
      errorEl.innerText = "Please provide your last name & min 4-character password.";
      return;
    }

    const hashed = await sha256(`CHICKEN_SALT_${password}`);
    const supabase = window.supabaseClient;

    if (authMode === 'register') {
      // Check if user already exists
      const { data: existing } = await supabase
        .from('chicken_wars_users')
        .select('username')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (existing) {
        errorEl.innerText = "That last name is already registered! Please log in.";
        return;
      }

      // Insert new user
      const { error: insertErr } = await supabase
        .from('chicken_wars_users')
        .insert([{ username: cleanUsername, password_hash: hashed }]);

      if (insertErr) {
        errorEl.innerText = "Database error registering user: " + insertErr.message;
        return;
      }

      // Initialize score entry
      await supabase.from('chicken_wars_scores').insert([{
        player_name: cleanUsername,
        user_hash: await sha256(`HASH_${cleanUsername}`),
        score: 0,
        correct_picks: 0
      }]);

    } else if (authMode === 'login') {
      const { data: user, error: fetchErr } = await supabase
        .from('chicken_wars_users')
        .select('*')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (!user || user.password_hash !== hashed) {
        errorEl.innerText = "Incorrect last name or password.";
        return;
      }

      // Update last login
      await supabase.from('chicken_wars_users')
        .update({ last_login: new Date().toISOString() })
        .eq('username', cleanUsername);
    }

    // Success: Set local session
    localStorage.setItem(AppConfig.AUTH_USER_KEY, cleanUsername);
    currentUser = cleanUsername;
    document.getElementById('current-player-name').innerText = cleanUsername;
    closeGate();
    
    // Sync bracket and scores
    if (window.BracketModule) {
      BracketModule.onUserAuthenticated();
    }
  }

  function promptSwitchUser() {
    openGate();
  }

  function getCurrentUser() {
    return currentUser;
  }

  return {
    init: checkSession,
    setAuthMode: setAuthMode,
    resetToChoice: resetToChoice,
    handleAuthSubmit: handleAuthSubmit,
    promptSwitchUser: promptSwitchUser,
    getCurrentUser: getCurrentUser,
    sha256: sha256
  };
})();
