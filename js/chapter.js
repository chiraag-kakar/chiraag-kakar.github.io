// Chapter Detail Page
class ChapterPage {
  constructor() {
    this.content = null;
    this.chapter = null;
    this.chapterIndex = -1;
  }

  async init() {
    try {
      // Load content
      const response = await fetch('./content.json');
      this.content = await response.json();
      
      // Get chapter ID from URL
      const params = new URLSearchParams(window.location.search);
      const chapterId = params.get('id');
      
      if (!chapterId) {
        window.location.href = 'index.html#chapters';
        return;
      }
      
      // Find chapter
      this.chapterIndex = this.content.chapters.findIndex(ch => ch.id === chapterId);
      if (this.chapterIndex === -1) {
        window.location.href = 'index.html#chapters';
        return;
      }
      
      this.chapter = this.content.chapters[this.chapterIndex];
      
      // Render
      this.renderNavigation();
      this.renderChapter();
      this.renderFooter();
      this.setupReadingProgress();
      this.setupDropdownToggle();
      this.setupMobileMenu();
      
      // Update page title
      document.title = `${this.chapter.title} — Chiraag.dev`;
      
    } catch (error) {
      console.error('Failed to load chapter:', error);
    }
  }

  renderNavigation() {
    const { navigation, chapters, meta } = this.content;
    const navLinks = document.getElementById('nav-links');
    const mobileLinks = document.getElementById('mobile-menu-links');
    
    // Update logo
    document.getElementById('nav-logo-name').textContent = meta.name;
    document.getElementById('nav-logo-accent').textContent = meta.accent;
    
    navigation.forEach(item => {
      if (item.href === '#chapters' && chapters) {
        // Desktop dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'nav-dropdown';
        dropdown.innerHTML = `
          <button class="nav-link nav-dropdown-trigger">
            ${item.text}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div class="nav-dropdown-menu">
            <a href="index.html#chapters" class="nav-dropdown-item nav-dropdown-header">View All Chapters</a>
            <div class="nav-dropdown-divider"></div>
            ${chapters.map((ch, i) => `
              <a href="chapter.html?id=${ch.id}" class="nav-dropdown-item ${ch.id === this.chapter.id ? 'active' : ''}" data-chapter="${i}">
                <span class="dropdown-chapter-num">Ch.${String(i + 1).padStart(2, '0')}</span>
                <span class="dropdown-chapter-info">
                  <span class="dropdown-chapter-company">${ch.company}</span>
                  <span class="dropdown-chapter-role">${ch.role}</span>
                </span>
              </a>
            `).join('')}
          </div>
        `;
        navLinks.appendChild(dropdown);

        // Mobile
        const mobileDropdown = document.createElement('div');
        mobileDropdown.className = 'mobile-nav-dropdown';
        mobileDropdown.innerHTML = `
          <button class="nav-link mobile-dropdown-trigger">
            ${item.text}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div class="mobile-dropdown-menu">
            <a href="index.html#chapters" class="mobile-dropdown-item">View All Chapters</a>
            ${chapters.map((ch, i) => `
              <a href="chapter.html?id=${ch.id}" class="mobile-dropdown-item ${ch.id === this.chapter.id ? 'active' : ''}">
                <span class="dropdown-chapter-num">Ch.${String(i + 1).padStart(2, '0')}</span>
                <span class="dropdown-chapter-company">${ch.company}</span>
              </a>
            `).join('')}
          </div>
        `;
        mobileLinks.appendChild(mobileDropdown);
      } else {
        // Regular link - prepend index.html for chapter page
        const href = item.href.startsWith('#') ? `index.html${item.href}` : item.href;
        
        const link = document.createElement('a');
        link.href = href;
        link.className = 'nav-link';
        link.textContent = item.text;
        navLinks.appendChild(link);

        const mobileLink = document.createElement('a');
        mobileLink.href = href;
        mobileLink.className = 'nav-link';
        mobileLink.textContent = item.text;
        mobileLinks.appendChild(mobileLink);
      }
    });
  }

