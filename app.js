/**
 * App Module: Bootstrapper, Falling Chicken Strips, Feathers & Secret Easter Egg Engine
 */
document.addEventListener('DOMContentLoaded', () => {

  // 1. Randomize Secret Easter Egg Location Across Safe Viewport Zones
  function placeRandomEasterEgg() {
    const eggBtn = document.getElementById('secret-easter-egg-btn');
    if (!eggBtn) return;

    // Define safe spawn spots away from main banners and bracket cards
    const spots = [
      { top: '16px', right: '22px' },               // Top right corner
      { top: '82px', left: '24px' },                // Under jukebox
      { top: '140px', right: '35px' },              // Upper right edge
      { bottom: '70px', left: '30px' },             // Lower left above wheat
      { bottom: '70px', right: '40px' },            // Lower right above wheat
      { top: '22px', left: 'calc(50% + 280px)' },   // Right of hanging sign
      { top: '22px', left: 'calc(50% - 320px)' },   // Left of hanging sign
      { bottom: '65px', left: 'calc(50% - 150px)' } // Hidden in bottom wheat
    ];

    const chosen = spots[Math.floor(Math.random() * spots.length)];

    // Reset styles and apply randomized coordinates
    eggBtn.style.top = chosen.top || 'auto';
    eggBtn.style.bottom = chosen.bottom || 'auto';
    eggBtn.style.left = chosen.left || 'auto';
    eggBtn.style.right = chosen.right || 'auto';

    // Slight random rotation for natural farm appearance
    const randomRot = -15 + Math.floor(Math.random() * 30);
    eggBtn.style.transform = `rotate(${randomRot}deg)`;
  }

  try {
    placeRandomEasterEgg();
  } catch (err) {
    console.error("Easter egg placement error:", err);
  }

  // 2. Initialize Falling 8-Bit Chicken Strips & Big Feathers
  function initFloatingScenery() {
    const container = document.getElementById('feather-canvas-container');
    if (!container) return;
    container.innerHTML = '';
    const particleCount = 28;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      // 60% chicken strips, 40% farm feathers
      const isStrip = (i % 5 !== 0);
      particle.className = `floating-particle ${isStrip ? 'particle-tender' : 'particle-feather'}`;

      // Distribute horizontally across screen width
      particle.style.left = Math.random() * 95 + 'vw';

      // Varied fall speeds (11s to 24s)
      const duration = 11 + Math.random() * 13;
      particle.style.animationDuration = duration + 's';
      particle.style.animationDelay = -(Math.random() * duration) + 's';

      // Generous scale variance for big visual impact
      const scale = isStrip ? (0.9 + Math.random() * 0.7) : (0.85 + Math.random() * 0.65);
      particle.style.transform = `scale(${scale})`;
      container.appendChild(particle);
    }
  }

  try {
    initFloatingScenery();
  } catch (err) {
    console.error("Scenery animation error:", err);
  }

  // 3. Safe Supabase Client Initialization
  try {
    if (window.supabase && AppConfig.SUPABASE_URL && !AppConfig.SUPABASE_ANON_KEY.includes('...')) {
      window.supabaseClient = window.supabase.createClient(
        AppConfig.SUPABASE_URL,
        AppConfig.SUPABASE_ANON_KEY
      );
    } else {
      console.warn("Supabase credentials not configured in config.js. Running in demo mode.");
    }
  } catch (e) {
    console.warn("Supabase client init warning:", e);
  }

  // 4. Boot Submodules Independently
  try { AudioModule.init(); } catch (e) { console.error("Audio init error:", e); }
  try { AuthModule.init(); } catch (e) { console.error("Auth init error:", e); }
  try { MascotModule.init(); } catch (e) { console.error("Mascot init error:", e); }
  try { BracketModule.init(); } catch (e) { console.error("Bracket init error:", e); }

  // 5. Supabase Realtime Listener (if online)
  if (window.supabaseClient) {
    try {
      window.supabaseClient
        .channel('chicken-wars-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chicken_wars_votes' }, () => {
          BracketModule.fetchCloudLeaderboard();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chicken_wars_state' }, (payload) => {
          if (payload.new && payload.new.state_json) {
            BracketModule.init();
          }
        })
        .subscribe();
    } catch (e) {
      console.warn("Realtime channel subscription error:", e);
    }
  }
});
