/**
 * scroll.js
 * Drives everything that responds to scroll position: the reveal-on-scroll
 * observer, the "life thread" signature light, the side scene-dots nav,
 * and gentle parallax on elements flagged with [data-parallax].
 */
(function () {
  const { qs, qsa, mapRange, throttleRaf, on, prefersReducedMotion } = window.Utils;

  function initLifeThread() {
    const thread = qs('#life-thread');
    const light = qs('.thread-light', thread || document);
    if (!thread || !light) return;

    thread.classList.add('is-visible');

    const update = throttleRaf(() => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? window.scrollY / docHeight : 0;
      const trackHeight = thread.clientHeight;
      light.style.top = `${progress * trackHeight}px`;

      // The light warms from a quiet ember to full gold as the story
      // progresses, then blazes as the story nears the wish/cake scenes.
      const glow = mapRange(progress, 0, 1, 6, 16);
      light.style.boxShadow = `0 0 ${glow}px 3px rgba(247, 208, 96, ${mapRange(progress, 0, 1, 0.35, 0.75)})`;
    });

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function initSceneDots(root) {
    const scenes = qsa('.scene[data-scene]', root);
    const nav = qs('#scene-dots');
    if (!scenes.length || !nav) return;

    nav.innerHTML = '';
    scenes.forEach((scene) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', `Go to ${scene.dataset.scene} scene`);
      btn.addEventListener('click', () => scene.scrollIntoView({ behavior: 'smooth' }));
      nav.appendChild(btn);
    });

    const dots = qsa('button', nav);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = scenes.indexOf(entry.target);
          if (entry.isIntersecting && idx > -1) {
            dots.forEach((d) => d.classList.remove('is-active'));
            dots[idx].classList.add('is-active');
          }
        });
      },
      { threshold: 0.5 }
    );
    scenes.forEach((s) => io.observe(s));
  }

  function initParallax(root) {
    if (prefersReducedMotion()) return;
    const layers = qsa('[data-parallax]', root);
    if (!layers.length) return;

    const update = throttleRaf(() => {
      const vh = window.innerHeight;
      layers.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const speed = parseFloat(el.dataset.parallax) || 0.15;
        const offset = (rect.top - vh / 2) * speed;
        el.style.transform = `translateY(${offset * -1}px)`;
      });
    });

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function init(root = document) {
    window.Utils.observeReveal(root);
    initLifeThread();
    initSceneDots(root);
    initParallax(root);
  }

  // Re-run whenever new scene markup is injected (see app.js).
  on('app:scenes-ready', (e) => init(e.detail && e.detail.root));

  window.Scroll = { init };
})();
