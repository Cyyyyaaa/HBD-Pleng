/**
 * loading.js
 * Owns the opening black screen: draws a slow star field on a canvas and
 * simulates a short, elegant loading progress before fading out and
 * announcing `app:loading-complete` on the shared bus.
 */
(function () {
  const { qs, emit, drawStarfield } = window.Utils;

  function init() {
    const screen = qs('#loading-screen');
    if (!screen) return;

    const canvas = qs('#loading-stars', screen);
    const bar = qs('.loading-bar span', screen);
    if (canvas) drawStarfield(canvas);

    let progress = 0;
    const target = 100;
    const step = () => {
      // Ease toward 100 rather than a flat linear fill — feels more crafted.
      progress += (target - progress) * 0.20 + 0.7;
      progress = Math.min(progress, 100);
      if (bar) bar.style.width = `${progress}%`;

      if (progress >= 99.4) {
        finish();
      } else {
        requestAnimationFrame(step);
      }
    };

    function finish() {
      if (bar) bar.style.width = '100%';
      setTimeout(() => {
        screen.classList.add('is-hidden');
        emit('app:loading-complete');
      }, 350);
    }

    requestAnimationFrame(step);
  }

  window.Loading = { init };
})();
