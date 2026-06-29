// Main application entry — loads content, renders, and wires interactions.

import { Renderer } from './renderer.js';
import { ScrollManager } from './scroll-manager.js';
import { ChapterDetail } from './chapter.js';
import { StoryMode } from './story.js';
import { AudioManager } from './audio.js';

class App {
  async init() {
    const res = await fetch('./content.json');
    this.content = await res.json();

    // Render data-driven lists from content.json
    new Renderer(this.content).render();

    // Background audio (cozy ambient hum + story-mode track) with mute toggle
    this.audio = new AudioManager();

    // Feature modules
    this.detail = new ChapterDetail(this.content);
    this.story = new StoryMode(this.content, this.audio);

    // Scroll-driven visuals (after render so cards exist)
    new ScrollManager(this.content.accents, this.content.chapters.length).init();

    this.wireChapters();
    this.wireStory();
    this.wireDropdown();
    this.wireMobileNav();
    this.wireContact();
  }

  // Hamburger menu for ≤880px — toggles the nav-links drop panel.
  wireMobileNav() {
    const nav = document.getElementById('cd-nav');
    const toggle = nav && nav.querySelector('[data-cd-navtoggle]');
    if (!nav || !toggle) return;
    const set = (v) => { nav.classList.toggle('is-open', v); toggle.setAttribute('aria-expanded', String(v)); };
    toggle.addEventListener('click', (ev) => { ev.stopPropagation(); set(!nav.classList.contains('is-open')); });
    // Close after navigating to a section or opening a chapter
    nav.querySelectorAll('.nav-links a, .nav-links .nav-drop-item').forEach(el =>
      el.addEventListener('click', () => set(false)));
    // Close on outside tap
    document.addEventListener('click', (ev) => { if (!nav.contains(ev.target)) set(false); });
  }

  // Open chapter detail from any element carrying data-cd-chapter (cards + dropdown)
  wireChapters() {
    document.addEventListener('click', (ev) => {
      const el = ev.target.closest('[data-cd-chapter]');
      if (!el) return;
      this.detail.open(parseInt(el.getAttribute('data-cd-chapter'), 10));
    });
  }

  wireStory() {
    const btn = document.querySelector('[data-cd-story]');
    if (btn) btn.addEventListener('click', () => this.story.open(0));
  }

  wireDropdown() {
    const jdrop = document.getElementById('cd-jdrop');
    if (!jdrop) return;
    const menu = jdrop.querySelector('[data-cd-jmenu]');
    const trig = jdrop.querySelector('[data-cd-jtrigger]');
    let open = false;
    const set = (v) => {
      open = v;
      menu.classList.toggle('is-open', v);
      if (trig) trig.setAttribute('aria-expanded', String(v));
    };
    if (trig) trig.addEventListener('click', (ev) => { ev.stopPropagation(); set(!open); });
    document.addEventListener('click', (ev) => { if (open && !jdrop.contains(ev.target)) set(false); });
    if (menu) menu.querySelectorAll('button, a').forEach(b => b.addEventListener('click', () => set(false)));
  }

  wireContact() {
    const root = document.getElementById('cd-root');
    const hidden = root.querySelector('[data-cd-type-input]');
    root.querySelectorAll('[data-cd-type]').forEach(btn => {
      btn.addEventListener('click', () => {
        root.querySelectorAll('[data-cd-type]').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        if (hidden) hidden.value = btn.getAttribute('data-cd-type');
      });
    });

    const form = root.querySelector('[data-cd-form]');
    if (form) form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const btn = form.querySelector('[data-cd-submit]');
      const done = () => { if (btn) { btn.textContent = 'Thank you, I’ll be in touch ✓'; btn.classList.add('is-sent'); btn.disabled = true; } };
      try {
        await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      } catch (_) { /* show confirmation regardless — message is best-effort */ }
      done();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new App().init());
