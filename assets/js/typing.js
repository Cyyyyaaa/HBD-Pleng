/**
 * typing.js
 * Pure typewriter engine — no scene-specific logic (polaroids, lightboxes,
 * etc. live in polaroid.js now). Exposes:
 *   Typing.type(el, text, opts)     -> types text into el
 *   Typing.erase(el, opts)          -> erases el's current text, char by char
 *   Typing.typeSequence(el, lines, opts) -> types each line; by default
 *     erases (backspace-style) before typing the next line, instead of
 *     swapping text abruptly.
 */
(function () {
  const { prefersReducedMotion } = window.Utils;

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /**
   * @param {HTMLElement} el
   * @param {string} text
   * @param {object} [opts]
   * @param {number} [opts.speed=45] ms per character while typing
   * @param {boolean} [opts.cursor=true]
   * @param {boolean} [opts.keepCursor=true] leave the cursor after finishing
   */
  function type(el, text, opts = {}) {
    const { speed = 45, cursor = true, keepCursor = true } = opts;

    return new Promise((resolve) => {
      if (!el) return resolve();

      if (prefersReducedMotion()) {
        el.textContent = text;
        resolve();
        return;
      }

      let cursorEl = el.querySelector(':scope > .cursor');
      if (!cursorEl && cursor) {
        cursorEl = document.createElement('span');
        cursorEl.className = 'cursor';
        cursorEl.setAttribute('aria-hidden', 'true');
        el.appendChild(cursorEl);
      }

      let i = 0;
      const tick = () => {
        if (i < text.length) {
          const char = document.createTextNode(text[i]);
          el.insertBefore(char, cursorEl && cursorEl.isConnected ? cursorEl : null);
          i += 1;
          setTimeout(tick, speed);
        } else {
          if (!keepCursor && cursorEl && cursorEl.isConnected) cursorEl.remove();
          resolve();
        }
      };
      tick();
    });
  }

  /**
   * Erases whatever text currently sits in `el`, one character at a time
   * from the end (a backspace effect), leaving only the cursor behind.
   * @param {number} [opts.speed=22] ms per character while erasing — faster
   *   than typing feels natural, like a real backspace.
   */
  function erase(el, opts = {}) {
    const { speed = 22, cursor = true } = opts;

    return new Promise((resolve) => {
      if (!el) return resolve();

      if (prefersReducedMotion()) {
        el.textContent = '';
        resolve();
        return;
      }

      let cursorEl = el.querySelector(':scope > .cursor');
      const textNodes = () =>
        Array.from(el.childNodes).filter((n) => n.nodeType === Node.TEXT_NODE);

      const tick = () => {
        const nodes = textNodes();
        if (!nodes.length) {
          if (cursor && !cursorEl) {
            cursorEl = document.createElement('span');
            cursorEl.className = 'cursor';
            cursorEl.setAttribute('aria-hidden', 'true');
            el.appendChild(cursorEl);
          }
          resolve();
          return;
        }
        const last = nodes[nodes.length - 1];
        last.textContent = last.textContent.slice(0, -1);
        if (!last.textContent) last.remove();
        setTimeout(tick, speed);
      };
      tick();
    });
  }

  /**
   * Types each line in sequence. By default, erases the previous line
   * (backspace-style) before typing the next one, rather than swapping
   * text abruptly. The final line is left on screen (not erased) unless
   * `opts.eraseLast` is true.
   *
   * @param {number} [opts.speed=45] typing speed, ms/char
   * @param {number} [opts.eraseSpeed=22] erase speed, ms/char
   * @param {number} [opts.hold=700] pause after a line finishes typing, before erasing
   * @param {boolean} [opts.eraseLast=false] also erase after the final line
   */
  async function typeSequence(el, lines, opts = {}) {
    const { hold = 700, eraseLast = false } = opts;

    for (let i = 0; i < lines.length; i += 1) {
      await type(el, lines[i], opts);
      if (hold) await wait(hold);

      const isLast = i === lines.length - 1;
      if (!isLast || eraseLast) {
        await erase(el, opts);
      }
    }
  }

  window.Typing = { type, erase, typeSequence };
})();
