# Agência Lusso Mobile Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a from-scratch mobile experience (≤768px) for all 4 pages of the Agência Lusso site as an isolated layer that leaves the desktop site byte-for-byte unchanged.

**Architecture:** Dual media-scoped bundles. `style.css` is scoped to `(min-width:769px)`; a new self-contained `public/mobile/mobile.css` applies at `(max-width:768px)`. A tiny inline module in each HTML imports the existing desktop JS on desktop or a new `/mobile/<page>.js` module on mobile. Mobile JS progressively enhances the **same** HTML (builds accordions, an accessible gallery, the redesigned menu) using Motion One for reveals and native scroll (no Lenis/GSAP on mobile).

**Tech Stack:** Vanilla JS + Vite 7 (MPA), Motion One (`motion`), self-hosted Helvetica, Playwright (MCP) for verification.

---

## Conventions & Pre-Flight (read before Task 1)

- **Spec:** `docs/superpowers/specs/2026-05-28-mobile-rebuild-design.md`. This plan implements it.
- **Commit identity (IMPORTANT):** this repo (`github.com/torugo123/agencia-lusso-website`) must be committed as **`torugo123 <keynona123@gmail.com>`**. The repo's local git config is `blackmetal2`, so every commit in this plan uses a per-command override. Do NOT change repo config. Every commit command below already includes:
  ```bash
  git -c user.name="torugo123" -c user.email="keynona123@gmail.com" commit -m "..."
  ```
- **Brand rules (apply everywhere):** Helvetica only (weights 400/700). All copy **lowercase, no final period** — the existing HTML already follows this; do not introduce capitalized or period-terminated copy.
- **Brand tokens:** bg `#e5e3d6`, text `#31312f`, wine `#510301`, green `#e0f0d1`, white-soft `#fefefe`, muted `#707767`, beige `#dfdac6`.
- **Do NOT edit (desktop):** `style.css`, `main.js`, `portfolio.js`, `sobre.js`, `contato.js`, `portfolio-data.js`. Only the 4 HTML files' `<head>` + `<script>` tags and `package.json` change among existing files.
- **Dev server:** run `npm run dev`; Vite prints a port (5173 or next free, e.g. 5174). Use that base URL in all verification steps (referred to below as `$BASE`).
- **Verification tool:** the executing agent uses the Playwright MCP tools (`mcp__playwright__browser_resize`, `browser_navigate`, `browser_snapshot`, `browser_take_screenshot`, `browser_evaluate`, `browser_console_messages`). Always `browser_resize` to `390×844` before mobile checks. Save screenshots under `/home/shin/lusso-mobile/` (allowed root).
- **Two chrome variants:** home/sobre/contato use `<header class="header">` + `.footer`; portfolio uses `<header class="portfolio-header">` + `.portfolio-footer`. Shared selectors `.hamburger` and `.mobile-menu` exist on all 4. Mobile CSS/JS must handle both.
- **No-JS safety:** never set a hidden/collapsed state in `mobile.css`. JS applies hidden/collapsed states on init so content is fully readable if JS fails.

---

## File Structure

**New files:**
- `public/favicon.svg` — minimal favicon (kills the existing 404).
- `public/mobile/mobile.css` — entire from-scratch mobile stylesheet (tokens, @font-face, reset, base, chrome, page sections, accordion, gallery, form).
- `mobile/chrome.js` — shared: header scroll show/hide, mobile menu (open/close/focus-trap/Esc/scroll-lock + injected close button, CTA, instagram), WhatsApp FAB reveal.
- `mobile/reveal.js` — shared: Motion One `inView`→`animate` reveals + stagger; reduced-motion aware.
- `mobile/accordion.js` — shared: generic single-open accordion with ARIA + Motion One height animation.
- `mobile/home.js` — home entry: imports shared modules, builds services accordion, injects one full-bleed image section.
- `mobile/sobre.js` — sobre entry: imports shared, builds story accordion, injects founder portrait.
- `mobile/portfolio.js` — portfolio entry: makes cards focusable buttons, builds accessible gallery overlay from `portfolio-data.js`.
- `mobile/contato.js` — contato entry: form labels/validation/success placeholder, FAQ accordion.

**Modified files (existing):**
- `index.html`, `sobre.html`, `portfolio.html`, `contato.html` — `<head>` link tags + entry `<script>` only.
- `package.json` — add `motion` dependency.

---

## Task 1: Project setup + dual-bundle wiring (pilot on Home)

**Files:**
- Modify: `package.json`
- Create: `public/favicon.svg`
- Create: `mobile/home.js` (temporary stub, replaced in Task 6)
- Modify: `index.html:14-18` (head) and `index.html:337-338` (script)

- [ ] **Step 1: Install Motion One**

Run:
```bash
npm install motion@^11
```
Expected: `package.json` `dependencies` gains `"motion": "^11.x"`; no errors.

- [ ] **Step 2: Create the favicon**

Create `public/favicon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#510301"/><text x="32" y="42" font-family="Helvetica,Arial,sans-serif" font-size="28" font-weight="700" fill="#e5e3d6" text-anchor="middle">L</text></svg>
```

- [ ] **Step 3: Create a temporary home entry stub**

Create `mobile/home.js`:
```js
// Temporary stub — replaced in Task 6. Confirms the mobile bundle loads.
document.documentElement.dataset.mobileBundle = 'home';
console.log('[mobile] home bundle loaded');
```

- [ ] **Step 4: Rewire `index.html` head**

Replace `index.html` lines 17-18:
```html
  <!-- Styles -->
  <link rel="stylesheet" href="/style.css" />
```
with:
```html
  <!-- Styles: desktop scoped ≥769px (unchanged content), mobile from-scratch ≤768px -->
  <link rel="stylesheet" href="/style.css" media="(min-width:769px)" />
  <link rel="stylesheet" href="/mobile/mobile.css" media="(max-width:768px)" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
```

