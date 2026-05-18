# Portfolio Redesign — Design Specification
**Date:** 2026-05-18
**Status:** Approved
**Author:** Veera Palla (via brainstorming session)

---

## 1. Overview

A ground-up redesign of Veera Palla's developer portfolio. The goal is the most visually impressive, technically sophisticated, and accessible portfolio possible — built on Next.js 16 / React 19 / TypeScript, with a full animation stack (R3F + GSAP + Framer Motion), single cyan accent aesthetic, and WCAG 2.1 AA / ADA compliance throughout.

---

## 2. Content Source

All content is derived from `VeeraVDP-ReactNode.pdf` and stored in `lib/data.ts`.

### Personal
- **Name:** Veera Palla
- **Title:** Sr. React.js / Node.js Developer
- **Email:** veerapalla.work28@gmail.com
- **Phone:** (989) 318-3683
- **LinkedIn:** https://www.linkedin.com/in/veera-palla
- **Medium:** https://medium.com/@veera.palla919
- **Resume:** `/public/resume.pdf`

### Experience (5 roles)
1. Comerica Bank — Sr. React/Node Developer — Jun 2024–Present — Auburn Hills, MI
2. UCLA Health — Sr. React/Node Developer — Sep 2021–May 2024 — Los Angeles, CA
3. Dillard's — MERN Stack Developer — Nov 2018–Aug 2021 — Little Rock, AR
4. KeyBank — Full Stack Developer — Dec 2016–Sep 2018 — Cleveland, OH
5. Foxconn — UI/UX Developer — Jun 2013–Nov 2016 — India

### Projects (2 enterprise projects)
1. AI-Powered Banking Assistant (Comerica Bank)
2. HIPAA-Compliant EMR Platform (UCLA Health)

### Education
- **Degree:** Bachelor of Technology, Computer Science & Engineering
- **Institution:** Lovely Professional University
- **Location:** Jalandhar, Punjab
- **Year:** 2013

### Certifications
1. OpenJS Node.js Services Developer — OpenJS Foundation
2. React Developer Certified (Level 2) — Credly / React Training

### Skills (7 categories)
Front-End · Back-End · AI & GenAI · Cloud & DevOps · Databases · Testing & APIs · Messaging & Monitoring

---

## 3. Design Tokens

```css
--bg-primary:     #030303
--bg-card:        rgba(255, 255, 255, 0.03)
--bg-card-hover:  rgba(255, 255, 255, 0.05)
--accent:         #00f2ff          /* single cyan accent — no other colors */
--accent-dim:     rgba(0, 242, 255, 0.06)
--accent-border:  rgba(0, 242, 255, 0.12)
--accent-glow:    0 0 20px rgba(0, 242, 255, 0.3)
--text-primary:   #ffffff
--text-secondary: #a1a1aa
--text-muted:     #52525b
--border:         rgba(255, 255, 255, 0.06)
--border-hover:   rgba(255, 255, 255, 0.12)
--font-sans:      Inter, system-ui, sans-serif
--font-mono:      JetBrains Mono, monospace
--radius-card:    2rem
--header-height:  80px
```

**Grain texture:** SVG noise overlay at 4% opacity on `body::before` — adds premium tactile feel.

---

## 4. Breakpoints (Mobile-First)

| Token | Value | Target |
|-------|-------|--------|
| default | 0px | Mobile phones |
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktop |
| `2xl` | 1400px | Wide desktop |

All layouts start from mobile (single-column) and progressively enhance. Minimum touch target: 44×44px on all interactive elements.

---

## 5. Animation Stack

| Library | Role |
|---------|------|
| React Three Fiber + Three.js | Hero 3D scene (code rain, floating geometry) |
| GSAP + ScrollTrigger | Section reveal choreography, timeline line draw |
| Framer Motion | Micro-interactions, hover effects, entrance animations |
| Lenis | Smooth scroll provider (replaces native scroll-behavior) |
| tsParticles | Hero particle dust layer |

