/**
 * audio.js - WebAudio Synthesizer & 3-Song Background Playlist Rotator
 */
const AudioModule = (function () {
  let audioCtx = null;
  let bgAudioElement = null;
  let isPlaying = false;
  let currentTrackIndex = 0;

  const PLAYLIST = ['cluck1.mp3', 'cluck2.mp3', 'cluck3.mp3'];

  function initAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type, duration, gainLevel = 0.08) {
    try {
      initAudioContext();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainLevel, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  function sfxChickenCluck() {
    try {
      initAudioContext();
      const now = audioCtx.currentTime;
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(540, now);
      osc1.frequency.exponentialRampToValueAtTime(260, now + 0.12);

      osc2.frequency.setValueAtTime(420, now);
      osc2.frequency.exponentialRampToValueAtTime(180, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.18);
      osc2.stop(now + 0.18);

      setTimeout(() => {
        const now2 = audioCtx.currentTime;
        const subOsc = audioCtx.createOscillator();
        const subGain = audioCtx.createGain();
        subOsc.type = 'sawtooth';
        subOsc.frequency.setValueAtTime(680, now2);
        subOsc.frequency.exponentialRampToValueAtTime(320, now2 + 0.15);
        subGain.gain.setValueAtTime(0.18, now2);
        subGain.gain.exponentialRampToValueAtTime(0.001, now2 + 0.16);
        subOsc.connect(subGain);
        subGain.connect(audioCtx.destination);
        subOsc.start(now2);
        subOsc.stop(now2 + 0.16);
      }, 70);
    } catch (e) {}
  }

  function sfxSwitch() { playTone(440, 'triangle', 0.08, 0.05); }
  function sfxCoin() {
    playTone(987.77, 'square', 0.08, 0.06);
    setTimeout(() => playTone(1318.51, 'square', 0.2, 0.06), 70);
  }
  function sfxBuzz() { playTone(140, 'sawtooth', 0.2, 0.09); }
  function sfxFanfare() {
    playTone(523.25, 'square', 0.1, 0.08);
    setTimeout(() => playTone(659.25, 'square', 0.1, 0.08), 100);
    setTimeout(() => playTone(783.99, 'square', 0.1, 0.08), 200);
    setTimeout(() => playTone(1046.50, 'square', 0.35, 0.09), 300);
  }

  function initMusicPlayer() {
    bgAudioElement = new Audio();
    bgAudioElement.volume = 0.35;
    bgAudioElement.addEventListener('ended', playNextTrack);
    bgAudioElement.addEventListener('error', () => {
      setTimeout(playNextTrack, 2000);
    });
  }

  function toggleMusic() {
    initAudioContext();
    if (!bgAudioElement) initMusicPlayer();

    if (isPlaying) {
      bgAudioElement.pause();
      isPlaying = false;
      updateUI();
    } else {
      bgAudioElement.src = PLAYLIST[currentTrackIndex];
      bgAudioElement.play().then(() => {
        isPlaying = true;
        updateUI();
      }).catch(() => {
        isPlaying = false;
        updateUI();
      });
    }
  }

  function playNextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % PLAYLIST.length;
    if (bgAudioElement) {
      bgAudioElement.src = PLAYLIST[currentTrackIndex];
      if (isPlaying) {
        bgAudioElement.play().catch(() => {});
      }
    }
    updateUI();
  }

  function updateUI() {
    const btn = document.getElementById('audio-toggle-btn');
    const label = document.getElementById('audio-status-label');
    if (!btn || !label) return;

    if (isPlaying) {
      btn.classList.add('is-playing');
      label.innerText = 'TUNE: ON';
    } else {
      btn.classList.remove('is-playing');
      label.innerText = 'TUNE: OFF';
    }
  }

  function init() {
    initMusicPlayer();
    const unlockHandler = () => {
      initAudioContext();
      document.removeEventListener('click', unlockHandler);
      document.removeEventListener('keydown', unlockHandler);
    };
    document.addEventListener('click', unlockHandler);
    document.addEventListener('keydown', unlockHandler);
  }

  return {
    init,
    toggleMusic,
    sfxChickenCluck,
    sfxSwitch,
    sfxCoin,
    sfxBuzz,
    sfxFanfare
  };
})();
