# Portfolio Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the portfolio into a premium, Seera-inspired design via three coordinated changes: indigo/violet colour palette, a sticky side strip replacing the desktop navbar, and gradient heading pattern across all sections.

**Architecture:** CSS custom properties handle the entire palette swap without touching component colours. A new `SideStrip` component sits `position: fixed` on the left at 220 px; a `.page-shell` wrapper adds `padding-left` on desktop to offset content. The existing `Navbar` is hidden on `lg+` breakpoints so the strip takes over desktop navigation entirely.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript strict · Framer Motion 12 · CSS custom properties · SVG · IntersectionObserver · Tailwind (for breakpoint classes only)

---

## Task 1: Colour System + Layout Utilities

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Replace the light-theme (`:root`) colour block**

Open `app/globals.css`. The current `:root` block starts at line 5. Replace every colour variable in it with the new indigo/violet palette. Leave `--font-sans`, `--font-mono`, and `--header-height` untouched. Add `--strip-width: 220px;` as a new variable.

New `:root` block:
```css
:root {
  --bg-primary:    #fafafe;
  --bg-secondary:  #f0f0ff;
  --bg-card:       #f5f5ff;

  --accent:        #6366f1;
  --accent-2:      #a855f7;
  --accent-lite:   #e0e7ff;
  --accent-lite-2: #f3e8ff;
  --accent-text:   #3730a3;

  --text-primary:   #0f172a;
  --text-secondary: #475569;
  --text-muted:     #94a3b8;

  --border:        #e0e7ff;
  --border-accent: #c7d2fe;

  --shadow:        0 4px 24px rgba(99, 102, 241, 0.10);
  --shadow-hover:  0 8px 32px rgba(99, 102, 241, 0.18);

  --font-sans:     var(--font-inter), system-ui, sans-serif;
  --font-mono:     var(--font-jetbrains), monospace;
  --header-height: 72px;
  --strip-width:   220px;
}
```

- [ ] **Step 2: Replace the dark-theme (`[data-theme="dark"]`) colour block**

The current dark block starts at line 32. Replace all colour variables:

```css
[data-theme="dark"] {
  --bg-primary:    #0d0d1a;
  --bg-secondary:  #12122a;
  --bg-card:       rgba(99, 102, 241, 0.07);

  --accent:        #818cf8;
  --accent-2:      #c084fc;
  --accent-lite:   rgba(129, 140, 248, 0.15);
  --accent-lite-2: rgba(192, 132, 252, 0.12);
  --accent-text:   #a5b4fc;

  --text-primary:   #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted:     #475569;

  --border:        rgba(129, 140, 248, 0.10);
  --border-accent: rgba(129, 140, 248, 0.25);

  --shadow:        none;
  --shadow-hover:  0 0 28px rgba(129, 140, 248, 0.20);
}
```

- [ ] **Step 3: Update `.card-base` border-radius and hover**

Find `.card-base` (around line 169). Change `border-radius` from `12px` to `16px`. Change the hover `border-color` from `var(--border-accent)` to `var(--accent)`:

```css
.card-base {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: var(--shadow);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}
.card-base:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow-hover);
  transform: translateY(-3px);
}
```

- [ ] **Step 4: Add `.page-shell` layout utility**

After the `.container-wide` block (around line 118), add:

```css
/* ─── Side-strip layout offset ───────────────────────────────────────────── */
@media (min-width: 1024px) {
  .page-shell { padding-left: var(--strip-width); }
}
```

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit
```
Expected: no output (clean).

- [ ] **Step 6: Visual check**

The dev server should already be running on `http://localhost:3000`. Open it. The site should now show indigo/violet colours in both light and dark modes. Cards should have slightly larger border-radius. No layout shift yet — that comes in Task 4.

- [ ] **Step 7: Commit**

```bash
git add app/globals.css
git commit -m "feat: swap colour palette to indigo/violet, add --strip-width and .page-shell"
```

---

## Task 2: VPLogo Component

**Files:**
- Create: `components/ui/VPLogo.tsx`

- [ ] **Step 1: Create the file**

