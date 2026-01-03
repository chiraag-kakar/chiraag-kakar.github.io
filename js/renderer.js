// Renderer - Populates the DOM from content.json with Chapter-based narrative design

export class Renderer {
  constructor(content) {
    this.content = content;
  }

  render() {
    this.renderNavigation();
    this.renderHero();
    this.renderChapters();
    this.renderArsenal();
    this.renderQuests();
    this.renderEducation();
    this.renderPhilosophy();
    this.renderContact();
    this.renderFooter();
  }

  renderNavigation() {
    const { navigation, chapters } = this.content;
    const navLinks = document.getElementById('nav-links');
    const mobileLinks = document.getElementById('mobile-menu-links');

    navigation.forEach(item => {
      // Special handling for "The Journey" - make it a dropdown
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
            <a href="#chapters" class="nav-dropdown-item nav-dropdown-header">View All Chapters</a>
            <div class="nav-dropdown-divider"></div>
            ${chapters.map((ch, i) => `
              <a href="#${ch.id}" class="nav-dropdown-item" data-chapter="${i}">
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

        // Mobile accordion
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
            <a href="#chapters" class="mobile-dropdown-item">View All Chapters</a>
            ${chapters.map((ch, i) => `
              <a href="#${ch.id}" class="mobile-dropdown-item">
                <span class="dropdown-chapter-num">Ch.${String(i + 1).padStart(2, '0')}</span>
                <span class="dropdown-chapter-company">${ch.company}</span>
              </a>
            `).join('')}
          </div>
        `;
        mobileLinks.appendChild(mobileDropdown);
      } else {
        const link = document.createElement('a');
        link.href = item.href;
        link.className = 'nav-link';
        link.textContent = item.text;
        navLinks.appendChild(link);

        const mobileLink = link.cloneNode(true);
        mobileLinks.appendChild(mobileLink);
      }
    });

    // Setup dropdown interactions
    this.setupDropdownInteractions();
  }

  setupDropdownInteractions() {
    // Desktop hover/click
    const dropdown = document.querySelector('.nav-dropdown');
    if (dropdown) {
      const trigger = dropdown.querySelector('.nav-dropdown-trigger');
      const menu = dropdown.querySelector('.nav-dropdown-menu');
      
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        dropdown.classList.toggle('active');
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
          dropdown.classList.remove('active');
        }
      });

