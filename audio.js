/**
 * audio.js
 * Manages 3-song playlist cycling and synthesized 8-bit chicken clucks
 */
const AudioModule = (() => {
  let audioContext = null;
  let bgAudio = null;
  let currentTrackIndex = 0;
  let isPlaying = false;

  function initAudioContext() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }

  function init() {
    bgAudio = new Audio();
    bgAudio.volume = 0.35;
    currentTrackIndex = Math.floor(Math.random() * AppConfig.PLAYLIST.length);
    bgAudio.src = AppConfig.PLAYLIST[currentTrackIndex];

    bgAudio.addEventListener('ended', playNextTrack);

    const toggleBtn = document.getElementById('music-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleMusic);
    }
  }

  function toggleMusic() {
    initAudioContext();
    const toggleBtn = document.getElementById('music-toggle-btn');

    if (isPlaying) {
      bgAudio.pause();
      isPlaying = false;
      if (toggleBtn) toggleBtn.classList.remove('is-playing');
    } else {
      bgAudio.play().then(() => {
        isPlaying = true;
        if (toggleBtn) toggleBtn.classList.add('is-playing');
      }).catch(err => {
        console.warn("Audio playback prevented:", err);
      });
    }
  }

  function playNextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % AppConfig.PLAYLIST.length;
    bgAudio.src = AppConfig.PLAYLIST[currentTrackIndex];
    if (isPlaying) {
      bgAudio.play().catch(() => {});
    }
  }

  /**
   * Synthesize an 8-bit chicken cluck sound effect on voting
   */
  function playCluck() {
    try {
      initAudioContext();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = 'sawtooth';
      const now = audioContext.currentTime;

      // Realistic chicken cluck pitch drops rapidly
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.start(now);
      osc.stop(now + 0.11);

      // Secondary quick chirp
      setTimeout(() => {
        if (!audioContext) return;
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.type = 'triangle';
        const t2 = audioContext.currentTime;
        osc2.frequency.setValueAtTime(750, t2);
        osc2.frequency.exponentialRampToValueAtTime(320, t2 + 0.07);
        gain2.gain.setValueAtTime(0.1, t2);
        gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.07);
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.start(t2);
        osc2.stop(t2 + 0.07);
      }, 70);

    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  return {
    init,
    toggleMusic,
    playCluck
  };
})();
