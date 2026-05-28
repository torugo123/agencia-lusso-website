import { initChrome } from './chrome.js';
import { initReveals, initStagger } from './reveal.js';
import { initAccordion } from './accordion.js';

function start() {
  initChrome();

  // Services → accordion (info-rows on home).
  const services = document.querySelector('#services .container');
  if (services) {
    // add a small section label above the rows
    if (!services.querySelector('.m-section-label')) {
      const label = document.createElement('div');
      label.className = 'm-label m-section-label';
      label.textContent = 'o que fazemos';
      services.prepend(label);
    }
    initAccordion(services, { item: '.info-row', trigger: '.info-row-title', panel: '.info-row-text' });
  }

  // Inject ONE full-bleed image section before the dark CTA (image-led direction).
  const ctaDark = document.querySelector('.cta-dark');
  if (ctaDark && !document.querySelector('.m-bleed-figure')) {
    const fig = document.createElement('figure');
    fig.className = 'm-bleed-figure m-bleed';
    fig.innerHTML =
      '<img src="/images/card-social.webp" alt="" loading="lazy">' +
      '<figcaption class="m-bleed-label">estratégia, estética e resultado</figcaption>';
    ctaDark.parentNode.insertBefore(fig, ctaDark);
  }

  // Reveals + staggers.
  initReveals('.reveal');
  initStagger('.hero-cards', '.hero-card');
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