- [ ] **Step 5: Rewire `index.html` script**

Replace `index.html` lines 337-338:
```html
  <!-- Scripts -->
  <script type="module" src="/main.js"></script>
```
with:
```html
  <!-- Scripts: pick the bundle once at load -->
  <script type="module">
    if (window.matchMedia('(max-width:768px)').matches) {
      import('/mobile/home.js');
    } else {
      import('/main.js');
    }
  </script>
```

- [ ] **Step 6: Create an empty mobile.css so the link resolves**

Create `public/mobile/mobile.css`:
```css
/* Agência Lusso — mobile stylesheet (≤768px). Built across Tasks 2–9. */
```

- [ ] **Step 7: Verify bundle selection (Playwright MCP)**

Run `npm run dev` (note the port → `$BASE`). Then:
1. `browser_resize` 390×844 → `browser_navigate` `$BASE/` → `browser_evaluate` `() => document.documentElement.dataset.mobileBundle` → Expected: `"home"`.
2. `browser_resize` 1280×900 → `browser_navigate` `$BASE/` → `browser_evaluate` `() => document.documentElement.dataset.mobileBundle` → Expected: `undefined` (desktop loaded `main.js`, not the stub).
3. `browser_console_messages` level error → Expected: only the pre-existing favicon line is gone; no new errors.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json public/favicon.svg public/mobile/mobile.css mobile/home.js index.html
git -c user.name="torugo123" -c user.email="keynona123@gmail.com" commit -m "feat(mobile): add motion dep + dual-bundle wiring on home"
```

---

## Task 2: mobile.css foundation (tokens, font, reset, base)

**Files:**
- Modify: `public/mobile/mobile.css`

- [ ] **Step 1: Write the foundation styles**

Replace the contents of `public/mobile/mobile.css` with:
```css
/* Agência Lusso — mobile stylesheet (≤768px). Self-contained: redeclares
   font + tokens because desktop style.css is scoped to ≥769px. */

/* ---- Fonts (self-hosted Helvetica) ---- */
@font-face { font-family:'Helvetica'; src:url('/fonts/Helvetica.ttf') format('truetype'); font-weight:400; font-display:swap; }
@font-face { font-family:'Helvetica'; src:url('/fonts/Helvetica-Bold.ttf') format('truetype'); font-weight:700; font-display:swap; }

/* ---- Tokens ---- */
:root{
  --bg:#e5e3d6; --text:#31312f; --wine:#510301; --green:#e0f0d1;
  --white-soft:#fefefe; --muted:#707767; --beige:#dfdac6;
  --font:'Helvetica','Helvetica Neue',Arial,sans-serif;
  --pad:20px;            /* page side padding */
  --maxw:560px;          /* content max width on large phones */
  --ease:cubic-bezier(.22,.61,.36,1);
  --hdr-h:60px;
}

/* ---- Reset ---- */
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html{ -webkit-text-size-adjust:100%; -webkit-font-smoothing:antialiased }
body{
  font-family:var(--font); font-weight:400; font-size:16px; line-height:1.6;
  color:var(--text); background:var(--bg); overflow-x:hidden;
}
img{ display:block; max-width:100%; height:auto }
a{ color:inherit; text-decoration:none }
button{ font-family:inherit; cursor:pointer; border:none; background:none; color:inherit }
ul,ol{ list-style:none }
h1,h2,h3,h4,h5{ font-weight:400; line-height:1.12; letter-spacing:-.01em }

/* ---- Type scale (mobile) ---- */
h1{ font-size:40px } h2{ font-size:30px } h3{ font-size:20px } h4{ font-size:24px }
.m-label{ font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--muted) }

/* ---- Layout helpers ---- */
.m-wrap{ width:100%; max-width:var(--maxw); margin:0 auto; padding-left:var(--pad); padding-right:var(--pad) }
.m-section{ padding:56px 0 }
.m-bleed{ width:100% } /* full-bleed: no side padding */

/* ---- Buttons ---- */
.m-btn{ display:inline-flex; align-items:center; gap:8px; min-height:48px; padding:0 22px;
  border-radius:5px; font-size:16px; transition:transform .15s var(--ease),opacity .15s }
.m-btn:active{ transform:scale(.98) }
.m-btn--primary{ background:var(--wine); color:var(--bg) }
.m-btn--outline{ border:1px solid var(--text); color:var(--text) }
.m-btn--light{ background:var(--bg); color:var(--text) }

/* ---- Reveal pre-state is applied by JS, never here (no-JS safety) ---- */
.m-reveal-init{ opacity:0; transform:translateY(24px) }

/* ---- Reduced motion ---- */
@media (prefers-reduced-motion:reduce){
  *{ animation:none !important; transition:none !important }
}
```

- [ ] **Step 2: Verify base renders (Playwright MCP)**

`browser_resize` 390×844 → `browser_navigate` `$BASE/` → `browser_evaluate`:
```js
() => { const b=getComputedStyle(document.body); return { font:b.fontFamily, bg:b.backgroundColor }; }
```
Expected: `font` contains `Helvetica`; `bg` is `rgb(229, 227, 214)` (#e5e3d6).

- [ ] **Step 3: Commit**

```bash
git add public/mobile/mobile.css
git -c user.name="torugo123" -c user.email="keynona123@gmail.com" commit -m "feat(mobile): mobile.css foundation — tokens, font, reset, base"
```

---

## Task 3: Shared chrome — CSS + `chrome.js`

Header (both variants), redesigned mobile menu (maroon surface, injected close + CTA + instagram, focus trap, Esc, scroll-lock), WhatsApp FAB.

**Files:**
- Modify: `public/mobile/mobile.css` (append chrome styles)
- Create: `mobile/chrome.js`

- [ ] **Step 1: Append chrome CSS**

Append to `public/mobile/mobile.css`:
```css
/* ==================== CHROME ==================== */
/* Header (both .header and .portfolio-header) */
.header,.portfolio-header{
  position:fixed; top:0; left:0; width:100%; height:var(--hdr-h); z-index:9000;
  display:flex; align-items:center; justify-content:space-between;
  padding:0 var(--pad); background:transparent; transition:background .3s var(--ease),transform .3s var(--ease);
}
.header.m-scrolled,.portfolio-header.m-scrolled{ background:rgba(229,227,214,.95); backdrop-filter:blur(10px) }
.header.m-hidden,.portfolio-header.m-hidden{ transform:translateY(-100%) }
.header-logo span,.portfolio-header .logo{ font-size:18px; font-weight:700; letter-spacing:.25em; color:var(--text) }
/* hide desktop-only header bits on mobile */
.header-nav,.header-contact,.portfolio-header nav{ display:none }
.header-actions .btn{ display:inline-flex; align-items:center; min-height:40px; padding:0 14px;
  background:var(--wine); color:var(--bg); border-radius:5px; font-size:14px }