**Reduced motion:** All animations must check `prefers-reduced-motion: reduce`. When true: skip GSAP timelines, disable Three.js animation loop, disable Framer Motion transitions. Content must be fully readable without any animation.

---

## 6. Accessibility Standards

- **WCAG 2.1 Level AA** minimum throughout
- **ADA compliance** for all interactive components
- Contrast ratios: `#00f2ff` on `#030303` ≈ 15:1 ✓ | white on `#030303` ≈ 21:1 ✓
- Skip-to-main-content link: visually hidden, visible on `:focus`, first focusable element on page
- ARIA landmarks: `<nav>`, `<main>`, `<footer>`, each `<section>` has `aria-label`
- Decorative elements (`<canvas>`, particles, grain): `aria-hidden="true"`
- Heading hierarchy: one `<h1>` (hero name), `<h2>` per section, `<h3>` for sub-items
- Keyboard navigation: Tab order follows visual order; all hover effects have keyboard equivalents
- Focus rings: `outline: 2px solid #00f2ff; outline-offset: 4px` — never suppressed without replacement
- Form: all inputs have `<label>`, errors use `aria-describedby` + `aria-live="polite"`, required fields use `aria-required="true"`
- Semantic HTML: `<time>` for dates, `<ul>/<li>` for lists, `<article>` for cards
- Cross-browser: Chrome, Firefox, Safari, Edge (latest 2 versions each)

---

## 7. File Structure

```
app/
  layout.tsx              — Lenis provider, skip link, custom cursor, metadata
  page.tsx                — Section assembly
  globals.css             — Design tokens, grain texture, utility classes

components/
  Navbar.tsx              — Floating pill, scroll-triggered, active section dot
  Hero.tsx                — 3-layer composition orchestrator
  About.tsx               — Word reveal + stat cards + highlight grid
  Skills.tsx              — Mobile accordion → desktop 3-col bento grid
  Experience.tsx          — Self-drawing vertical timeline
  Projects.tsx            — Editorial cards with tilt + glow
  Education.tsx           — Degree card + certification cards (new component)
  Contact.tsx             — EmailJS form + social contact cards
  Footer.tsx              — Logo + nav + socials + copyright

components/three/
  HeroCanvas.tsx          — R3F Canvas wrapper with Suspense + lazy loading
  CodeRain.tsx            — WebGL matrix-style character rain (instanced mesh)
  FloatingGeometry.tsx    — Wireframe icosahedron + orbiting torus knots

components/ui/
  MagneticButton.tsx      — Magnetic pull hover (desktop only, touch fallback)
  TiltCard.tsx            — 3D perspective tilt on mouse move (desktop only)
  GlowBorder.tsx          — Animated cyan border glow on hover/focus
  CustomCursor.tsx        — Cursor dot + ring (hidden on touch devices)
  SkipLink.tsx            — Accessible skip-to-main link

lib/
  data.ts                 — Single source of truth for all content (update medium URL)
  gsap.ts                 — GSAP + ScrollTrigger registration module
```

---

## 8. Section Designs

### 8.1 Navigation
- **Type:** Floating pill, fixed `top: 24px`, centered horizontally
- **Behavior:** Hidden on load; springs down after 100px scroll; hides when back at top
- **Visual:** `background: rgba(3,3,3,0.7)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(0,242,255,0.08)`
- **Active indicator:** Cyan dot beneath active section link, animated via Framer Motion `layoutId`
- **Nav links:** Hover → cyan underline draws left-to-right via `clip-path`
- **Resume button:** Pill-shaped, cyan border, magnetic hover, downloads `/public/resume.pdf`
- **Mobile:** Shrinks to `VP` monogram + hamburger; opens fullscreen overlay with staggered links

### 8.2 Hero
Three layers composited via z-index:

