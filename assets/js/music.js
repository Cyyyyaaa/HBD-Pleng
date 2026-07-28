/**
 * music.js
 * Handles the background soundtrack and the small click sound. Autoplay
 * policies mean we only ever start audio in direct response to a user
 * gesture (the "tap anywhere" intro, or the toggle button). If the audio
 * file isn't present in assets/music/ yet, this fails silently rather
 * than throwing — the site still works perfectly without sound.
 *
 * Because the site now spans multiple real pages (index.html, letter.html,
 * wish.html, cake.html), each page load creates a fresh <audio> element.
 * To keep the soundtrack feeling continuous as someone clicks "Continue"
 * from page to page, playback position and mute state are stashed in
 * sessionStorage just before navigating away, and restored on the next
 * page's load.
 */
(function () {
  const { qs, on } = window.Utils;

  const STORAGE_KEY = 'hbd-music-state';

  let bgMusic;
  let clickSound;
  let started = false;
  let muted = false;

  function readSavedState() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function saveState() {
    if (!bgMusic) return;
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ time: bgMusic.currentTime || 0, muted, started })
      );
    } catch (err) {
      // sessionStorage unavailable (private mode, etc.) — fine to skip.
    }
  }

  function initAudioElements() {
    bgMusic = new Audio('assets/music/onlyone.mp4');
    bgMusic.loop = true;
    bgMusic.volume = 0.25;

    const saved = readSavedState();
    if (saved) {
      muted = !!saved.muted;
      bgMusic.muted = muted;
      if (saved.time) {
        bgMusic.addEventListener(
          'loadedmetadata',
          () => {
            try {
              bgMusic.currentTime = saved.time;
            } catch (err) {
              /* ignore seek errors on unsupported sources */
            }
          },
          { once: true }
        );
      }
      // If music was already playing on the previous page, resume here too.
      if (saved.started) start();
    }

    window.addEventListener('beforeunload', saveState);
  }

  function playClick() {
    if (!clickSound || muted) return;
    clickSound.currentTime = 0;
    clickSound.play().catch(() => {});
  }

  function start() {
    if (started || !bgMusic) return;
    started = true;
    bgMusic.play().catch(() => {
      // Autoplay blocked or file missing — the toggle button still lets
      // the visitor try again with a direct tap.
      started = false;
    });
  }

  function toggleMute() {
    muted = !muted;
    if (bgMusic) bgMusic.muted = muted;
    const btn = qs('#music-toggle');
    if (btn) {
      btn.classList.toggle('is-muted', muted);
      btn.setAttribute('aria-pressed', String(muted));
    }
    if (!muted) start();
    saveState();
  }

  /** Gently lower the volume as the ending moment comes into view. */
  function initEndingFade(root) {
    const ending = qs('[data-scene="ending"]', root);
    if (!ending || !bgMusic) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const fade = setInterval(() => {
              bgMusic.volume = Math.max(0, bgMusic.volume - 0.02);
              if (bgMusic.volume <= 0.02) clearInterval(fade);
            }, 200);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(ending);
  }

  function initToggleButton() {
    const btn = qs('#music-toggle');
    if (!btn) return;
    // Reflect any restored mute state on the button immediately.
    btn.classList.toggle('is-muted', muted);
    btn.setAttribute('aria-pressed', String(muted));
    btn.addEventListener('click', toggleMute);
  }

  function init(root = document) {
    if (!bgMusic) initAudioElements();
    initToggleButton();
    initEndingFade(root);
  }

  window.Music = { init, start, playClick, toggleMute };
  on('app:scenes-ready', (e) => init(e.detail && e.detail.root));
  on('app:intro-tapped', start);
})();
