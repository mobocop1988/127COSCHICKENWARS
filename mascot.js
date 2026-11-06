/**
 * Mascot Module: 8-Bit Neck-Beard Chicken Peeker Engine
 */
const MascotModule = (() => {
  let isPeeking = false;
  let peekTimer = null;
  const positions = ['pos-bottom', 'pos-left', 'pos-right', 'pos-top'];

  function triggerManualPeek() {
    if (isPeeking) return;
    showMascot();
  }

  function showMascot() {
    const container = document.getElementById('mascot-chicken-peeker');
    if (!container) return;

    isPeeking = true;
    positions.forEach(p => container.classList.remove(p));

    // Choose random edge (weighted toward bottom and sides)
    const randomPos = positions[Math.floor(Math.random() * positions.length)];
    container.classList.add(randomPos);

    // Audio cluck accompanying the visual emergence
    AudioModule.playCluckSound();

    requestAnimationFrame(() => {
      container.classList.add('peek-active');
    });

    // Stay visible for 2.6 seconds, then retreat
    setTimeout(() => {
      container.classList.remove('peek-active');
      setTimeout(() => {
        isPeeking = false;
        scheduleNextPeek();
      }, 500);
    }, 2600);
  }

  function scheduleNextPeek() {
    if (peekTimer) clearTimeout(peekTimer);
    // Random interval between 12 and 26 seconds
    const delay = 12000 + Math.random() * 14000;
    peekTimer = setTimeout(showMascot, delay);
  }

  function init() {
    const container = document.getElementById('mascot-chicken-peeker');
    if (container) {
      container.addEventListener('click', () => {
        AudioModule.playCluckSound();
        container.classList.remove('peek-active');
      });
    }

    // Initial emergence 3 seconds after load so you see him immediately
    setTimeout(showMascot, 3000);
  }

  return {
    init,
    triggerManualPeek
  };
})();