/* Hamburger */
.hamburger{ display:flex; flex-direction:column; justify-content:center; gap:5px; width:40px; height:40px; z-index:9100 }
.hamburger span{ display:block; width:22px; height:1.5px; background:var(--text); transition:transform .3s var(--ease),opacity .3s var(--ease) }
.hamburger.active span:nth-child(1){ transform:translateY(6.5px) rotate(45deg) }
.hamburger.active span:nth-child(2){ opacity:0 }
.hamburger.active span:nth-child(3){ transform:translateY(-6.5px) rotate(-45deg) }
.hamburger.active span{ background:var(--bg) }

/* Mobile menu — maroon surface */
.mobile-menu{
  position:fixed; inset:0; z-index:9050; background:var(--wine);
  display:flex; flex-direction:column; justify-content:center; align-items:center; gap:28px;
  padding:var(--hdr-h) var(--pad) 40px;
  opacity:0; pointer-events:none; transition:opacity .35s var(--ease);
}
.mobile-menu.active{ opacity:1; pointer-events:auto }
.mobile-menu a{ font-size:32px; color:var(--bg); opacity:.92 }
.mobile-menu a:active{ opacity:.6 }
.mobile-menu .m-menu-cta{ margin-top:8px; background:var(--bg); color:var(--wine); min-height:48px;
  display:inline-flex; align-items:center; padding:0 24px; border-radius:5px; font-size:16px }
.mobile-menu .m-menu-ig{ font-size:14px; letter-spacing:.12em; text-transform:uppercase; opacity:.8 }
.mobile-menu .m-menu-close{ position:absolute; top:14px; right:16px; width:44px; height:44px;
  display:flex; align-items:center; justify-content:center; color:var(--bg); font-size:30px; line-height:1 }

/* WhatsApp FAB */
.whatsapp-fab{ position:fixed; right:16px; bottom:16px; width:52px; height:52px; z-index:9999;
  background:#25d366; border-radius:50%; display:flex; align-items:center; justify-content:center;
  box-shadow:0 6px 18px rgba(0,0,0,.25); opacity:0; pointer-events:none; transition:opacity .4s var(--ease) }
.whatsapp-fab.visible{ opacity:1; pointer-events:auto }
.whatsapp-fab svg{ width:28px; height:28px; fill:#fff }

/* Loader: not used on mobile — hide it outright */
.loader{ display:none !important }
```

- [ ] **Step 2: Write `chrome.js`**

Create `mobile/chrome.js`:
```js
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
```

- [ ] **Step 3: Call chrome from the home stub**

Replace `mobile/home.js` contents:
```js
import { initChrome } from './chrome.js';

function start() { initChrome(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
```
> Why the readyState guard: each mobile entry is loaded via a dynamic `import()` that can resolve AFTER `DOMContentLoaded` has already fired — a bare `addEventListener('DOMContentLoaded', …)` would then never run. This pattern runs immediately if the DOM is already parsed.

- [ ] **Step 4: Verify chrome (Playwright MCP)**

`browser_resize` 390×844 → `browser_navigate` `$BASE/` then:
1. `browser_evaluate` `() => { document.querySelector('.hamburger').click(); return document.querySelector('.mobile-menu').classList.contains('active'); }` → Expected: `true`.
2. `browser_take_screenshot` `lusso-mobile/t3-menu.png` → visually: maroon menu, white links, X top-right, "fale conosco" + "instagram" present.
3. `browser_press_key` `Escape` → `browser_evaluate` `() => document.querySelector('.mobile-menu').classList.contains('active')` → Expected: `false`.
4. `browser_console_messages` level error → Expected: none.

- [ ] **Step 5: Commit**

```bash
git add public/mobile/mobile.css mobile/chrome.js mobile/home.js
git -c user.name="torugo123" -c user.email="keynona123@gmail.com" commit -m "feat(mobile): shared chrome — header, redesigned menu, FAB"
```

---

## Task 4: Shared reveals — `reveal.js`

**Files:**
- Create: `mobile/reveal.js`

- [ ] **Step 1: Write `reveal.js`**

Create `mobile/reveal.js`:
```js
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
    if (el.dataset.revealed) return; // once per element — avoids re-enter flash
    el.dataset.revealed = '1';
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
    if (root.dataset.staggered) return; // once per container
    root.dataset.staggered = '1';
    animate(children,
      { opacity: [0, 1], transform: ['translateY(24px)', 'translateY(0)'] },
      { duration: 0.6, delay: stagger(0.08), ease: [0.22, 0.61, 0.36, 1] }
    );
    children.forEach((c) => c.classList.remove('m-reveal-init'));
  }, { amount: 0.1 });
}

