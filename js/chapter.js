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
    
    // Header
    document.getElementById('chapter-label').textContent = ch.chapterLabel;
    document.getElementById('chapter-title').textContent = ch.title;
    document.getElementById('chapter-tagline').textContent = ch.tagline;
    
    // Company link
    const companyLink = document.getElementById('company-link');
    if (ch.companyUrl) {
      companyLink.href = ch.companyUrl;
      document.getElementById('company-name').textContent = ch.company;
    } else {
      document.getElementById('company-name').textContent = ch.company;
      companyLink.removeAttribute('href');
      companyLink.style.pointerEvents = 'none';
      companyLink.querySelector('svg').style.display = 'none';
    }
    
    document.getElementById('chapter-role').textContent = ch.role;
    document.getElementById('chapter-period').textContent = ch.period;
    
    // Story
    document.getElementById('story-setting-text').textContent = ch.story.setting;
    document.getElementById('story-quest-text').textContent = ch.story.quest;
    
    // Journey Timeline
    const timeline = document.getElementById('journey-timeline');
    timeline.innerHTML = ch.journey.map((step, i) => `
      <div class="journey-step fade-in" style="animation-delay: ${i * 0.1}s">
        <div class="step-marker">
          <span class="step-number">${String(i + 1).padStart(2, '0')}</span>
        </div>
        <div class="step-content">
          <h3 class="step-title">${step.title}</h3>
          <p class="step-text">${step.text}</p>
          ${step.quote ? `<blockquote class="step-quote">${step.quote}</blockquote>` : ''}
        </div>
      </div>
    `).join('');
    
    // Impact Grid
    const impactGrid = document.getElementById('impact-grid');
    impactGrid.innerHTML = ch.impact.map(item => `
      <div class="impact-card fade-in">
        <span class="impact-value">${item.value}</span>
        <span class="impact-label">${item.label}</span>
      </div>
    `).join('');
    
    // Tech Tags
    const techTags = document.getElementById('tech-tags');
    techTags.innerHTML = ch.tech.map(tech => `
      <span class="tech-tag">${tech}</span>
    `).join('');
    
    // Chapter Navigation
    const prevChapter = document.getElementById('prev-chapter');
    const nextChapter = document.getElementById('next-chapter');
    
    if (idx > 0) {
      const prev = chapters[idx - 1];
      prevChapter.href = `chapter.html?id=${prev.id}`;
      document.getElementById('prev-chapter-title').textContent = prev.title;
    } else {
      prevChapter.style.visibility = 'hidden';
    }
    
    if (idx < chapters.length - 1) {
      const next = chapters[idx + 1];
      nextChapter.href = `chapter.html?id=${next.id}`;
      document.getElementById('next-chapter-title').textContent = next.title;
    } else {
      nextChapter.style.visibility = 'hidden';
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
