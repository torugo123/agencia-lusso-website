/* ============================================
   AGÊNCIA LUSSO — Contact Page JavaScript
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

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// ============================================
// HEADER — Hide on scroll down, show on scroll up
// ============================================
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
// CONTACT FAQ ACCORDION
// ============================================
function initContactFAQ() {
  document.querySelectorAll('.faq-item').forEach((item) => {
    item.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all
      document.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('active'));

      // Open clicked (if it wasn't active)
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

// ============================================
// CONTACT PAGE ANIMATIONS
// ============================================
function initContactAnimations() {
  // Hero H1 — SplitType chars + stagger
  const contactH1 = document.querySelector('.contact-hero h1');
  if (contactH1) {
    const split = new SplitType(contactH1, { types: 'chars' });
    gsap.from(split.chars, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.03,
      ease: 'power3.out',
      delay: 0.2,
    });
  }

  // Form section — slide up on scroll
  const formContent = document.querySelector('.contact-form-section .s-content');
  if (formContent) {
    gsap.from(formContent, {
      scrollTrigger: {
        trigger: '.contact-form-section',
        start: 'top 80%',
        once: true,
      },
      opacity: 0,
      y: 60,
      duration: 0.8,
      ease: 'power3.out',
    });
  }

  // Address blocks — stagger
  const addressBlocks = document.querySelectorAll('.address-block');
  if (addressBlocks.length) {
    gsap.from(addressBlocks, {
      scrollTrigger: {
        trigger: '.contact-address',
        start: 'top 75%',
        once: true,
      },
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power3.out',
    });
  }

  // FAQ items — stagger
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length) {
    gsap.from(faqItems, {
      scrollTrigger: {
        trigger: '.contact-faq',
        start: 'top 75%',
        once: true,
      },
      opacity: 0,
      y: 20,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power3.out',
    });
  }

  // CTA bottom — heading reveal with SplitType lines
  const ctaH2 = document.querySelector('.contact-cta h2');
  if (ctaH2) {
    const splitCta = new SplitType(ctaH2, { types: 'lines' });
    gsap.from(splitCta.lines, {
      scrollTrigger: {
        trigger: '.contact-cta',
        start: 'top 70%',
        once: true,
      },
      opacity: 0,
      y: 50,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power3.out',
    });
  }
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
  initContactFAQ();
  initSmoothAnchors();

  if (!prefersReducedMotion()) {
    initContactAnimations();
  }
});
