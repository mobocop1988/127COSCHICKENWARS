/**
 * mascot.js - 8-Bit Chicken Guy Mascot (Peeker, Easter Egg Randomizer & 5s Swarm Breakout)
 */
const MascotModule = (function () {
  let isPeeking = false;
  let peekTimer = null;
  let isSwarming = false;
  let swarmInterval = null;
  let swarmCleanupTimer = null;

  const PHRASES = [
    "Bok-bagawk!!!",
    "Bok BOK BOK!",
    "BA-GAWWWK!!",
    "Cluck cluck, baby!",
    "BOK-A-DOODLE-DOO!"
  ];

  function positionEasterEgg() {
    const egg = document.getElementById('secret-easter-egg-btn');
    if (!egg) return;

    const minX = 70;
    const maxX = window.innerWidth - 80;
    const minY = 80;
    const maxY = window.innerHeight - 100;

    const randX = Math.floor(minX + Math.random() * (maxX - minX));
    const randY = Math.floor(minY + Math.random() * (maxY - minY));

    egg.style.left = randX + 'px';
    egg.style.top = randY + 'px';
  }

  function triggerPeek() {
    if (isPeeking || isSwarming) return;
    const mascot = document.getElementById('mascot-container');
    const bubble = document.getElementById('mascot-bubble');
    if (!mascot || !bubble) return;

    bubble.innerText = PHRASES[Math.floor(Math.random() * PHRASES.length)];

    const randomRight = 20 + Math.random() * (window.innerWidth - 220);
    mascot.style.right = `${randomRight}px`;

    isPeeking = true;
    mascot.classList.add('mascot-peeking');
    AudioModule.sfxChickenCluck();

    setTimeout(() => {
      mascot.classList.remove('mascot-peeking');
      isPeeking = false;
      scheduleNextPeek();
    }, 2800);
  }

  function scheduleNextPeek() {
    clearTimeout(peekTimer);
    const delay = 10000 + Math.random() * 14000;
    peekTimer = setTimeout(triggerPeek, delay);
  }

  function triggerSwarm() {
    if (isSwarming) return;
    isSwarming = true;

    const swarmContainer = document.getElementById('mascot-swarm-container');
    if (!swarmContainer) return;

    swarmContainer.innerHTML = '';
    AudioModule.sfxFanfare();

    let cluckCounter = 0;
    const swarmStartTime = Date.now();
    const SWARM_SPAWN_DURATION = 5000;

    swarmInterval = setInterval(() => {
      if (Date.now() - swarmStartTime >= SWARM_SPAWN_DURATION) {
        clearInterval(swarmInterval);
        return;
      }
      spawnSingleSwarmChicken(swarmContainer);
      cluckCounter++;
      if (cluckCounter % 3 === 0) {
        AudioModule.sfxChickenCluck();
      }
    }, 180);

    clearTimeout(swarmCleanupTimer);
    swarmCleanupTimer = setTimeout(() => {
      const units = swarmContainer.querySelectorAll('.swarm-chicken-unit');
      units.forEach(u => u.classList.add('swarm-scramble-exit'));

      setTimeout(() => {
        swarmContainer.innerHTML = '';
        isSwarming = false;
        scheduleNextPeek();
      }, 700);
    }, 10000);
  }

  function spawnSingleSwarmChicken(container) {
    const unit = document.createElement('div');
    unit.className = 'swarm-chicken-unit';

    const randX = Math.floor(Math.random() * (window.innerWidth - 100));
    const randY = Math.floor(Math.random() * (window.innerHeight - 120));
    unit.style.left = randX + 'px';
    unit.style.top = randY + 'px';

    const scale = 0.55 + Math.random() * 0.75;
    unit.style.transform = `scale(${scale})`;

    const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];

    unit.innerHTML = `
      <div class="swarm-bubble">${phrase}</div>
      <svg viewBox="0 0 96 96" width="75" height="75" style="image-rendering: pixelated;">
        <rect x="22" y="26" width="52" height="52" rx="20" fill="#fdf0d5" stroke="#2c1a0e" stroke-width="4"/>
        <path d="M 40 18 Q 48 10 56 18 Q 48 24 40 18 Z" fill="#d9383a" stroke="#2c1a0e" stroke-width="3"/>
        <path d="M 36 34 Q 48 26 60 34 Q 48 44 36 34 Z" fill="#ef8354" stroke="#2c1a0e" stroke-width="3"/>
        <rect x="36" y="40" width="24" height="14" fill="#ffcca0"/>
        <rect x="38" y="42" width="4" height="4" fill="#000"/>
        <rect x="54" y="42" width="4" height="4" fill="#000"/>
        <polygon points="48,46 43,53 53,53" fill="#f39a3e" stroke="#2c1a0e" stroke-width="2"/>
        <path d="M 33 46 Q 33 60 48 64 Q 63 60 63 46 Z" fill="#583119" stroke="#2c1a0e" stroke-width="3"/>
        <ellipse cx="18" cy="50" rx="10" ry="16" fill="#f4d06f" stroke="#2c1a0e" stroke-width="3" transform="rotate(-15 18 50)"/>
        <ellipse cx="78" cy="50" rx="10" ry="16" fill="#f4d06f" stroke="#2c1a0e" stroke-width="3" transform="rotate(15 78 50)"/>
      </svg>
    `;

    container.appendChild(unit);
  }

  function init() {
    positionEasterEgg();
    window.addEventListener('resize', positionEasterEgg);
    setTimeout(triggerPeek, 3000);
  }

  return {
    init,
    triggerPeek,
    triggerSwarm,
    repositionEasterEgg: positionEasterEgg
  };
})();
