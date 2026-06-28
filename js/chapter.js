// Chapter Detail — full-screen case-file overlay for a single chapter.

import { esc, animateCount } from './util.js';

export class ChapterDetail {
  constructor(content) {
    this.CH = content.chapters;
    this.ACCENTS = content.accents;
    this._overlay = null;
    this._open = false;
    window.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && this._open) this.close(); });
  }

  fav(url, size) {
    return url ? 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=' + (size || 64) + '&url=' + encodeURIComponent(url) : '';
  }

  ensureOverlay() {
    if (this._overlay && document.body.contains(this._overlay)) return this._overlay;
    const o = document.createElement('div');
    o.id = 'cd-detail-ov';
    document.body.appendChild(o);
    this._overlay = o;
    return o;
  }

  open(i) {
    const o = this.ensureOverlay();
    o.style.setProperty('--accent', this.ACCENTS[i]);
    o.innerHTML = this.buildDetail(i);
    o.scrollTop = 0;
    o.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
    if (document.body) document.body.style.overflow = 'hidden';
    this._open = true;
    this.wire(o, i);
  }

  close() {
    const o = this._overlay;
    if (!o) return;
    o.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    if (document.body) document.body.style.overflow = '';
    this._open = false;
    setTimeout(() => { o.innerHTML = ''; }, 460);
  }

  buildDetail(i) {
    const ch = this.CH[i], n = String(i + 1).padStart(2, '0'), total = this.CH.length;
    const e = esc;

    const favImg = ch.companyUrl
      ? `<img class="detail-company-fav" src="${e(this.fav(ch.companyUrl, 64))}" alt="" onerror="this.style.display='none'">`
      : '';
    const company =
      `<a class="detail-company" href="${e(ch.companyUrl || '#')}" target="_blank" rel="noopener">${favImg}<span>${e(ch.company)}</span></a>` +
      `<span class="detail-role"> · ${e(ch.role)}</span>`;

    const journey = ch.journey.map((s, j) => {
      const last = j === ch.journey.length - 1;
      return `<div class="detail-step${last ? ' detail-step-last' : ''}" data-d-reveal>
        <div class="detail-step-num">${j + 1}</div>
        ${last ? '' : '<div class="detail-step-line"></div>'}
        <h5 class="detail-step-title">${e(s.title)}</h5>
        <p class="detail-step-text">${e(s.text)}</p>
        ${s.quote ? `<p class="detail-step-quote">&ldquo;${e(s.quote)}&rdquo;</p>` : ''}
      </div>`;
    }).join('');

    const impact = ch.impact.map((m) => `
      <div class="detail-impact" data-d-reveal>
        <div class="detail-impact-value" data-d-count="${e(m.value)}">${e(m.value)}</div>
        <div class="detail-impact-label">${e(m.label)}</div>
      </div>`).join('');

    const tech = ch.tech.map((t) => `<span class="detail-tech-chip">${e(t)}</span>`).join('');

    const pub = ch.publication ? `
      <a class="detail-pub" data-d-reveal href="${e(ch.publication.url)}" target="_blank" rel="noopener">
        <div class="detail-pub-kicker">📄 Published Work</div>
        <h4 class="detail-pub-title">${e(ch.publication.title)}</h4>
        <div class="detail-pub-meta"><span>${e(ch.publication.publisher)}</span><span class="sep">·</span><span>${e(ch.publication.date)}</span></div>
        <p class="detail-pub-series">${e(ch.publication.series)}</p>
        <span class="detail-pub-cta">Read Publication →</span>
      </a>` : '';

    const prevBtn = i > 0
      ? `<button class="detail-nav-btn detail-nav-prev" data-d-nav="${i - 1}"><div class="detail-nav-dir">← Previous</div><div class="detail-nav-co">${e(this.CH[i - 1].company)}</div></button>`
      : '<div class="detail-nav-empty"></div>';
    const nextBtn = i < total - 1
      ? `<button class="detail-nav-btn detail-nav-next" data-d-nav="${i + 1}"><div class="detail-nav-dir">Next →</div><div class="detail-nav-co">${e(this.CH[i + 1].company)}</div></button>`
      : '<div class="detail-nav-empty"></div>';

    return `
      <div class="detail-progress-track"><div class="detail-progress-bar" data-d-progress></div></div>
      <div class="detail-topbar">
        <button class="detail-back" data-d-close><span class="detail-back-arrow">←</span> Back to Journey</button>
        <div class="detail-counter">${n} <span class="sep">/</span> ${String(total).padStart(2, '0')}</div>
      </div>
      <div class="detail-body">
        <div class="detail-hero">
          <div class="detail-hero-num">${n}</div>
          <div data-d-reveal>
            <div class="detail-label"><span class="detail-label-dot"></span>${e(ch.label)}</div>
            <h1 class="detail-title">${e(ch.title)}</h1>
            <div class="detail-company-wrap">${company}</div>
            <div class="detail-period">${e(ch.period)}</div>
            <p class="detail-tagline">&ldquo;${e(ch.tagline)}&rdquo;</p>
          </div>
        </div>
        <div class="detail-highlight" data-d-reveal>
          <div>
            <div class="detail-highlight-metric">${e(ch.highlight.metric)}</div>
            <div class="detail-highlight-label">${e(ch.highlight.label)}</div>
          </div>
          <p class="detail-highlight-punch">${e(ch.highlight.punch)}</p>
        </div>
        <div class="detail-block" data-d-reveal>
          <div class="detail-kicker">The Setting</div>
          <p class="detail-setting-text">${e(ch.story.setting)}</p>
        </div>
        <div class="detail-quest" data-d-reveal>
          <div class="detail-kicker">The Quest</div>
          <p class="detail-quest-text">${e(ch.story.quest)}</p>
        </div>
        <div class="detail-stage" data-d-reveal><div class="detail-h2">The Journey</div></div>
        ${journey}
        <div class="detail-stage detail-stage-impact" data-d-reveal><div class="detail-h2">The Impact</div></div>
        <div class="detail-impact-grid">${impact}</div>
        <div class="detail-tech" data-d-reveal>${tech}</div>
        ${pub}
        <div class="detail-nav">${prevBtn}${nextBtn}</div>
      </div>`;
  }

  wire(o) {
    const close = o.querySelector('[data-d-close]');
    if (close) close.addEventListener('click', () => this.close());
    o.querySelectorAll('[data-d-nav]').forEach(b =>
      b.addEventListener('click', () => this.open(parseInt(b.getAttribute('data-d-nav'), 10))));

    const prog = o.querySelector('[data-d-progress]');
    o.onscroll = () => {
      if (prog) {
        const h = o.scrollHeight - o.clientHeight;
        prog.style.width = (h > 0 ? Math.min(100, (o.scrollTop / h) * 100) : 0) + '%';
      }
    };

    const reveals = o.querySelectorAll('[data-d-reveal]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.style.opacity = '1';
          en.target.style.transform = 'none';
          if (en.target.hasAttribute('data-d-count')) animateCount(en.target);
          const c = en.target.querySelector ? en.target.querySelector('[data-d-count]') : null;
          if (c) animateCount(c);
          io.unobserve(en.target);
        }
      });
    }, { root: o, threshold: 0.15 });
    reveals.forEach(el => io.observe(el));
    setTimeout(() => reveals.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; }), 2200);
  }
}