function clearInit(el) { el.classList.remove('m-reveal-init'); el.style.opacity = '1'; el.style.transform = 'none'; }
```

- [ ] **Step 2: Verify import resolves via build**

Run:
```bash
npm run build
```
Expected: build succeeds; output lists `mobile/reveal.js` bundled (no "failed to resolve import 'motion'"). Then `rm -rf dist` (build was a check only).

- [ ] **Step 3: Commit**

```bash
git add mobile/reveal.js
git -c user.name="torugo123" -c user.email="keynona123@gmail.com" commit -m "feat(mobile): Motion One reveal helpers"
```

---

## Task 5: Shared accordion — CSS + `accordion.js`

Single-open accordion with ARIA + Motion One height animation. Used by home services, sobre story, contato FAQ.

**Files:**
- Modify: `public/mobile/mobile.css` (append accordion styles)
- Create: `mobile/accordion.js`

- [ ] **Step 1: Append accordion CSS**

Append to `public/mobile/mobile.css`:
```css
/* ==================== ACCORDION ==================== */
.m-acc-item{ border-bottom:1px solid rgba(81,3,1,.18) }
.m-acc-trigger{ width:100%; display:flex; align-items:center; justify-content:space-between; gap:16px;
  text-align:left; padding:18px 0; font-size:18px; color:var(--text) }
.m-acc-trigger[aria-expanded="true"]{ color:var(--wine) }
.m-acc-sign{ flex:none; width:18px; height:18px; position:relative }
.m-acc-sign::before,.m-acc-sign::after{ content:''; position:absolute; top:50%; left:50%;
  width:14px; height:1.5px; background:currentColor; transform:translate(-50%,-50%); transition:transform .3s var(--ease) }
