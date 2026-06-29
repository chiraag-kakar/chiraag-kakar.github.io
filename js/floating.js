// Floating images — a slow-drifting moodboard of project & company tiles in
// the hero, with subtle pointer parallax. Decorative; skipped on small screens
// and when the visitor prefers reduced motion.

import { companyTile } from './util.js';

export class Floating {
  constructor(content) {
    this.content = content;
    this._cards = [];
  }

  init() {
    const layer = document.getElementById('cd-float');
    if (!layer) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(max-width: 820px)').matches) return;

    const items = this._items();
    // Periphery slots (left/right/corners) — kept clear of the centred copy.
    const slots = [
      { x: 6,  y: 24, s: 66, d: 0.9 },
      { x: 11, y: 64, s: 52, d: 0.5 },
      { x: 18, y: 86, s: 44, d: 1.3 },
      { x: 29, y: 13, s: 40, d: 1.5 },
      { x: 71, y: 11, s: 44, d: 1.4 },
      { x: 88, y: 20, s: 58, d: 1.0 },
      { x: 93, y: 56, s: 70, d: 0.6 },
      { x: 83, y: 82, s: 48, d: 1.2 },
    ];

    layer.innerHTML = slots.map((p, i) => {
      const it = items[i % items.length];
      const inner = it.img
        ? `<img src="${it.img}" alt="" draggable="false">`
        : `<span class="float-glyph">${it.glyph}</span>`;
      return `<div class="float-card" data-depth="${p.d}"
          style="left:${p.x}%;top:${p.y}%;--s:${p.s}px;--delay:${(i * 0.7).toFixed(2)}s;--dur:${(9 + (i % 4) * 1.6).toFixed(1)}s;${it.accent ? `--fc:${it.accent}` : ''}">
          <div class="float-card-in">${inner}</div>
        </div>`;
    }).join('');

    this._cards = [...layer.querySelectorAll('.float-card')];
    this._wireParallax(layer);
  }

  _items() {
    const projects = (this.content.projects || []).map(p => ({ glyph: p.icon }));
    const chapters = (this.content.chapters || []);
    const accents = this.content.accents || [];
    const tiles = chapters.slice(0, 4).map((c, i) => ({
      img: companyTile(c.company, accents[i] || '#e9b873'),
      accent: accents[i] || '#e9b873',
    }));
    // Interleave emoji icons with company letter-tiles for variety.
    const out = [];
    const max = Math.max(projects.length, tiles.length);
    for (let i = 0; i < max; i++) {
      if (tiles[i]) out.push(tiles[i]);
      if (projects[i]) out.push(projects[i]);
    }
    return out;
  }

  _wireParallax(layer) {
    const hero = layer.closest('.hero') || layer.parentElement;
    let raf = 0, tx = 0, ty = 0;
    const apply = () => {
      raf = 0;
      for (const c of this._cards) {
        const d = parseFloat(c.getAttribute('data-depth')) || 1;
        c.style.transform = `translate3d(${(tx * d * 26).toFixed(1)}px, ${(ty * d * 22).toFixed(1)}px, 0)`;
      }
    };
    const onMove = (e) => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(apply); });
  }
}
