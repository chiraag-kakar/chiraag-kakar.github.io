// Scroll Manager — hero constellation canvas, eased parallax engine,
// scroll-reveal, 3D card tilt, and the floating-nav scroll state.

import { hexToRgb, animateCount } from './util.js';

export class ScrollManager {
  constructor(accents, chapterCount) {
    this.accents = accents || [];
    this.chapterCount = chapterCount || 10;
    this.reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  init() {
    this.root = document.getElementById('cd-root');
    if (!this.root) return;
    this.initConstellation();
    this.initParallax();
    this.initReveal();
    this.initTilt();
  }

  /* ---------- hero constellation ---------- */
  initConstellation() {
    const cvs = document.getElementById('cd-canvas');
    const wrap = document.getElementById('cd-canvaswrap');
    if (!cvs || !cvs.getContext || !wrap) return;
    const ctx = cvs.getContext('2d');
    const reduce = this.reduce;
    let W = 0, H = 0, DPR = 1;
    const resize = () => {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      const r = wrap.getBoundingClientRect();
      W = r.width; H = r.height;
      cvs.width = Math.max(1, Math.round(W * DPR));
      cvs.height = Math.max(1, Math.round(H * DPR));
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const accentRgb = this.accents.map(hexToRgb);
    const N = 360, pts = [];
    for (let k = 0; k < N; k++) {
      const y = 1 - (k / (N - 1)) * 2;
      const rad = Math.sqrt(Math.max(0, 1 - y * y));
      const phi = k * 2.399963229;
      pts.push({ x: Math.cos(phi) * rad, y, z: Math.sin(phi) * rad, big: false });
    }
    for (let c = 0; c < this.chapterCount; c++) {
      const k = Math.floor((c + 0.5) / this.chapterCount * N);
      pts[k].big = true; pts[k].ci = c;
    }

    let rot = 0, mx = 0, my = 0, tmx = 0, tmy = 0;
    const spot = document.getElementById('cd-spot');
    this.root.addEventListener('pointermove', (ev) => {
      const r = wrap.getBoundingClientRect();
      const px = (ev.clientX - r.left) / r.width, py = (ev.clientY - r.top) / r.height;
      tmx = px - 0.5; tmy = py - 0.5;
      if (spot && ev.clientY < r.bottom) {
        spot.style.opacity = '1';
        spot.style.background = 'radial-gradient(420px 420px at ' + (px * 100) + '% ' + (py * 100) + '%, rgba(233,184,115,.13), transparent 70%)';
      }
    });
    this.root.addEventListener('pointerleave', () => { tmx = 0; tmy = 0; if (spot) spot.style.opacity = '0'; });

    const draw = () => {
      rot += reduce ? 0 : 0.0016;
      mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H * 0.46, R = Math.min(W, H) * 0.40;
      const ry = rot + mx * 0.7, rx = -my * 0.5;
      const cosY = Math.cos(ry), sinY = Math.sin(ry), cosX = Math.cos(rx), sinX = Math.sin(rx);
      const fov = 2.4, proj = [];
      for (let k = 0; k < pts.length; k++) {
        const p = pts[k];
        let x = p.x * cosY + p.z * sinY;
        let z = -p.x * sinY + p.z * cosY;
        let y = p.y * cosX - z * sinX;
        z = p.y * sinX + z * cosX;
        const persp = fov / (fov - z);
        proj.push({ sx: cx + x * R * persp, sy: cy + y * R * persp, z, persp, big: p.big, ci: p.ci });
      }
      const bright = proj.filter(p => p.big);
      for (let aa = 0; aa < bright.length; aa++) {
        for (let bb = aa + 1; bb < bright.length; bb++) {
          const dx = bright[aa].sx - bright[bb].sx, dy = bright[aa].sy - bright[bb].sy, d = Math.hypot(dx, dy);
          if (d < R * 1.05) {
            const dep = (bright[aa].z + bright[bb].z) / 2;
            const al = Math.max(0, 0.14 * (1 - d / (R * 1.05)) * (0.5 + dep * 0.5));
            ctx.strokeStyle = 'rgba(233,184,115,' + al.toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(bright[aa].sx, bright[aa].sy); ctx.lineTo(bright[bb].sx, bright[bb].sy); ctx.stroke();
          }
        }
      }
      proj.sort((a, b) => a.z - b.z);
      for (let k = 0; k < proj.length; k++) {
        const p = proj[k], dep = (p.z + 1) / 2;
        if (p.big) {
          const col = accentRgb[p.ci] || [233, 184, 115], rr = 3.4 * p.persp;
          const g = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, rr * 6);
          g.addColorStop(0, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + (0.55 + dep * 0.4).toFixed(3) + ')');
          g.addColorStop(0.4, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + (0.2 * dep).toFixed(3) + ')');
          g.addColorStop(1, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(p.sx, p.sy, rr * 6, 0, 6.2832); ctx.fill();
          ctx.fillStyle = 'rgba(250,240,224,' + (0.7 + dep * 0.3).toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(p.sx, p.sy, rr, 0, 6.2832); ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(242,236,225,' + (0.12 + dep * 0.5).toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(p.sx, p.sy, 1.15 * p.persp, 0, 6.2832); ctx.fill();
        }
      }
      requestAnimationFrame(draw);
    };
    draw();
  }

  /* ---------- eased parallax engine + nav scroll state ---------- */
  initParallax() {
    const root = this.root, reduce = this.reduce;
    const nav = document.getElementById('cd-nav');
    const herocopy = document.getElementById('cd-herocopy');
    const header = document.getElementById('cd-top');
    const wrap = document.getElementById('cd-canvaswrap');

    const pxEls = Array.from(root.querySelectorAll('[data-cd-px]')).map(el => ({
      el,
      sec: el.closest('section') || el.parentElement,
      speed: parseFloat(el.getAttribute('data-cd-px')) || 0,
      speedX: parseFloat(el.getAttribute('data-cd-px-x')) || 0,
      cy: 0, cx: 0
    }));

    let tpx = 0, tpy = 0, ppx = 0, ppy = 0;
    if (!reduce) root.addEventListener('pointermove', (e) => {
      tpx = (e.clientX / window.innerWidth - 0.5);
      tpy = (e.clientY / window.innerHeight - 0.5);
    });

    const loop = () => {
      const vh = window.innerHeight;
      ppx += (tpx - ppx) * 0.06; ppy += (tpy - ppy) * 0.06;
      if (header) {
        const hr = header.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, -hr.top) / vh);
        if (wrap) {
          wrap.style.transform = 'translate3d(' + (ppx * 24).toFixed(2) + 'px,' + (p * 120 + ppy * 18).toFixed(2) + 'px,0) scale(' + (1 - p * 0.12).toFixed(4) + ')';
          wrap.style.opacity = String(Math.max(0, 1 - p * 1.15));
        }
        if (herocopy) {
          herocopy.style.transform = 'translate3d(' + (ppx * -10).toFixed(2) + 'px,' + (p * 70).toFixed(2) + 'px,0)';
          herocopy.style.opacity = String(Math.max(0, 1 - p * 1.4));
        }
      }
      for (let i = 0; i < pxEls.length; i++) {
        const it = pxEls[i];
        const r = it.sec.getBoundingClientRect();
        const off = (r.top + r.height / 2) - vh / 2;
        const ty = off * it.speed + ppy * 40 * (it.speed * 5);
        const tx = off * it.speedX + ppx * 40 * (it.speed * 5);
        it.cy += (ty - it.cy) * (reduce ? 1 : 0.12);
        it.cx += (tx - it.cx) * (reduce ? 1 : 0.12);
        it.el.style.transform = 'translate3d(' + it.cx.toFixed(2) + 'px,' + it.cy.toFixed(2) + 'px,0)';
      }
      requestAnimationFrame(loop);
    };

    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset || (document.scrollingElement || {}).scrollTop || 0;
      if (nav) nav.classList.toggle('is-scrolled', y > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    onScroll();
    loop();
  }

  /* ---------- scroll reveal ---------- */
  initReveal() {
    const root = this.root, reduce = this.reduce;
    const reveals = root.querySelectorAll('[data-cd-reveal]');
    const showEl = (el) => {
      el.classList.add('is-visible');
      if (el.hasAttribute && el.hasAttribute('data-cd-count')) animateCount(el);
      if (el.querySelectorAll) el.querySelectorAll('[data-cd-count]').forEach(c => animateCount(c));
    };
    if ('IntersectionObserver' in window && !reduce) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            const par = en.target.parentElement;
            const sibs = par ? Array.from(par.querySelectorAll(':scope > [data-cd-reveal]')) : [en.target];
            const delay = Math.max(0, sibs.indexOf(en.target)) * 60;
            setTimeout(() => showEl(en.target), delay);
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
      reveals.forEach(el => io.observe(el));
      setTimeout(() => reveals.forEach(showEl), 2600);
    } else {
      reveals.forEach(showEl);
    }
  }

  /* ---------- 3D tilt + glare ---------- */
  initTilt() {
    const root = this.root;
    if (this.reduce) return;
    const wireTilt = () => {
      root.querySelectorAll('[data-cd-tilt]').forEach(card => {
        if (card.__tilt) return; card.__tilt = true;
        const glare = card.querySelector('[data-cd-glare]');
        const accent = card.getAttribute('data-cd-accent');
        card.style.transition = 'transform .25s cubic-bezier(.16,1,.3,1), box-shadow .25s ease';
        card.addEventListener('pointermove', (ev) => {
          const r = card.getBoundingClientRect();
          const px = (ev.clientX - r.left) / r.width, py = (ev.clientY - r.top) / r.height;
          const rxx = (0.5 - py) * 10, ryy = (px - 0.5) * 12;
          card.style.transition = 'transform .05s linear, box-shadow .25s ease';
          card.style.transform = 'translateY(-6px) perspective(900px) rotateX(' + rxx.toFixed(2) + 'deg) rotateY(' + ryy.toFixed(2) + 'deg)';
          if (accent) card.style.boxShadow = '0 30px 60px -28px ' + accent + '66, 0 0 0 1px ' + accent + '44 inset';
          if (glare) { glare.style.opacity = '1'; glare.style.background = 'radial-gradient(240px 240px at ' + (px * 100) + '% ' + (py * 100) + '%, rgba(255,255,255,.16), transparent 60%)'; }
        });
        card.addEventListener('pointerleave', () => {
          card.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1), box-shadow .4s ease';
          card.style.transform = 'translateY(0) perspective(900px) rotateX(0) rotateY(0)';
          card.style.boxShadow = '';
          if (glare) glare.style.opacity = '0';
        });
      });
    };
    wireTilt();
    setTimeout(wireTilt, 400);
    setTimeout(wireTilt, 1200);
  }
}
