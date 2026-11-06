/**
 * app.js
 * Scenery spawner, falling chicken strips & feathers, golden egg placement, and bootloader
 */
document.addEventListener('DOMContentLoaded', () => {

  // 1. Spawns falling chicken strips & feathers
  function initFallingParticles() {
    const container = document.getElementById('feather-canvas-container');
    if (!container) return;
    container.innerHTML = '';
    const totalCount = 38;

    for (let i = 0; i < totalCount; i++) {
      const particle = document.createElement('div');
      const isTender = (i % 2 === 0);
      particle.className = `floating-particle ${isTender ? 'particle-tender' : 'particle-feather'}`;

      particle.style.left = Math.random() * 95 + 'vw';
      const duration = 12 + Math.random() * 18;
      particle.style.animationDuration = duration + 's';
      particle.style.animationDelay = -(Math.random() * duration) + 's';

      const scale = isTender ? (0.7 + Math.random() * 0.5) : (0.6 + Math.random() * 0.7);
      particle.style.transform = `scale(${scale})`;
      container.appendChild(particle);
    }
  }
  initFallingParticles();

  // 2. Randomizes the location of the secret golden egg easter egg button
  function randomizeEasterEgg() {
    const egg = document.getElementById('secret-easter-egg-btn');
    if (!egg) return;

    // Randomize across visible margins, avoiding header center
    const isLeft = Math.random() > 0.5;
    const xPercent = isLeft ? (4 + Math.random() * 22) : (74 + Math.random() * 20);
    const yPercent = 20 + Math.random() * 62;

    egg.style.left = `${xPercent}vw`;
    egg.style.top = `${yPercent}vh`;
  }
  randomizeEasterEgg();

  // 3. Initialize Supabase safely
  try {
    if (window.supabase && AppConfig.SUPABASE_URL && !AppConfig.SUPABASE_ANON_KEY.includes('...')) {
      window.supabaseClient = window.supabase.createClient(
        AppConfig.SUPABASE_URL,
        AppConfig.SUPABASE_ANON_KEY
      );
    } else {
      console.warn("Configure AppConfig.SUPABASE_URL & ANON_KEY in config.js for cloud persistence.");
    }
  } catch (err) {
    console.warn("Supabase init error:", err);
  }

  // 4. Boot Subsystems
  try { AudioModule.init(); } catch (e) { console.error("Audio error:", e); }
  try { AuthModule.init(); } catch (e) { console.error("Auth error:", e); }
  try { MascotModule.init(); } catch (e) { console.error("Mascot error:", e); }
  try { BracketModule.init(); } catch (e) { console.error("Bracket error:", e); }
});