      // Close on item click
      menu.querySelectorAll('.nav-dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
          dropdown.classList.remove('active');
        });
      });
    }

    // Mobile accordion
    const mobileDropdown = document.querySelector('.mobile-nav-dropdown');
    if (mobileDropdown) {
      const trigger = mobileDropdown.querySelector('.mobile-dropdown-trigger');
      
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        mobileDropdown.classList.toggle('active');
      });
    }
  }

  renderHero() {
    const { hero } = this.content;

    document.getElementById('hero-badge').textContent = hero.badge;
    document.getElementById('hero-line-1').textContent = hero.titleLine1;
    document.getElementById('hero-line-2').textContent = hero.titleLine2;
    document.getElementById('hero-line-3').textContent = hero.titleHighlight;
    document.getElementById('hero-subtitle').textContent = hero.subtitle;

    document.getElementById('hero-cta-text').textContent = hero.ctaText;
  }

  renderChapters() {
    const { chapters } = this.content;
    const container = document.getElementById('chapters');

    chapters.forEach((chapter, index) => {
      // Create a wrapper for sticky scroll space
      const wrapper = document.createElement('div');
      wrapper.className = 'chapter-wrapper';
      
      const section = this.createChapterSection(chapter, index);
      wrapper.appendChild(section);
      container.appendChild(wrapper);
    });
  }

  getChapterGraphic(index) {
    const graphics = [
      // Ch1: Network/connections for Coda payments
      `<svg class="chapter-bg-graphic" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="200" r="80" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" opacity="0.15"/>
        <circle cx="200" cy="200" r="140" stroke="currentColor" stroke-width="1" stroke-dasharray="8 8" opacity="0.1"/>
        <circle cx="200" cy="200" r="180" stroke="currentColor" stroke-width="1" stroke-dasharray="12 12" opacity="0.08"/>
        <circle cx="120" cy="120" r="8" fill="currentColor" opacity="0.2"/>
        <circle cx="280" cy="120" r="6" fill="currentColor" opacity="0.15"/>
        <circle cx="320" cy="200" r="10" fill="currentColor" opacity="0.2"/>
        <circle cx="280" cy="280" r="7" fill="currentColor" opacity="0.18"/>
        <circle cx="120" cy="280" r="9" fill="currentColor" opacity="0.15"/>
        <path d="M120 120 L200 200" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" opacity="0.1"/>
        <path d="M280 120 L200 200" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" opacity="0.1"/>
        <path d="M320 200 L200 200" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" opacity="0.1"/>
        <path d="M280 280 L200 200" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" opacity="0.1"/>
        <path d="M120 280 L200 200" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" opacity="0.1"/>
      </svg>`,
      // Ch2: Cloud/infrastructure for HyperVerge
      `<svg class="chapter-bg-graphic" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 250 Q100 200 150 200 Q150 150 220 150 Q290 150 290 200 Q340 200 340 250 Q340 300 280 300 L120 300 Q100 300 100 250Z" stroke="currentColor" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.12"/>
        <rect x="140" y="320" width="40" height="50" rx="4" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" opacity="0.1"/>
        <rect x="200" y="320" width="40" height="50" rx="4" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" opacity="0.1"/>
        <rect x="260" y="320" width="40" height="50" rx="4" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" opacity="0.1"/>
        <path d="M160 300 L160 320" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2" opacity="0.1"/>
        <path d="M220 300 L220 320" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2" opacity="0.1"/>
        <path d="M280 300 L280 320" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2" opacity="0.1"/>
      </svg>`,
      // Ch3: Mobile/app for Sequoia
      `<svg class="chapter-bg-graphic" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="140" y="80" width="120" height="240" rx="16" stroke="currentColor" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.12"/>
        <rect x="160" y="120" width="80" height="12" rx="2" stroke="currentColor" stroke-width="1" opacity="0.1"/>
        <rect x="160" y="145" width="60" height="8" rx="2" stroke="currentColor" stroke-width="1" opacity="0.08"/>
        <rect x="160" y="170" width="80" height="60" rx="4" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" opacity="0.1"/>
        <rect x="160" y="245" width="35" height="35" rx="6" stroke="currentColor" stroke-width="1" opacity="0.1"/>
        <rect x="205" y="245" width="35" height="35" rx="6" stroke="currentColor" stroke-width="1" opacity="0.1"/>
        <circle cx="200" cy="305" r="8" stroke="currentColor" stroke-width="1" opacity="0.1"/>
      </svg>`,
      // Ch4: Charts/analytics for Economize
      `<svg class="chapter-bg-graphic" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M80 320 L80 120" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" opacity="0.1"/>
        <path d="M80 320 L340 320" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" opacity="0.1"/>
        <path d="M100 280 L140 220 L180 250 L220 180 L260 200 L300 140" stroke="currentColor" stroke-width="2" stroke-dasharray="6 4" opacity="0.15" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="100" cy="280" r="4" fill="currentColor" opacity="0.2"/>
        <circle cx="140" cy="220" r="4" fill="currentColor" opacity="0.2"/>
        <circle cx="180" cy="250" r="4" fill="currentColor" opacity="0.2"/>
        <circle cx="220" cy="180" r="4" fill="currentColor" opacity="0.2"/>
        <circle cx="260" cy="200" r="4" fill="currentColor" opacity="0.2"/>
        <circle cx="300" cy="140" r="4" fill="currentColor" opacity="0.2"/>
        <rect x="120" y="260" width="20" height="60" rx="2" fill="currentColor" opacity="0.08"/>
        <rect x="160" y="230" width="20" height="90" rx="2" fill="currentColor" opacity="0.08"/>
        <rect x="200" y="200" width="20" height="120" rx="2" fill="currentColor" opacity="0.08"/>
        <rect x="240" y="180" width="20" height="140" rx="2" fill="currentColor" opacity="0.08"/>
      </svg>`,
      // Ch5: Code/brackets for HackerEarth
      `<svg class="chapter-bg-graphic" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M120 140 L80 200 L120 260" stroke="currentColor" stroke-width="2" stroke-dasharray="6 4" stroke-linecap="round" stroke-linejoin="round" opacity="0.15"/>
        <path d="M280 140 L320 200 L280 260" stroke="currentColor" stroke-width="2" stroke-dasharray="6 4" stroke-linecap="round" stroke-linejoin="round" opacity="0.15"/>
        <path d="M220 120 L180 280" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" stroke-linecap="round" opacity="0.12"/>
        <rect x="140" y="300" width="120" height="8" rx="2" fill="currentColor" opacity="0.08"/>
        <rect x="160" y="320" width="80" height="8" rx="2" fill="currentColor" opacity="0.06"/>
        <rect x="150" y="340" width="100" height="8" rx="2" fill="currentColor" opacity="0.05"/>
      </svg>`,
      // Ch6: Community/people for JWOC
      `<svg class="chapter-bg-graphic" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="160" r="30" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.12"/>
        <circle cx="200" cy="145" r="12" stroke="currentColor" stroke-width="1" opacity="0.1"/>
        <path d="M175 175 Q200 200 225 175" stroke="currentColor" stroke-width="1" opacity="0.1"/>
        <circle cx="120" cy="220" r="25" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" opacity="0.1"/>
        <circle cx="280" cy="220" r="25" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" opacity="0.1"/>
        <circle cx="140" cy="300" r="20" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" opacity="0.08"/>
        <circle cx="260" cy="300" r="20" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" opacity="0.08"/>
        <path d="M200 190 L200 250" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" opacity="0.08"/>
        <path d="M200 250 L140 290" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" opacity="0.08"/>
        <path d="M200 250 L260 290" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" opacity="0.08"/>
      </svg>`,
      // Ch7: Shopping cart for Zaptay
      `<svg class="chapter-bg-graphic" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 140 L130 140 L170 260 L300 260" stroke="currentColor" stroke-width="1.5" stroke-dasharray="6 4" stroke-linecap="round" stroke-linejoin="round" opacity="0.12"/>
        <ellipse cx="190" cy="290" rx="15" ry="15" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" opacity="0.1"/>
        <ellipse cx="270" cy="290" rx="15" ry="15" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" opacity="0.1"/>
        <rect x="145" y="160" width="140" height="80" rx="4" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" opacity="0.1"/>
        <rect x="160" y="175" width="50" height="50" rx="4" stroke="currentColor" stroke-width="1" opacity="0.08"/>
        <rect x="220" y="175" width="50" height="30" rx="2" stroke="currentColor" stroke-width="1" opacity="0.08"/>
      </svg>`,
      // Ch8: Neural network for IIT Research
      `<svg class="chapter-bg-graphic" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="150" r="12" stroke="currentColor" stroke-width="1" opacity="0.15"/>
        <circle cx="100" cy="200" r="12" stroke="currentColor" stroke-width="1" opacity="0.15"/>
        <circle cx="100" cy="250" r="12" stroke="currentColor" stroke-width="1" opacity="0.15"/>
        <circle cx="200" cy="130" r="12" stroke="currentColor" stroke-width="1" opacity="0.15"/>
        <circle cx="200" cy="200" r="12" stroke="currentColor" stroke-width="1" opacity="0.15"/>
        <circle cx="200" cy="270" r="12" stroke="currentColor" stroke-width="1" opacity="0.15"/>
        <circle cx="300" cy="175" r="12" stroke="currentColor" stroke-width="1" opacity="0.15"/>
        <circle cx="300" cy="225" r="12" stroke="currentColor" stroke-width="1" opacity="0.15"/>
        <path d="M112 150 L188 130" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" opacity="0.1"/>
        <path d="M112 150 L188 200" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" opacity="0.1"/>
        <path d="M112 200 L188 130" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" opacity="0.1"/>
        <path d="M112 200 L188 200" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" opacity="0.1"/>
        <path d="M112 200 L188 270" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" opacity="0.1"/>
        <path d="M112 250 L188 200" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" opacity="0.1"/>
        <path d="M112 250 L188 270" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" opacity="0.1"/>
        <path d="M212 130 L288 175" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" opacity="0.1"/>
        <path d="M212 200 L288 175" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" opacity="0.1"/>
        <path d="M212 200 L288 225" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" opacity="0.1"/>
        <path d="M212 270 L288 225" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" opacity="0.1"/>
      </svg>`,
      // Ch9: Book/publication for MAKAUT Research
      `<svg class="chapter-bg-graphic" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M120 100 L120 300 Q200 280 280 300 L280 100 Q200 120 120 100Z" stroke="currentColor" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.12"/>
        <path d="M200 115 L200 290" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" opacity="0.1"/>
        <rect x="140" y="140" width="40" height="6" rx="1" fill="currentColor" opacity="0.1"/>
        <rect x="140" y="155" width="50" height="4" rx="1" fill="currentColor" opacity="0.08"/>
        <rect x="140" y="168" width="35" height="4" rx="1" fill="currentColor" opacity="0.06"/>
        <rect x="220" y="140" width="40" height="6" rx="1" fill="currentColor" opacity="0.1"/>
        <rect x="220" y="155" width="45" height="4" rx="1" fill="currentColor" opacity="0.08"/>
        <rect x="220" y="168" width="30" height="4" rx="1" fill="currentColor" opacity="0.06"/>
        <rect x="140" y="200" width="45" height="6" rx="1" fill="currentColor" opacity="0.1"/>
        <rect x="220" y="200" width="40" height="6" rx="1" fill="currentColor" opacity="0.1"/>
      </svg>`
    ];
    return graphics[index % graphics.length];
  }

  createChapterSection(chapter, index) {
    const section = document.createElement('section');
    section.className = 'chapter';
    section.id = chapter.id;

    // Story blocks (Setting & Quest - renamed from Context/Challenge)
    let storyHTML = '';
    if (chapter.story) {
      storyHTML = `
        <div class="chapter-story fade-in">
          <div class="story-block">
            <h4>The Setting</h4>
            <p>${chapter.story.setting}</p>
          </div>
          <div class="story-block">
            <h4>The Quest</h4>
            <p>${chapter.story.quest}</p>
          </div>
        </div>
      `;
    }

    // Journey timeline
    let journeyHTML = '';
    if (chapter.journey && chapter.journey.length > 0) {
      journeyHTML = `
        <div class="chapter-journey fade-in">
          <h4 class="journey-title">The Journey</h4>
          <div class="journey-steps">
            ${chapter.journey.map((step, i) => `
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
    if (chapter.impact && chapter.impact.length > 0) {
      impactHTML = `
        <div class="chapter-impact fade-in">
          ${chapter.impact.map(item => `
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
    if (chapter.tech && chapter.tech.length > 0) {
      techHTML = `
        <div class="chapter-tech fade-in">
          ${chapter.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
        </div>
      `;
    }

    // Publication card (for chapter 09)
    let publicationHTML = '';
    if (chapter.publication) {
      publicationHTML = `
        <a href="${chapter.publication.url}" target="_blank" rel="noopener" class="chapter-publication fade-in">
          <div class="publication-badge">📄 Published Work</div>
          <h4 class="publication-title">${chapter.publication.title}</h4>
          <div class="publication-meta">
            <span class="publication-publisher">${chapter.publication.publisher}</span>
            <span class="publication-date">${chapter.publication.date}</span>
          </div>
          <p class="publication-series">${chapter.publication.series}</p>
          <span class="publication-link">Read Publication →</span>
        </a>
      `;
    }

    section.innerHTML = `
      ${this.getChapterGraphic(index)}
      <div class="chapter-container">
        <div class="chapter-header fade-in">
          <div class="chapter-meta">
            <span class="chapter-number">${chapter.chapterLabel}</span>
          </div>
          <h2 class="chapter-title">${chapter.title}</h2>
          <div class="chapter-company">
            ${chapter.companyUrl ? `
              <a href="${chapter.companyUrl}" target="_blank" rel="noopener" class="company-link">
                <img src="https://www.google.com/s2/favicons?sz=32&domain_url=${encodeURIComponent(chapter.companyUrl)}" 
                     alt="${chapter.company}" 
                     class="company-favicon"
                     onerror="this.onerror=null; this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23c9a66b%22 rx=%2210%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2265%22 text-anchor=%22middle%22 fill=%22%23fff%22 font-family=%22system-ui%22 font-weight=%22700%22 font-size=%2250%22>${chapter.company.charAt(0)}</text></svg>';" />
                <strong>${chapter.company}</strong>
              </a>
            ` : `<strong>${chapter.company}</strong>`}
            · ${chapter.role}
          </div>
          <p class="chapter-tagline">"${chapter.tagline}"</p>
        </div>

        ${storyHTML}
        ${journeyHTML}
        ${impactHTML}
        ${techHTML}
        ${publicationHTML}
      </div>
    `;

    return section;
  }

  renderArsenal() {
    const { arsenal } = this.content;
    
    document.getElementById('arsenal-eyebrow').textContent = arsenal.eyebrow;
    document.getElementById('arsenal-title').textContent = arsenal.title;
    document.getElementById('arsenal-subtitle').textContent = arsenal.subtitle;

    const grid = document.getElementById('arsenal-grid');
    
    arsenal.categories.forEach((category, index) => {
      const categoryEl = document.createElement('div');
      categoryEl.className = `arsenal-category fade-in stagger-${(index % 6) + 1}`;
      categoryEl.innerHTML = `
        <h4 class="arsenal-category-title">${category.name}</h4>
        <div class="arsenal-items">
          ${category.items.map(item => `<span class="arsenal-item">${item}</span>`).join('')}
        </div>
      `;
      grid.appendChild(categoryEl);
    });
  }

  renderQuests() {
    const { quests } = this.content;

    document.getElementById('quests-eyebrow').textContent = quests.eyebrow;
    document.getElementById('quests-title').textContent = quests.title;
    document.getElementById('quests-subtitle').textContent = quests.subtitle;

    const grid = document.getElementById('quests-grid');
    
    quests.projects.forEach(project => {
      const card = document.createElement('div');
      card.className = 'quest-card fade-in';
      
      const links = [];
      if (project.github) {
        links.push(`
          <a href="${project.github}" target="_blank" rel="noopener" class="quest-link" title="GitHub">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        `);
      }
      if (project.demo) {
        links.push(`
          <a href="${project.demo}" target="_blank" rel="noopener" class="quest-link" title="Live Demo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        `);
      }
      
      card.innerHTML = `
        <div class="quest-header">
          <span class="quest-icon">${project.icon}</span>
          <h4 class="quest-title">${project.title}</h4>
          <div class="quest-links">${links.join('')}</div>
        </div>
        <div class="quest-usecase">
          <span class="usecase-label">🎯 The Problem It Solves</span>
          <p>${project.useCase}</p>
        </div>
        <div class="quest-tech">
          ${project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
        </div>
      `;
      
      grid.appendChild(card);
    });
  }

  renderEducation() {
    const { education } = this.content;

    document.getElementById('education-eyebrow').textContent = education.eyebrow;
    document.getElementById('education-title').textContent = education.title;

    const content = document.getElementById('education-content');
    
    content.innerHTML = `
      <div class="education-card fade-in">
        <div class="education-icon">🎓</div>
        <div class="education-info">
          <h4 class="education-school">${education.school}</h4>
          <p class="education-degree">${education.degree}</p>
          <div class="education-meta">
            <span class="period">${education.period}</span>
            <span class="gpa">${education.gpa}</span>
          </div>
          <p class="education-location">${education.location}</p>
        </div>
      </div>
    `;
  }

  renderPhilosophy() {
    const { philosophy } = this.content;

    document.getElementById('philosophy-eyebrow').textContent = philosophy.eyebrow;
    document.getElementById('philosophy-title').textContent = philosophy.title;
    document.getElementById('philosophy-subtitle').textContent = philosophy.subtitle;

    const grid = document.getElementById('philosophy-cards');
    
    philosophy.cards.forEach((card, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = `philosophy-card fade-in stagger-${(index % 6) + 1}`;
      cardEl.innerHTML = `
        <div class="philosophy-icon">${card.icon}</div>
        <h4>${card.title}</h4>
        <p>${card.text}</p>
      `;
      grid.appendChild(cardEl);
    });
  }

  renderContact() {
    const { contact } = this.content;

    document.getElementById('contact-label').textContent = contact.label;
    document.getElementById('contact-title').textContent = contact.title;
    document.getElementById('contact-subtitle').textContent = contact.subtitle;

    const infoContainer = document.getElementById('contact-info');
    const contactIcons = {
      Email: `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="5" width="18" height="14" rx="2" ry="2"/>
          <polyline points="3 7 12 13 21 7"/>
        </svg>
      `,
      GitHub: `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577v-2.234C5.66 21.273 4.967 19.143 4.967 19.143c-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.5 11.5 0 0 1 6.002 0c2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.563 21.8 24 17.301 24 12c0-6.63-5.373-12-12-12Z"/>
        </svg>
      `,
      LinkedIn: `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 23.5h4V7.5h-4v16zM8.5 7.5v16h4v-8.4c0-2.2 2.8-2.4 2.8 0v8.4h4v-10c0-5.5-6.2-5.3-7.8-2.6V7.5h-3z"/>
        </svg>
      `
    };

    contact.items.forEach(item => {
      const itemEl = document.createElement('a');
      itemEl.href = item.link;
      itemEl.className = 'contact-item';
      itemEl.target = item.link.startsWith('mailto:') ? '_self' : '_blank';
      itemEl.rel = 'noopener';
      itemEl.innerHTML = `
        <div class="contact-item-top">
          <span class="contact-item-icon">${contactIcons[item.label] || ''}</span>
          <div>
            <div class="contact-item-label">${item.label}</div>
            <div class="contact-item-value">${item.value}</div>
          </div>
        </div>
      `;
      infoContainer.appendChild(itemEl);
    });

    document.getElementById('name').placeholder = contact.placeholders.name;
    document.getElementById('email').placeholder = contact.placeholders.email;
    document.getElementById('message').placeholder = contact.placeholders.message;

    // Inquiry type tags
    const tagsContainer = document.getElementById('inquiry-tags');
    const hiddenInput = document.getElementById('inquiry-type');
    let activeType = '';

    contact.formTypes.forEach(type => {
      const tag = document.createElement('button');
      tag.type = 'button';
      tag.className = 'inquiry-tag';
      tag.textContent = type;
      tag.addEventListener('click', () => {
        activeType = type;
        hiddenInput.value = type;
        Array.from(tagsContainer.children).forEach(btn => btn.classList.remove('active'));
        tag.classList.add('active');
      });
      tagsContainer.appendChild(tag);
    });

    // Preselect first type
    if (tagsContainer.firstChild) {
      tagsContainer.firstChild.click();
    }

    document.getElementById('submit-text').textContent = contact.submitText;
    document.getElementById('contact-quote').textContent = contact.quote;
  }

  renderFooter() {
    const { footer } = this.content;

    document.getElementById('footer-copyright').textContent = `© ${new Date().getFullYear()} ${footer.copyright}`;
    
    const taglineEl = document.getElementById('footer-tagline');
    if (taglineEl && footer.tagline) {
      taglineEl.textContent = footer.tagline;
    }

    const sectionsContainer = document.getElementById('footer-sections');
    if (sectionsContainer && footer.sections) {
      footer.sections.forEach(section => {
        const sectionEl = document.createElement('div');
        sectionEl.className = 'footer-section';
        sectionEl.innerHTML = `
          <h4 class="footer-section-title">${section.title}</h4>
          <div class="footer-section-links">
            ${section.links.map(link => `
              <a href="${link.url}" class="footer-link" ${link.url.startsWith('#') ? '' : 'target="_blank" rel="noopener"'}>${link.text}</a>
            `).join('')}
          </div>
        `;
        sectionsContainer.appendChild(sectionEl);
      });
    }

    const bottomTextEl = document.getElementById('footer-bottom-text');
    if (bottomTextEl && footer.bottomText) {
      bottomTextEl.textContent = footer.bottomText;
    }
  }
}
