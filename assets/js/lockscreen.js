/**
 * lockscreen.js
 * A cute PIN-code gate shown before anything else (before #loading-screen).
 * Supports on-screen keypad taps and the physical keyboard. On success,
 * plays an unlock animation, hides itself, then hands off to Loading.init().
 * On failure, shakes, resets, and shows a little scolding message.
 */
(function () {
  // 🔑 เปลี่ยนรหัสผ่านตรงนี้ได้เลย (จำนวนหลักจะปรับจุด PIN ให้อัตโนมัติ)
  const CORRECT_PIN = '0908';

  const WRONG_MESSAGES = [
    'วันเกิดน้องไง ลองใหม่อีกทีคั้บ 🥹',
  ];

  function init() {
    const screen = document.getElementById('lock-screen');
    if (!screen) return;

    const dotsWrap = document.getElementById('lock-dots');
    const keypad = document.getElementById('lock-keypad');
    const messageEl = document.getElementById('lock-message');
    const card = screen.querySelector('.lock-card');
    const canvas = document.getElementById('lock-stars');

    if (canvas && window.Utils?.drawStarfield) {
      window.Utils.drawStarfield(canvas, { density: 7000 });
    }

    // Build the PIN dots to match CORRECT_PIN's length.
    dotsWrap.innerHTML = '';
    for (let i = 0; i < CORRECT_PIN.length; i += 1) {
      const dot = document.createElement('span');
      dot.className = 'dot';
      dotsWrap.appendChild(dot);
    }
    const dots = Array.from(dotsWrap.children);

    let entered = '';
    let busy = false; // true while a wrong/right animation is playing

    function showMessage(text, isSuccess) {
      messageEl.textContent = text;
      messageEl.classList.toggle('is-success', !!isSuccess);
      messageEl.classList.add('is-visible');
    }

    function clearMessage() {
      messageEl.classList.remove('is-visible', 'is-success');
    }

    function renderDots() {
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-filled', i < entered.length);
      });
    }

    function popLastDot() {
      const dot = dots[entered.length - 1];
      if (!dot) return;
      dot.classList.remove('is-pop');
      // restart the animation even if it was already applied
      void dot.offsetWidth;
      dot.classList.add('is-pop');
    }

    function reset() {
      entered = '';
      renderDots();
    }

    function shakeAndReset() {
      busy = true;
      card.classList.add('is-shaking');
      const msg = WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)];
      showMessage(msg, false);

      setTimeout(() => {
        card.classList.remove('is-shaking');
        reset();
        busy = false;
      }, 500);
    }

    function unlock() {
      busy = true;
      showMessage('ถูกต้องแล้ว! 🤍', true);
      card.classList.add('is-unlocked');
      keypad.setAttribute('aria-disabled', 'true');
      screen.classList.add('is-unlocking');

      setTimeout(() => {
        screen.classList.add('is-hidden');
        document.removeEventListener('keydown', onKeydown);
        // Hand off to the loading screen once the lock has faded away.
        if (window.Loading?.init) window.Loading.init();
      }, 700);
    }

    function pressKey(key) {
      if (busy) return;

      if (key === 'back') {
        entered = entered.slice(0, -1);
        renderDots();
        clearMessage();
        return;
      }

      if (entered.length >= CORRECT_PIN.length) return;

      entered += key;
      renderDots();
      popLastDot();
      clearMessage();

      if (entered.length === CORRECT_PIN.length) {
        if (entered === CORRECT_PIN) {
          unlock();
        } else {
          setTimeout(shakeAndReset, 120);
        }
      }
    }

    // ---- on-screen keypad ----
    keypad.addEventListener('click', (e) => {
      const btn = e.target.closest('.lock-key[data-key]');
      if (!btn) return;
      btn.classList.add('is-pressed');
      setTimeout(() => btn.classList.remove('is-pressed'), 150);
      pressKey(btn.dataset.key);
    });

    // ---- physical keyboard ----
    function onKeydown(e) {
      if (e.key >= '0' && e.key <= '9') {
        pressKey(e.key);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        pressKey('back');
      }
    }
    document.addEventListener('keydown', onKeydown);
  }

  window.Lockscreen = { init };
})();
