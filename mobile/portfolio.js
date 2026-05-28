import { initChrome } from './chrome.js';
import { initReveals } from './reveal.js';
import { galleryImages } from '../portfolio-data.js';

function start() {
  initChrome();
  initCards();
  initReveals('.reveal');
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();

function initCards() {
  document.querySelectorAll('.pf-card').forEach((card) => {
    const slug = card.dataset.slug;
    const name = card.dataset.name || '';
    const cat = card.dataset.cat || '';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `ver galeria ${name} — ${cat}`);
    const open = () => openGallery(slug, name, cat);
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });
}

function openGallery(slug, name, cat) {
  const imgs = galleryImages[slug];
  if (!imgs || !imgs.length) return;
  const lastFocus = document.activeElement;

  const overlay = document.createElement('div');
  overlay.className = 'm-gallery';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', `galeria ${name}`);
  overlay.innerHTML =
    `<div class="m-gallery-head">
       <div><div class="m-gallery-title">${name}</div><div class="m-gallery-cat">${cat}</div></div>
       <button class="m-gallery-close" aria-label="fechar galeria">&times;</button>
     </div>
     <div class="m-gallery-grid">
       ${imgs.map((f, i) => `<img src="/images/portfolio/${slug}/${f}" alt="${name} — ${i + 1} de ${imgs.length}" loading="lazy">`).join('')}
     </div>`;
  document.body.appendChild(overlay);
  document.documentElement.style.overflow = 'hidden';
  requestAnimationFrame(() => overlay.classList.add('active'));

  const closeBtn = overlay.querySelector('.m-gallery-close');
  closeBtn.focus();

  const close = () => {
    overlay.classList.remove('active');
    document.documentElement.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    setTimeout(() => overlay.remove(), 300);
    if (lastFocus) lastFocus.focus();
  };
  const onKey = (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') { e.preventDefault(); closeBtn.focus(); }
  };
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onKey);
}
