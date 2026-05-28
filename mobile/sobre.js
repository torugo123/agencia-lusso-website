import { initChrome } from './chrome.js';
import { initReveals } from './reveal.js';
import { initAccordion } from './accordion.js';

function start() {
  initChrome();

  // Founder portrait (full-bleed) right after the hero.
  const hero = document.querySelector('.about-hero');
  if (hero && !document.querySelector('.m-founder')) {
    const fig = document.createElement('figure');
    fig.className = 'm-founder m-bleed';
    fig.innerHTML = '<img src="/images/about.webp" alt="Maria Eduarda (Madu), fundadora da Agência Lusso" loading="eager">';
    hero.after(fig);
  }

  // Story rows → accordion (origem / fundadora / foco / filosofia).
  const story = document.querySelector('.info-rows-section .container');
  if (story) initAccordion(story, { item: '.info-row', trigger: '.info-row-title', panel: '.info-row-text' });

  initReveals('.reveal');
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
