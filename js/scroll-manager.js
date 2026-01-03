// Scroll Manager - Handles scroll-based animations and progress

export class ScrollManager {
  constructor() {
    this.progressBar = document.getElementById('progress-bar');
    this.fadeElements = [];
    this.skillBars = [];
  }

  init() {
    this.setupProgressBar();
    this.setupIntersectionObserver();
  }

  setupProgressBar() {
    // Create a beautiful themed progress bar in header
    const nav = document.getElementById('nav');
    if (nav && this.progressBar) {
      // Move progress bar inside nav for better positioning
      this.progressBar.style.position = 'absolute';
      this.progressBar.style.bottom = '0';
      this.progressBar.style.left = '0';
      this.progressBar.style.height = '2px';
      this.progressBar.style.width = '0%';
      this.progressBar.style.transform = 'none';
    }

    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
          const scrollProgress = (window.scrollY / scrollHeight) * 100;
          
          if (this.progressBar) {
            this.progressBar.style.width = `${scrollProgress}%`;
          }
          
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  setupIntersectionObserver() {
    // Fade in elements when they come into view
    const options = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, options);

    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => {
      observer.observe(el);
    });
  }
}