Create `components/ui/VPLogo.tsx` with the full content below. This is a client component — it uses Framer Motion's `useReducedMotion` to skip animation when the OS has reduced-motion enabled.

```tsx
'use client';
import { motion, useReducedMotion } from 'framer-motion';

interface VPLogoProps { size?: number; }

export default function VPLogo({ size = 60 }: VPLogoProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      style={{ width: size, height: size, perspective: 400, display: 'inline-block' }}
      animate={reduced ? {} : {
        rotateY: [0, 12, 0, -12, 0],
        y:       [0, -4,  0,  -4, 0],
      }}
      transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
      whileHover={{ scale: 1.08 }}
    >
      <svg
        viewBox="0 0 60 60"
        width={size}
        height={size}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id="vp-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>

        {/* Outer ring */}
        <circle
          cx="30" cy="30" r="28"
          fill="none"
          stroke="url(#vp-grad)"
          strokeWidth="1.5"
          opacity="0.4"
        />

        {/* VP initials */}
        <text
          x="50%" y="46%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontWeight="900"
          fontSize="22"
          fill="url(#vp-grad)"
          letterSpacing="-1"
        >
          VP
        </text>

        {/* Dev marker */}
        <text
          x="50%" y="72%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontWeight="700"
          fontSize="9"
          fill="var(--text-muted)"
          opacity="0.5"
        >
          {'</>'}
        </text>
      </svg>
    </motion.div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no output.

- [ ] **Step 3: Visual spot-check**

The component isn't wired up yet, but you can temporarily import it in any page to check it renders. Skip this if comfortable.

- [ ] **Step 4: Commit**

```bash
git add components/ui/VPLogo.tsx
git commit -m "feat: add animated VPLogo SVG monogram component"
```

---

## Task 3: SideStrip Component

**Files:**
- Create: `components/SideStrip.tsx`

Depends on: Task 2 (VPLogo), Task 1 (CSS variables). The `personal` object is imported from `@/lib/data` — do not hardcode any strings.

- [ ] **Step 1: Create `components/SideStrip.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaLinkedin, FaMedium } from 'react-icons/fa6';
import { FileText } from 'lucide-react';
import VPLogo from './ui/VPLogo';
import ThemeToggle from './ThemeToggle';
import { personal } from '@/lib/data';

