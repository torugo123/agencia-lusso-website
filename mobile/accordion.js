import { animate } from 'motion';
const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

let uid = 0;

/**
 * Turn a list of items into a single-open accordion.
 * @param {Element} root container holding the items
 * @param {object} cfg { item, trigger, panel } CSS selectors relative to root/item
 */
export function initAccordion(root, cfg) {
  if (!root) return;
  const items = root.querySelectorAll(cfg.item);
  const entries = [];

  items.forEach((item) => {
    const triggerEl = item.querySelector(cfg.trigger);
    const panel = item.querySelector(cfg.panel);
    if (!triggerEl || !panel) return;

    item.classList.add('m-acc-item');
    panel.classList.add('m-acc-panel');
    // wrap panel content so we can measure natural height
    const inner = document.createElement('div');
    inner.className = 'm-acc-panel-inner';
    while (panel.firstChild) inner.appendChild(panel.firstChild);
    panel.appendChild(inner);

    // Build a real <button> trigger (keyboard accessible) preserving the label text.
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'm-acc-trigger';
    const id = `m-acc-${++uid}`;
    panel.id = `${id}-panel`;
    btn.id = `${id}-btn`;
    btn.setAttribute('aria-controls', panel.id);
    btn.setAttribute('aria-expanded', 'false');
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', btn.id);
    btn.innerHTML = `<span>${triggerEl.textContent.trim()}</span><span class="m-acc-sign" aria-hidden="true"></span>`;
    // Preserve heading semantics: if the trigger was a heading, keep its level by
    // wrapping the button in the same heading tag (a button is valid phrasing content
    // inside a heading). Non-heading triggers (e.g. .faq-question div) are replaced directly.
    const tag = triggerEl.tagName;
    if (/^H[1-6]$/.test(tag)) {
      const heading = document.createElement(tag);
      heading.className = 'm-acc-heading';
      heading.appendChild(btn);
      triggerEl.replaceWith(heading);
    } else {
      triggerEl.replaceWith(btn);
    }

    // collapsed by default (JS-applied; CSS leaves panels open for no-JS)
    panel.style.height = '0px';
    entries.push({ btn, panel, inner, open: false });

    btn.addEventListener('click', () => toggle(entry(btn)));
  });

  function entry(btn) { return entries.find((e) => e.btn === btn); }

  function toggle(e) {
    if (!e) return;
    if (e.open) { collapse(e); return; }
    entries.forEach((other) => { if (other !== e && other.open) collapse(other); });
    expand(e);
  }
  function expand(e) {
    e.open = true; e.btn.setAttribute('aria-expanded', 'true');
    const target = e.inner.offsetHeight;
    if (reduce) { e.panel.style.height = 'auto'; return; }
    animate(e.panel, { height: ['0px', target + 'px'] }, { duration: 0.35, ease: [0.22, 0.61, 0.36, 1] })
      .finished.then(() => { if (e.open) e.panel.style.height = 'auto'; });
  }
  function collapse(e) {
    e.open = false; e.btn.setAttribute('aria-expanded', 'false');
    const current = e.panel.offsetHeight;
    if (reduce) { e.panel.style.height = '0px'; return; }
    // offsetHeight above already forced a style flush, so animate in the same frame
    // (no rAF — a deferred callback could fire after a fast re-tap and fight the new animation).
    e.panel.style.height = current + 'px';
    animate(e.panel, { height: [current + 'px', '0px'] }, { duration: 0.3, ease: [0.22, 0.61, 0.36, 1] });
  }
}