  renderChapter() {
    const ch = this.chapter;
    const idx = this.chapterIndex;
    const chapters = this.content.chapters;
    const container = document.getElementById('chapter-detail-container');
    
    // Create chapter section using the SAME structure as renderer.js
    const section = document.createElement('section');
    section.className = 'chapter standalone-chapter-view';
    section.id = ch.id;

    // Story blocks
    let storyHTML = '';
    if (ch.story) {
      storyHTML = `
        <div class="chapter-story">
          <div class="story-block">
            <h4>The Setting</h4>
            <p>${ch.story.setting}</p>
          </div>
          <div class="story-block">
            <h4>The Quest</h4>
            <p>${ch.story.quest}</p>
          </div>
        </div>
      `;
    }

    // Journey timeline
    let journeyHTML = '';
    if (ch.journey && ch.journey.length > 0) {
      journeyHTML = `
        <div class="chapter-journey">
          <h4 class="journey-title">The Journey</h4>
          <div class="journey-steps">
            ${ch.journey.map((step, i) => `
              <div class="journey-step">
                <div class="journey-step-number">${i + 1}</div>
                <h5 class="journey-step-title">${step.title}</h5>
                <p class="journey-step-text">${step.text}</p>
                ${step.quote ? `<p class="journey-step-quote">${step.quote}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Impact metrics
    let impactHTML = '';
    if (ch.impact && ch.impact.length > 0) {
      impactHTML = `
        <div class="chapter-impact">
          ${ch.impact.map(item => `
            <div class="impact-card">
              <div class="impact-value">${item.value}</div>
              <div class="impact-label">${item.label}</div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Technologies
    let techHTML = '';
    if (ch.tech && ch.tech.length > 0) {
      techHTML = `
        <div class="chapter-tech">
          ${ch.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
        </div>
      `;
    }

    // Publication card
    let publicationHTML = '';
    if (ch.publication) {
      publicationHTML = `
        <a href="${ch.publication.url}" target="_blank" rel="noopener" class="chapter-publication">
          <div class="publication-badge">📄 Published Work</div>
          <h4 class="publication-title">${ch.publication.title}</h4>
          <div class="publication-meta">
            <span class="publication-publisher">${ch.publication.publisher}</span>
            <span class="publication-date">${ch.publication.date}</span>
          </div>
          <p class="publication-series">${ch.publication.series}</p>
          <span class="publication-link">Read Publication →</span>
        </a>
      `;
    }

    section.innerHTML = `
      <div class="chapter-container">
        <div class="chapter-header">
          <div class="chapter-meta">
            <span class="chapter-number">${ch.chapterLabel}</span>
          </div>
          <h2 class="chapter-title">${ch.title}</h2>
          <div class="chapter-company">
            ${ch.companyUrl ? `
              <a href="${ch.companyUrl}" target="_blank" rel="noopener" class="company-link">
                <img src="https://www.google.com/s2/favicons?sz=32&domain_url=${encodeURIComponent(ch.companyUrl)}" 
                     alt="${ch.company}" 
                     class="company-favicon"
                     onerror="this.onerror=null; this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23c9a66b%22 rx=%2210%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2265%22 text-anchor=%22middle%22 fill=%22%23fff%22 font-family=%22system-ui%22 font-weight=%22700%22 font-size=%2250%22>${ch.company.charAt(0)}</text></svg>';" />
                <strong>${ch.company}</strong>
              </a>
            ` : `<strong>${ch.company}</strong>`}
            · ${ch.role}
          </div>
          <p class="chapter-tagline">"${ch.tagline}"</p>
        </div>

        ${storyHTML}
        ${journeyHTML}
        ${impactHTML}
        ${techHTML}
        ${publicationHTML}
      </div>
    `;

    container.appendChild(section);
    
    // Chapter Navigation
    const prevBtn = document.getElementById('prev-chapter-btn');
    const nextBtn = document.getElementById('next-chapter-btn');
    
    if (idx > 0) {
      const prev = chapters[idx - 1];
      prevBtn.href = `chapter.html?id=${prev.id}`;
    } else {
      prevBtn.style.display = 'none';
    }
    
    if (idx < chapters.length - 1) {
      const next = chapters[idx + 1];
      nextBtn.href = `chapter.html?id=${next.id}`;
    } else {
      nextBtn.style.display = 'none';
    }
  }

  renderFooter() {
    const { footer } = this.content;
    
    document.getElementById('footer-tagline').textContent = footer.tagline;
    document.getElementById('footer-year').textContent = new Date().getFullYear();
    document.getElementById('footer-copyright').textContent = footer.copyright;
    document.getElementById('footer-built').textContent = footer.bottomText;
    
    const sectionsContainer = document.getElementById('footer-sections');
    sectionsContainer.innerHTML = footer.sections.map(section => `
      <div class="footer-section">
        <h4 class="footer-section-title">${section.title}</h4>
        <div class="footer-section-links">
          ${section.links.map(link => {
            const href = link.url.startsWith('#') ? `index.html${link.url}` : link.url;
            return `<a href="${href}" class="footer-link">${link.text}</a>`;
          }).join('')}
        </div>
      </div>
    `).join('');
  }

  setupReadingProgress() {
    const progressBar = document.getElementById('reading-progress-bar');
    if (!progressBar) return;

    const updateProgress = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      progressBar.style.width = `${Math.min(progress, 100)}%`;
    };

    window.addEventListener('scroll', () => {
      requestAnimationFrame(updateProgress);
    });
    
    updateProgress();
  }

  setupDropdownToggle() {
    document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
      const trigger = dropdown.querySelector('.nav-dropdown-trigger');
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
      });
    });

    document.addEventListener('click', () => {
      document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('active'));
    });
  }

  setupMobileMenu() {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('mobile-menu');
    const nav = document.getElementById('nav');
    
    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        nav.classList.toggle('menu-open');
        menu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
      });
      
      // Close on link click
      menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          nav.classList.remove('menu-open');
          menu.classList.remove('active');
          document.body.classList.remove('menu-open');
        });
      });
    }
    
    // Mobile dropdown toggle
    document.querySelectorAll('.mobile-dropdown-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        trigger.parentElement.classList.toggle('active');
      });
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const page = new ChapterPage();
  page.init();
});
