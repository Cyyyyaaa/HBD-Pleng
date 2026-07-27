/**
 * typing.js
 * Typewriter engine with full Thai language support (Grapheme Cluster Segmentation).
 */
(function () {
  const { prefersReducedMotion } = window.Utils;

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /**
   * Helper function ในการแยกข้อความออกเป็น Grapheme Clusters
   * เพื่อรวมพยัญชนะ + สระบน/ล่าง + วรรณยุกต์ ให้เป็น 1 หน่วยอักษรที่ไม่แยกออกจากกัน
   */
  function splitIntoGraphemes(text) {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
      return Array.from(segmenter.segment(text), (s) => s.segment);
    }
    // Fallback สำหรับเบราว์เซอร์รุ่นเก่ามากๆ
    return text.match(/[\u0E00-\u0E7F][\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]*|[^\u0E00-\u0E7F]/g) || Array.from(text);
  }

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

      // แยกข้อความภาษาไทยเป็นกลุ่มอักษรที่ถูกต้อง
      const characters = splitIntoGraphemes(text);
      let currentText = '';
      let i = 0;

      const tick = () => {
        if (i < characters.length) {
          currentText += characters[i];

          // ใช้ Text Node เดียวและอัปเดต textContent เพื่อป้องกันปัญหา Text Node แยกส่วนทำให้สระไม่ลอย
          let firstChild = el.firstChild;
          if (!firstChild || firstChild.nodeType !== Node.TEXT_NODE) {
            firstChild = document.createTextNode('');
            el.insertBefore(firstChild, cursorEl && cursorEl.isConnected ? cursorEl : null);
          }
          firstChild.textContent = currentText;

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
      let firstChild = el.firstChild;
      
      if (!firstChild || firstChild.nodeType !== Node.TEXT_NODE) {
        resolve();
        return;
      }

      let characters = splitIntoGraphemes(firstChild.textContent);

      const tick = () => {
        if (!characters.length) {
          if (firstChild) firstChild.remove();
          if (cursor && !cursorEl) {
            cursorEl = document.createElement('span');
            cursorEl.className = 'cursor';
            cursorEl.setAttribute('aria-hidden', 'true');
            el.appendChild(cursorEl);
          }
          resolve();
          return;
        }
        characters.pop();
        firstChild.textContent = characters.join('');
        setTimeout(tick, speed);
      };
      tick();
    });
  }

  /**
   * Types each line in sequence.
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
