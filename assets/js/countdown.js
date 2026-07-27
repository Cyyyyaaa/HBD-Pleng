/**
 * countdown.js
 * Plays the "3, 2, 1" numeral animation once the countdown scene enters
 * view, then reveals the birthday date beneath it. Runs only once.
 */
(function () {
  const { qs, prefersReducedMotion } = window.Utils;

  function playCountdown(scene) {
    const digit = qs('.countdown-digit', scene);
    const dateEl = qs('.countdown-date', scene);
    if (!digit) return;

    const sequence = ['9','8', '7', '6', '5', '4','3', '2', '1'];
    const stepMs = prefersReducedMotion() ? 0 : 650;

    if (stepMs === 0) {
      digit.textContent = '';
      digit.classList.add('is-done');
      if (dateEl) dateEl.classList.add('in-view');
      return;
    }

    let i = 0;
    digit.textContent = sequence[0];
    digit.animate(
      [{ opacity: 0, transform: 'scale(0.7)' }, { opacity: 1, transform: 'scale(1)' }],
      { duration: 400, easing: 'cubic-bezier(0.16,1,0.3,1)' }
    );

    const timer = setInterval(() => {
      i += 1;
      if (i < sequence.length) {
        digit.textContent = sequence[i];
        digit.animate(
          [{ opacity: 0, transform: 'scale(0.7)' }, { opacity: 1, transform: 'scale(1)' }],
          { duration: 400, easing: 'cubic-bezier(0.16,1,0.3,1)' }
        );
      } else {
        clearInterval(timer);
        digit.animate(
          [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.4)' }],
          { duration: 500, easing: 'ease-out' }
        );
        setTimeout(() => {
          digit.textContent = '↓';
          if (dateEl) dateEl.classList.add('in-view');
        }, 480);
      }
    }, stepMs);
  }

  function init(root = document) {
    const scene = qs('[data-scene="countdown"]', root);
    if (!scene) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            playCountdown(scene);
            io.disconnect();
          }
        });
      },
      { threshold: 0.6 }
    );
    io.observe(scene);
  }

  window.Countdown = { init };
  window.Utils.on('app:scenes-ready', (e) => init(e.detail && e.detail.root));
})();
