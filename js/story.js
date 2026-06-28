// Story Mode — cinematic, auto-playing walkthrough of the chapters
// rendered over a rotating 3D constellation.

import { esc, hexToRgb } from './util.js';

export class StoryMode {
  constructor(content) {
    this.CH = content.chapters;
    this.ACCENTS = content.accents;
    this._st = null;
  }

  storyIcon(play) {
    return play
      ? '<svg width="16" height="16" viewBox="0 0 12 14" fill="#100d0a"><path d="M0 0l12 7-12 7z"/></svg>'
      : '<svg width="15" height="15" viewBox="0 0 12 14" fill="#100d0a"><rect x="0" y="0" width="4" height="14" rx="1"/><rect x="8" y="0" width="4" height="14" rx="1"/></svg>';
  }

  storySphere() {
    const N = 320, pts = [], stars = [];
    for (let k = 0; k < N; k++) {
      const y = 1 - (k / (N - 1)) * 2, rad = Math.sqrt(Math.max(0, 1 - y * y)), phi = k * 2.399963229;
      pts.push({ x: Math.cos(phi) * rad, y, z: Math.sin(phi) * rad, big: false });
    }
    for (let c = 0; c < this.CH.length; c++) {
      const k = Math.floor((c + 0.5) / this.CH.length * N);
      pts[k].big = true; pts[k].ci = c; stars[c] = pts[k];
    }
    return { pts, stars };
  }

  ensureStory() {
    if (this._st && document.body.contains(this._st)) return this._st;
    const o = document.createElement('div');
    o.id = 'cd-story-ov';
    o.innerHTML =
      '<canvas class="story-canvas" id="cd-st-canvas"></canvas>' +
      '<div class="story-vig" data-st-vig></div>' +
      '<div class="story-vignette2"></div>' +
      '<div class="story-top">' +
        '<div class="story-badge"><span class="story-badge-dot"></span> Story Mode</div>' +
        '<button class="story-exit" data-st-exit>Exit <span class="story-exit-key">esc</span></button>' +
      '</div>' +
      '<div class="story-panel" id="cd-st-panel">' +
        '<div class="story-ch" data-st-ch></div>' +
        '<h1 class="story-title" data-st-title></h1>' +
        '<div class="story-co" data-st-co></div>' +
        '<p class="story-tag" data-st-tag></p>' +
        '<div class="story-metric-row"><div class="story-metric" data-st-metric></div><div class="story-metric-label" data-st-metriclabel></div></div>' +
      '</div>' +
      '<div class="story-controls">' +
        '<div class="story-dots" data-st-dots></div>' +
        '<div class="story-btns">' +
          '<button class="story-nav-btn" data-st-prev title="Previous">‹</button>' +
          '<button class="story-pp" data-st-pp title="Play/Pause"></button>' +
          '<button class="story-nav-btn" data-st-next title="Next">›</button>' +
        '</div>' +
        '<div class="story-progress-track"><div class="story-progress-bar" data-st-prog></div></div>' +
      '</div>';
    document.body.appendChild(o);
    this._st = o;
    return o;
  }

  open(i) {
    const o = this.ensureStory();
    const sph = this.storySphere();
    this._stPts = sph.pts; this._stStars = sph.stars;
    this._stIdx = i || 0;
    this._stPlaying = true;
    this._stRy = 0; this._stRx = 0;
    o.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
    if (document.body) document.body.style.overflow = 'hidden';

    const dots = o.querySelector('[data-st-dots]');
    dots.innerHTML = this.CH.map((c, k) => `<button class="story-dot" data-st-dot="${k}"></button>`).join('');
    const self = this;
    dots.querySelectorAll('[data-st-dot]').forEach(d => d.addEventListener('click', () => self.setScene(parseInt(d.getAttribute('data-st-dot'), 10), true)));
    o.querySelector('[data-st-exit]').onclick = () => self.close();
    o.querySelector('[data-st-prev]').onclick = () => self.setScene((self._stIdx - 1 + self.CH.length) % self.CH.length, true);
    o.querySelector('[data-st-next]').onclick = () => self.setScene((self._stIdx + 1) % self.CH.length, true);
    o.querySelector('[data-st-pp]').onclick = () => self.toggle();

    this._stKey = (ev) => {
      if (!self._stOn) return;
      if (ev.key === 'Escape') self.close();
      else if (ev.key === 'ArrowRight') self.setScene((self._stIdx + 1) % self.CH.length, true);
      else if (ev.key === 'ArrowLeft') self.setScene((self._stIdx - 1 + self.CH.length) % self.CH.length, true);
      else if (ev.key === ' ') { ev.preventDefault(); self.toggle(); }
    };
    window.addEventListener('keydown', this._stKey);

    this._stOn = true;
    this.startCanvas();
    this.setScene(this._stIdx, true);
  }

