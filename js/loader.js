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

  // Ease toward 88% while we wait — the final stretch lands when finish() runs.
  _tick() {
    if (this._done) return;
    this._val = Math.min(88, this._val + (88 - this._val) * 0.028 + 0.18);
    this._render(this._val);
    this._raf = requestAnimationFrame(() => this._tick());
  }

  _render(v) {
    if (this.fill) this.fill.style.width = v.toFixed(1) + '%';
    if (this.pct) this.pct.textContent = String(Math.round(v)).padStart(2, '0');
  }

  // Call once the app is ready. Keeps a minimum on-screen time so the
  // animation is actually seen, then runs the counter to 100 and reveals.
  // onReveal fires the instant the curtain lifts (used to start the music).
  finish(onReveal) {
    this._onReveal = onReveal;
    if (this._done) return;
    const wait = Math.max(0, 2600 - (performance.now() - this._t0));
    setTimeout(() => this._complete(), wait);
  }

  _complete() {
    if (this._done) return;
    this._done = true;
    cancelAnimationFrame(this._raf);
    const from = this._val, t0 = performance.now();
    const run = (t) => {
      const p = Math.min(1, (t - t0) / 620);
      this._render(from + (100 - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) { requestAnimationFrame(run); return; }
      document.documentElement.classList.remove('cd-loading');
      document.body.classList.add('is-loaded');
      if (this._onReveal) { try { this._onReveal(); } catch (_) {} }
      if (this.el) {
        this.el.classList.add('is-done');
        const el = this.el;
        setTimeout(() => { if (el && el.parentNode) el.parentNode.removeChild(el); }, 1100);
      }
    };
    requestAnimationFrame(run);
  }
}
