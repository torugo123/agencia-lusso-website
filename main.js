/* ============================================
   AGÊNCIA LUSSO — Main JavaScript
   GSAP + ScrollTrigger + Lenis + SplitType
   ============================================ */

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

// ============================================
// LENIS SMOOTH SCROLL
// ============================================
const lenis = new Lenis({
  lerp: 0.1,
  duration: 1.2,
  orientation: 'vertical',
  smoothWheel: true,
});

// Stop scroll during loading
lenis.stop();

// Sync Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// ============================================
// LOADING SCREEN
// ============================================
function initLoader() {
  const loader = document.querySelector('.loader');
  const loaderLogo = document.querySelector('.loader-logo');

  const tl = gsap.timeline({
    onComplete: () => {
      loader.style.display = 'none';
      lenis.start();
      initScrollAnimations();
      // Show WhatsApp button after 3s delay
      setTimeout(() => {
        document.querySelector('.whatsapp-fab')?.classList.add('visible');
      }, 3000);
    },
  });

  // Fade in + slide up the logo
  tl.to(loaderLogo, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power3.out',
  })
    // Hold for a moment
    .to(loaderLogo, {
      scale: 1.05,
      duration: 0.6,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: 1,
    })
    // Slide the loader away
    .to(
      loader,
      {
        yPercent: -100,
        duration: 0.8,
        ease: 'power4.inOut',
      },
      '-=0.3'
    );
}

// ============================================
// HEADER — Hide on scroll down, show on scroll up
// ============================================
function initHeader() {
  const header = document.querySelector('.header');
  let lastScrollY = 0;
  let ticking = false;

  function updateHeader() {
    const scrollY = window.scrollY;

    // Below 100px — fully transparent, no classes
    if (scrollY < 100) {
      header.classList.remove('scrolled');
      header.classList.remove('scrolled-down');
      header.classList.remove('header-active');
      lastScrollY = scrollY;
      ticking = false;
      return;
    }

    // Past 100px — add scrolled bg
    header.classList.add('scrolled');

    // Hide on scroll down, show on scroll up
    if (scrollY > lastScrollY && scrollY > 200) {
      header.classList.add('scrolled-down');
      header.classList.remove('header-active');
    } else {
      header.classList.remove('scrolled-down');
      header.classList.add('header-active');
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  });
}

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
// SPLIT TEXT ANIMATIONS
// ============================================
function initSplitText() {
  const splitElements = document.querySelectorAll('.split-text');

  splitElements.forEach((el) => {
    const split = new SplitType(el, { types: 'lines' });

    // Wrap each line for overflow hidden
    split.lines?.forEach((line) => {
      const wrapper = document.createElement('div');
      wrapper.style.overflow = 'hidden';
      line.parentNode.insertBefore(wrapper, line);
      wrapper.appendChild(line);
    });

    gsap.from(split.lines, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        once: true,
      },
    });
  });
}

// ============================================
// SCROLL-TRIGGERED ANIMATIONS
// ============================================
function initScrollAnimations() {
  // Split text
  initSplitText();

  // Reveal elements
  const reveals = document.querySelectorAll('.reveal');
  reveals.forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
    });
  });

  // Hero cards stagger
  const heroCards = document.querySelectorAll('.hero-card');
  if (heroCards.length) {
    gsap.to(heroCards, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.hero-cards',
        start: 'top 85%',
        once: true,
      },
    });
  }

  // Info rows stagger
  const infoRows = document.querySelectorAll('.info-row');
  if (infoRows.length) {
    gsap.to(infoRows, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.info-rows-section',
        start: 'top 85%',
        once: true,
      },
    });
  }

  // Pre-footer cards stagger
  const preFooterCards = document.querySelectorAll('.pre-footer-card');
  if (preFooterCards.length) {
    gsap.to(preFooterCards, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.pre-footer-cards',
        start: 'top 85%',
        once: true,
      },
    });
  }

  // Hero image parallax
  const heroImage = document.querySelector('.hero-image');
  if (heroImage) {
    gsap.to(heroImage, {
      y: '-15%',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }
}

// ============================================
// MARQUEE MOBILE SPEED
// ============================================
function initMarqueeSpeed() {
  if (window.innerWidth > 768) return;
  document.querySelectorAll('.marquee-track').forEach((track) => {
    track.style.animationDuration = '30s';
  });
}

// ============================================
// SCROLL TO TOP
// ============================================
function initScrollToTop() {
  const btn = document.querySelector('.scroll-top');
  if (!btn) return;

  btn.addEventListener('click', () => {
    lenis.scrollTo(0, { duration: 1.5 });
  });
}

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -107 });
      }
    });
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
  initHeader();
  initHamburger();
  initMarqueeSpeed();
  initScrollToTop();
  initSmoothAnchors();

  if (prefersReducedMotion()) {
    // Skip animations, just show everything
    document.querySelector('.loader').style.display = 'none';
    document.querySelectorAll('.reveal').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    lenis.start();
    document.querySelector('.whatsapp-fab')?.classList.add('visible');
  } else {
    initLoader();
  }
});
