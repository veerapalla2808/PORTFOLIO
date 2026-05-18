# Portfolio Redesign — Design Spec
**Date:** 2026-05-17
**Status:** Approved for implementation

---

## 1. Goal

Transform the current portfolio from a narrow, under-animated single-page site into a professional, cinematic showcase that:
1. Signals 11 years of senior-level engineering expertise on first glance
2. Presents all resume sections (Hero, About, Skills, Experience, Projects, Education, Contact) with visual authority
3. Delivers a memorable, interactive experience that stands out from typical dark-only dev portfolios

**Implementation approach:** Full visual rebuild — keep all infrastructure (data layer `lib/data.ts`, GSAP setup `lib/gsap.ts`, EmailJS form logic, Lenis smooth scroll, accessibility features) and rebuild every visual component from scratch against the new design system.

---

## 2. Design System

### 2.1 Theming

Light theme is the **default**. A toggle in the navbar switches to dark. Preference persists to `localStorage` via a `useTheme` hook. The `data-theme="dark"` attribute is set on `<html>` — all tokens flip via CSS variables.

### 2.2 Color Tokens

| Token | Light Value | Dark Value | Usage |
|---|---|---|---|
| `--bg-primary` | `#ffffff` | `#060f0f` | Page background |
| `--bg-secondary` | `#f0fdf9` | `#081414` | Alternate sections (About, Education) |
| `--bg-card` | `#f0fdf9` | `rgba(34,211,238,.06)` | Card backgrounds |
| `--accent` | `#10b981` | `#22d3ee` | Primary accent (Emerald → Cyan) |
| `--accent-2` | `#0891b2` | `#818cf8` | Secondary accent (Sky → Indigo) |
| `--accent-grad` | `linear-gradient(135deg, #10b981, #0891b2)` | `linear-gradient(135deg, #22d3ee, #818cf8)` | Gradient (buttons, text highlights) |
| `--accent-lite` | `#d1fae5` | `rgba(34,211,238,.12)` | Tinted backgrounds, badges |
| `--accent-lite-2` | `#cffafe` | `rgba(129,140,248,.10)` | Secondary tinted backgrounds |
| `--accent-text` | `#065f46` | `#67e8f9` | Text on tinted backgrounds |
| `--text-primary` | `#0f172a` | `#f1f5f9` | Headings, body text |
| `--text-secondary` | `#475569` | `#94a3b8` | Descriptions, subtitles |
| `--text-muted` | `#94a3b8` | `#475569` | Labels, timestamps |
| `--border` | `#e5e7eb` | `rgba(255,255,255,.07)` | Card borders, dividers |
| `--border-accent` | `#d1fae5` | `rgba(34,211,238,.20)` | Accent card borders |
| `--shadow` | `0 4px 24px rgba(16,185,129,.10)` | `none` | Card elevation (light only) |
| `--shadow-hover` | `0 8px 32px rgba(16,185,129,.18)` | `0 0 24px rgba(34,211,238,.12)` | Hover card elevation/glow |

### 2.3 Typography

| Role | Size | Weight | Font | Notes |
|---|---|---|---|---|
| Display (hero name/statement) | `clamp(3rem, 8vw, 6rem)` | 900 | Inter | letter-spacing: -0.05em, line-height: 0.9 |
| Section title | `clamp(2rem, 5vw, 3.5rem)` | 800 | Inter | letter-spacing: -0.03em |
| Section label (mono) | `0.7rem` | 600 | JetBrains Mono | `// 003 EXPERIENCE`, uppercase, letter-spacing: 4px |
| Card title | `1rem–1.1rem` | 700 | Inter | |
| Body | `0.95rem` | 400 | Inter | line-height: 1.7 |
| Description | `0.85rem` | 400 | Inter | color: `--text-secondary`, line-height: 1.65 |
| Pill/tag | `0.7rem` | 500 | Inter | |
| Metric number | `clamp(1.5rem, 4vw, 2.5rem)` | 900 | Inter | gradient fill |

### 2.4 Layout

- **Max-width:** `1400px`, centered, `2rem` side padding
- **Section padding:** `8rem` top and bottom (full-bleed width, content inside container)
- **Section backgrounds** alternate between two tokens only — keeps the pattern simple and avoids three shades fighting each other:
  - `--bg-primary` (`#ffffff` / `#060f0f`): Hero, Skills, Projects, Contact
  - `--bg-secondary` (`#f0fdf9` / `#081414`): About, Experience, Education
- **Card gaps:** `1.5rem` (standard), `2rem` (between major groups)
- **Border radius:** `12px` (cards), `8px` (pills/badges), `100px` (pill tags)

### 2.5 Core Component Library

