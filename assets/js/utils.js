/**
 * utils.js
 * Small, dependency-free helpers shared by every module.
 * Exposed on `window.Utils` so plain <script> tags (no bundler) can use it.
 */
(function () {
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const lerp = (a, b, t) => a + (b - a) * t;

  /** Map a value from one range to another, clamped. */
  const mapRange = (value, inMin, inMax, outMin, outMax) => {
    const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
    return lerp(outMin, outMax, t);
  };

  const debounce = (fn, wait = 150) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  const throttleRaf = (fn) => {
    let ticking = false;
    return (...args) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        fn(...args);
        ticking = false;
      });
    };
  };

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const randomBetween = (min, max) => Math.random() * (max - min) + min;

  /** Fetch + parse JSON with a friendly console warning on failure. */
  const loadJSON = async (path) => {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return await res.json();
    } catch (err) {
      console.warn(`[loadJSON] Could not load ${path}:`, err.message);
      return null;
    }
  };

  /** Fetch an HTML partial (a scene) and return its markup as a string. */
  const loadHTML = async (path) => {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return await res.text();
    } catch (err) {
      console.warn(`[loadHTML] Could not load ${path}:`, err.message);
      return '';
    }
  };

  /** Observe elements and toggle `.in-view` once they cross the viewport. */
  const observeReveal = (root = document) => {
    const items = qsa('.reveal', root);
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('in-view'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25, rootMargin: '0px 0px -8% 0px' }
    );

    items.forEach((el) => io.observe(el));
  };

  /**
   * Draws a slow, twinkling star field on a canvas. Returns a cleanup
   * function. Used by both the opening loading screen and the closing
   * scene so the "stars" motif bookends the story visually.
   */
  const drawStarfield = (canvas, opts = {}) => {
    const ctx = canvas.getContext('2d');
    const density = opts.density || 6000;
    let stars = [];
    let raf;

    function resize() {
      canvas.width = canvas.clientWidth * devicePixelRatio;
      canvas.height = canvas.clientHeight * devicePixelRatio;
      const count = Math.max(30, Math.round((canvas.clientWidth * canvas.clientHeight) / density));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 * devicePixelRatio + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.015 + 0.005,
      }));
    }

    function tick(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        const twinkle = 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
        ctx.beginPath();
        ctx.fillStyle = `rgba(247, 208, 96, ${0.25 + twinkle * 0.55})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener('resize', resize);

    if (prefersReducedMotion()) {
      tick(0);
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  };

  /** Simple event bus so unrelated modules don't need to know about each other. */
  const bus = document.createElement('span');
  const emit = (name, detail) => bus.dispatchEvent(new CustomEvent(name, { detail }));
  const on = (name, handler) => bus.addEventListener(name, handler);

  window.Utils = {
    qs,
    qsa,
    clamp,
    lerp,
    mapRange,
    debounce,
    throttleRaf,
    prefersReducedMotion,
    randomBetween,
    loadJSON,
    loadHTML,
    observeReveal,
    drawStarfield,
    emit,
    on,
  };
})();