.m-acc-sign::after{ transform:translate(-50%,-50%) rotate(90deg) }
.m-acc-trigger[aria-expanded="true"] .m-acc-sign::after{ transform:translate(-50%,-50%) rotate(0) }
.m-acc-panel{ overflow:hidden; height:0 }
.m-acc-panel-inner{ padding:0 0 20px; font-size:15px; line-height:1.65; color:#3a3a37 }
```

- [ ] **Step 2: Write `accordion.js`**

Create `mobile/accordion.js`:
```js
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
    // wrapping the button in the same heading tag (button is valid inside a heading).
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
```

- [ ] **Step 3: Verify (deferred to Task 6 where it's first used).** No standalone check; `npm run build` must still pass:

Run: `npm run build` → Expected: success. Then `rm -rf dist`.

- [ ] **Step 4: Commit**

```bash
git add public/mobile/mobile.css mobile/accordion.js
git -c user.name="torugo123" -c user.email="keynona123@gmail.com" commit -m "feat(mobile): generic single-open accordion component"
```

---

## Task 6: Home page — CSS + `mobile/home.js`

Assemble home: hero, marquee (kept, service words), services accordion, injected full-bleed image, dark statement CTA, pre-footer. Mirrors existing copy.

**Files:**
- Modify: `public/mobile/mobile.css` (append home styles)
- Modify: `mobile/home.js` (full implementation)

- [ ] **Step 1: Append home CSS**

Append to `public/mobile/mobile.css`:
```css
/* ==================== HOME ==================== */
.hero{ padding:calc(var(--hdr-h) + 28px) 0 8px }
.hero .container{ display:flex; flex-direction:column; padding:0 var(--pad) }
.hero h1{ font-size:44px; line-height:1.05 }
.hero-body{ margin-top:18px; font-size:16px; color:#3a3a37 }
.hero-cards{ display:flex; flex-direction:column; gap:12px; margin-top:24px }
.hero-card{ background:rgba(255,255,255,.45); border:1px solid rgba(255,255,255,.6);
  border-radius:14px; padding:18px 16px; backdrop-filter:blur(8px) }
.hero-card h3{ font-size:18px } .hero-card-divider{ height:1px; background:rgba(81,3,1,.15); margin:10px 0 }
.hero-card-link{ font-size:14px; color:var(--wine) }
.hero-image{ margin-top:24px } .hero-image img{ width:100%; border-radius:14px; max-height:60vh; object-fit:cover }

/* Marquee (kept — owner brief). Clean CSS scroll, no edge clipping. */
.marquee-section{ background:var(--beige); padding:18px 0; overflow:hidden }
.marquee-row{ overflow:hidden; white-space:nowrap }
.marquee-row + .marquee-row{ margin-top:6px }
.marquee-track{ display:inline-block; white-space:nowrap; will-change:transform; animation:m-scroll 22s linear infinite }
.marquee-row.reverse .marquee-track{ animation-direction:reverse }
.marquee-item{ font-size:18px; color:var(--text); margin:0 14px }
.marquee-dot{ display:inline-block; width:4px; height:4px; border-radius:50%; background:var(--wine); vertical-align:middle }
@keyframes m-scroll{ from{transform:translateX(0)} to{transform:translateX(-50%)} }

/* CTA band */
.cta-band{ padding:48px 0 }
.cta-band .container{ padding:0 var(--pad); text-align:center }
.cta-band p{ font-size:16px; color:#3a3a37 }
.cta-band .btn-group{ display:flex; flex-direction:column; gap:12px; margin-top:22px }
.cta-band .btn{ display:inline-flex; align-items:center; justify-content:center; min-height:48px; border-radius:5px; font-size:16px }
.cta-band .btn-primary{ background:var(--wine); color:var(--bg) }
.cta-band .btn-outline{ border:1px solid var(--text); color:var(--text) }

/* About/mission */
.info{ padding:56px 0 } .info .container{ padding:0 var(--pad) }
.info-left h2{ font-size:30px } .info-left p{ margin-top:16px; font-size:16px; color:#3a3a37 }
.info-left .btn{ display:inline-flex; align-items:center; min-height:48px; padding:0 22px; margin-top:20px;
  background:var(--wine); color:var(--bg); border-radius:5px }
.info-card{ margin-top:28px; background:var(--green); border-radius:14px; padding:22px 18px }
.info-card h3{ font-size:18px; color:var(--wine) } .info-card p{ margin-top:8px; font-size:15px }

/* Services accordion section */
.info-rows-section{ padding:56px 0 } .info-rows-section .container{ padding:0 var(--pad) }
.info-rows-section .m-section-label{ margin-bottom:8px }

/* Injected full-bleed image section */
.m-bleed-figure{ position:relative; margin:8px 0 }
.m-bleed-figure img{ width:100%; height:62vh; object-fit:cover }
.m-bleed-figure .m-bleed-label{ position:absolute; left:var(--pad); bottom:18px; color:var(--white-soft);
  font-size:12px; letter-spacing:.18em; text-transform:uppercase; text-shadow:0 1px 6px rgba(0,0,0,.4) }

/* CTA dark — the big statement moment */
.cta-dark{ background:var(--wine); padding:64px 0 } .cta-dark .container{ padding:0 var(--pad) }
.cta-dark-label{ display:block; font-size:12px; letter-spacing:.16em; text-transform:uppercase; color:rgba(254,254,254,.7) }
.cta-dark h2{ margin-top:14px; font-size:34px; line-height:1.12; color:var(--white-soft) }
.cta-dark .btn-light{ display:inline-flex; align-items:center; min-height:48px; padding:0 22px; margin-top:28px;
  background:var(--bg); color:var(--text); border-radius:5px }
.cta-dark-image{ display:none } /* keep hidden on mobile */
.cta-dark-marquee{ margin-top:34px; overflow:hidden }
.cta-dark-marquee .marquee-item{ color:var(--white-soft); font-size:16px }

/* Pre-footer */
.pre-footer{ background:var(--beige); padding:56px 0 40px } .pre-footer .container{ padding:0 var(--pad); text-align:center }
.pre-footer h4{ font-size:24px } .pre-footer p{ margin-top:10px }
.scroll-top{ display:inline-flex; align-items:center; justify-content:center; width:48px; height:48px; margin-top:22px;
  border:1px solid var(--text); border-radius:50%; color:var(--text) }

/* Footer (.footer) */
.footer{ background:var(--beige); padding:32px var(--pad) calc(32px + env(safe-area-inset-bottom)) }
.footer .container{ display:flex; flex-direction:column; gap:20px; text-align:center; align-items:center }
.footer-left{ display:flex; flex-direction:column; gap:14px; align-items:center }
.footer-logo{ font-size:22px; font-weight:700; letter-spacing:.25em }
.footer-copy{ font-size:13px; color:var(--muted) }
.footer-socials{ display:flex; gap:18px } .footer-socials a{ width:44px; height:44px; display:flex; align-items:center; justify-content:center; color:var(--wine) }
.footer-socials svg{ width:20px; height:20px }
.footer-right{ display:flex; flex-wrap:wrap; gap:14px; justify-content:center; font-size:13px }
```

- [ ] **Step 2: Implement `mobile/home.js`**

Replace `mobile/home.js` contents:
```js
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
```

- [ ] **Step 3: Verify home (Playwright MCP)**

`browser_resize` 390×844 → `browser_navigate` `$BASE/` then:
1. `browser_evaluate`:
```js
() => {
  const t = document.querySelector('#services .m-acc-trigger');
  t.click();
  return new Promise(r => setTimeout(() => r({
    expanded: t.getAttribute('aria-expanded'),
    panelH: document.querySelector('#services .m-acc-panel').offsetHeight
  }), 450));
}
```
Expected: `expanded:"true"`, `panelH` > 0.
2. `browser_evaluate` `() => document.querySelectorAll('#services .m-acc-trigger').length` → Expected: `6`.
3. `browser_evaluate` `() => !!document.querySelector('.m-bleed-figure img')` → Expected: `true`.
4. `browser_take_screenshot` fullPage `lusso-mobile/t6-home.png` → visually confirm: marquee present with words, services as accordion, full-bleed image with label, maroon statement section.
5. `browser_console_messages` level error → Expected: none.

- [ ] **Step 4: Commit**

```bash
git add public/mobile/mobile.css mobile/home.js
git -c user.name="torugo123" -c user.email="keynona123@gmail.com" commit -m "feat(mobile): home — hero, marquee, services accordion, full-bleed, statement"
```

---

## Task 7: Sobre page — wire + CSS + `mobile/sobre.js`

**Files:**
- Modify: `sobre.html:14-15` (head) + `sobre.html:157` (script)
- Modify: `public/mobile/mobile.css` (append sobre styles)
- Create: `mobile/sobre.js`

- [ ] **Step 1: Rewire `sobre.html` head**

Replace `sobre.html` lines 14-15:
```html
  <!-- Styles -->
  <link rel="stylesheet" href="/style.css" />
```
with:
```html
  <!-- Styles -->
  <link rel="stylesheet" href="/style.css" media="(min-width:769px)" />
  <link rel="stylesheet" href="/mobile/mobile.css" media="(max-width:768px)" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
```

- [ ] **Step 2: Rewire `sobre.html` script**

Replace `sobre.html` line 157:
```html
  <script type="module" src="/sobre.js"></script>
```
with:
```html
  <script type="module">
    if (window.matchMedia('(max-width:768px)').matches) import('/mobile/sobre.js');
    else import('/sobre.js');
  </script>
```

- [ ] **Step 3: Append sobre CSS**

Append to `public/mobile/mobile.css`:
```css
/* ==================== SOBRE ==================== */
.about-hero{ padding:calc(var(--hdr-h) + 40px) var(--pad) 16px }
.about-hero h1{ font-size:40px }
.m-founder{ margin:8px 0 } .m-founder img{ width:100%; height:64vh; object-fit:cover }
.m-founder + .info-rows-section{ padding-top:24px } /* figure is injected between hero and story */
.about-cta{ background:var(--wine); padding:56px var(--pad); text-align:center }
.about-cta h2{ color:var(--white-soft); font-size:28px }
.about-cta .btn-light{ display:inline-flex; align-items:center; min-height:48px; padding:0 22px; margin-top:22px;
  background:var(--bg); color:var(--text); border-radius:5px }
```

- [ ] **Step 4: Write `mobile/sobre.js`**

Create `mobile/sobre.js`:
```js
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
```

- [ ] **Step 5: Verify sobre (Playwright MCP)**

`browser_resize` 390×844 → `browser_navigate` `$BASE/sobre.html` then:
1. `browser_evaluate` `() => document.querySelectorAll('.info-rows-section .m-acc-trigger').length` → Expected: `4`.
2. `browser_evaluate` `() => !!document.querySelector('.m-founder img')` → Expected: `true`.
3. `browser_evaluate` `() => { const t=document.querySelector('.info-rows-section .m-acc-trigger'); t.click(); return new Promise(r=>setTimeout(()=>r(t.getAttribute('aria-expanded')),450)); }` → Expected: `"true"`.
4. `browser_take_screenshot` fullPage `lusso-mobile/t7-sobre.png` → confirm portrait + 4 story accordions + maroon CTA.
5. `browser_console_messages` level error → Expected: none.

- [ ] **Step 6: Commit**

```bash
git add sobre.html public/mobile/mobile.css mobile/sobre.js
git -c user.name="torugo123" -c user.email="keynona123@gmail.com" commit -m "feat(mobile): sobre — founder portrait + story accordion"
```

---

## Task 8: Portfolio page — wire + CSS + `mobile/portfolio.js`

Single-column cards as accessible buttons; accessible gallery overlay built from `portfolio-data.js`.

**Files:**
- Modify: `portfolio.html:14-15` (head) + `portfolio.html:124` (script)
- Modify: `public/mobile/mobile.css` (append portfolio styles)
- Create: `mobile/portfolio.js`

- [ ] **Step 1: Rewire `portfolio.html` head**

Replace `portfolio.html` lines 14-15:
```html
  <!-- Styles -->
  <link rel="stylesheet" href="/style.css" />
```
with:
```html
  <!-- Styles -->
  <link rel="stylesheet" href="/style.css" media="(min-width:769px)" />
  <link rel="stylesheet" href="/mobile/mobile.css" media="(max-width:768px)" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
```

- [ ] **Step 2: Rewire `portfolio.html` script**

Replace `portfolio.html` line 124:
```html
  <script type="module" src="/portfolio.js"></script>
```
with:
```html
  <script type="module">
    if (window.matchMedia('(max-width:768px)').matches) import('/mobile/portfolio.js');
    else import('/portfolio.js');
  </script>
```

- [ ] **Step 3: Append portfolio CSS**

Append to `public/mobile/mobile.css`:
```css
/* ==================== PORTFOLIO ==================== */
.portfolio-page{ padding-top:var(--hdr-h) }
.pf-intro{ padding:32px var(--pad) 8px } .pf-intro h1{ font-size:40px } .pf-intro-sub{ margin-top:10px; color:var(--muted); font-size:15px }
.pf-section{ padding:24px 0 } .pf-section .container{ padding:0 var(--pad) }
.pf-section-label{ display:flex; align-items:center; gap:8px; font-size:13px; letter-spacing:.16em; text-transform:uppercase; color:var(--muted); margin-bottom:14px }
.pf-dot{ width:6px; height:6px; border-radius:50%; background:var(--wine) }
.pf-grid{ display:flex; flex-direction:column; gap:18px }
.pf-card{ display:block; width:100%; text-align:left; background:none }
.pf-card-img{ border-radius:14px; overflow:hidden } .pf-card-img img{ width:100%; aspect-ratio:4/5; object-fit:cover }
.pf-card-meta{ display:flex; justify-content:space-between; align-items:baseline; margin-top:10px }
.pf-name{ font-size:18px } .pf-cat{ font-size:12px; color:var(--muted); text-transform:uppercase; letter-spacing:.1em }
.pf-card:focus-visible{ outline:2px solid var(--wine); outline-offset:3px }

/* portfolio footer variant */
.portfolio-footer{ padding:32px var(--pad); display:flex; flex-direction:column; gap:14px; align-items:center; text-align:center; background:var(--beige) }
.portfolio-footer .copyright{ font-size:13px; color:var(--muted) }
.portfolio-footer .footer-links{ display:flex; flex-wrap:wrap; gap:14px; justify-content:center; font-size:14px }

/* gallery overlay */
.m-gallery{ position:fixed; inset:0; z-index:9500; background:var(--bg); overflow-y:auto;
  opacity:0; pointer-events:none; transition:opacity .3s var(--ease) }
.m-gallery.active{ opacity:1; pointer-events:auto }
.m-gallery-head{ position:sticky; top:0; display:flex; align-items:center; justify-content:space-between;
  padding:16px var(--pad); background:rgba(229,227,214,.95); backdrop-filter:blur(8px) }
.m-gallery-title{ font-size:18px } .m-gallery-cat{ font-size:12px; color:var(--muted); text-transform:uppercase; letter-spacing:.1em }
.m-gallery-close{ width:44px; height:44px; display:flex; align-items:center; justify-content:center; font-size:28px; color:var(--text) }
.m-gallery-grid{ display:flex; flex-direction:column; gap:10px; padding:10px var(--pad) 40px }
.m-gallery-grid img{ width:100%; border-radius:8px }
```

- [ ] **Step 4: Write `mobile/portfolio.js`**

Create `mobile/portfolio.js`:
```js
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
    if (e.key === 'Tab') { e.preventDefault(); closeBtn.focus(); } // single focusable → trap
  };
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onKey);
}
```

- [ ] **Step 5: Verify portfolio (Playwright MCP)**

`browser_resize` 390×844 → `browser_navigate` `$BASE/portfolio.html` then:
1. `browser_evaluate` `() => document.querySelectorAll('.pf-card[role="button"][tabindex="0"]').length` → Expected: `10`.
2. `browser_evaluate` `() => { document.querySelector('.pf-card').click(); return new Promise(r=>setTimeout(()=>r(!!document.querySelector('.m-gallery.active')),400)); }` → Expected: `true`.
3. `browser_evaluate` `() => document.querySelectorAll('.m-gallery-grid img').length` → Expected: > 0 (matches the first slug's image count).
4. `browser_press_key` `Escape` → `browser_evaluate` `() => !!document.querySelector('.m-gallery')` → Expected: `false` (after ~300ms; re-check if needed).
5. `browser_take_screenshot` fullPage `lusso-mobile/t8-portfolio.png` → single-column cards.
6. `browser_console_messages` level error → Expected: none.

- [ ] **Step 6: Commit**

```bash
git add portfolio.html public/mobile/mobile.css mobile/portfolio.js
git -c user.name="torugo123" -c user.email="keynona123@gmail.com" commit -m "feat(mobile): portfolio — focusable cards + accessible gallery overlay"
```

---

## Task 9: Contato page — wire + CSS + `mobile/contato.js`

Form with real labels, validation + inline errors, success placeholder (no backend); FAQ accordion; address blocks.

**Files:**
- Modify: `contato.html:14-15` (head) + `contato.html:268` (script)
- Modify: `public/mobile/mobile.css` (append contato styles)
- Create: `mobile/contato.js`

- [ ] **Step 1: Rewire `contato.html` head**

Replace `contato.html` lines 14-15:
```html
  <!-- Styles -->
  <link rel="stylesheet" href="/style.css" />
```
with:
```html
  <!-- Styles -->
  <link rel="stylesheet" href="/style.css" media="(min-width:769px)" />
  <link rel="stylesheet" href="/mobile/mobile.css" media="(max-width:768px)" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
```

- [ ] **Step 2: Rewire `contato.html` script**

Replace `contato.html` line 268:
```html
  <script type="module" src="/contato.js"></script>
```
with:
```html
  <script type="module">
    if (window.matchMedia('(max-width:768px)').matches) import('/mobile/contato.js');
    else import('/contato.js');
  </script>
```

- [ ] **Step 3: Append contato CSS**

Append to `public/mobile/mobile.css`:
```css
/* ==================== CONTATO ==================== */
.contact-hero{ padding:calc(var(--hdr-h) + 40px) var(--pad) 8px } .contact-hero h1{ font-size:40px }
.contact-form-section,.contact-address,.contact-faq{ padding:40px 0 } 
.contact-form-section .s-inner,.contact-address .s-inner,.contact-faq .s-inner,.contact-cta .s-inner{ padding:0 var(--pad) }
.contact-form-section h2,.contact-address h2,.contact-faq h2{ font-size:26px } .form-intro,.address-subtitle{ margin:10px 0 22px; color:var(--muted); font-size:15px }

.contact-form{ display:flex; flex-direction:column; gap:16px }
.contact-form .form-row{ display:flex; flex-direction:column; gap:16px } /* nome+sobrenome etc. stack with spacing */
.m-field{ display:flex; flex-direction:column; gap:6px }
.m-field label{ font-size:13px; letter-spacing:.04em; color:var(--text) }
.contact-form input,.contact-form select,.contact-form textarea{
  width:100%; font-family:inherit; font-size:16px; /* 16px stops iOS zoom */ color:var(--text);
  background:rgba(255,255,255,.5); border:1px solid rgba(49,49,47,.25); border-radius:8px; padding:14px 14px; min-height:48px }
.contact-form textarea{ min-height:120px; resize:vertical }
.m-field.m-invalid input,.m-field.m-invalid select,.m-field.m-invalid textarea{ border-color:var(--wine) }
.m-error{ font-size:12px; color:var(--wine); min-height:14px }
.btn-submit{ min-height:52px; background:var(--wine); color:var(--bg); border-radius:8px; font-size:16px; margin-top:4px }
.m-form-success{ background:var(--green); color:var(--text); border-radius:10px; padding:18px; font-size:15px; text-align:center }

.address-blocks{ display:flex; flex-direction:column; gap:22px }
.address-block h3{ font-size:13px; letter-spacing:.14em; text-transform:uppercase; color:var(--muted) }
.address-block p{ margin-top:6px; font-size:17px } .address-block a{ color:var(--wine) }

.contact-cta{ background:var(--wine); padding:56px 0 } .contact-cta h2{ color:var(--white-soft); font-size:30px }
.contact-cta p{ color:rgba(254,254,254,.85) }
.contact-cta-marquee{ margin-top:28px; overflow:hidden }
.contact-cta-marquee .marquee-track{ display:inline-block; white-space:nowrap; animation:m-scroll 26s linear infinite }
.contact-cta-marquee .marquee-item{ color:var(--white-soft); font-size:16px; margin:0 18px }
```

- [ ] **Step 4: Write `mobile/contato.js`**

Create `mobile/contato.js`:
```js
import { initChrome } from './chrome.js';
import { initReveals } from './reveal.js';
import { initAccordion } from './accordion.js';

// Declared before the readyState guard at the bottom — start() reads it, so it must
// be initialized first (avoids a temporal-dead-zone ReferenceError on immediate start()).
const LABELS = {
  'tipo-servico': 'serviço', nome: 'nome', sobrenome: 'sobrenome',
  email: 'email', telefone: 'telefone', mensagem: 'mensagem',
};

function start() {
  initChrome();
  enhanceForm();
  const faq = document.querySelector('.s-accordion');
  if (faq) initAccordion(faq, { item: '.faq-item', trigger: '.faq-question', panel: '.faq-answer' });
  initReveals('.reveal');
}

function enhanceForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  // Wrap each control in a labelled field with an error slot.
  form.querySelectorAll('input,select,textarea').forEach((ctrl) => {
    const name = ctrl.name;
    const field = document.createElement('div');
    field.className = 'm-field';
    const label = document.createElement('label');
    label.textContent = LABELS[name] || name;
    const id = `f-${name}`; ctrl.id = id; label.setAttribute('for', id);
    const err = document.createElement('div'); err.className = 'm-error'; err.id = `${id}-err`;
    ctrl.setAttribute('aria-describedby', err.id);
    ctrl.parentNode.replaceChild(field, ctrl); // replace the .form-row wrapper position
    field.append(label, ctrl, err);
  });

  form.setAttribute('novalidate', '');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate(form)) return;
    const success = document.createElement('div');
    success.className = 'm-form-success';
    success.setAttribute('role', 'status');
    success.textContent = 'mensagem enviada — em breve a equipe da lusso entra em contato';
    form.replaceWith(success);
  });
}

