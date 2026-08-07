/**
 * app.js
 * The conductor for the single-scroll part of the story: loading screen,
 * intro, countdown, the "beginning" narrative, and the photo gallery.
 * The letter, wishes, and cake moments now live on their own standalone
 * pages (letter.html, wish.html, cake.html) — each of those wires up its
 * own small init script at the bottom of its HTML file.
 */
(function () {
  const { qs, qsa, loadHTML, loadJSON, emit, on, prefersReducedMotion } = window.Utils;

  // Narrative order — independent of the alphabetical file list in /sections.
  const SCENE_FILES = [
    'sections/intro.html',
    'sections/birthday.html',
    'sections/gallery.html',
  ];

  async function loadScenes() {
    const root = qs('#scenes-root');
    if (!root) return;

    const htmls = await Promise.all(SCENE_FILES.map(loadHTML));
    root.innerHTML = htmls.join('\n');
    return root;
  }

  function populateProfile(profile, root) {
    if (!profile) return;

    qsa('[data-bind="name"]', root).forEach((el) => (el.textContent = profile.name));
    qsa('[data-bind="nickname"]', root).forEach((el) => (el.textContent = profile.nickname));
    qsa('[data-bind="birthDateLong"]', root).forEach((el) => (el.textContent = profile.birthDateLong));
    qsa('[data-bind="thisYearDate"]', root).forEach((el) => (el.textContent = profile.thisYearDateLong));

    // Beginning narrative lines (typed)
    window.__beginningLines = profile.beginningLines || [];
    window.__revealPhoto = profile.revealPhoto || null;
  }

  function initIntro(root) {
    const intro = qs('[data-scene="intro"]', root);
    if (!intro) return;
    const hint = qs('.tap-hint', intro);

    const advance = () => {
      emit('app:intro-tapped');
      window.Music.playClick();
      const next = intro.nextElementSibling;
      intro.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        { duration: 500, easing: 'ease-out', fill: 'forwards' }
      ).onfinish = () => {
        intro.style.display = 'none';
        if (next) next.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      };
      intro.removeEventListener('click', advance);
      window.removeEventListener('keydown', keyAdvance);
    };
    const keyAdvance = (e) => {
      if (e.key === 'Enter' || e.key === ' ') advance();
    };

    intro.addEventListener('click', advance);
    window.addEventListener('keydown', keyAdvance);
    if (hint) hint.textContent = 'กดจิ้มตรงไหนก็ได้เลยนะ 🤍';
  }

  async function initBeginning(root) {
    const scene = qs('[data-scene="beginning"]', root);
    if (!scene) return;
    const line = qs('.story-line', scene);
    const polaroid = qs('#beginning-polaroid', scene);
    if (!line || !window.__beginningLines?.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting) {
            io.disconnect();
            await window.Typing.typeSequence(line, window.__beginningLines, {
              speed: 42,
              eraseSpeed: 20,
              hold: 700,
            });
            await window.Polaroid.fadeOutText(line);
            window.Polaroid.reveal(polaroid, window.__revealPhoto);
          }
        });
      },
      { threshold: 0.6 }
    );
    io.observe(scene);
  }

  async function boot() {
    const [profile] = await Promise.all([loadJSON('data/profile.json')]);
    const root = await loadScenes();
    if (!root) return;

    populateProfile(profile, root);

    // Let every scroll/scene-specific module boot against the fresh markup.
    emit('app:scenes-ready', { root });

    initIntro(root);
    initBeginning(root);

    document.documentElement.classList.add('is-ready');
  }

  on('app:loading-complete', boot);

  document.addEventListener('DOMContentLoaded', () => {
    if (window.Gate) {
      window.Gate.init(); // checks the date first, then hands off to Lockscreen/Loading
    } else if (window.Lockscreen) {
      window.Lockscreen.init(); // calls window.Loading.init() itself once unlocked
    } else {
      window.Loading.init();
    }
  });
})();
