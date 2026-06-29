// Quest Slider — a cinematic coverflow for the side-projects. One quest sits
// centred and in focus while its neighbours peel away symmetrically on either
// side. Drag / arrows / dots / keyboard, plus an auto-advancing play mode.

const SPACING = 52;   // % of slide width each neighbour steps aside
const ANGLE = 27;     // deg of rotateY per step
const AUTO_MS = 5000; // dwell per slide while playing

export class QuestSlider {
  constructor() {
    this.i = 0;
    this.playing = true;
    this._inView = false;
    this._hover = false;
    this._timer = 0;
  }

  init() {
    this.root = document.querySelector('[data-qslider]');
    if (!this.root) return;
    this.slides = [...this.root.querySelectorAll('.qslide')];
    this.dots = [...this.root.querySelectorAll('[data-qdot]')];
    this.prog = this.root.querySelector('[data-qprog]');
    this.pp = this.root.querySelector('[data-qpp]');
    this.n = this.slides.length;
    if (!this.n) return;

    const self = this;
    this.root.querySelector('[data-qprev]').addEventListener('click', () => self.go(self.i - 1));
    this.root.querySelector('[data-qnext]').addEventListener('click', () => self.go(self.i + 1));
    this.dots.forEach((d, k) => d.addEventListener('click', () => self.go(k)));
    if (this.pp) this.pp.addEventListener('click', () => self.toggle());

    // Click a side slide to bring it to the front.
    this.slides.forEach((s, k) => s.addEventListener('click', (ev) => {
      if (k !== self.i && !ev.target.closest('a')) { ev.preventDefault(); self.go(k); }
    }));

    // Pause auto-play while the pointer rests on the deck.
    this.root.addEventListener('pointerenter', () => { self._hover = true; self.arm(); });
    this.root.addEventListener('pointerleave', () => { self._hover = false; self.arm(); });

    this._wireDrag();
    this._wireKeys();
    this._wireVisibility();

    this.setPlaying(true, true);
    this.layout();
  }

  go(n) {
    this.i = ((n % this.n) + this.n) % this.n;
    this.layout();
    this.arm();           // every move (manual or auto) re-arms the timer
  }

  layout() {
    const half = this.n / 2;
    this.slides.forEach((s, k) => {
      let o = k - this.i;
      if (o > half) o -= this.n;
      if (o < -half) o += this.n;     // wrap to the shorter way round
      const abs = Math.abs(o);
      const vis = abs <= 2;
      s.style.transform =
        `translate(calc(-50% + ${o * SPACING}%), -50%) translateZ(${-abs * 150}px) rotateY(${-o * ANGLE}deg) scale(${o === 0 ? 1 : 0.86})`;
      s.style.opacity = vis ? (o === 0 ? '1' : '0.4') : '0';
      s.style.zIndex = String(30 - abs);
      s.style.pointerEvents = vis ? 'auto' : 'none';
      s.style.filter = o === 0 ? 'none' : `blur(${Math.min(abs * 1.4, 3)}px) saturate(.7)`;
      s.classList.toggle('is-active', o === 0);
    });
    this.dots.forEach((d, k) => d.classList.toggle('is-active', k === this.i));
    const accent = this.slides[this.i].style.getPropertyValue('--qa');
    if (accent) this.root.style.setProperty('--qaa', accent.trim());
  }

  toggle() { this.setPlaying(!this.playing); }

  setPlaying(v, silent) {
    this.playing = v;
    if (this.pp) {
      this.pp.classList.toggle('is-playing', v);
      this.pp.innerHTML = v
        ? '<svg width="13" height="14" viewBox="0 0 12 14" fill="currentColor"><rect x="0" width="4" height="14" rx="1"/><rect x="8" width="4" height="14" rx="1"/></svg>'
        : '<svg width="13" height="14" viewBox="0 0 12 14" fill="currentColor"><path d="M0 0l12 7-12 7z"/></svg>';
    }
    if (!silent) this.arm();
  }

  // Single source of truth for the auto-advance timer + progress bar.
  arm() {
    clearTimeout(this._timer);
    const live = this.playing && this._inView && !this._hover;
    if (!this.prog) { /* no bar */ }
    else if (live) {
      this.prog.style.transition = 'none';
      this.prog.style.width = '0%';
      void this.prog.offsetWidth;
      this.prog.style.transition = `width ${AUTO_MS}ms linear`;
      this.prog.style.width = '100%';
    } else {
      this.prog.style.transition = 'width .3s ease';
      this.prog.style.width = '0%';
    }
    if (live) this._timer = setTimeout(() => this.go(this.i + 1), AUTO_MS);
  }

  _wireDrag() {
    const vp = this.root.querySelector('[data-qviewport]');
    let x0 = 0, active = false;
    vp.addEventListener('pointerdown', (e) => { active = true; x0 = e.clientX; clearTimeout(this._timer); vp.classList.add('is-grabbing'); });
    window.addEventListener('pointerup', (e) => {
      if (!active) return;
      active = false; vp.classList.remove('is-grabbing');
      const dx = e.clientX - x0;
      if (Math.abs(dx) > 45) this.go(this.i + (dx < 0 ? 1 : -1));
      else this.arm();
    });
  }

  _wireKeys() {
    window.addEventListener('keydown', (e) => {
      if (!this._inView || e.target.matches('input, textarea')) return;
      if (e.key === 'ArrowRight') this.go(this.i + 1);
      else if (e.key === 'ArrowLeft') this.go(this.i - 1);
    });
  }

  // Only auto-play / accept arrow keys while the section is on screen.
  _wireVisibility() {
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => { this._inView = en.isIntersecting; this.arm(); });
    }, { threshold: 0.3 });
    io.observe(this.root);
  }
}
