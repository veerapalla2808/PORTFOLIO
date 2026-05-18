# Portfolio Visual Redesign — Design Spec

## Goal

Transform the portfolio from a generic single-column layout into an elegant, premium-feeling site inspired by seera.framer.website — using a narrow sticky left strip, an indigo/violet palette, and a consistent gradient heading pattern across all sections.

## Architecture

Three coordinated changes work together: (1) a `SideStrip` component fixed to the left replaces the desktop Navbar and keeps the user's identity always on screen; (2) the CSS color system swaps from emerald/cyan to indigo/violet across both light and dark themes; (3) every section heading adopts a "plain text + gradient final word" pattern. The Navbar stays alive for mobile only.

## Tech Stack

Next.js 16 App Router · React 19 · Framer Motion 12 · CSS custom properties · SVG · IntersectionObserver

---

## 1. Color System (`app/globals.css`)

Replace all color variables in both `:root` (light) and `[data-theme="dark"]`.

### Light theme (`:root`)

| Variable | Old | New |
|---|---|---|
| `--bg-primary` | `#ffffff` | `#fafafe` |
| `--bg-secondary` | `#f0fdf9` | `#f0f0ff` |
| `--bg-card` | `#f0fdf9` | `#f5f5ff` |
| `--accent` | `#10b981` | `#6366f1` |
| `--accent-2` | `#0891b2` | `#a855f7` |
| `--accent-lite` | `#d1fae5` | `#e0e7ff` |
| `--accent-lite-2` | `#cffafe` | `#f3e8ff` |
| `--accent-text` | `#065f46` | `#3730a3` |
| `--border` | `#e5e7eb` | `#e0e7ff` |
| `--border-accent` | `#d1fae5` | `#c7d2fe` |
| `--shadow` | `0 4px 24px rgba(16,185,129,0.10)` | `0 4px 24px rgba(99,102,241,0.10)` |
| `--shadow-hover` | `0 8px 32px rgba(16,185,129,0.18)` | `0 8px 32px rgba(99,102,241,0.18)` |

### Dark theme (`[data-theme="dark"]`)

| Variable | Old | New |
|---|---|---|
| `--bg-primary` | `#060f0f` | `#0d0d1a` |
| `--bg-secondary` | `#081414` | `#12122a` |
| `--bg-card` | `rgba(34,211,238,0.06)` | `rgba(99,102,241,0.07)` |
| `--accent` | `#22d3ee` | `#818cf8` |
| `--accent-2` | `#818cf8` | `#c084fc` |
| `--accent-lite` | `rgba(34,211,238,0.12)` | `rgba(129,140,248,0.15)` |
| `--accent-lite-2` | `rgba(129,140,248,0.10)` | `rgba(192,132,252,0.12)` |
| `--accent-text` | `#67e8f9` | `#a5b4fc` |
| `--border` | `rgba(255,255,255,0.07)` | `rgba(129,140,248,0.10)` |
| `--border-accent` | `rgba(34,211,238,0.20)` | `rgba(129,140,248,0.25)` |
| `--shadow-hover` | `0 0 24px rgba(34,211,238,0.12)` | `0 0 28px rgba(129,140,248,0.20)` |

---

## 2. Layout Shell

### New CSS variable (`:root`)
```css
--strip-width: 220px;
```

### `app/globals.css` additions
```css
@media (min-width: 1024px) {
  .page-shell { padding-left: var(--strip-width); }
}
```

### `app/page.tsx`
Wrap the entire page return in a `<div className="page-shell">` so both `<main>` and `<Footer>` shift right on desktop.

### `components/Navbar.tsx`
On desktop (≥1024px):
- Hide the logo `<a>` — strip handles branding
- Hide the desktop `<nav>` links — strip handles navigation
- Hide the Resume `MagneticButton` — strip has the CTA
- Keep `ThemeToggle` hidden on desktop (strip shows it at bottom)
- Keep the mobile hamburger button visible only on mobile (already `flex md:hidden`)

Implementation: add `className="hidden lg:hidden"` (already using Tailwind breakpoints) to the logo, desktop nav, and Resume button. The header element itself can also be hidden on lg+ since the strip takes over entirely: add `className="lg:hidden"` to the `<header>`.

---

## 3. `components/SideStrip.tsx` — NEW

A `'use client'` component. Fixed left panel, visible only on desktop.

### Layout (top to bottom)
1. `VPLogo` component (size=56)
2. Name: `personal.name` — bold, `0.95rem`
3. Title: `personal.title` — muted, `0.75rem`
4. Availability pill — pulsing dot + "Available for opportunities"
5. Divider line
6. Section nav dots — one per section, label + filled/hollow dot. Active section tracked via `IntersectionObserver` (same pattern as existing `Navbar.tsx`).
7. Divider line
8. Social icons row (LinkedIn, Medium, Resume) — 32px squares, same hover treatment as Footer
9. "Let's Talk" `<a href="mailto:...">` button — `btn-primary` style, full width
10. `ThemeToggle` — at very bottom

