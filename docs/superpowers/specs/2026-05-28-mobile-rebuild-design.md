# Mobile Rebuild — Design Spec

**Date:** 2026-05-28
**Status:** Awaiting review
**Scope:** From-scratch mobile experience (≤768px) for all 4 pages, as an isolated layer that leaves the desktop site untouched.

---

## 1. Goals & Constraints

**Problem:** The current mobile site is too text-heavy and feels broken — walls of prose at 15px, a flat hierarchy, a mobile menu that looks like an empty beige screen, an unwired contact form, and a heavy GSAP/Lenis stack that fights native scroll. Desktop is fine and must not regress.

**Goals:**
- Rebuild the mobile experience from scratch for all 4 pages (home, portfolio, sobre, contato).
- Make dense text scannable via accordions (progressive disclosure).
- Replace GSAP + Lenis on mobile with Motion One + IntersectionObserver, native scroll.
- Fix the mobile chrome (menu, header, footer, FAB) and accessibility gaps.
- Keep desktop byte-for-byte unchanged in behavior.
- Mirror the current desktop **content faithfully** on mobile (desktop already implements the owner's brief in `melhorias site.pdf`).
- Align the mobile look with the owner's reference (**itsdoestudio.com**): image-led, full-bleed media + a big statement moment — **while keeping the brand marquee the owner explicitly wants** (see §5.0).
- Typography: **Helvetica only** (weights may vary). Brand quirk: **all copy lowercase, no final period.**

**Non-goals (this round) — mobile-only:**
- No desktop redesign.
- No contact-form backend wiring (UI/validation/success placeholder only).
- No portfolio gallery content refresh from the Documents zips (existing galleries stay).
- Performance/battery is explicitly **not** a driving constraint (sessions are short).
- **Out of scope (owner brief, deferred to separate work):** new logo asset, the faceless hero photo `C8CB43A3-…B1.jpg`, wiring Pinterest/Behance/TikTok to real URLs, a Blog page (Substack), and the links-aggregator page. Not built here.

---

## 2. Architecture — "Dual media-scoped bundles"

The same 4 HTML files serve both desktop and mobile. Only their `<head>` link tags and the entry `<script>` change. Everything else about desktop is untouched.

### 2.1 HTML changes (per page)
```html
<!-- Desktop styles: only apply ≥769px. File content unchanged. -->
<link rel="stylesheet" href="/style.css" media="(min-width:769px)">
<!-- New from-scratch mobile styles: only apply ≤768px. -->
<link rel="stylesheet" href="/mobile/mobile.css" media="(max-width:768px)">

<!-- Favicon (kills the existing 404). -->
<link rel="icon" href="/favicon.svg" type="image/svg+xml">

<!-- Entry loader: pick the bundle once, at load. -->
<script type="module">
  if (window.matchMedia('(max-width:768px)').matches) {
    import('/mobile/home.js');      // page-specific mobile entry
  } else {
    import('/main.js');             // existing desktop entry, untouched
  }
</script>
```
Each page points at its own mobile entry (`/mobile/home.js`, `/mobile/portfolio.js`, `/mobile/sobre.js`, `/mobile/contato.js`).

### 2.2 Why this works
- `style.css` scoped to `≥769px` means its base styles (reset, `:root` tokens, `@font-face`, typography, all the `≤768`/`≤480` blocks including the dead `.png` thumbnail rules) **never apply on mobile**. No override wars.
- `mobile.css` is self-contained: it redeclares `@font-face` (Helvetica regular + bold) and `:root` tokens, then a fresh reset + mobile styles. The token/font duplication is intentional and isolated.
- **Serving/bundling split (finalized in the plan):** `mobile.css` is served as a static asset from `public/mobile/` (plain CSS, no Vite transform needed) so the `<link href="/mobile/mobile.css">` resolves in both dev and build. The mobile **JS** modules are Vite-processed source (so bare imports like `motion` resolve and they're bundled as async chunks) — the dynamic-import path wiring is confirmed during implementation and may require a minor `vite.config.js` touch.
- The desktop/mobile choice is fixed at page load (no live swap when resizing across 768px). This is irrelevant for real phones and acceptable for dev/testing (reload to switch).

### 2.3 Untouched files (desktop)
`style.css`, `main.js`, `portfolio.js`, `sobre.js`, `contato.js`, `portfolio-data.js`. The only edits to existing files are the `<head>`/`<script>` tags in the 4 HTML files and adding `motion` to `package.json`.

### 2.4 Shared HTML, progressive enhancement
Mobile reuses the existing page markup and enhances it at runtime (e.g., builds accordions from existing title+body rows). No duplicate mobile HTML files. Content lives in the HTML; mobile JS reads the DOM and upgrades it.

---

## 3. New Files

```
public/favicon.svg            simple LUSSO favicon (kills 404)
public/mobile/mobile.css      from-scratch mobile stylesheet (static asset, served at /mobile/mobile.css)
mobile/chrome.js              header show/hide, mobile menu, WhatsApp FAB (shared, Vite-processed)
mobile/accordion.js           generic tap-to-expand component (shared)
mobile/reveal.js              Motion One inView/animate reveals + stagger (shared)
mobile/home.js                home entry (imports shared + page-specific)
mobile/portfolio.js           portfolio entry (cards + gallery overlay)
mobile/sobre.js               sobre entry (story accordion)
mobile/contato.js             contato entry (form + FAQ accordion)
```

> Note: the mobile per-page JS files share base names with the desktop ones but live under `/mobile/`, so there is no collision. The CSS is a static `public/` asset; the JS modules are Vite-processed source (bundled as async chunks). Exact dynamic-import resolution is confirmed in the plan and may need a minor `vite.config.js` touch.

### 3.1 Dependency
Add `motion` (Motion One) to `package.json` dependencies. Desktop bundle does not import it.

---

## 4. Shared Components

### 4.1 `chrome.js`
- **Header:** fixed top bar; native `scroll` listener (rAF-throttled) for the show-on-scroll-up / hide-on-scroll-down behavior. Logo `href` fixed to `/` (currently `#`). "fale conosco" CTA + hamburger remain.
- **Mobile menu (redesigned):**
  - Surface: maroon `#510301` (was same-as-page beige), white links — a real "menu" surface.
  - Contents: the 4 nav links + a "fale conosco" CTA + Instagram link.
  - **Visible X close button** (top-right).
  - **Focus trap** while open; focus moves to the menu on open and is **restored** to the hamburger on close.
  - **Esc closes.** `aria-modal="true"`, `aria-controls`/`aria-expanded` wired.
  - Body scroll lock via `overflow:hidden` on `<html>`/`<body>` (no Lenis).
- **WhatsApp FAB:** kept, `href="https://wa.me/5527998507890"`, revealed immediately (no dependency on a loader).
- **Loader:** removed on mobile. Content renders immediately (optional 150ms fade-in of the page).

### 4.2 `accordion.js`
Generic, reused by Home services, Sobre story, Contato FAQ.
- Input: a container whose children are `(trigger, panel)` pairs.
- Behavior: tap trigger toggles panel; **single-open** per group (opening one closes others).
- Animation: Motion One animates panel `height` (auto) + opacity; instant when `prefers-reduced-motion`.
- ARIA: trigger is a `<button>` with `aria-expanded` + `aria-controls`; panel is a region with matching `id`. Keyboard: Enter/Space toggles.
- **No-JS / JS-fail safety:** panels are visible by default in CSS; JS adds the collapsed state on init. If JS fails, all content is readable (not hidden).

### 4.3 `reveal.js`
- Uses Motion One `inView` to trigger `animate` (fade + small translate) as elements enter the viewport; `stagger` for groups.
- Native scroll only.
- `prefers-reduced-motion` → no animation, content shown.
- **Critical:** the pre-reveal hidden state is applied by JS, never by CSS, so content is never trapped invisible if JS fails (this was a desktop bug).

---

## 5. Visual Direction & Per-Page Design

### 5.0 Visual direction (reference: itsdoestudio.com)
Adopt the reference's *feel*, not a clone, **while honoring the owner's specific likes from `melhorias site.pdf`** (notably: they love the marquee). Combine both:
- **Keep the brand marquee.** The owner explicitly loves it. Carry it on mobile with the service words: `identidade visual · branding · direção criativa · social media · design · captação e edição de fotos e vídeos`. Implement as a CSS marquee (no edge word-clipping like the current one). This is *in addition to* the Doe-style elements below, not replaced by them.
- **Image-led, full-bleed media sections.** Use edge-to-edge image sections with a small overlaid label where photos exist, drawing on the repo's currently-unused brand imagery — `about.webp`, `card-branding.webp`, `card-social.webp`, `card-producao.webp`, `extra-coffee.webp`, `extra-pen.webp`, `extra-portrait.webp`, `marquee-flatlay.webp`, plus portfolio shots (large sources; resize for mobile).
- **A big statement moment.** Treat the existing dark CTA heading (`marcas de beleza, que querem profissionalizar…`) as the oversized bold typographic centerpiece, Doe-style. (No marquee is converted into it — the marquee stays.)
- **Motion:** Motion One reveals (`inView`) + gentle parallax on media, plus the CSS marquee.
- **Restraint.** Generous spacing, few elements per screen, strong size/weight hierarchy.
- **Typography:** **Helvetica only** (weights may vary) — confirmed by owner; no script/display face. Hierarchy comes from size/weight. **All copy lowercase, no final period** (brand quirk, applied globally on mobile, mirroring desktop).

### 5.1 Home (`mobile/home.js`)
Section order (top→bottom):
1. Header (chrome).
2. **Hero:** h1 `delegar é crescer` + one tightened value line (see §7) + hero image moved up (not buried at the bottom) + 3 service chips (identidade visual e branding / social media / direção criativa) linking into the services accordion.
3. **Services accordion:** the 6 services (titles visible, bodies on tap, single-open). Full body copy retained inside panels.
4. **Why Lusso:** trimmed mission/about intro (see §7) + `nossa missão é:` line.
5. **Marquee** (kept — owner's brief) with the service words (§5.0), as a clean CSS marquee.
6. **Full-bleed image section** (≥1) with a small overlaid label, using repo brand imagery — image-led direction (§5.0).
7. **Positioning CTA (dark):** label `para quem é a agência lusso?` + big statement h2 `marcas de beleza…` + `fale conosco →` button (the Doe-style statement moment).
8. **Pre-footer:** `quem delega cresce` + back-to-top button.
9. Footer (chrome).
- Marquee **kept** (§5.0); mirror desktop content faithfully; all copy lowercase / no final period.

### 5.2 Sobre (`mobile/sobre.js`)
1. Header.
2. **Hero:** h1 `sobre a lusso`.
3. **Founder portrait:** `about.webp` (color — **chosen**; B&W `extra-portrait.webp` available as alternative), resized to a mobile-appropriate size (~800px wide webp), given a **full-bleed treatment** near the top of the story (§5.0).
4. **Story accordion:** the 4 chapters `origem / fundadora / foco / filosofia` — labels visible, tap to read full paragraph. Single-open.
5. **CTA:** `quer conversar?` + `fale conosco →` → `/contato.html`.
6. Footer.

### 5.3 Portfolio (`mobile/portfolio.js`)
1. Header.
2. **Intro:** h1 `portfólio` + subtitle.
3. **Two category sections** (`identidade visual`, `social media`), single-column card stack of the 10 project cards.
4. **Cards become real `<button>`s** (or `role="button"` + `tabindex=0`): openable via tap, Enter, and Space; visible focus ring. Images shown fully (no 120%-height bottom-crop; parallax stays off on mobile).
5. **Gallery overlay (accessible dialog):** built from `portfolio-data.js` (`galleryImages[slug]`). `role="dialog"`, `aria-modal`, focus trap, Esc-to-close, visible close button, body scroll-lock. Vertically scrollable image grid/stack.
6. Footer.
- Data/markup duplication risk is documented: cards are in HTML, galleries in `portfolio-data.js`; slugs must match (they currently do, 10/10). `tuttie` legitimately lacks `2.webp` (data omits it — graceful).

### 5.4 Contato (`mobile/contato.js`)
1. Header.
2. **Hero:** h1 `vamos conversar`.
3. **Form (rebuilt UI, no backend):**
   - Fields: `tipo-servico` (select, required), `nome` (required), `sobrenome` (required), `email` (email, required), `telefone` (tel, optional), `mensagem` (textarea, optional).
   - **Real `<label>` per field** (not placeholder-only). 16px inputs (no iOS zoom). `autocomplete`/`inputmode` set appropriately. ≥44px tap targets.
   - **Validation:** client-side, inline error messages per field; submit blocked until valid.
   - **Submit:** `preventDefault()`; on valid input show a **success-state placeholder** message ("mensagem enviada…") — no data is transmitted. Structure leaves a single obvious hook for a future backend.
4. **Address blocks:** single-column, prioritized (email `mailto:`, whatsapp `wa.me`, instagram, horário), ≥44px targets.
5. **FAQ accordion:** the 5 Q&A items, rebuilt with proper ARIA (single-open).
6. **CTA:** the existing CTA line as a large statement; **marquee kept** with service words (§5.0).
7. Footer.

---

## 6. Footer & Links (per user decision)
- **Keep all footer links as-is**, including the placeholder `#` links (LinkedIn, Pinterest, Behance, TikTok, política de privacidade, termos). Do **not** hide them.
- Instagram and `contato` remain real.
- Header logo `href` is the one link fixed (→ `/`).

---

## 7. Copy Treatment

Per the owner's brief (`melhorias site.pdf`): **keep the full copy** — no trimming. Mobile mirrors the current desktop strings verbatim. (Earlier trim proposals are withdrawn.)

Brand rules applied globally on mobile:
- **All copy lowercase.**
- **No final period** on copy lines (deliberate brand quirk).
- **Helvetica only**, weights may vary.

Accordions keep the dense service/FAQ bodies out of the way, so full copy does not create "walls" — the text-heaviness is solved by progressive disclosure, not by cutting words.

---

## 8. Motion / Behavior Summary
- **Library:** Motion One (`motion`) for reveals (`inView` + `animate` + `stagger`) and accordion height animation.
- **Scroll:** native (no Lenis). Body scroll-lock via `overflow:hidden` for menu + gallery overlay.
- **Reduced motion:** all animation skipped; content fully shown.
- **Resilience:** content never hidden by CSS; JS applies hidden/collapsed states on init.

---

## 9. Edge Cases & Error Handling
- **JS disabled/failed:** all content visible and readable (accordions open, reveals shown). No blank screens.
- **prefers-reduced-motion:** static, instant.
- **768/769 boundary:** bundle chosen at load; no live swap. Documented; acceptable for phones.
- **Form invalid:** inline per-field errors; submit blocked.
- **Form valid:** success placeholder; no network call.
- **Gallery missing slug:** open is a no-op (guarded), as today.
- **Favicon:** added, 404 resolved.

---

## 10. Testing & Verification
Playwright at **390×844**, plus a **360px** small-phone pass and a **768px** boundary check, per page:
- Full-page screenshots + accessibility snapshots.
- Accordions: toggle open/close, single-open behavior, ARIA state, keyboard (Enter/Space).
- Mobile menu: open/close, focus trap, Esc, focus restore, scroll-lock.
- Portfolio: card keyboard-open, gallery dialog open/close + Esc + focus trap.
- Contato form: validation errors, success placeholder, no navigation on submit.
- Console: zero errors (favicon resolved).
- **Desktop regression check:** load at ≥769px and confirm `style.css` + `main.js` still drive the page and `mobile.css`/mobile JS are not applied.

---

## 11. File-Change Summary
**New:** `public/favicon.svg`, `public/mobile/mobile.css`, `mobile/chrome.js`, `mobile/accordion.js`, `mobile/reveal.js`, `mobile/home.js`, `mobile/portfolio.js`, `mobile/sobre.js`, `mobile/contato.js`. Resized founder portrait asset for Sobre (derived from `about.webp`, color). Resized mobile copies of the selected brand images for the full-bleed sections (§5.0; shortlist confirmed in the plan).
**Edited:** `index.html`, `portfolio.html`, `sobre.html`, `contato.html` (head link tags + entry script), `package.json` (add `motion`).
**Possibly touched:** `vite.config.js` (only if dynamic-import wiring requires it; confirmed in plan).
**Untouched (desktop behavior):** `style.css`, `main.js`, `portfolio.js`, `sobre.js`, `contato.js`, `portfolio-data.js`.

---

## 12. Open Items for Reviewer
1. ~~Founder portrait: B&W vs color~~ — **RESOLVED: color (`about.webp`)**.
2. ~~Copy trims~~ — **RESOLVED: withdrawn; keep full owner copy + lowercase / no-final-period rule (§7)**.
3. ~~Keep a marquee or cut?~~ — **RESOLVED: KEEP the marquee (owner loves it), words = the 6 services (§5.0)**.
4. ~~Typography (script vs Helvetica)~~ — **RESOLVED: Helvetica only, weights vary**.
5. **Full-bleed imagery selection (open):** which repo brand images to use for the full-bleed sections (candidates in §5.0) — I'll propose a shortlist with the plan.
6. **Confirmed out of scope** (owner brief, separate future work): logo asset, faceless hero photo, real Pinterest/Behance/TikTok URLs, Blog page (Substack), links-aggregator page.
