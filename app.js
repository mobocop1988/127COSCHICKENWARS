/**
 * App Module: Bootstrapper & Realtime Subscription Wiring
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Supabase Client
  window.supabaseClient = window.supabase.createClient(
    AppConfig.SUPABASE_URL,
    AppConfig.SUPABASE_ANON_KEY
  );

  // 2. Initialize Background Floating Feathers
  function initFeathers() {
    const container = document.getElementById('feather-canvas-container');
    if (!container) return;
    const count = 30;
    for (let i = 0; i < count; i++) {
      const feather = document.createElement('div');
      feather.className = 'floating-feather';
      feather.style.left = Math.random() * 96 + 'vw';
      const duration = 12 + Math.random() * 20;
      feather.style.animationDuration = duration + 's';
      feather.style.animationDelay = -(Math.random() * duration) + 's';
      const scale = 0.6 + Math.random() * 0.8;
      feather.style.transform = `scale(${scale})`;
      container.appendChild(feather);
    }
  }
  initFeathers();

  // 3. Boot Subsystems
  AudioModule.init();
  AuthModule.init();
  MascotModule.init();
  BracketModule.init();

  // 4. Supabase Realtime Listener for sync between clients
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
});
