/**
 * Audio Module: Playlist Rotator & 8-Bit Cluck Sound FX
 */
const AudioModule = (() => {
  let audioCtx = null;
  let bgAudio = null;
  let currentTrackIndex = 0;
  let isPlaying = false;

  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // 8-Bit Clucking Sound Generated Synthetically on Vote
  function playCluckSound() {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      const now = ctx.currentTime;

      // Realistic chicken cluck pitch slide
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.14);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);

      // Follow-up small bok
      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'sawtooth';
          const t2 = ctx.currentTime;
          osc2.frequency.setValueAtTime(420, t2);
          osc2.frequency.exponentialRampToValueAtTime(290, t2 + 0.09);
          gain2.gain.setValueAtTime(0.12, t2);
          gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.09);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(t2);
          osc2.stop(t2 + 0.09);
        } catch(e) {}
      }, 95);
    } catch (e) {
      console.warn("WebAudio cluck failed:", e);
    }
  }

  function playUiTone(freq, type = 'square', duration = 0.1) {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch(e) {}
  }

  function sfxFanfare() {
    playUiTone(440, 'square', 0.1);
    setTimeout(() => playUiTone(554.37, 'square', 0.1), 100);
    setTimeout(() => playUiTone(659.25, 'square', 0.12), 200);
    setTimeout(() => playUiTone(880, 'square', 0.25), 320);
  }

  function sfxBuzz() {
    playUiTone(130, 'sawtooth', 0.2);
  }

  function sfxSwitch() {
    playUiTone(493.88, 'triangle', 0.08);
  }

  // Rotate between playlist tracks seamlessly
  function playNextTrack() {
    if (!AppConfig.MUSIC_PLAYLIST || AppConfig.MUSIC_PLAYLIST.length === 0) return;
    const track = AppConfig.MUSIC_PLAYLIST[currentTrackIndex];
    if (!bgAudio) {
      bgAudio = new Audio();
      bgAudio.volume = 0.35;
      bgAudio.addEventListener('ended', () => {
        currentTrackIndex = (currentTrackIndex + 1) % AppConfig.MUSIC_PLAYLIST.length;
        playNextTrack();
      });
    }

    bgAudio.src = track;
    bgAudio.play().then(() => {
      isPlaying = true;
      updateJukeboxState();
    }).catch(err => {
      console.log("Audio autoplay prevented by browser:", err);
      isPlaying = false;
      updateJukeboxState();
    });
  }

  function toggleMusic() {
    getAudioContext();
    const btn = document.getElementById('music-toggle-btn');
    if (!bgAudio) {
      playNextTrack();
      return;
    }

    if (bgAudio.paused) {
      bgAudio.play().then(() => {
        isPlaying = true;
        updateJukeboxState();
      }).catch(() => {});
    } else {
      bgAudio.pause();
      isPlaying = false;
      updateJukeboxState();
    }
  }

  function updateJukeboxState() {
    const btn = document.getElementById('music-toggle-btn');
    if (btn) {
      if (isPlaying) {
        btn.classList.add('is-playing');
      } else {
        btn.classList.remove('is-playing');
      }
    }
  }

  function init() {
    const btn = document.getElementById('music-toggle-btn');
    if (btn) {
      btn.addEventListener('click', toggleMusic);
    }
  }

  return {
    init,
    playCluckSound,
    sfxFanfare,
    sfxBuzz,
    sfxSwitch,
    toggleMusic
  };
})();
