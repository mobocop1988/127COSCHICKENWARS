/**
 * Audio Module: Multi-song rotator & Retro 8-bit Chicken Cluck Synthesizer
 */
const AudioModule = (function () {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let currentTrackIndex = 0;
  let bgAudio = null;
  let isPlaying = false;

  function initAudio() {
    bgAudio = new Audio();
    bgAudio.volume = 0.35;

    // Advance to next song when current track ends
    bgAudio.addEventListener('ended', () => {
      nextTrack();
    });

    const toggleBtn = document.getElementById('music-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        toggleMusic();
      });
    }

    // Auto-unlock Web Audio context on user first gesture
    const unlock = () => {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      document.removeEventListener('click', unlock);
    };
    document.addEventListener('click', unlock);
  }

  function toggleMusic() {
    if (!bgAudio) return;
    if (isPlaying) {
      bgAudio.pause();
      isPlaying = false;
      updateUI(false);
    } else {
      loadAndPlayTrack(currentTrackIndex);
    }
  }

  function loadAndPlayTrack(index) {
    currentTrackIndex = index % AppConfig.PLAYLIST.length;
    const trackFile = AppConfig.PLAYLIST[currentTrackIndex];
    bgAudio.src = trackFile;
    bgAudio.play().then(() => {
      isPlaying = true;
      updateUI(true, trackFile);
    }).catch(err => {
      console.warn("Audio autoplay blocked, awaiting interaction:", err);
      updateUI(false);
    });
  }

  function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % AppConfig.PLAYLIST.length;
    loadAndPlayTrack(currentTrackIndex);
  }

  function updateUI(playing, track = AppConfig.PLAYLIST[currentTrackIndex]) {
    const btn = document.getElementById('music-toggle-btn');
    const label = document.getElementById('now-playing-label');
    if (btn) btn.innerText = playing ? '⏸ PAUSE' : '♪ PLAY MUSIC';
    if (label) label.innerText = `TRACK: [${track}]`;
  }

  /**
   * Synthesizes an 8-bit retro chicken cluck ("Bok!")
   */
  function playChickenCluck() {
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      
      // Pitch drop mimicking a rooster cluck
      const now = audioCtx.currentTime;
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.14);

      // Stutter cluck follow-up
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        const now2 = audioCtx.currentTime;
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(800, now2);
        osc2.frequency.exponentialRampToValueAtTime(280, now2 + 0.18);
        gain2.gain.setValueAtTime(0.2, now2);
        gain2.gain.exponentialRampToValueAtTime(0.01, now2 + 0.18);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start(now2);
        osc2.stop(now2 + 0.18);
      }, 70);
    } catch (e) {
      console.warn("Cluck synth error:", e);
    }
  }

  return {
    init: initAudio,
    toggleMusic: toggleMusic,
    playCluck: playChickenCluck
  };
})();