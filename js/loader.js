// Preloader — drives the progress counter while content loads, then reveals
// the site. Markup lives in index.html so it paints before any module runs.

export class Loader {
  constructor() {
    this.el = document.getElementById('cd-loader');
    this.fill = this.el && this.el.querySelector('[data-loader-fill]');
    this.pct = this.el && this.el.querySelector('[data-loader-pct]');
    this._val = 0;
    this._done = false;
    this._t0 = performance.now();
    document.documentElement.classList.add('cd-loading');
    if (this.el) this._tick();
  }

  // Ease toward 90% while we wait — the final 10% lands when finish() is called.
  _tick() {
    if (this._done) return;
    this._val = Math.min(90, this._val + (90 - this._val) * 0.05 + 0.4);
    this._render(this._val);
    this._raf = requestAnimationFrame(() => this._tick());
  }

  _render(v) {
    if (this.fill) this.fill.style.width = v.toFixed(1) + '%';
    if (this.pct) this.pct.textContent = String(Math.round(v)).padStart(2, '0');
  }

  // Call once the app is ready. Keeps a minimum on-screen time so the
  // animation is actually seen, then runs the counter to 100 and reveals.
  finish() {
    if (this._done) return;
    const wait = Math.max(0, 1500 - (performance.now() - this._t0));
    setTimeout(() => this._complete(), wait);
  }

  _complete() {
    if (this._done) return;
    this._done = true;
    cancelAnimationFrame(this._raf);
    const from = this._val, t0 = performance.now();
    const run = (t) => {
      const p = Math.min(1, (t - t0) / 420);
      this._render(from + (100 - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) { requestAnimationFrame(run); return; }
      document.documentElement.classList.remove('cd-loading');
      document.body.classList.add('is-loaded');
      if (this.el) {
        this.el.classList.add('is-done');
        const el = this.el;
        setTimeout(() => { if (el && el.parentNode) el.parentNode.removeChild(el); }, 1000);
      }
    };
    requestAnimationFrame(run);
  }
}