const SECTIONS = [
  { id: 'about',      label: 'About' },
  { id: 'skills',     label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects',   label: 'Projects' },
  { id: 'education',  label: 'Education' },
  { id: 'contact',    label: 'Contact' },
];

const SOCIALS = [
  { Icon: FaLinkedin, label: 'LinkedIn', href: personal.linkedin },
  { Icon: FaMedium,   label: 'Medium',   href: personal.medium },
  { Icon: FileText,   label: 'Resume',   href: personal.resumeUrl },
];

export default function SideStrip() {
  const [active, setActive] = useState('');

  useEffect(() => {
    const observers = SECTIONS.map(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { threshold: 0.3 },
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  return (
    <aside
      aria-label="Site navigation"
      className="hidden lg:flex"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: 'var(--strip-width)',
        zIndex: 50,
        flexDirection: 'column',
        padding: '2rem 1.25rem',
        borderRight: '1px solid var(--border)',
        background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <a
        href="#hero"
        aria-label="Back to top"
        style={{ display: 'inline-block', marginBottom: '1rem' }}
      >
        <VPLogo size={56} />
      </a>

      {/* Identity */}
      <p style={{
        fontSize: '0.9rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        lineHeight: 1.3,
        marginBottom: '0.2rem',
      }}>
        {personal.name}
      </p>
      <p style={{
        fontSize: '0.72rem',
        color: 'var(--text-secondary)',
        marginBottom: '0.85rem',
        lineHeight: 1.4,
      }}>
        {personal.title}
      </p>

      {/* Availability */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        background: 'var(--accent-lite)',
        border: '1px solid var(--border-accent)',
        borderRadius: 999,
        padding: '0.25rem 0.65rem',
        fontSize: '0.65rem',
        fontWeight: 600,
        color: 'var(--accent-text)',
        marginBottom: '1.5rem',
        width: 'fit-content',
      }}>
        <motion.span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--accent)',
            display: 'inline-block',
            flexShrink: 0,
          }}
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        Available
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border)', marginBottom: '1.25rem' }} />

      {/* Section nav */}
      <nav
        aria-label="Section navigation"
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}
      >
        {SECTIONS.map(({ id, label }) => {
          const isActive = active === id;
          return (
            <a
              key={id}
              href={`#${id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.75rem',
                fontWeight: isActive ? 700 : 400,
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
                padding: '0.2rem 0',
              }}
            >
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: isActive ? 'var(--accent)' : 'transparent',
                border: `1.5px solid ${isActive ? 'var(--accent)' : 'var(--text-muted)'}`,
                flexShrink: 0,
                transition: 'all 0.2s ease',
              }} />
              {label}
            </a>
          );
        })}
      </nav>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border)', margin: '1.25rem 0' }} />

      {/* Social icons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {SOCIALS.map(({ Icon, label, href }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg-primary)',
              color: 'var(--text-muted)',
              transition: 'all 0.2s ease',
              textDecoration: 'none',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.borderColor = 'var(--border-accent)';
              el.style.color       = 'var(--accent)';
              el.style.background  = 'var(--accent-lite)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.borderColor = 'var(--border)';
              el.style.color       = 'var(--text-muted)';
              el.style.background  = 'var(--bg-primary)';
            }}
          >
            <Icon size={14} aria-hidden="true" />
          </a>
        ))}
      </div>

      {/* CTA */}
      <a
        href={`mailto:${personal.email}`}
        className="btn-primary"
        style={{
          textAlign: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          fontSize: '0.8rem',
          padding: '0.55rem 1rem',
        }}
      >
        Let&apos;s Talk
      </a>

      {/* Theme toggle */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeToggle />
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add components/SideStrip.tsx
git commit -m "feat: add SideStrip fixed navigation panel with VPLogo, section dots, socials"
```

---

## Task 4: Layout Integration

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/Navbar.tsx`

Depends on: Task 3 (SideStrip must exist before wiring).

- [ ] **Step 1: Update `app/page.tsx`**

Add `SideStrip` import and wrap the page in the layout shell. The full new file:

```tsx
// app/page.tsx
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Education from "@/components/Education";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SectionReveal from "@/components/ui/SectionReveal";
import SideStrip from "@/components/SideStrip";

export default function Home() {
  return (
    <>
      <SideStrip />
      <Navbar />
      <div className="page-shell">
        <main id="main-content" tabIndex={-1}>
          <Hero />
          <SectionReveal variant="fold"        ><About      /></SectionReveal>
          <SectionReveal variant="sweep-left"  ><Skills     /></SectionReveal>
          <SectionReveal variant="curtain"     ><Experience /></SectionReveal>
          <SectionReveal variant="zoom"        ><Projects   /></SectionReveal>
          <SectionReveal variant="sweep-right" ><Education  /></SectionReveal>
          <SectionReveal variant="blur-in"     ><Contact    /></SectionReveal>
        </main>
        <Footer />
      </div>
    </>
  );
}
```

- [ ] **Step 2: Hide the Navbar header on desktop**

Open `components/Navbar.tsx`. The `<header` element is at line 57. Add `className="lg:hidden"` to it so it disappears on desktop (≥1024px) where the SideStrip takes over:

```tsx
<header
  className="lg:hidden"
  style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    // ... rest of existing style props unchanged
  }}
>
```

The `ScrollProgressBar` at line 55 is a sibling of `<header>` (not inside it), so it remains visible on all breakpoints — that's fine.

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```
Expected: no output.

- [ ] **Step 4: Visual check in browser at `http://localhost:3000`**

On a desktop-width viewport (≥1024px) you should see:
- The 220px strip on the left: VP logo, name, title, availability pill, section dots, social icons, Let's Talk button, ThemeToggle
- All page content shifted 220px to the right
- The top navbar gone on desktop
- Scrolling updates the active section dot in the strip

On a mobile viewport (<1024px):
- Strip invisible
- Top navbar visible with hamburger

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx components/Navbar.tsx
git commit -m "feat: wire SideStrip into layout, hide desktop Navbar on lg+ breakpoint"
```

---

## Task 5: Section Headings

**Files:**
- Modify: `components/About.tsx` (lines 37–42)
- Modify: `components/Skills.tsx` (line 21)
- Modify: `components/Experience.tsx` (lines 92–96)
- Modify: `components/Projects.tsx` (line 15)
- Modify: `components/Education.tsx` (line 13)
- Modify: `components/Contact.tsx` (line 147)

Each section uses `<SectionTransition title={...}>` where `title` is a `React.ReactNode`. Update each `title` prop to the new gradient pattern. The `text-grad` class already exists in `globals.css` and is already updated to the new indigo/violet gradient via the palette swap in Task 1.

- [ ] **Step 1: Update `components/About.tsx` title (lines 37–42)**

Replace:
```tsx
title={
  <>
    Architecting at{' '}
    <span className="text-grad">enterprise scale.</span>
  </>
}
```
With:
```tsx
title={<>Engineering With <span className="text-grad">Purpose</span></>}
```

- [ ] **Step 2: Update `components/Skills.tsx` title (line 21)**

Replace:
```tsx
title={<>Tech <span className="text-grad">Stack</span></>}
```
With:
```tsx
title={<>Tools I <span className="text-grad">Master</span></>}
```

- [ ] **Step 3: Update `components/Experience.tsx` title (lines 92–96)**

Replace:
```tsx
title={
  <>11 years ·{' '}
    <span className="text-grad">5 companies</span>
  </>
}
```
With:
```tsx
title={<>Where I&apos;ve <span className="text-grad">Worked</span></>}
```

- [ ] **Step 4: Update `components/Projects.tsx` title (line 15)**

Replace:
```tsx
title={<>Featured <span className="text-grad">Work</span></>}
```
With:
```tsx
title={<>Things I&apos;ve <span className="text-grad">Built</span></>}
```

- [ ] **Step 5: Update `components/Education.tsx` title (line 13)**

Replace:
```tsx
title={<>Academic <span className="text-grad">Foundation</span></>}
```
With:
```tsx
title={<>How I <span className="text-grad">Learned</span></>}
```

- [ ] **Step 6: Update `components/Contact.tsx` title (line 147)**

Replace:
```tsx
title={<>Let&apos;s <span className="text-grad">work together.</span></>}
```
With:
```tsx
title={<>Let&apos;s Work <span className="text-grad">Together</span></>}
```

- [ ] **Step 7: Type-check**

```bash
npx tsc --noEmit
```
Expected: no output.

- [ ] **Step 8: Visual check in browser**

Scroll through every section and confirm:
- Each `<h2>` shows the new text with the last word in the indigo→violet gradient
- Gradient renders correctly in both light and dark modes
- No section shows the old heading text

- [ ] **Step 9: Commit**

```bash
git add components/About.tsx components/Skills.tsx components/Experience.tsx components/Projects.tsx components/Education.tsx components/Contact.tsx
git commit -m "feat: update all section headings to gradient-word pattern"
```

---

## Spec Coverage Check

| Spec requirement | Task |
|---|---|
| Light theme → indigo/violet palette | Task 1 |
| Dark theme → indigo/violet palette | Task 1 |
| `--strip-width` CSS variable | Task 1 |
| `.page-shell` layout offset | Task 1 |
| Card border-radius 16px + hover accent border | Task 1 |
| VPLogo animated SVG monogram | Task 2 |
| `prefers-reduced-motion` respected in VPLogo | Task 2 |
| SideStrip fixed left panel | Task 3 |
| SideStrip: logo, name, title, availability pill | Task 3 |
| SideStrip: section nav dots + IntersectionObserver | Task 3 |
| SideStrip: social icons + CTA + ThemeToggle | Task 3 |
| SideStrip hidden on mobile | Task 3 |
| SideStrip wired into page.tsx | Task 4 |
| Navbar hidden on lg+ | Task 4 |
| Mobile layout unchanged | Task 4 |
| All 6 section headings updated | Task 5 |
| `lib/data.ts` as single source of truth | Task 3 (no hardcoding) |
| TypeScript strict mode clean | Every task |
