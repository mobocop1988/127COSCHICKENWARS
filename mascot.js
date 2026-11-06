/**
 * mascot.js
 * 8-bit neck-beard chicken mascot with passive peeks, 5-second swarm, and 10-second auto-clear
 */
const MascotModule = (() => {
  let isPeeking = false;
  let peekTimer = null;
  let swarmInterval = null;
  let swarmClearTimeout = null;

  function init() {
    // Immediate introduction peek 3 seconds after load
    setTimeout(() => {
      triggerManualPeek();
    }, 3000);

    // Schedule regular passive peeks
    scheduleNextPeek();
  }

  function scheduleNextPeek() {
    clearTimeout(peekTimer);
    const delay = 12000 + Math.random() * 16000; // 12-28 seconds
    peekTimer = setTimeout(() => {
      triggerRandomPeek();
      scheduleNextPeek();
    }, delay);
  }

  function triggerRandomPeek() {
    if (isPeeking) return;
    const peeker = document.getElementById('mascot-chicken-peeker');
    if (!peeker) return;

    peeker.classList.remove('peek-bottom', 'peek-left', 'peek-right');
    const positions = ['peek-bottom', 'peek-left', 'peek-right'];
    const chosen = positions[Math.floor(Math.random() * positions.length)];
    peeker.classList.add(chosen);

    isPeeking = true;
    peeker.classList.add('show');
    AudioModule.playCluck();

    setTimeout(() => {
      peeker.classList.remove('show');
      setTimeout(() => { isPeeking = false; }, 500);
    }, 2800);
  }

  function triggerManualPeek() {
    triggerRandomPeek();
  }

  /**
   * 5-SECOND SCREEN SWARM & 10-SECOND AUTO-CLEAR
   * Continuously spawns clucking chickens over 5 seconds.
   * At 10 seconds from initiation, triggers panic scramble exit and clears all.
   */
  function triggerSwarm() {
    const container = document.getElementById('mascot-swarm-container');
    if (!container) return;

    // Clear any previous active swarm run
    if (swarmInterval) clearInterval(swarmInterval);
    if (swarmClearTimeout) clearTimeout(swarmClearTimeout);

    AudioModule.playCluck();

    const startTime = Date.now();
    let cluckThrottle = 0;

    // Spawn chickens continuously across the screen over 5 seconds
    swarmInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= 5000) {
        clearInterval(swarmInterval);
        swarmInterval = null;
        return;
      }

      spawnSwarmChicken(container);

      // Play cluck sound periodically
      cluckThrottle++;
      if (cluckThrottle % 3 === 0) {
        AudioModule.playCluck();
      }
    }, 130);

    // Auto-clear exactly 10 seconds after initiation
    swarmClearTimeout = setTimeout(() => {
      const allSwarmers = container.querySelectorAll('.swarm-chicken-unit');
      allSwarmers.forEach(ch => {
        ch.classList.add('swarm-scramble-exit');
      });

      // Completely remove from DOM after the exit scramble finishes
      setTimeout(() => {
        container.innerHTML = '';
      }, 1200);
    }, 10000);
  }

  function spawnSwarmChicken(container) {
    const unit = document.createElement('div');
    unit.className = 'swarm-chicken-unit';

    const x = Math.random() * (window.innerWidth - 130);
    const y = Math.random() * (window.innerHeight - 130);
    const scale = 0.65 + Math.random() * 0.75;

    unit.style.left = `${Math.max(10, x)}px`;
    unit.style.top = `${Math.max(10, y)}px`;
    unit.style.transform = `scale(${scale})`;

    const sayings = ["Bok-bagawk!!!", "CLUCK!", "BOK BOK!", "BA-GAWK!"];
    const phrase = sayings[Math.floor(Math.random() * sayings.length)];

    unit.innerHTML = `
      <div class="swarm-speech-bubble">${phrase}</div>
      <svg class="chicken-man-svg" viewBox="0 0 64 64" width="105" height="105" shape-rendering="crispEdges">
        <rect x="26" y="2" width="12" height="4" fill="#cc2b2b" />
        <rect x="24" y="6" width="16" height="4" fill="#e84345" />
        <rect x="28" y="0" width="8" height="3" fill="#ff5c5c" />
        <rect x="18" y="10" width="28" height="18" fill="#fdfaf0" />
        <rect x="16" y="12" width="32" height="14" fill="#fdfaf0" />
        <rect x="14" y="14" width="36" height="10" fill="#ede5d1" />
        <polygon points="30,11 34,11 32,17" fill="#f9a825" />
        <polygon points="31,11 33,11 32,15" fill="#ffd54f" />
        <rect x="22" y="18" width="20" height="15" fill="#fbd3b0" />
        <rect x="23" y="20" width="8" height="5" fill="#111111" />
        <rect x="33" y="20" width="8" height="5" fill="#111111" />
        <rect x="30" y="22" width="4" height="2" fill="#111111" />
        <rect x="25" y="21" width="4" height="3" fill="#ffffff" />
        <rect x="35" y="21" width="4" height="3" fill="#ffffff" />
        <rect x="27" y="22" width="2" height="2" fill="#000000" />
        <rect x="37" y="22" width="2" height="2" fill="#000000" />
        <rect x="23" y="25" width="3" height="2" fill="#f09090" />
        <rect x="38" y="25" width="3" height="2" fill="#f09090" />
        <rect x="29" y="26" width="6" height="1" fill="#7d3428" />
        <rect x="21" y="28" width="22" height="5" fill="#4a2e18" />
        <rect x="23" y="32" width="18" height="6" fill="#38210f" />
        <rect x="26" y="37" width="12" height="4" fill="#291608" />
        <rect x="12" y="36" width="40" height="24" fill="#fdfaf0" />
        <rect x="10" y="40" width="44" height="18" fill="#f3ecdb" />
        <rect x="14" y="56" width="36" height="6" fill="#e0d6c0" />
        <g class="mascot-left-wing">
          <rect x="4" y="38" width="8" height="14" fill="#fdfaf0" />
          <rect x="2" y="42" width="4" height="10" fill="#ded4bc" />
        </g>
        <g class="mascot-right-wing">
          <rect x="52" y="38" width="8" height="14" fill="#fdfaf0" />
          <rect x="58" y="42" width="4" height="10" fill="#ded4bc" />
        </g>
        <rect x="18" y="58" width="11" height="5" fill="#f9a825" />
        <rect x="35" y="58" width="11" height="5" fill="#f9a825" />
      </svg>
    `;

    unit.addEventListener('click', () => {
      AudioModule.playCluck();
      unit.style.transform += ' rotate(20deg) scale(1.1)';
    });

    container.appendChild(unit);
  }

  return {
    init,
    triggerRandomPeek,
    triggerManualPeek,
    triggerSwarm
  };
})();
