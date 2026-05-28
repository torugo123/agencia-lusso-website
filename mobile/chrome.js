// Shared mobile chrome: header show/hide, menu (focus trap/Esc/scroll-lock), FAB.
const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

export function initChrome() {
  initHeader();
  initMenu();
  initFab();
}

function initHeader() {
  const header = document.querySelector('.header, .portfolio-header');
  if (!header) return;
  let last = window.scrollY, ticking = false;
  const update = () => {
    const y = window.scrollY;
    header.classList.toggle('m-scrolled', y > 80);
    if (y > 200 && y > last) header.classList.add('m-hidden');
    else header.classList.remove('m-hidden');
    last = y; ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
}

function initMenu() {
  const burger = document.querySelector('.hamburger');
  const menu = document.querySelector('.mobile-menu');
  if (!burger || !menu) return;

  // Inject close button + CTA + instagram (idempotent).
  if (!menu.querySelector('.m-menu-close')) {
    const close = document.createElement('button');
    close.className = 'm-menu-close';
    close.setAttribute('aria-label', 'fechar menu');
    close.innerHTML = '&times;';
    menu.appendChild(close);
    const cta = document.createElement('a');
    cta.className = 'm-menu-cta'; cta.href = '/contato.html'; cta.textContent = 'fale conosco';
    menu.appendChild(cta);
    const ig = document.createElement('a');
    ig.className = 'm-menu-ig'; ig.href = 'https://www.instagram.com/agencialusso';
    ig.target = '_blank'; ig.rel = 'noopener noreferrer'; ig.textContent = 'instagram';
    menu.appendChild(ig);
  }

  menu.setAttribute('aria-modal', 'true');
  burger.setAttribute('aria-controls', 'mobile-menu');
  menu.id = menu.id || 'mobile-menu';

  let lastFocus = null;
  const focusables = () => menu.querySelectorAll('a[href],button');

  const open = () => {
    lastFocus = document.activeElement;
    menu.classList.add('active'); burger.classList.add('active');
    burger.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
    const f = focusables(); if (f.length) f[0].focus();
    document.addEventListener('keydown', onKey);
  };
  const close = () => {
    menu.classList.remove('active'); burger.classList.remove('active');
    burger.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    if (lastFocus) lastFocus.focus();
  };
  const onKey = (e) => {
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') {
      const f = Array.from(focusables()); if (!f.length) return;
      const first = f[0], lastEl = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
    }
  };

  burger.addEventListener('click', () => menu.classList.contains('active') ? close() : open());
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a') || e.target.closest('.m-menu-close')) close();
  });
}

function initFab() {
  const fab = document.querySelector('.whatsapp-fab');
  if (!fab) return;
  if (reduce) { fab.classList.add('visible'); return; }
  setTimeout(() => fab.classList.add('visible'), 600);
}