**Buttons:**
- Primary: gradient background (`--accent-grad`), white text, 8px radius, 700 weight
- Secondary: transparent with `--border-accent` border, `--accent` text
- Ghost: text only, `--accent` color, arrow icon

**Cards:**
- Base glass card: `--bg-card` background, `1px solid --border` border, `12px` radius, `--shadow`
- Accent card: `--border-accent` border, `--accent-lite` background tint
- Featured card: gradient background at 8–12% opacity

**Skill pills:** `--accent-lite` bg, `--border-accent` border, `--accent-text` text (alternates with accent-2 variant)

**Section ghost numbers:** Absolute-positioned, `font-size: 8–10rem`, `color: rgba(accent, 0.06)`, decorative — reinforces section identity without competing with content.

---

## 3. Sections

### 3.1 Navbar

- Fixed top, `backdrop-filter: blur(16px)`, `--bg-primary` at 90% opacity
- Left: monogram logo `VP` in `--accent`, links to `#hero`
- Center: nav links (About, Work, Experience, Contact) — active link has a **sliding indicator** (Framer Motion `layoutId="nav-indicator"`) that moves between links as user scrolls
- Right: theme toggle (sun/moon icon, `useTheme`), Resume download button (primary gradient button, MagneticButton wrapper)
- Mobile: hamburger → full-screen overlay with staggered link entrance (Framer Motion)
- **Scroll progress bar:** 3px gradient line pinned to top of viewport, width driven by scroll position (Framer Motion `useScroll` + `scaleX` transform on a `position:fixed` element)

### 3.2 Hero

**Layout:** Full-viewport-height, centered vertically, max-width container.

**Content (top to bottom):**
1. Availability badge — pulsing green dot + "Available for opportunities" — `--accent-lite` bg, `--border-accent` border
2. Eyebrow — `// Senior Software Engineer · 11 Years` in monospace, `--accent`
3. Display title (3 lines):
   - Line 1: `I build systems` — solid `--text-primary`
   - Line 2: `that handle` — text-stroke outline style (transparent fill, `--text-muted` stroke)
   - Line 3: `millions.` — gradient fill (`--accent-grad`)
4. Subtitle — `Fintech · Healthcare · Retail · AI — across 5 companies, 40+ projects, 11+ years of production-grade software.`
5. CTA row — Primary button (See My Work) + Secondary button (Resume ↓), both wrapped in `MagneticButton`
6. Stats bar — horizontal row: `11+ Yrs`, `40+ Projects`, `5 Companies`, `3 Certs` — separated by subtle dividers, numbers use gradient fill

**Background:** Radial glow (accent color, 15% opacity) positioned top-right, parallax-scrolling at 0.3x speed.

**Hero entrance animation (BOLD):**
- Availability badge: fade in, 0ms delay
- Eyebrow: fade + slide up 20px, 100ms delay
- Title line 1: fade + slide up 30px, 200ms delay
- Title line 2: fade + slide up 30px, 300ms delay
- Title line 3: fade + slide up 30px, 400ms delay (gradient resolves last)
- Subtitle: fade in, 500ms delay
- CTAs: fade + slide up, 600ms delay
- Stats bar: each stat counts up from 0 (counter animation), staggered 150ms apart, starting at 700ms

### 3.3 About

**Layout:** `--bg-secondary` full-bleed. Two-column: left = bio (2/3), right = highlight cards (1/3). Stats row below spanning full width.

**Content:**
- Section label: `// 002 ABOUT`
- Section title: `Architecting at enterprise scale.` — last two words in gradient
- Bio: 2 paragraphs. First in larger weight (500, `--text-primary`). Second in regular (`--text-secondary`).
- Highlight cards (3, stacked right column): left border in `--accent`, title + one-line description. Cards: Architectural Depth, Product Mindset, Team Leadership
- Stats row: 4 stat cards (`11+ Years`, `40+ Projects`, `5 Companies`, `3 Certs`) — numbers animate on scroll entry

**Scroll animations (REFINED):**
- Section label + title: fade + slide up, trigger at 80% viewport
- Bio paragraphs: stagger fade + slide up, 100ms apart
- Highlight cards: stagger fade + slide up from right, 80ms apart
- Stat cards: stagger scale-in + counter animation, 100ms apart

### 3.4 Skills

**Layout:** `--bg-primary`. Bento grid — 4 columns desktop, 2 tablet, accordion on mobile. AI & GenAI cell spans 2 columns (featured).

**Content:** 7 categories with Lucide icons and pill tags. Alternating `--accent` and `--accent-2` pill variants for visual rhythm.

**Hover interaction:** Pill tooltip — small floating card showing `{skill}: {n} years · {level}` (Expert/Proficient/Familiar). Appears on hover with 150ms fade.

