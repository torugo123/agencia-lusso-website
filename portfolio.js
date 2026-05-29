/* ============================================
   AGÊNCIA LUSSO — Portfolio JavaScript
   Lenis + GSAP ScrollTrigger: reveal, column parallax, click overlay.
   ============================================ */

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { galleryImages } from './portfolio-data.js';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({ lerp: 0.1, duration: 1.2, orientation: 'vertical', smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// HAMBURGER
function initHamburger() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (!hamburger || !mobileMenu) return;
  const links = mobileMenu.querySelectorAll('a');
  hamburger.addEventListener('click', () => {
    const active = hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', active);
    active ? lenis.stop() : lenis.start();
  });
  links.forEach((l) => l.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    lenis.start();
  }));
}

// REVEAL on scroll
function initReveal() {
  document.querySelectorAll('.reveal').forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
    );
  });
}

// IMAGE PARALLAX — each image drifts vertically inside its frame as the card
// travels through the viewport (Squarespace "parallax" effect, itsdoestudio-style).
// Image is 120% tall (CSS); drifting yPercent 0 → -16.6 sweeps the full overhang.
function initParallax() {
  if (reduceMotion || window.innerWidth < 768) return;
  document.querySelectorAll('.pf-card-img img').forEach((img) => {
    const card = img.closest('.pf-card');
    gsap.fromTo(img,
      { yPercent: 0 },
      { yPercent: -16.6, ease: 'none',
        scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } }
    );
  });
}

// ENHANCED OVERLAY — header (name + category) + image grid
function initGallery() {
  function openGallery(slug, name, cat) {
    const images = galleryImages[slug];
    if (!images || !images.length) return;
    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    overlay.innerHTML = `
      <div class="gallery-header">
        <div class="gallery-header-meta">
          <span class="g-name">${name}</span>
          <span class="g-cat">${cat}</span>
        </div>
        <button class="gallery-close" aria-label="Fechar">&times;</button>
      </div>
      <div class="gallery-grid">
        ${images.map((img) => `<img src="/images/portfolio/${slug}/${img}" alt="${name}" loading="lazy" />`).join('')}
      </div>`;
    document.body.appendChild(overlay);
    lenis.stop();
    requestAnimationFrame(() => overlay.classList.add('active'));
    const close = () => { overlay.classList.remove('active'); lenis.start(); setTimeout(() => overlay.remove(), 300); };
    overlay.querySelector('.gallery-close').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function esc(e){ if(e.key==='Escape'){ close(); document.removeEventListener('keydown', esc);} });
  }

  document.querySelectorAll('.pf-card').forEach((card) => {
    card.addEventListener('click', () => {
      openGallery(card.dataset.slug, card.dataset.name || card.dataset.slug, card.dataset.cat || '');
    });
  });
}

const __onReady = (fn) => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn());
__onReady(() => {
  initHamburger();
  initGallery();
  if (reduceMotion) {
    document.querySelectorAll('.reveal').forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
  } else {
    initReveal();
    initParallax();
  }
});
