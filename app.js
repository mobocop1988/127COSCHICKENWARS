/**
 * app.js - Application Initialization & Particle System Generator
 * Spawns elongated fried chicken tenders & soft chicken feathers
 */
document.addEventListener('DOMContentLoaded', () => {

  // 1. Falling Particles: Elongated Fried Chicken Tenders & Soft Feathers
  function initParticles() {
    const container = document.getElementById('particle-canvas-container');
    if (!container) return;
    container.innerHTML = '';

    // Elongated Crispy Fried Chicken Tender SVG
    const tenderSvg = `
      <svg viewBox="0 0 64 28" width="100%" height="100%" style="overflow: visible;">
        <!-- Base Crispy Tender Silhouette: Curved & Elongated -->
        <path d="M 6 15 Q 4 7 14 5 Q 28 3 44 8 Q 58 12 60 17 Q 61 22 52 24 Q 38 27 22 25 Q 9 23 6 15 Z" 
              fill="#c97316" stroke="#5c2605" stroke-width="2"/>
        <!-- Golden Crust Surface Texture -->
        <path d="M 9 14 Q 8 8 16 6 Q 28 5 42 9 Q 54 13 56 17 Q 56 21 49 22 Q 36 25 22 23 Q 11 21 9 14 Z" 
              fill="#e59b24"/>
        <!-- Crunchy Panko Highlights -->
        <ellipse cx="24" cy="11" rx="8" ry="3.5" fill="#f7c04a" transform="rotate(-4 24 11)"/>
        <ellipse cx="40" cy="14" rx="7" ry="3" fill="#f7c04a" transform="rotate(8 40 14)"/>
        <ellipse cx="14" cy="16" rx="4" ry="2.5" fill="#f7c04a"/>
        <!-- Seasoning Pepper Specks & Crispy Crumb Bumps -->
        <circle cx="18" cy="10" r="1.2" fill="#7a3406"/>
        <circle cx="28" cy="16" r="1.4" fill="#7a3406"/>
        <circle cx="34" cy="11" r="1.2" fill="#7a3406"/>
        <circle cx="46" cy="17" r="1.4" fill="#7a3406"/>
        <circle cx="50" cy="13" r="1.1" fill="#7a3406"/>
        <circle cx="12" cy="12" r="1" fill="#421a02"/>
        <circle cx="38" cy="19" r="1" fill="#421a02"/>
      </svg>
    `;

    // Realistic Feathery Feather SVG
    const featherSvg = `
      <svg viewBox="0 0 44 48" width="100%" height="100%" style="overflow: visible;">
        <!-- Quill Rachis Stem -->
        <path d="M 8 46 Q 22 26 36 4" stroke="#dfc28d" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- Left Vane Barbs -->
        <path d="M 36 4 Q 28 8 23 15 Q 18 22 13 32 Q 10 37 14 38 Q 18 36 21 28 Q 26 18 36 4 Z" 
              fill="#ffffff" stroke="#e0d5be" stroke-width="1"/>
        <!-- Right Vane Barbs -->
        <path d="M 36 4 Q 38 12 34 22 Q 30 30 25 36 Q 22 39 24 37 Q 27 30 31 20 Q 34 12 36 4 Z" 
              fill="#fff9e6" stroke="#e0d5be" stroke-width="1"/>
        <!-- Subtle Feather Vane Texture Lines -->
        <path d="M 28 12 Q 22 15 20 18 M 24 18 Q 18 22 16 26 M 20 24 Q 15 28 13 32" 
              stroke="#ece1ca" stroke-width="1" fill="none"/>
        <path d="M 33 14 Q 36 18 34 22 M 30 20 Q 32 25 30 28" 
              stroke="#ece1ca" stroke-width="1" fill="none"/>
        <!-- Downy Base Tuft Fluff -->
        <path d="M 12 40 Q 15 37 18 39 Q 15 42 12 40 Z" fill="#ffffff" opacity="0.9"/>
        <path d="M 15 38 Q 19 35 22 37 Q 19 40 15 38 Z" fill="#ffffff" opacity="0.9"/>
      </svg>
    `;

    // Spawn 18 Elongated Chicken Tenders
    const tenderCount = 18;
    for (let i = 0; i < tenderCount; i++) {
      const el = document.createElement('div');
      el.className = 'particle-tender';
      el.style.left = (Math.random() * 94) + 'vw';
      const duration = 12 + Math.random() * 16;
      el.style.animationDuration = duration + 's';
      el.style.animationDelay = -(Math.random() * duration) + 's';
      const scale = 0.75 + Math.random() * 0.6;
      el.style.transform = `scale(${scale})`;
      el.innerHTML = tenderSvg;
      container.appendChild(el);
    }

    // Spawn 22 Soft Chicken Feathers
    const featherCount = 22;
    for (let i = 0; i < featherCount; i++) {
      const el = document.createElement('div');
      el.className = 'particle-feather';
      el.style.left = (Math.random() * 94) + 'vw';
      const duration = 14 + Math.random() * 18;
      el.style.animationDuration = duration + 's';
      el.style.animationDelay = -(Math.random() * duration) + 's';
      const scale = 0.8 + Math.random() * 0.7;
      el.style.transform = `scale(${scale})`;
      el.innerHTML = featherSvg;
      container.appendChild(el);
    }
  }

  // Execute Background Particles
  initParticles();

  // 2. Initialize Subsystems safely with error shields
  try { AudioModule.init(); } catch (e) { console.error("AudioModule error:", e); }
  try { MascotModule.init(); } catch (e) { console.error("MascotModule error:", e); }
  try { BracketModule.init(); } catch (e) { console.error("BracketModule error:", e); }
  try { AuthModule.init(); } catch (e) { console.error("AuthModule error:", e); }
});