**Layer 1 — R3F Canvas (z-index: 0, aria-hidden, pointer-events: none)**
- `CodeRain`: instanced mesh of cyan characters (`#00f2ff` at 4% opacity) falling vertically — atmospheric, not distracting
- `FloatingGeometry`: one large wireframe icosahedron (slow rotation) + 3 torus knots orbiting at different speeds; all cyan wireframe; mouse parallax ±20px via `useFrame`

**Layer 2 — tsParticles (z-index: 1, aria-hidden)**
- ~60 tiny cyan particles, slow drift, connecting lines within 120px

**Layer 3 — Typography (z-index: 10)**
```
[● Available for Senior Opportunities]     ← pulsing green dot + badge

VEERA                                      ← font-black, 10vw, white
PALLA.                                     ← same, with cyan text-shadow glow

[Typewriter cycling 4 roles]               ← JetBrains Mono, cyan

"Crafting high-performance digital         ← fade-in tagline
 architectures with 11+ years..."

[View My Work ↓]  [Download Resume]        ← CTA: magnetic buttons

──── Scroll to explore ────                ← bottom, pulsing indicator
```

**Entrance sequence (Framer Motion stagger):**
0ms → badge | 200ms → "VEERA" | 350ms → "PALLA." | 600ms → typewriter | 900ms → tagline | 1100ms → CTAs | 1400ms → scroll indicator

**Scroll exit:** Hero content fades + scales to 0.9; canvas dissolves — smooth handoff to About.

### 8.3 About
- **Label:** `01 // ABOUT`
- **Layout:** 2-column on `lg+` (60/40 split); single column on mobile
- **Left:** `WordReveal` — bio text, each word fades 10%→100% as it scrolls into view
- **Right:** 4 stat cards stacked (11+ Years · 40+ Projects · 5 Companies · 3 Cloud Platforms) — glassmorphism, cyan numbers, GSAP slide-in from right
- **Bottom:** 3 highlight cards full-width (Architectural Depth · Product Mindset · Senior Leadership) — glassmorphism, hover → cyan glow border, GSAP stagger up

### 8.4 Skills
- **Label:** `02 // SKILLS & TECH STACK`
- **Mobile:** Accordion list — tap category to expand, skill pills inside
- **Tablet:** 2-column card grid
- **Desktop:** 3-column bento grid; AI & GenAI card spans 2 columns (differentiator)
- **Cards:** Glassmorphism, cyan category icon, skill pills (`bg: accent-dim`, `border: accent-border`, monospace font)
- **Pill hover:** cyan glow + scale 1.05 (desktop); tap highlight (mobile)
- **GSAP:** Grid fades up on scroll, cards stagger 80ms each
- **Animated underline:** Draws under section subtitle word "Build" in cyan on scroll entry

### 8.5 Experience
- **Label:** `03 // EXPERIENCE`
- **Timeline line:** Vertical line; GSAP ScrollTrigger `scaleY` 0→1 as user scrolls through section (draws itself)
- **Mobile:** Single column, cards full-width, line left-aligned
- **Desktop:** Alternating left/right cards; company initial floats on line node
- **Cards:** Glassmorphism; tech pills (same system as Skills); active card → cyan left-border glow
- **GSAP:** Each card slides in from right (desktop) / fades up (mobile) as its node enters viewport
- **Company name hover:** Cyan underline draws in
- **Dates:** Wrapped in `<time datetime="...">` elements

### 8.6 Projects
- **Label:** `04 // PROJECTS`
- **Mobile:** Full-width stacked cards
- **Tablet:** 2-column grid
- **Desktop:** Full-width editorial cards with large project number (`01`, `02`) as background watermark
- **Card contents:** Project name + GitHub link → description → highlight bullets → tech pills
- **Desktop hover (TiltCard):** ±8° perspective tilt tracking mouse; cyan glow from nearest edge; project number reveals; GitHub arrow rotates 45°
- **Mobile touch:** Tap → cyan border flash; all content visible by default (no hover-reveal)
- **GSAP:** Cards stagger up on scroll entry; project number counter scrubs with scroll

