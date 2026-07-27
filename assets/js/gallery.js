/**
 * gallery.js
 * Renders the polaroid photo field from data/gallery.json. Photos "fall"
 * into place with a slight rotation on first view. Clicking one opens the
 * dedicated Gallery Lightbox (#gallery-lightbox) — separate from the
 * Polaroid Lightbox used by standalone polaroids (see polaroid.js).
 */
(function () {
  const { qs, loadJSON, randomBetween, prefersReducedMotion } = window.Utils;

  function layoutPositions(count, fieldWidth) {
    const cols = fieldWidth > 900 ? 4 : fieldWidth > 600 ? 3 : 2;
    const positions = [];
    for (let i = 0; i < count; i += 1) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const jitterY = randomBetween(-24, 24);
      positions.push({
        left: `${(col / cols) * 100 + randomBetween(2, 6)}%`,
        top: `${row * 230 + jitterY + 80}px`,
      });
    }
    return positions;
  }

  function buildLightbox() {
    let lightbox = qs('#gallery-lightbox');
    if (lightbox) return lightbox;

    lightbox = document.createElement('div');
    lightbox.id = 'gallery-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Photo preview');
    lightbox.innerHTML = `
      <button class="lightbox-close" aria-label="Close photo preview">&times;</button>
      <figure>
        <img src="" alt="" />
        <figcaption></figcaption>
      </figure>
    `;
    document.body.appendChild(lightbox);

    const close = () => lightbox.classList.remove('is-open');
    qs('.lightbox-close', lightbox).addEventListener('click', close);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    return lightbox;
  }

  function openLightbox(src, alt, caption) {
    const lightbox = buildLightbox();
    const img = qs('img', lightbox);
    img.src = src;
    img.alt = alt || '';
    qs('figcaption', lightbox).textContent = caption || '';
    lightbox.classList.add('is-open');
  }

  async function init(root = document) {
    const field = qs('#polaroid-field', root);
    if (!field) return;

    const data = (await loadJSON('data/gallery.json')) || [];
    if (!data.length) return;

    const positions = layoutPositions(data.length, field.clientWidth || 900);
    field.style.minHeight = `${Math.ceil(data.length / (field.clientWidth > 900 ? 4 : field.clientWidth > 600 ? 3 : 2)) * 230 + 260}px`;

    data.forEach((photo, i) => {
      const fig = document.createElement('figure');
      fig.className = 'polaroid';
      fig.tabIndex = 0;
      fig.setAttribute('role', 'button');
      fig.setAttribute('aria-label', `Open photo: ${photo.caption || 'untitled'}`);

      const rot = randomBetween(-7, 7).toFixed(1);
      const pos = positions[i];
      fig.style.left = pos.left;
      fig.style.top = pos.top;
      fig.style.setProperty('--rot-to', `${rot}deg`);
      fig.style.setProperty('--rot-from', `${rot / 3}deg`);
      fig.style.transform = `rotate(${rot}deg)`;

      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.alt || photo.caption || 'A memory';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.onerror = () => {
        img.onerror = null;
        img.src =
          'data:image/svg+xml;utf8,' +
          encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="100%" height="100%" fill="#f2e6de"/><text x="50%" y="52%" font-family="Kanit, sans-serif" font-size="20" fill="#b89b8c" text-anchor="middle">${(photo.caption || 'photo').slice(0, 18)}</text></svg>`
          );
      };

      const caption = document.createElement('figcaption');
      caption.textContent = photo.caption || '';

      fig.appendChild(img);
      fig.appendChild(caption);
      field.appendChild(fig);

      const activate = () => openLightbox(img.src, img.alt, photo.caption);
      fig.addEventListener('click', activate);
      fig.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      });

      if (!prefersReducedMotion()) {
        fig.style.opacity = '0';
        fig.animate(
          [
            { opacity: 0, transform: `translateY(-40vh) rotate(${rot / 3}deg)` },
            { opacity: 1, transform: `translateY(0) rotate(${rot}deg)` },
          ],
          { duration: 900, delay: i * 130, easing: 'cubic-bezier(0.16,1,0.3,1)', fill: 'forwards' }
        );
      } else {
        fig.style.opacity = '1';
      }
    });
  }

  window.Gallery = { init, openLightbox };
  window.Utils.on('app:scenes-ready', (e) => init(e.detail && e.detail.root));
})();