  toggle() {
    this._stPlaying = !this._stPlaying;
    const pp = this._st && this._st.querySelector('[data-st-pp]');
    if (pp) pp.innerHTML = this.storyIcon(this._stPlaying ? false : true);
    if (this._stPlaying) this.armTimer();
    else { clearTimeout(this._stTimer); const pr = this._st.querySelector('[data-st-prog]'); if (pr) pr.style.transition = 'none'; }
  }

  armTimer() {
    clearTimeout(this._stTimer);
    const dur = 6000;
    const pr = this._st && this._st.querySelector('[data-st-prog]');
    if (pr) { pr.style.transition = 'none'; pr.style.width = '0%'; void pr.offsetWidth; pr.style.transition = 'width ' + dur + 'ms linear'; pr.style.width = '100%'; }
    const self = this;
    this._stTimer = setTimeout(() => { if (self._stPlaying && self._stOn) self.setScene((self._stIdx + 1) % self.CH.length, false); }, dur);
  }

  setScene(i) {
    if (!this._st) return;
    this._stIdx = i;
    const ch = this.CH[i], a = this.ACCENTS[i], o = this._st, e = esc;
    o.querySelector('[data-st-ch]').textContent = 'Chapter ' + String(i + 1).padStart(2, '0') + ' / ' + String(this.CH.length).padStart(2, '0');
    o.querySelector('[data-st-ch]').style.color = a;
    o.querySelector('[data-st-title]').textContent = ch.title;
    const favImg = ch.companyUrl ? `<img class="story-co-fav" src="${e('https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=64&url=' + encodeURIComponent(ch.companyUrl))}" alt="" onerror="this.style.display='none'">` : '';
    o.querySelector('[data-st-co]').innerHTML = favImg + `<span style="font-weight:600">${e(ch.company)}</span><span style="opacity:.55">${e(ch.role)}</span>`;
    const tg = o.querySelector('[data-st-tag]'); tg.textContent = '“' + ch.tagline + '”'; tg.style.color = a;
    const mv = o.querySelector('[data-st-metric]'); mv.textContent = ch.highlight.metric; mv.style.color = a;
    o.querySelector('[data-st-metriclabel]').textContent = ch.highlight.label;
    o.querySelector('[data-st-vig]').style.background = 'radial-gradient(80% 80% at 70% 50%,' + a + '26,transparent 70%)';
    o.querySelectorAll('[data-st-dot]').forEach((d, k) => { d.style.background = k === i ? a : 'rgba(242,236,225,.25)'; d.style.transform = k === i ? 'scale(1.5)' : 'scale(1)'; });
    const ppBtn = o.querySelector('[data-st-pp]'); if (ppBtn) { ppBtn.innerHTML = this.storyIcon(this._stPlaying ? false : true); ppBtn.style.background = a; }
    const panel = o.querySelector('#cd-st-panel');
    if (panel && panel.animate) panel.animate([{ opacity: 0, transform: 'translateY(-50%) translateX(-22px)' }, { opacity: 1, transform: 'translateY(-50%) translateX(0)' }], { duration: 650, easing: 'cubic-bezier(.16,1,.3,1)' });
    const P = this._stStars[i];
    if (P) { this._stRyT = Math.atan2(-P.x, P.z); const r = Math.hypot(P.x, P.z); this._stRxT = Math.atan2(P.y, r); }
    if (this._stPlaying) this.armTimer();
  }

