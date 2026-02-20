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
// MOBILE: TAP TO VIEW PROJECT IMAGE
// ============================================
function initPortfolioMobile() {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isTouchDevice || window.innerWidth > 768) return;

  const items = document.querySelectorAll('.project-item');
  items.forEach((item) => {
    item.addEventListener('click', () => {
      const slug = item.dataset.slug;
      const img = document.querySelector(`.portfolio-image[src*="${slug}"]`);
      if (!img) return;

      const overlay = document.createElement('div');
      overlay.className = 'mobile-project-overlay';
      overlay.innerHTML = `
        <div class="overlay-close">&times;</div>
        <img src="${img.src}" alt="${img.alt}" />
      `;
      document.body.appendChild(overlay);

      lenis.stop();
      requestAnimationFrame(() => overlay.classList.add('active'));

      overlay.addEventListener('click', () => {
        overlay.classList.remove('active');
        lenis.start();
        setTimeout(() => overlay.remove(), 300);
      });
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
  initPortfolioMobile();
  initViewToggle();

  if (!prefersReducedMotion()) {
    initEntryAnimations();
  }
});
