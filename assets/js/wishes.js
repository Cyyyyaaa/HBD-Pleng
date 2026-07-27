/**
 * wishes.js
 * Scatters clickable stars across the night-sky scene, each one holding a
 * short wish loaded from data/wishes.json. Clicking a star opens a small
 * bubble with the wish text and marks that star as revealed.
 */
(function () {
  const { qs, loadJSON, randomBetween } = window.Utils;

  function positionStars(count) {
    // Deterministic-feeling scatter: split the sky into a loose grid, then
    // jitter within each cell so stars never overlap or clump.
    const cols = Math.ceil(Math.sqrt(count * 1.4));
    const rows = Math.ceil(count / cols);
    const cells = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) cells.push({ r, c });
    }
    cells.sort(() => Math.random() - 0.5);

    return cells.slice(0, count).map(({ r, c }) => ({
      left: `${(c / cols) * 92 + randomBetween(1, 6)}%`,
      top: `${(r / rows) * 88 + randomBetween(1, 6)}%`,
    }));
  }

  async function init(root = document) {
    const sky = qs('#wish-sky', root);
    const progressEl = qs('#wish-progress', root);
    if (!sky) return;

    const wishes = (await loadJSON('data/wishes.json')) || [];
    if (!wishes.length) return;

    const positions = positionStars(wishes.length);
    let revealedCount = 0;

    const bubble = document.createElement('div');
    bubble.className = 'wish-bubble';
    bubble.setAttribute('role', 'status');
    sky.appendChild(bubble);

    function updateProgress() {
      if (!progressEl) return;
      progressEl.textContent = `${revealedCount} of ${wishes.length} wishes found`;
    }
    updateProgress();

    wishes.forEach((wish, i) => {
      const star = document.createElement('button');
      star.type = 'button';
      star.className = 'wish-star';
      star.style.left = positions[i].left;
      star.style.top = positions[i].top;
      star.style.animationDelay = `${randomBetween(0, 2.5)}s`;
      star.setAttribute('aria-label', `Reveal wish ${i + 1} of ${wishes.length}`);
      star.dataset.revealed = 'false';

      star.addEventListener('click', () => {
        bubble.textContent = wish;
        bubble.style.left = star.style.left;
        bubble.style.top = star.style.top;
        bubble.classList.add('is-open');

        if (star.dataset.revealed === 'false') {
          star.dataset.revealed = 'true';
          star.classList.add('is-revealed');
          revealedCount += 1;
          updateProgress();
        }
      });

      sky.appendChild(star);
    });

    // Tapping the sky itself (not a star) closes the open bubble.
    sky.addEventListener('click', (e) => {
      if (e.target === sky) bubble.classList.remove('is-open');
    });
  }

  window.Wishes = { init };
  window.Utils.on('app:scenes-ready', (e) => init(e.detail && e.detail.root));
})();