function validate(form) {
  let ok = true;
  form.querySelectorAll('input,select,textarea').forEach((ctrl) => {
    const field = ctrl.closest('.m-field');
    const err = field.querySelector('.m-error');
    let msg = '';
    if (ctrl.required && !ctrl.value.trim()) msg = 'campo obrigatório';
    else if (ctrl.type === 'email' && ctrl.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ctrl.value)) msg = 'email inválido';
    field.classList.toggle('m-invalid', !!msg);
    err.textContent = msg;
    if (msg) ok = false;
  });
  return ok;
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
```

> Note: the existing form wraps controls in `.form-row` divs. The code above replaces each control with its `.m-field` wrapper *inside* the same `.form-row`, so a `.form-row` ends up holding one or two `.m-field`s (e.g. nome + sobrenome). The `.contact-form .form-row` rule (Step 3) gives those fields column spacing.

- [ ] **Step 5: Verify contato (Playwright MCP)**

`browser_resize` 390×844 → `browser_navigate` `$BASE/contato.html` then:
1. `browser_evaluate` `() => document.querySelectorAll('.contact-form label').length` → Expected: `6`.
2. Submit empty → `browser_evaluate`:
```js
() => { document.querySelector('.btn-submit').click();
  return { invalid: document.querySelectorAll('.m-field.m-invalid').length, stillForm: !!document.querySelector('.contact-form') }; }
