// Renderer — turns content.json data into DOM.
// Repeated, data-driven lists only; static copy lives in index.html.

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

export class Renderer {
  constructor(content) {
    this.content = content;
    this.accents = content.accents || [];
  }

  render() {
    this.renderDropdown();
    this.renderChapters();
    this.renderArsenal();
    this.renderProjects();
    this.renderArticles();
    this.renderPrinciples();
  }

  accent(i) { return this.accents[i] || '#e9b873'; }
  num(i) { return String(i + 1).padStart(2, '0'); }

  mount(sel, html) {
    const el = document.querySelector(`[data-render="${sel}"]`);
    if (el) el.innerHTML = html;
    return el;
  }

  renderDropdown() {
    const html = this.content.chapters.map((ch, i) => `
      <button class="nav-drop-item" data-cd-chapter="${i}" style="--accent:${esc(this.accent(i))}">
        <span class="nav-drop-dot"></span>
        <span class="nav-drop-num">${esc(this.num(i))}</span>
        <span class="nav-drop-text">
          <span class="nav-drop-company">${esc(ch.company)}</span>
          <span class="nav-drop-role">${esc(ch.role)}</span>
        </span>
      </button>`).join('');
    this.mount('dropdown', html);
  }

  renderChapters() {
    const html = this.content.chapters.map((ch, i) => `
      <article class="chapter-card" data-cd-chapter="${i}" data-cd-tilt data-cd-reveal data-cd-accent="${esc(this.accent(i))}" style="--accent:${esc(this.accent(i))}">
        <div class="chapter-card-num">${esc(this.num(i))}</div>
        <div class="chapter-label-row">
          <span class="chapter-dot"></span>
          <span class="chapter-label">${esc(ch.label)}</span>
        </div>
        <h3 class="chapter-title">${esc(ch.title)}</h3>
        <div class="chapter-meta">${esc(ch.company)} · ${esc(ch.role)}</div>
        <p class="chapter-tagline">&ldquo;${esc(ch.tagline)}&rdquo;</p>
        <div class="chapter-spacer"></div>
        <div class="chapter-foot">
          <div>
            <div class="chapter-metric">${esc(ch.highlight.metric)}</div>
            <div class="chapter-metric-label">${esc(ch.highlight.label)}</div>
          </div>
          <span class="chapter-read">Read chapter →</span>
        </div>
        <span class="glare" data-cd-glare></span>
      </article>`).join('');
    this.mount('chapters', html);
  }

  renderArsenal() {
    const domains = (this.content.arsenal && this.content.arsenal.domains) || [];
    const html = domains.map((d) => `
      <div class="arsenal-card" data-cd-reveal data-cd-tilt data-cd-accent="${esc(d.accent)}" style="--accent:${esc(d.accent)}">
        <div class="arsenal-card-bar"></div>
        <div class="arsenal-card-head">
          <span class="arsenal-card-dot"></span>
          <span class="arsenal-card-name">${esc(d.name)}</span>
        </div>
        <div class="arsenal-chips">
          ${d.items.map((t) => `<span class="chip"><span class="chip-dot"></span>${esc(t)}</span>`).join('')}
        </div>
        <span class="glare" data-cd-glare></span>
      </div>`).join('');
    this.mount('arsenal', html);
  }

  renderProjects() {
    const html = this.content.projects.map((p) => `
      <div class="project-card" data-cd-reveal data-cd-tilt>
        <div class="project-head">
          <span class="project-icon">${esc(p.icon)}</span>
          <div class="project-links">
            <a class="project-link" href="${esc(p.github)}" target="_blank" rel="noopener">Code ↗</a>
            <a class="project-link" href="${esc(p.demo)}" target="_blank" rel="noopener">Demo ↗</a>
          </div>
        </div>
        <h3 class="project-title">${esc(p.title)}</h3>
        <p class="project-desc">${esc(p.useCase)}</p>
        <div class="project-spacer"></div>
        <div class="project-tech">
          ${p.tech.map((t) => `<span class="project-tech-chip">${esc(t)}</span>`).join('')}
        </div>
      </div>`).join('');
    this.mount('projects', html);
  }

  renderArticles() {
    const html = this.content.articles.map((a) => `
      <a class="article-card" data-cd-reveal href="${esc(a.link)}" target="_blank" rel="noopener">
        <div class="article-meta">
          <span>${esc(a.category)}</span>
          <span class="article-meta-sep">·</span>
          <span class="article-readtime">${esc(a.readTime)}</span>
        </div>
        <h3 class="article-title">${esc(a.title)}</h3>
        <p class="article-excerpt">${esc(a.excerpt)}</p>
        <span class="article-cta">Read on Medium ↗</span>
      </a>`).join('');
    this.mount('articles', html);
  }

  renderPrinciples() {
    const html = this.content.principles.map((pr, i) => `
      <div class="principle" data-cd-reveal>
        <div class="principle-head">
          <span class="principle-num">${esc(this.num(i))}</span>
          <h3 class="principle-title">${esc(pr.title)}</h3>
        </div>
        <p class="principle-text">${esc(pr.text)}</p>
      </div>`).join('');
    this.mount('principles', html);
  }
}
