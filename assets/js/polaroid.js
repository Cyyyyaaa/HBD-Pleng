/**
 * polaroid.js
 * Owns every standalone polaroid on the site that lives OUTSIDE the main
 * photo gallery (currently: the "beginning" scene's reveal photo). Each
 * one opens in its own Polaroid Lightbox (#polaroid-lightbox) — a
 * separate instance from the Gallery Lightbox (#gallery-lightbox) in
 * gallery.js, so the two never collide or share DOM structure.
 */
(function () {
  const { qs } = window.Utils;

  function buildLightbox() {
    let lightbox = qs('#polaroid-lightbox');
    if (lightbox) return lightbox;

    lightbox = document.createElement('div');
    lightbox.id = 'polaroid-lightbox';
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

  function placeholderImage(label) {
    return (
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="100%" height="100%" fill="#f2e6de"/><text x="50%" y="52%" font-family="Kanit, sans-serif" font-size="18" fill="#b89b8c" text-anchor="middle">${(label || 'photo').slice(0, 20)}</text></svg>`
      )
    );
  }

  /**
   * Populates and reveals a hidden `<figure class="polaroid">` container,
   * wires it up to open in the Polaroid Lightbox, and (optionally) swaps
   * to a second photo after a delay — e.g. a baby photo that becomes a
   * "now" photo.
   *
   * @param {HTMLElement} el - the hidden polaroid figure
   * @param {object} photo - { src, alt, caption, afterSrc, afterAlt,
   *   afterCaptionMidway, afterCaption, afterDelay }
   */
  function reveal(el, photo) {
    if (!el || !photo) return;
    const img = qs('img', el);
    const caption = qs('figcaption', el);
    if (!img) return;

    const setImage = (src, alt) => {
      img.style.opacity = '0';
      img.onload = () => {
        img.style.opacity = '1';
      };
      img.onerror = () => {
        img.onerror = null;
        img.src = placeholderImage(alt);
        img.style.opacity = '1';
      };
      img.src = src;
      img.alt = alt || '';
    };

    setImage(photo.src, photo.alt);
    if (caption) caption.textContent = photo.caption || '';

    el.removeAttribute('aria-hidden');
    requestAnimationFrame(() => el.classList.add('is-shown'));

    const activate = () => openLightbox(img.src, img.alt, caption?.textContent);
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', `Open photo: ${photo.caption || 'untitled'}`);
    el.addEventListener('click', activate);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });

    if (photo.afterSrc) {
      setTimeout(() => {
        if (caption && photo.afterCaptionMidway) caption.textContent = photo.afterCaptionMidway;
        setImage(photo.afterSrc, photo.afterAlt);
        if (caption && photo.afterCaption) {
          setTimeout(() => {
            caption.textContent = photo.afterCaption;
          }, 900);
        }
      }, photo.afterDelay || 4000);
    }
  }

  /** Fades out (and clears) an element's text, e.g. the last typed line, to make room for a photo. */
  function fadeOutText(el) {
    return new Promise((resolve) => {
      if (!el) return resolve();
      if (window.Utils.prefersReducedMotion()) {
        el.textContent = '';
        return resolve();
      }
      const anim = el.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 600,
        easing: 'ease-out',
        fill: 'forwards',
      });
      anim.onfinish = () => {
        el.textContent = '';
        el.style.opacity = '1';
        resolve();
      };
    });
  }

  window.Polaroid = { reveal, openLightbox, fadeOutText };
})();
