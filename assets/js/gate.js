/**
 * gate.js
 * The very first check of all — a countdown gate that keeps the whole
 * site closed until 9 สิงหาคม 2569 (Aug 9, 2026), 00:00 น. เวลาประเทศไทย
 * (GMT+7). Before that moment: shows a live countdown and blocks
 * everything else. From that moment on: skips itself and hands off to
 * the existing lock-screen / loading flow, every time, on every device.
 */
(function () {
  // 🎯 วันที่เปิดให้เข้าเว็บได้ (เวลาไทย GMT+7) — เปลี่ยนได้ตรงนี้
  const TARGET_ISO = '2026-08-07T14:16:00+07:00';

  function proceed() {
    if (window.Lockscreen?.init) {
      window.Lockscreen.init();
    } else if (window.Loading?.init) {
      window.Loading.init();
    }
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function init() {
    const target = new Date(TARGET_ISO).getTime();

    // Already past the date (or a device with a broken clock reading later) — skip the gate entirely.
    if (Date.now() >= target) {
      proceed();
      return;
    }

    const screen = document.getElementById('gate-screen');
    if (!screen) {
      proceed();
      return;
    }

    screen.style.display = 'flex';

    const canvas = document.getElementById('gate-stars');
    if (canvas && window.Utils?.drawStarfield) {
      window.Utils.drawStarfield(canvas, { density: 7000 });
    }

    const card = screen.querySelector('.gate-card');
    const dEl = document.getElementById('gate-days');
    const hEl = document.getElementById('gate-hours');
    const mEl = document.getElementById('gate-minutes');
    const sEl = document.getElementById('gate-seconds');

    let timer = null;

    function tick() {
      const diff = target - Date.now();

      if (diff <= 0) {
        clearInterval(timer);
        unlock();
        return;
      }

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      if (dEl) dEl.textContent = String(days);
      if (hEl) hEl.textContent = pad(hours);
      if (mEl) mEl.textContent = pad(minutes);
      if (sEl) sEl.textContent = pad(seconds);
    }

    function unlock() {
      if (card) card.classList.add('is-unlocked');
      screen.classList.add('is-unlocking');
      setTimeout(() => {
        screen.classList.add('is-hidden');
        proceed();
      }, 700);
    }

    tick();
    timer = setInterval(tick, 1000);

    // If the tab was left open across midnight, re-check on visibility change too.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') tick();
    });
  }

  window.Gate = { init };
})();