> **Data requirement:** `lib/data.ts` `SkillCategory.skills` entries must be extended from `string[]` to `{ name: string; years: number; level: 'Expert' | 'Proficient' | 'Familiar' }[]`. This is a data layer change (not schema-breaking — only Skills component reads this field).

**Scroll animations (REFINED):**
- Section label + title: combo D wipe (section number `003` clips in, then title zooms)
- Skill group cards: stagger fade + scale from 0.95 → 1, 60ms apart, left to right, top to bottom

### 3.5 Experience

**Layout:** `--bg-secondary` full-bleed. Two-part structure:
- **Part A — Career Timeline** (full width): horizontal progress bar showing 2013 → now with gradient fill. Company buttons below the bar, each clickable. Active company highlighted. Timeline bar fill animates 0→100% on scroll entry.
- **Part B — Detail Panel** (full width below): switches when user clicks a company. Contains role, company tag, date badge, 4 impact metrics, bullet points, tech pills.

**Timeline bar:** gradient from `rgba(--accent, 0.3)` → `--accent` → `--accent-2`. Year markers above. Company dots on the bar.

**Impact metrics:** 4 chips per role with the key quantified number (e.g., `2M+ / Daily Txns`, `60% / Faster Deploy`, `12K+ / AI Users`, `8 / Team Size`). Numbers animate up from 0 on panel entry.

**Panel switching animation:** Outgoing panel slides left + fades out (200ms). Incoming panel slides in from right + fades in (250ms). Spring easing.

**Scroll animations:**
- Timeline bar: width animates 0→100% on scroll trigger (GSAP ScrollTrigger, scrub: 1)
- Company dots: pop in sequentially (scale 0→1), staggered 120ms
- Detail panel: fade + slide up on initial entry
- Metric numbers: count up from 0 on panel activation
- Bullet points: stagger fade + slide, 70ms apart

### 3.6 Projects

**Layout:** `--bg-primary` full-bleed. Two large cards side-by-side desktop, stacked mobile. Each card: full-width with large ghost project number (`01`, `02`) positioned absolute top-right.

**Card content:** Project name, description, 4 highlight bullets, tech pill row, GitHub link.

**Interactions:** 3D tilt on mouse move (TiltCard, ±8°, spring physics). Border glows to `--border-accent` on hover. Ghost number fades in stronger on hover.

**Scroll animations (REFINED):**
- Section label + title: combo D
- Card 1: fade + slide up, trigger at 75% viewport
- Card 2: fade + slide up, 150ms after card 1

### 3.7 Education

**Layout:** `--bg-secondary`. Left: degree card. Right: 2 certification cards stacked.

**Scroll animations (REFINED):** Fade + slide up stagger.

### 3.8 Contact

**Layout:** `--bg-primary`. Left column: 4 contact link cards (Email, LinkedIn, Medium, Phone). Right column: EmailJS form.

**Form:** Floating label inputs (label animates up on focus/fill). Submit button is primary gradient with loading spinner state.

**Scroll animations (REFINED):**
- Contact cards: stagger fade + slide from left, 80ms apart
- Form fields: stagger fade + slide from right, 80ms apart

### 3.9 Footer

Three-column: Logo + tagline | Nav links | Social icons. Mobile: single column. Standard fade-in on scroll.

---

## 4. Animation System

### 4.1 Section Transition Choreography (A + D Combined)

Every section entry is a **3-beat sequence**:

1. **Beat 1 — Ghost number wipe (clip-path):** The large background section number (`// 003`, `// 004`...) reveals left→right via `clip-path: inset(0 100% 0 0)` → `clip-path: inset(0 0% 0 0)`. Duration: 600ms, ease: `power3.out`.
2. **Beat 2 — Title zoom-fade:** Section label and title scale from 0.92→1 + fade from 0→1. Starts 200ms after beat 1. Duration: 500ms, ease: `power2.out`.
3. **Beat 3 — Content stagger:** Cards/items stagger in with fade + slide up (20–30px). Starts 150ms after beat 2. Stagger: 80ms between items, ease: `power2.out`.

All triggered via **GSAP ScrollTrigger** at `start: "top 80%"`.

### 4.2 Scroll-Driven Animations

Using Framer Motion `useScroll` + `useTransform`:
- **Hero parallax:** background glow element scrolls at `0.3x` speed (moves up slower than content)
- **Hero content:** opacity fades 1→0, y shifts 0→-60px as user scrolls past hero (creates "pushing away" effect)
- **Scroll progress bar:** top-of-page gradient line, `scaleX` mapped to overall scroll progress

### 4.3 Scroll-Triggered Animations