  startCanvas() {
    const o = this._st, cvs = o.querySelector('#cd-st-canvas');
    if (!cvs || !cvs.getContext) return;
    const ctx = cvs.getContext('2d');
    const accentRgb = this.ACCENTS.map(hexToRgb);
    let W = 0, H = 0, DPR = 1;
    const resize = () => { DPR = Math.min(window.devicePixelRatio || 1, 2); const r = o.getBoundingClientRect(); W = r.width; H = r.height; cvs.width = Math.round(W * DPR); cvs.height = Math.round(H * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); };
    resize();
    this._stResize = resize;
    window.addEventListener('resize', resize);
    const self = this;
    const draw = () => {
      if (!self._stOn) return;
      self._stRy += ((self._stRyT || 0) - self._stRy) * 0.06;
      self._stRx += ((self._stRxT || 0) - self._stRx) * 0.06;
      ctx.clearRect(0, 0, W, H);
      const wide = W > 820;
      const cx = wide ? W * 0.72 : W * 0.5, cy = wide ? H * 0.5 : H * 0.34, R = Math.min(W, H) * (wide ? 0.34 : 0.3);
      const cosY = Math.cos(self._stRy), sinY = Math.sin(self._stRy), cosX = Math.cos(self._stRx), sinX = Math.sin(self._stRx), fov = 2.6;
      const proj = [];
      for (let k = 0; k < self._stPts.length; k++) {
        const p = self._stPts[k];
        let x = p.x * cosY + p.z * sinY, z = -p.x * sinY + p.z * cosY, y = p.y * cosX - z * sinX; z = p.y * sinX + z * cosX;
        const persp = fov / (fov - z);
        proj.push({ sx: cx + x * R * persp, sy: cy + y * R * persp, z, persp, big: p.big, ci: p.ci });
      }
      const act = proj.find(p => p.big && p.ci === self._stIdx);
      if (act) for (let k = 0; k < proj.length; k++) {
        if (proj[k].big && proj[k] !== act) {
          const d = Math.hypot(proj[k].sx - act.sx, proj[k].sy - act.sy);
          if (d < R * 1.4) { ctx.strokeStyle = 'rgba(233,184,115,' + (0.12 * (1 - d / (R * 1.4))).toFixed(3) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(act.sx, act.sy); ctx.lineTo(proj[k].sx, proj[k].sy); ctx.stroke(); }
        }
      }
      proj.sort((a, b) => a.z - b.z);
      for (let k = 0; k < proj.length; k++) {
        const p = proj[k], dep = (p.z + 1) / 2;
        if (p.big) {
          const isAct = p.ci === self._stIdx, col = accentRgb[p.ci], rr = (isAct ? 5.5 : 3) * p.persp;
          const g = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, rr * (isAct ? 9 : 5));
          g.addColorStop(0, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + ((isAct ? 0.85 : 0.4) + dep * 0.3).toFixed(3) + ')');
          g.addColorStop(0.4, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + ((isAct ? 0.3 : 0.12) * dep).toFixed(3) + ')');
          g.addColorStop(1, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.sx, p.sy, rr * (isAct ? 9 : 5), 0, 6.2832); ctx.fill();
          ctx.fillStyle = 'rgba(250,242,228,' + (isAct ? 0.98 : 0.55 + dep * 0.3).toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(p.sx, p.sy, rr, 0, 6.2832); ctx.fill();
          if (isAct) { ctx.strokeStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',.9)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(p.sx, p.sy, rr + 9 + Math.sin(performance.now() / 360) * 2.5, 0, 6.2832); ctx.stroke(); }
        } else {
          ctx.fillStyle = 'rgba(242,236,225,' + (0.08 + dep * 0.4).toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(p.sx, p.sy, 1.1 * p.persp, 0, 6.2832); ctx.fill();
        }
      }
      self._stRaf = requestAnimationFrame(draw);
    };
    draw();
  }

  close() {
    const o = this._st;
    if (!o) return;
    this._stOn = false;
    this._stPlaying = false;
    clearTimeout(this._stTimer);
    if (this._stRaf) cancelAnimationFrame(this._stRaf);
    if (this._stResize) window.removeEventListener('resize', this._stResize);
    if (this._stKey) window.removeEventListener('keydown', this._stKey);
    o.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    if (document.body) document.body.style.overflow = '';
  }
}