### Sections tracked by nav dots
```ts
const SECTIONS = [
  { id: 'about',      label: 'About' },
  { id: 'skills',     label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects',   label: 'Projects' },
  { id: 'education',  label: 'Education' },
  { id: 'contact',    label: 'Contact' },
];
```

### Positioning
```css
position: fixed;
left: 0; top: 0; bottom: 0;
width: var(--strip-width);
z-index: 50;
border-right: 1px solid var(--border);
background: color-mix(in srgb, var(--bg-primary) 85%, transparent);
backdrop-filter: blur(12px);
padding: 2rem 1.25rem;
display: flex; flex-direction: column; gap: 0;
overflow-y: auto;
```

### Visibility
Wrap the entire strip in a container with `display: none` on mobile, `display: flex` on lg+:
```tsx
<aside className="hidden lg:flex" style={{ flexDirection: 'column', ... }}>
```

---

## 4. `components/ui/VPLogo.tsx` — NEW

A `'use client'` component.

### Visual
- 60×60px SVG inside a Framer Motion wrapper
- Outer circle: thin gradient ring, 40% opacity
- Center text: "VP" in bold monospace, gradient fill (`url(#vp-grad)`)
- Below "VP": `</>` in `var(--text-muted)` at 45% opacity, `fontSize: 9`
- `linearGradient` id `vp-grad`: `var(--accent)` → `var(--accent-2)`, diagonal

### Animation
```ts
animate={{
  rotateY: [0, 12, 0, -12, 0],
  y: [0, -4, 0, -4, 0],
}}
transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
```
Container has `style={{ perspective: 400 }}` for 3D depth.

### Hover
```ts
whileHover={{ scale: 1.08 }}
transition={{ type: 'spring', stiffness: 300, damping: 20 }}
```

### Props
```ts
interface VPLogoProps { size?: number; }
```
Default `size = 60`.

---

## 5. Typography Pattern — Section Headings

Every section's `<h2>` is updated. The last/key word is wrapped in `<span className="text-grad">`. The `.text-grad` class already exists in `globals.css` and will automatically use the new indigo/violet gradient after the palette swap.

| Component | New heading JSX |
|---|---|
| `About.tsx` | `Engineering With <span className="text-grad">Purpose</span>` |
| `Skills.tsx` | `Tools I <span className="text-grad">Master</span>` |
| `Experience.tsx` | `Where I've <span className="text-grad">Worked</span>` |
| `Projects.tsx` | `Things I've <span className="text-grad">Built</span>` |
| `Education.tsx` | `How I <span className="text-grad">Learned</span>` |
| `Contact.tsx` | `Let's Work <span className="text-grad">Together</span>` |

Each heading keeps the existing `section-title` class and `section-eyebrow` label above it.

---

## 6. Card Refinements (`app/globals.css`)

Three targeted changes to `.card-base`:

```css
.card-base {
  border-radius: 16px;          /* was 12px */
  /* other existing properties stay */
}
.card-base:hover {
  border-color: var(--accent);  /* was --border-accent; full accent on hover */
  border-top-color: var(--accent);
}
```

Section components with explicit `padding` on cards: bump from `1.5rem` to `2rem` where applicable. This is a component-level change done alongside the heading updates.

---

## File Impact Summary

| File | Type | Change |
|---|---|---|
| `app/globals.css` | Modify | Palette variables, `--strip-width`, `.page-shell`, card radius |
| `app/page.tsx` | Modify | Wrap in `<div className="page-shell">`, add `<SideStrip />` |
| `components/Navbar.tsx` | Modify | Hide header on `lg+` (strip takes over) |
| `components/SideStrip.tsx` | **Create** | Full sticky strip component |
| `components/ui/VPLogo.tsx` | **Create** | Animated VP monogram |
| `components/About.tsx` | Modify | Heading text + card padding |
| `components/Skills.tsx` | Modify | Heading text + card padding |
| `components/Experience.tsx` | Modify | Heading text + card padding |
| `components/Projects.tsx` | Modify | Heading text + card padding |
| `components/Education.tsx` | Modify | Heading text + card padding |
| `components/Contact.tsx` | Modify | Heading text + card padding |

---

## Constraints

- No new npm packages — Framer Motion, Lucide, react-icons already available
- `prefers-reduced-motion`: VPLogo animation must respect it (skip animate if reduced)
- Mobile behavior unchanged — SideStrip hidden, Navbar unchanged
- `lib/data.ts` is the single source of truth for name, title, email, social links — SideStrip reads from it, no hardcoding
- TypeScript strict mode: all new components must type-check clean