Using GSAP ScrollTrigger (`start: "top 80%"`, `once: true`):
- Career timeline bar fill (scrub-driven — fills as user scrolls through Experience section)
- All card reveal animations (run once, not on scroll back up)
- Stat counter animations
- Section ghost number wipes

### 4.4 Parallax Layers

| Element | Scroll speed | Direction |
|---|---|---|
| Hero radial glow | 0.3x | Up (slower than content) |
| Hero decorative grid | 0.2x | Up |
| Section ghost numbers | 0.15x | Up (subtle depth) |

### 4.5 Interactive Animations

| Element | Trigger | Effect |
|---|---|---|
| CTA buttons | Mouse proximity (60px) | Magnetic pull — spring: stiffness 300, damping 20 |
| Custom cursor | Mouse move | Small dot (instant) + larger ring (spring lag). Ring expands 2x over interactive elements |
| Card hover | Mouse enter/leave | Border → `--border-accent`, shadow appears, translateY(-3px), 200ms ease |
| Skill pill hover | Mouse enter | Tooltip appears with fade 150ms |
| Experience company click | Click | Panel slides out left, new panel slides in from right |
| Nav links scroll | IntersectionObserver | Active indicator slides to current section link |
| Stat numbers | Section enters viewport | Count 0 → target over 1.5s, ease: power3.out |
| Project card | Mouse move | 3D tilt ±8°, spring physics, perspective 800px |

### 4.6 Accessibility

- All GSAP/Framer animations check `prefers-reduced-motion: reduce` — if set, skip enter/exit animations, keep only functional state changes (hover borders, active states)
- Counter animations skip to final value immediately if reduced motion
- Parallax disabled if reduced motion

---

## 5. Theme Toggle Implementation

```
lib/
  useTheme.ts        ← hook: reads/writes localStorage, sets data-theme on <html>

components/
  ThemeToggle.tsx    ← sun/moon icon button, calls useTheme
  Navbar.tsx         ← includes ThemeToggle

app/
  globals.css        ← :root { light tokens } [data-theme="dark"] { dark tokens }
  layout.tsx         ← ThemeScript injected in <head> to prevent FOUC
```

**FOUC prevention:** A tiny inline `<script>` in `<head>` reads `localStorage` and sets `data-theme` before first paint. No React hydration dependency.

---

## 6. Files Changed

### Modified
- `lib/data.ts` — extend `SkillCategory.skills` from `string[]` to `{ name, years, level }[]`
- `app/globals.css` — complete rewrite: new design tokens, section backgrounds, animations
- `app/layout.tsx` — add ThemeScript, update metadata
- `components/Navbar.tsx` — sliding nav indicator, theme toggle, scroll progress bar
- `components/Hero.tsx` — editorial layout, new entrance animation, parallax glow
- `components/About.tsx` — 2-col layout, highlight cards, stat counters
- `components/Skills.tsx` — bento grid, pill tooltips, combo-D section entry
- `components/Experience.tsx` — timeline + impact cards, panel switching animation
- `components/Projects.tsx` — full-width cards, tilt, ghost numbers
- `components/Education.tsx` — updated layout + animations
- `components/Contact.tsx` — floating labels, updated layout + animations
- `components/Footer.tsx` — updated tokens
- `components/ui/CustomCursor.tsx` — ring expansion on hover targets
- `components/ui/MagneticButton.tsx` — no changes needed (already implemented)
- `components/ui/TiltCard.tsx` — no changes needed (already implemented)

### New Files
- `lib/useTheme.ts` — theme hook with localStorage persistence
- `components/ThemeToggle.tsx` — sun/moon toggle button
- `components/ui/SkillTooltip.tsx` — tooltip component for skill pills
- `components/ui/ScrollProgressBar.tsx` — top-of-page progress indicator
- `components/ui/SectionTransition.tsx` — reusable wrapper: ghost number + combo-D entry

### Deleted
- `components/three/FloatingGeometry.tsx` — replaced by CSS parallax glow (lighter, theme-aware)
- `components/three/CodeRain.tsx` — removed (doesn't fit light-first design)
- `components/three/HeroCanvas.tsx` — removed with above

---

## 7. Decisions & Constraints

- **No new npm dependencies** — all effects use existing Framer Motion + GSAP stack
- **Three.js removed** — FloatingGeometry and CodeRain don't work in light mode and add bundle weight; replaced by CSS gradient effects
- **Dark mode is secondary** — dark theme uses the same component structure, only tokens change
- **Data layer untouched** — `lib/data.ts` is the single source of truth; no content changes
- **Performance** — all Three.js weight (~300KB) removed; animations use `will-change: transform` and `transform`/`opacity` only (compositor layer, no layout thrashing)
- **Accessibility** — all existing ARIA labels, semantic HTML, skip links, focus rings preserved; `prefers-reduced-motion` respected throughout