```
Expected: `invalid` ≥ 4 (required fields), `stillForm:true` (no navigation, no success yet).
3. Fill valid + submit → `browser_evaluate`:
```js
() => {
  const f = document.querySelector('.contact-form');
  f.querySelector('[name=tipo-servico]').value = 'design';
  f.querySelector('[name=nome]').value = 'ana';
  f.querySelector('[name=sobrenome]').value = 'lima';
  f.querySelector('[name=email]').value = 'ana@teste.com';
  f.querySelector('.btn-submit').click();
  return !!document.querySelector('.m-form-success');
}
```
Expected: `true`.
4. `browser_evaluate` `() => { const t=document.querySelector('.faq-item .m-acc-trigger'); t.click(); return new Promise(r=>setTimeout(()=>r(t.getAttribute('aria-expanded')),450)); }` → Expected: `"true"`.
5. `browser_take_screenshot` fullPage `lusso-mobile/t9-contato.png` → labelled form, address blocks single column, FAQ accordion.
6. `browser_console_messages` level error → Expected: none.

- [ ] **Step 6: Commit**

```bash
git add contato.html public/mobile/mobile.css mobile/contato.js
git -c user.name="torugo123" -c user.email="keynona123@gmail.com" commit -m "feat(mobile): contato — labelled form + validation + success + FAQ accordion"
```

---

## Task 10: Cross-page polish, desktop regression, production build

**Files:** none new (verification + any small fixes surfaced).

- [ ] **Step 1: Desktop regression (Playwright MCP)**

`browser_resize` 1280×900, then for each of `$BASE/`, `$BASE/sobre.html`, `$BASE/portfolio.html`, `$BASE/contato.html`:
- `browser_navigate` → `browser_evaluate` `() => ({ mobileCss: !!getComputedStyle(document.body).getPropertyValue('--pad').trim(), bundle: document.documentElement.dataset.mobileBundle })`.
- Expected: `bundle` is `undefined` on all (desktop JS ran, not mobile); the desktop layout looks identical to before (spot-check a screenshot `lusso-mobile/t10-desktop-home.png` vs the original look).

> If `--pad` resolves on desktop it means mobile.css is leaking — confirm the `media="(max-width:768px)"` attribute is present on all 4 pages.

- [ ] **Step 2: Mobile sweep (Playwright MCP)**

`browser_resize` 390×844, visit all 4 pages; for each run `browser_console_messages` level error → Expected: none on any page. Confirm the menu opens/closes on each (`.hamburger` click).

- [ ] **Step 3: Small-phone check**

`browser_resize` 360×780 → navigate `$BASE/` → `browser_take_screenshot` fullPage `lusso-mobile/t10-360.png` → confirm no horizontal overflow (no sideways scroll; content fits).

- [ ] **Step 4: Production build**

Run:
```bash
npm run build
```
Expected: build succeeds; `dist/` contains the 4 HTML entries and a `mobile/mobile.css` asset under `dist/`. Then:
```bash
npm run preview
```
and `browser_navigate` to the preview URL at 390×844; confirm a page renders with the mobile layout and no console errors. Stop preview after.

- [ ] **Step 5: Final commit (if any fixes were made)**

```bash
git add -A
git -c user.name="torugo123" -c user.email="keynona123@gmail.com" commit -m "fix(mobile): cross-page polish + desktop regression verified"
```

> If Step 1–4 surfaced no changes, skip the commit (nothing to commit is fine).

---

## Done criteria
- All 4 pages render a from-scratch mobile layout at ≤768px; desktop unchanged at ≥769px.
- Marquee kept (service words); copy full + lowercase/no-period; Helvetica only.
- Accordions (home services, sobre story, contato FAQ) toggle with single-open + keyboard + ARIA.
- Mobile menu: maroon surface, X close, CTA + instagram, focus trap, Esc, scroll-lock.
- Portfolio cards keyboard-openable; gallery overlay is an accessible dialog.
- Contato form: labels, validation, success placeholder (no backend).
- `npm run build` + `npm run preview` clean; zero console errors across pages.
