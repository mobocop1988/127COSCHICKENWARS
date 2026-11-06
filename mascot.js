/**
 * Mascot Module: 8-Bit Neck-Beard Chicken Guy screen peeker
 * Features immediate initial peek, edge rotation, cluck sound, and manual test trigger.
 */
const MascotModule = (function () {
  let mascotEl = null;
  let peekTimer = null;
  let isCurrentlyPeeking = false;

  function initMascot() {
    mascotEl = document.getElementById('mascot-chicken-peeker');
    if (!mascotEl) {
      console.warn("Mascot element #mascot-chicken-peeker not found.");
      return;
    }

    // Fast initial peek after 3 seconds so the user immediately sees it working
    setTimeout(() => {
      triggerPeek();
    }, 3000);
  }

  function scheduleNextPeek() {
    if (peekTimer) clearTimeout(peekTimer);
    // Random interval between 10 and 22 seconds
    const interval = Math.floor(Math.random() * 12000) + 10000;
    peekTimer = setTimeout(() => {
      triggerPeek();
    }, interval);
  }

  function triggerPeek() {
    if (!mascotEl || isCurrentlyPeeking) return;
    isCurrentlyPeeking = true;

    // Pick random edge position
    const positions = ['pos-bottom', 'pos-left', 'pos-right', 'pos-top'];
    const selectedPos = positions[Math.floor(Math.random() * positions.length)];

    mascotEl.classList.remove('pos-bottom', 'pos-left', 'pos-right', 'pos-top', 'peek-active');
    mascotEl.classList.add(selectedPos);

    // Audio cluck accompaniment
    if (window.AudioModule && typeof AudioModule.playCluck === 'function') {
      AudioModule.playCluck();
    }

    // Slide in
    setTimeout(() => {
      mascotEl.classList.add('peek-active');
    }, 50);

    // Stay visible for 3.2 seconds, then retreat
    setTimeout(() => {
      mascotEl.classList.remove('peek-active');
      setTimeout(() => {
        isCurrentlyPeeking = false;
        scheduleNextPeek();
      }, 500);
    }, 3200);
  }

  return {
    init: initMascot,
    triggerManualPeek: () => {
      isCurrentlyPeeking = false;
      triggerPeek();
    }
  };
})();
