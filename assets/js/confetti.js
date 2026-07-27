/**
 * confetti.js
 * A lightweight canvas confetti burst (no library) plus a handful of
 * CSS-driven balloons, both triggered once the candle is blown out.
 */
(function () {
  const { qs, randomBetween, prefersReducedMotion } = window.Utils;

  const COLORS = ['#F7D060', '#F8C8DC', '#FFFFFF', '#0D1B2A'];

  function burstConfetti() {
    let canvas = qs('#confetti-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'confetti-canvas';
      document.body.appendChild(canvas);
    }
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (prefersReducedMotion()) return; // keep it calm if requested

    const pieces = Array.from({ length: 140 }, () => ({
      x: canvas.width / 2 + randomBetween(-40, 40),
      y: canvas.height * 0.55,
      vx: randomBetween(-6, 6),
      vy: randomBetween(-11, -4),
      size: randomBetween(5, 10),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: randomBetween(0, Math.PI * 2),
      spin: randomBetween(-0.2, 0.2),
      life: 0,
    }));

    let frame = 0;
    const maxFrames = 160;

    function tick() {
      frame += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.vy += 0.16; // gravity
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.spin;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - frame / maxFrames);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      if (frame < maxFrames) {
        requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    requestAnimationFrame(tick);
  }

  function releaseBalloons(scene) {
    const field = qs('.balloon-field', scene);
    if (!field || prefersReducedMotion()) return;

    const colors = ['#F8C8DC', '#F7D060', '#FFFFFF'];
    for (let i = 0; i < 8; i += 1) {
      const balloon = document.createElement('span');
      balloon.className = 'balloon';
      balloon.style.left = `${randomBetween(5, 90)}%`;
      balloon.style.background = colors[i % colors.length];
      balloon.style.animation = `balloon-rise ${randomBetween(6, 9)}s ease-in ${randomBetween(0, 1.2)}s forwards`;
      field.appendChild(balloon);
    }

    setTimeout(() => {
      field.innerHTML = '';
    }, 11000);
  }

  function celebrate(scene) {
    burstConfetti();
    releaseBalloons(scene);
  }

  window.Confetti = { celebrate };
})();
