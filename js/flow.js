// Flow — Wispr-style flowing motion graphic for the Philosophy section.
// Layered sine "ribbons" of light drift and undulate across a canvas, blended
// additively so where they overlap they glow. Pauses when off-screen and is
// skipped entirely for visitors who prefer reduced motion.

export class Flow {
  constructor(accents) {
    this.palette = ['#e9b873', '#4db3c4', '#8e93cf', '#5fae9e', '#d9974f'];
    if (Array.isArray(accents) && accents.length) {
      this.palette = [accents[0], accents[5] || accents[0], accents[8] || accents[2], accents[2], accents[1]];
    }
  }

  init() {
    const cvs = document.getElementById('cd-flow');
    if (!cvs || !cvs.getContext) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = cvs.getContext('2d');
    const sec = cvs.closest('section') || cvs.parentElement;
    let W = 0, H = 0, DPR = 1;

    const resize = () => {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      const r = sec.getBoundingClientRect();
      W = r.width; H = r.height;
      cvs.width = Math.round(W * DPR); cvs.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Each ribbon: a base height, a couple of harmonics, its own drift speed.
    const ribbons = [];
    const N = 5;
    for (let i = 0; i < N; i++) {
      ribbons.push({
        y: 0.16 + i * 0.16,
        amp: 34 + i * 15,
        wl: 0.55 + i * 0.16,
        speed: 0.00022 + i * 0.00009,
        phase: i * 1.9,
        color: this.palette[i % this.palette.length],
        width: 1.3 + (i % 2) * 1.1,
        alpha: 0.5 - i * 0.045,
      });
    }

    const draw = (t) => {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      for (const rb of ribbons) {
        const baseY = H * rb.y;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 14) {
          const k = (x / Math.max(W, 1)) * Math.PI * 2 * rb.wl;
          const y = baseY
            + Math.sin(k + t * rb.speed + rb.phase) * rb.amp
            + Math.sin(k * 1.8 + t * rb.speed * 1.4 + rb.phase) * rb.amp * 0.34;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        const grad = ctx.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.5, rb.color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.strokeStyle = grad;
        ctx.globalAlpha = rb.alpha;
        ctx.lineWidth = rb.width;
        ctx.shadowColor = rb.color;
        ctx.shadowBlur = 16;
        ctx.stroke();
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'source-over';
    };

    let on = true, raf = 0;
    const loop = (t) => { draw(t || 0); raf = on ? requestAnimationFrame(loop) : 0; };
    const start = () => { if (!raf) raf = requestAnimationFrame(loop); };
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { on = e.isIntersecting; if (on) start(); });
    }, { threshold: 0.01 });
    io.observe(sec);
    start();
  }
}
