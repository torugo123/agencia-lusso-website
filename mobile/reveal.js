import { inView, animate, stagger } from 'motion';

const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

// Reveal individual elements matching `selector` as they enter the viewport.
export function initReveals(selector = '.reveal, [data-reveal]') {
  const els = document.querySelectorAll(selector);
  if (reduce) { els.forEach(clearInit); return; }
  els.forEach((el) => el.classList.add('m-reveal-init'));
  // motion's inView callback may receive the element or an IntersectionObserverEntry —
  // normalize to the element so this works across motion versions.
  inView(selector, (info) => {
    const el = info && info.target ? info.target : info;
    animate(el,
      { opacity: [0, 1], transform: ['translateY(24px)', 'translateY(0)'] },
      { duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }
    );
    el.classList.remove('m-reveal-init');
  }, { amount: 0.15 });
}

// Reveal children of `container` with a stagger when the container enters.
export function initStagger(container, childSelector) {
  const root = typeof container === 'string' ? document.querySelector(container) : container;
  if (!root) return;
  const children = root.querySelectorAll(childSelector);
  if (!children.length) return;
  if (reduce) { children.forEach(clearInit); return; }
  children.forEach((c) => c.classList.add('m-reveal-init'));
  inView(root, () => {
    animate(children,
      { opacity: [0, 1], transform: ['translateY(24px)', 'translateY(0)'] },
      { duration: 0.6, delay: stagger(0.08), ease: [0.22, 0.61, 0.36, 1] }
    );
    children.forEach((c) => c.classList.remove('m-reveal-init'));
  }, { amount: 0.1 });
}

function clearInit(el) { el.classList.remove('m-reveal-init'); el.style.opacity = '1'; el.style.transform = 'none'; }
