/* ============================================
   AGÊNCIA LUSSO — Portfolio Page JavaScript
   GSAP entry animations + hover interactions
   ============================================ */

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';

// ============================================
// LENIS SMOOTH SCROLL
// ============================================
const lenis = new Lenis({
  lerp: 0.1,
  duration: 1.2,
  orientation: 'vertical',
  smoothWheel: true,
});

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// ============================================
// HAMBURGER MENU
// ============================================
function initHamburger() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const menuLinks = mobileMenu?.querySelectorAll('a');

  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isActive = hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isActive);

    if (isActive) {
      lenis.stop();
    } else {
      lenis.start();
    }
  });

  menuLinks?.forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      lenis.start();
    });
  });
}

// ============================================
// PROJECT HOVER INTERACTION
// ============================================
function initProjectHover() {
  const projectItems = document.querySelectorAll('.project-item');
  const images = document.querySelectorAll('.portfolio-image');

  if (!projectItems.length || !images.length) return;

  projectItems.forEach((item) => {
    item.addEventListener('mouseenter', () => {
      const index = parseInt(item.dataset.index, 10);

      // Remove active from all items
      projectItems.forEach((p) => p.classList.remove('active'));

      // Handle image transition
      images.forEach((img) => {
        if (img.classList.contains('active')) {
          img.classList.remove('active');
          img.classList.add('previous');
          setTimeout(() => img.classList.remove('previous'), 600);
        }
      });

      // Activate hovered
      item.classList.add('active');
      if (images[index]) {
        images[index].classList.add('active');
      }
    });
  });
}

// ============================================
// PROJECT GALLERY DATA
// ============================================
const galleryImages = {
  'purpose': ['42.png', '56.png', '64.png', '77.png', '83.png', '87.png', 'dia-do-consumidor.png'],
  'halo-beauty': ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png', '11.png', '12.png', '13.png', '14.png'],
  'acervo-moda': ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png', '11.png'],
  'cym': ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '8.png', '9.png', '10.png'],
  'cy': ['38.png', '39.png', '53.png', '58.png', '82.png', '100.png', '104.png', '111.png'],
  'himawari': ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png'],
  'lu-godoy': ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png', '11.png', '12.png'],
};

// ============================================
// PROJECT GALLERY (click to open)
// ============================================
function initProjectGallery() {
  const projectItems = document.querySelectorAll('.project-item');
  const centerImages = document.querySelectorAll('.portfolio-image');
  const gridCards = document.querySelectorAll('.portfolio-grid-card');

  function openGallery(slug, projectName) {
    const images = galleryImages[slug];
    if (!images || !images.length) return;

    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    overlay.innerHTML = `
      <div class="gallery-header">
        <span class="gallery-title">${projectName}</span>
        <button class="gallery-close">&times;</button>
      </div>
      <div class="gallery-grid">
        ${images.map((img) => `<img src="/images/portfolio/${slug}/${img}" alt="${projectName}" loading="lazy" />`).join('')}
      </div>
    `;
    document.body.appendChild(overlay);
    lenis.stop();

    requestAnimationFrame(() => overlay.classList.add('active'));

    overlay.querySelector('.gallery-close').addEventListener('click', closeGallery);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeGallery();
    });

    function closeGallery() {
      overlay.classList.remove('active');
      lenis.start();
      setTimeout(() => overlay.remove(), 300);
    }
  }

  // Click on project item name
  projectItems.forEach((item) => {
    item.addEventListener('click', () => {
      const slug = item.dataset.slug;
      const name = item.querySelector('.project-name')?.textContent || slug;
      openGallery(slug, name);
    });
  });

  // Click on center image
  centerImages.forEach((img) => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => {
      const src = img.getAttribute('src') || '';
      const slug = Object.keys(galleryImages).find((s) => src.includes(s));
      if (slug) openGallery(slug, slug);
    });
  });

  // Click on grid card
  gridCards.forEach((card) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const imgSrc = card.querySelector('img')?.getAttribute('src') || '';
      const name = card.querySelector('.card-name')?.textContent || '';
      const slug = Object.keys(galleryImages).find((s) => imgSrc.includes(s));
      if (slug) openGallery(slug, name);
    });
  });
}

// ============================================
// VIEW TOGGLE (LIST / GRID)
// ============================================
function initViewToggle() {
  const toggles = document.querySelectorAll('.view-toggle span');
  const portfolioPage = document.querySelector('.portfolio-page');

  if (!toggles.length || !portfolioPage) return;

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      toggles.forEach((t) => t.classList.remove('active'));
      toggle.classList.add('active');

      if (toggle.dataset.view === 'grid') {
        portfolioPage.classList.add('view-grid');
      } else {
        portfolioPage.classList.remove('view-grid');
      }
    });
  });
}

// ============================================
// GSAP ENTRY ANIMATIONS
// ============================================
function initEntryAnimations() {
  // Header + footer fade in (clearProps so CSS takes over after)
  gsap.from('.portfolio-header, .portfolio-footer', {
    opacity: 0,
    duration: 0.5,
    delay: 0.2,
    clearProps: 'all',
  });

  // Project items stagger (clearProps so CSS hover rules work after)
  gsap.from('.project-item', {
    opacity: 0,
    y: 30,
    duration: 0.6,
    stagger: 0.08,
    ease: 'power3.out',
    delay: 0.3,
    clearProps: 'all',
  });

  // View toggle
  gsap.from('.view-toggle', {
    opacity: 0,
    duration: 0.5,
    delay: 0.4,
    clearProps: 'all',
  });
}

// ============================================
// REDUCED MOTION CHECK
// ============================================
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initHamburger();
  initProjectHover();
  initProjectGallery();
  initViewToggle();

  if (!prefersReducedMotion()) {
    initEntryAnimations();
  }
});
