/* ============================================
   AGÊNCIA LUSSO — /sobre page JavaScript
   Minimal: Lenis smooth scroll, header hide-on-scroll,
   hamburger, .reveal animations.
   ============================================ */

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// LENIS SMOOTH SCROLL
const lenis = new Lenis({
  lerp: 0.1,
  duration: 1.2,
  orientation: 'vertical',
  smoothWheel: true,
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// HEADER hide-on-scroll-down, show-on-scroll-up
function initHeader() {
  const header = document.querySelector('.header');
  let lastScrollY = 0;
  let ticking = false;

  function updateHeader() {
    const scrollY = window.scrollY;

    if (scrollY < 100) {
      header.classList.remove('scrolled');
      header.classList.remove('scrolled-down');
      header.classList.remove('header-active');
      lastScrollY = scrollY;
      ticking = false;
      return;
    }

    header.classList.add('scrolled');

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

// HAMBURGER MENU
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

// REVEAL animations — fade-in any element with .reveal
function initReveals() {
  document.querySelectorAll('.reveal').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });

  // Info-row stagger (matches home page behavior)
  const infoRows = document.querySelectorAll('.info-row');
  if (infoRows.length) {
    gsap.to(infoRows, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.info-rows-section', start: 'top 85%', once: true },
    });
  }
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initHamburger();

  if (prefersReducedMotion()) {
    document.querySelectorAll('.reveal').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  } else {
    initReveals();
  }
});
