// Main Application Entry
import { Renderer } from './renderer.js';
import { ScrollManager } from './scroll-manager.js';

class App {
  constructor() {
    this.content = null;
    this.renderer = null;
    this.scrollManager = null;
  }

  async init() {
    try {
      // Load content
      const response = await fetch('./content.json');
      this.content = await response.json();
      
      // Initialize renderer
      this.renderer = new Renderer(this.content);
      this.renderer.render();
      
      // Initialize scroll manager
      this.scrollManager = new ScrollManager();
      this.scrollManager.init();
      
      // Setup navigation
      this.setupNavigation();
      
      // Hide loader
      this.hideLoader();
      
      // Setup form
      this.setupForm();
      
      // Setup hero parallax effect
      this.setupHeroParallax();
      
      // Animate chapters on scroll
      this.setupChapterAnimations();
      
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  }

  setupHeroParallax() {
    const floatingElements = document.querySelectorAll('[data-parallax]');
    const hero = document.querySelector('.hero');
    
    if (floatingElements.length === 0) return;

    let ticking = false;
    let mouseX = 0;
    let mouseY = 0;

    // Smooth mouse parallax on hero
    const updateMouseParallax = () => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      floatingElements.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.5;
        const xOffset = (mouseX - centerX) * speed * 0.03;
        const yOffset = (mouseY - centerY) * speed * 0.03;
        
        el.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
      });
      
      ticking = false;
    };

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      if (!ticking) {
        requestAnimationFrame(updateMouseParallax);
        ticking = true;
      }
    });

    // Fade out floating elements on scroll
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const heroHeight = hero?.offsetHeight || window.innerHeight;
      const opacity = Math.max(0, 1 - (scrollY / (heroHeight * 0.6)));
      
      floatingElements.forEach(el => {
        el.style.opacity = opacity * 0.25; // Base opacity is 0.25
      });
    });
  }

  setupChapterAnimations() {
    const chapters = document.querySelectorAll('.chapter');
    if (chapters.length === 0) return;

    this.createChapterIndicators(chapters);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            const index = parseInt(entry.target.dataset.index, 10);
            this.updateChapterIndicators(index);
          }
        });
      },
      {
        rootMargin: '0px 0px -15% 0px',
        threshold: 0.1,
      }
    );

    chapters.forEach((chapter, index) => {
      chapter.dataset.index = index;
      observer.observe(chapter);
    });
  }

  createChapterIndicators(chapters) {
    const indicator = document.createElement('div');
    indicator.className = 'chapter-progress-indicator';
    indicator.id = 'chapter-indicator';
    indicator.innerHTML = `
      <div class="chapter-progress-track">
        ${Array.from(chapters).map((_, i) => `
          <div class="chapter-dot" data-chapter="${i}">
            <span class="chapter-dot-inner"></span>
            <span class="chapter-dot-label">Ch.${String(i + 1).padStart(2, '0')}</span>
          </div>
        `).join('')}
        <div class="chapter-progress-line"></div>
      </div>
    `;
    document.body.appendChild(indicator);
    
    // Click to scroll to chapter
    indicator.querySelectorAll('.chapter-dot').forEach((dot, i) => {
      dot.addEventListener('click', () => {
        chapters[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    // Show/hide based on scroll position (only visible in chapters area)
    const chaptersContainer = document.getElementById('chapters');
    
    window.addEventListener('scroll', () => {
      if (chaptersContainer) {
        const containerRect = chaptersContainer.getBoundingClientRect();
        const isInChaptersArea = containerRect.top < window.innerHeight / 2 && containerRect.bottom > window.innerHeight / 2;
        indicator.classList.toggle('visible', isInChaptersArea);
      }
    });
  }

  updateChapterIndicators(currentIndex) {
    const dots = document.querySelectorAll('.chapter-dot');
    const progressLine = document.querySelector('.chapter-progress-line');
    
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
      dot.classList.toggle('passed', i < currentIndex);
    });
    
    if (progressLine && dots.length > 0) {
      const progress = (currentIndex / (dots.length - 1)) * 100;
      progressLine.style.height = `${progress}%`;
    }
  }

  hideLoader() {
    const loader = document.getElementById('loader');
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 1600);
  }

  setupNavigation() {
    const nav = document.getElementById('nav');
    const toggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    // Scroll behavior for nav
    let lastScrollY = 0;
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
      
      lastScrollY = currentScrollY;
    });

    // Mobile menu toggle
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.classList.toggle('menu-open');
    });

    // Close mobile menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
      });
    });

    // Smooth scroll for anchor links - without changing URL hash
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const navHeight = nav.offsetHeight;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // Update URL without hash using history API for clean URLs
          const sectionName = href.replace('#', '');
          if (sectionName && sectionName !== 'chapters') {
            history.pushState(null, '', `/${sectionName}`);
          } else if (sectionName.startsWith('chapter-')) {
            history.pushState(null, '', `/${sectionName}`);
          } else {
            history.pushState(null, '', '/');
          }
        }
      });
    });

    // Handle browser back/forward navigation
    window.addEventListener('popstate', () => {
      const path = window.location.pathname.replace('/', '');
      if (path) {
        const target = document.getElementById(path) || document.querySelector(`[id^="${path}"]`);
        if (target) {
          const navHeight = nav.offsetHeight;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
      }
    });
  }

  setupForm() {
    const form = document.getElementById('contact-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      const btn = document.getElementById('submit-btn');
      const originalText = btn.querySelector('span').textContent;
      
      // Show loading state
      btn.querySelector('span').textContent = 'Sending...';
      btn.disabled = true;
      
      try {
        // Option 1: Formspree (uncomment and add your form ID)
        // const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        //   method: 'POST',
        //   body: formData,
        //   headers: { 'Accept': 'application/json' }
        // });
        
        // Option 2: FormBuilder/FormSubmit (uncomment and add your email)
        // const response = await fetch('https://formsubmit.co/ajax/YOUR_EMAIL', {
        //   method: 'POST',
        //   body: formData,
        //   headers: { 'Accept': 'application/json' }
        // });
        
        // For now, simulate success (replace with actual integration above)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Show success message
        btn.querySelector('span').textContent = 'Message Sent! ✓';
        
        setTimeout(() => {
          btn.querySelector('span').textContent = originalText;
          btn.disabled = false;
          form.reset();
        }, 3000);
        
      } catch (error) {
        console.error('Form submission error:', error);
        btn.querySelector('span').textContent = 'Error - Try Again';
        btn.disabled = false;
        
        setTimeout(() => {
          btn.querySelector('span').textContent = originalText;
        }, 3000);
      }
    });
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
