/**
 * wishes.js
 * Scatters clickable stars in the shape of letter 'P', each one holding a
 * short wish loaded from data/wishes.json.
 */
(function () {
  const { qs, loadJSON, randomBetween } = window.Utils;

  // พิกัดรูปตัว P (รองรับดาวสูงสุด 10 ดวง)
  const P_SHAPE_POSITIONS = [
    { left: '38%', top: '20%' },
    { left: '38%', top: '35%' },
    { left: '38%', top: '50%' },
    { left: '38%', top: '65%' },
    { left: '38%', top: '80%' },
    { left: '48%', top: '20%' },
    { left: '58%', top: '23%' },
    { left: '62%', top: '35%' },
    { left: '58%', top: '47%' },
    { left: '48%', top: '50%' }
  ];

  async function init(root = document) {
    const sky = qs('#wish-sky', root);
    const progressEl = qs('#wish-progress', root);
    if (!sky) return;

    const wishes = (await loadJSON('data/wishes.json')) || [];
    if (!wishes.length) return;

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
      // ดึงพิกัดจากรูปตัว P (หากคำอวยพรใน JSON มีมากกว่า 10 ข้อความ จะวนกลับมาใช้พิกัดแรก)
      const pos = P_SHAPE_POSITIONS[i % P_SHAPE_POSITIONS.length];

      const star = document.createElement('button');
      star.type = 'button';
      star.className = 'wish-star';
      star.style.left = pos.left;
      star.style.top = pos.top;
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
