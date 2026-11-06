/**
 * Mascot Module: 8-Bit Neck-Beard Chicken Guy screen peeker
 */
const MascotModule = (function () {
  let mascotEl = null;
  let peekTimer = null;

  function initMascot() {
    mascotEl = document.getElementById('mascot-chicken-peeker');
    if (!mascotEl) return;
    scheduleNextPeek();
  }

  function scheduleNextPeek() {
    // Random interval between 15 and 35 seconds
    const interval = Math.floor(Math.random() * 20000) + 15000;
    peekTimer = setTimeout(() => {
      triggerPeek();
    }, interval);
  }

  function triggerPeek() {
    if (!mascotEl) return;

    // Pick random screen edge
    const positions = ['pos-bottom', 'pos-left', 'pos-right'];
    const selectedPos = positions[Math.floor(Math.random() * positions.length)];

    mascotEl.classList.remove('pos-bottom', 'pos-left', 'pos-right', 'peek-active');
    mascotEl.classList.add(selectedPos);

    // Audio cue
    AudioModule.playCluck();

    // Trigger visual slide in
    requestAnimationFrame(() => {
      mascotEl.classList.add('peek-active');
    });

    // Stay on screen for 2.8 seconds, then retract
    setTimeout(() => {
      mascotEl.classList.remove('peek-active');
      scheduleNextPeek();
    }, 2800);
  }

  return {
    init: initMascot,
    triggerManualPeek: triggerPeek
  };
})();