### 8.7 Education & Certifications
- **Label:** `05 // EDUCATION & CERTIFICATIONS`
- **Mobile:** Stacked full-width cards
- **Desktop:** 2-column — degree card left (wider, more visual weight), cert cards right (stacked)
- **Degree card:** Large glassmorphism card; graduation cap icon (cyan); `<h3>` for degree name; institution + location + year in hierarchy; single card, stands alone confidently — not sparse
- **Cert cards:** Compact glassmorphism; badge acronym in large cyan monospace; title + issuer beside it; `<ul>/<li>` with `role="list"`
- **GSAP:** Degree card slides from left; cert cards stagger from right

### 8.8 Contact
- **Label:** `06 // CONTACT`
- **Headline:** "Let's Build Something."
- **Mobile:** Social contact cards stacked → form below
- **Desktop:** 2-column — contact cards left, EmailJS form right
- **Contact cards (4):** Email · LinkedIn · Medium · Phone — glassmorphism, icon in cyan, magnetic hover (desktop), 44px touch targets (mobile)
- **Form fields:** Name · Email · Message — dark glass inputs, floating label animation, cyan focus ring
- **Submit button:** Full-width cyan border pill; loading spinner during send; success/error `aria-live="polite"` announcement
- **Validation:** Inline errors beneath each field; `aria-describedby` + `aria-required`
- **EmailJS env vars:** `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`, `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`

### 8.9 Footer
- **Layout:** 3-column on desktop (logo+tagline · nav links · socials); single column centered on mobile
- **Logo:** "VP" monogram in cyan + name + title
- **Nav links:** All 6 section links; hover → cyan underline
- **Socials:** Email · LinkedIn · Medium · Phone icons — 44px touch targets
- **Divider:** Thin cyan line (`rgba(0,242,255,0.15)`) above copyright
- **Copyright:** `© 2025 Veera Palla · Built with Next.js & React`

---

## 9. Shared UI Components

### MagneticButton
- On `mousemove`: translate button toward cursor within bounding radius (max ±15px) using Framer Motion spring
- On `mouseleave`: spring back to origin
- Desktop only — no effect on touch devices (detected via `pointer: coarse` media query)

### TiltCard
- On `mousemove`: apply CSS `perspective(1000px) rotateX() rotateY()` capped at ±8°
- On `mouseleave`: reset with spring transition
- Desktop only

### GlowBorder
- Hover/focus: `box-shadow: 0 0 20px rgba(0,242,255,0.3)` + `border-color: rgba(0,242,255,0.4)` transition 400ms
- Used on all cards, form inputs, buttons

### CustomCursor
- Large ring (32px) + small dot (6px), both cyan
- Ring lags behind cursor with spring physics (Framer Motion)
- Scales up on hoverable elements
- Hidden on touch devices (`pointer: coarse`) and replaces default cursor only on pointer devices
- `aria-hidden="true"`, `pointer-events: none`

---

## 10. Performance Targets

- Lighthouse Performance ≥ 90 on mobile and desktop
- Three.js canvas lazy-loaded via dynamic import + React Suspense
- GSAP lazy-loaded via dynamic import
- Images: Next.js `<Image>` component with `priority` on above-fold only
- Fonts: `display: swap` (already configured)
- No layout shift from font loading (size-adjust fallback)
- Code split: each section component lazy-loaded below the fold

---

## 11. Data Layer Changes Required

Update `lib/data.ts`:
1. Replace `github` field in `personal` with `medium: "https://medium.com/@veera.palla919"`
2. Add `education` export with LPU B.Tech CSE 2013 data
3. Keep all other data unchanged

---

## 12. Environment Variables Required

Create `.env.local`:
```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

---

## 13. Out of Scope

- Backend / API routes (portfolio is static)
- Authentication
- CMS integration
- Personal GitHub projects (work projects only)
- Multiple pages (single-page application)
- Dark/light mode toggle (dark only)
