/**
 * App Module: Bootstrapper & Realtime Engine
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Falling 8-Bit Chicken Tenders & Feathers IMMEDIATELY
  function initFloatingScenery() {
    const container = document.getElementById('feather-canvas-container');
    if (!container) return;
    container.innerHTML = '';
    const particleCount = 32;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      // 60% chicken tenders, 40% farm feathers
      const isTender = (i % 5 !== 0);
      particle.className = `floating-particle ${isTender ? 'particle-tender' : 'particle-feather'}`;

      // Distribute horizontally across screen width
      particle.style.left = Math.random() * 95 + 'vw';

      // Varied fall speeds (11s to 24s)
      const duration = 11 + Math.random() * 13;
      particle.style.animationDuration = duration + 's';
      particle.style.animationDelay = -(Math.random() * duration) + 's';

      const scale = 0.7 + Math.random() * 0.75;
      particle.style.transform = `scale(${scale})`;
      container.appendChild(particle);
    }
  }

  try {
    initFloatingScenery();
  } catch (err) {
    console.error("Scenery animation error:", err);
  }

  // 2. Safe Supabase Client Initialization
  try {
    if (window.supabase && AppConfig.SUPABASE_URL && !AppConfig.SUPABASE_ANON_KEY.includes('...')) {
      window.supabaseClient = window.supabase.createClient(
        AppConfig.SUPABASE_URL,
        AppConfig.SUPABASE_ANON_KEY
      );
    } else {
      console.warn("Supabase credentials not configured in js/config.js. Running in demo mode.");
    }
  } catch (e) {
    console.warn("Supabase client init warning:", e);
  }

  // 3. Boot Submodules Independently
  try { AudioModule.init(); } catch (e) { console.error("Audio init error:", e); }
  try { AuthModule.init(); } catch (e) { console.error("Auth init error:", e); }
  try { MascotModule.init(); } catch (e) { console.error("Mascot init error:", e); }
  try { BracketModule.init(); } catch (e) { console.error("Bracket init error:", e); }

  // 4. Supabase Realtime Listener (if online)
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
