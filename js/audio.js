// Background audio — cozy ambient hum on the main page that ducks out for the
// "Spectre" story-mode track, plus a persistent global mute toggle.

const AMBIENT_SRC = 'assets/audio/bieber-jay_justin-bieber-beauty-and-a-beat-feat-nicki-miaj.mp3';
const STORY_SRC = 'assets/audio/spectre.mp3';
const AMBIENT_VOL = 0.34;
const STORY_VOL = 0.5;
const FADE_MS = 700;

export class AudioManager {
  constructor() {
    this.muted = localStorage.getItem('cd-muted') === '1';
    this.mode = 'ambient'; // 'ambient' | 'story'
    this._started = false;

    this.ambient = new Audio(AMBIENT_SRC);
    this.ambient.loop = true;
    this.ambient.preload = 'auto';
    this.ambient.volume = 0;

    this.story = new Audio(STORY_SRC);
    this.story.loop = true;
    this.story.preload = 'auto';
    this.story.volume = 0;

    this._buildToggle();
  }

  // --- Public API ---------------------------------------------------------

  // Click "Play the Story": duck the ambient hum and bring up Spectre.
  enterStory() {
    this.mode = 'story';
    this._fade(this.ambient, 0, () => this.ambient.pause());
    if (!this.muted) {
      this._safePlay(this.story);
      this._fade(this.story, STORY_VOL);
    }
  }

  // Exit story mode: stop Spectre, restore the ambient hum.
  exitStory() {
    this.mode = 'ambient';
    this._fade(this.story, 0, () => { this.story.pause(); this.story.currentTime = 0; });
    if (!this.muted) {
      this._safePlay(this.ambient);
      this._fade(this.ambient, AMBIENT_VOL);
    }
  }

  setMuted(v) {
    this.muted = v;
    localStorage.setItem('cd-muted', v ? '1' : '0');
    this._syncToggle();
    const active = this.mode === 'story' ? this.story : this.ambient;
    const target = this.mode === 'story' ? STORY_VOL : AMBIENT_VOL;
    if (v) {
      this._fade(active, 0, () => active.pause());
    } else {
      this._safePlay(active);
      this._fade(active, target);
    }
  }

  // --- Internals ----------------------------------------------------------

  // Kick off the home track (called the moment the loader reveals the site).
  // Browsers block autoplay-with-sound until the first user gesture, so if the
  // immediate attempt is refused, fall back to the first interaction.
  start() {
    if (this._kicked) return;
    this._kicked = true;
    this._start().catch(() => {
      const once = () => { this._start(); window.removeEventListener('pointerdown', once); window.removeEventListener('keydown', once); };
      window.addEventListener('pointerdown', once, { once: true });
      window.addEventListener('keydown', once, { once: true });
    });
  }

  async _start() {
    if (this._started || this.muted || this.mode !== 'ambient') return Promise.resolve();
    await this.ambient.play(); // rejects if gesture is required
    this._started = true;
    this._fade(this.ambient, AMBIENT_VOL);
  }

  _safePlay(el) {
    const p = el.play();
    if (p && p.catch) p.catch(() => {});
    this._started = true;
  }

  _fade(el, to, done) {
    clearInterval(el._fadeIv);
    const from = el.volume, steps = Math.max(1, Math.round(FADE_MS / 40));
    let i = 0;
    el._fadeIv = setInterval(() => {
      i++;
      el.volume = Math.min(1, Math.max(0, from + (to - from) * (i / steps)));
      if (i >= steps) { clearInterval(el._fadeIv); if (done) done(); }
    }, 40);
  }

  _buildToggle() {
    const btn = document.createElement('button');
    btn.className = 'cd-audio-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Toggle sound');
    btn.innerHTML = this._iconMarkup();
    btn.addEventListener('click', () => this.setMuted(!this.muted));
    document.body.appendChild(btn);
    this._toggle = btn;
    this._syncToggle();
  }

  _iconMarkup() {
    // Two icons; CSS shows one based on the .is-muted class.
    return (
      '<svg class="ico-on" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a3 3 0 0 1 0 6"/><path d="M18.5 7a6 6 0 0 1 0 10"/></svg>' +
      '<svg class="ico-off" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M22 9l-6 6"/><path d="M16 9l6 6"/></svg>'
    );
  }

  _syncToggle() {
    if (!this._toggle) return;
    this._toggle.classList.toggle('is-muted', this.muted);
    this._toggle.setAttribute('aria-pressed', String(this.muted));
    this._toggle.title = this.muted ? 'Sound off' : 'Sound on';
  }
}
