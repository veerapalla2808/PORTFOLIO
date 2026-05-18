# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ground-up redesign of Veera Palla's developer portfolio — three-layer hero (matrix rain + R3F 3D geometry + bold typography), single cyan accent, floating pill navbar, GSAP ScrollTrigger section reveals, and WCAG 2.1 AA / ADA compliance throughout.

**Architecture:** Single-page Next.js 16 App Router application. All section components are Client Components (hooks + browser APIs). Three.js canvas is code-split via `next/dynamic` with `ssr: false`. GSAP + Lenis are initialized in a client `LenisProvider` wrapping `<body>`. Content lives in `lib/data.ts` (single source of truth).

**Tech Stack:** Next.js 16.2.4, React 19, TypeScript, Tailwind CSS v4, Framer Motion 12, GSAP + ScrollTrigger, React Three Fiber, Three.js, Lenis, tsParticles, EmailJS, typewriter-effect

---

## Task 1: Install New Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime dependencies**

```bash
npm install three @react-three/fiber @react-three/drei gsap lenis
```

Expected output: `added N packages` with no peer dependency errors.

- [ ] **Step 2: Install type definitions**

```bash
npm install -D @types/three
```

- [ ] **Step 3: Verify installation**

```bash
npm ls three @react-three/fiber @react-three/drei gsap lenis
```

Expected: each package listed at correct version with no `UNMET DEPENDENCY` warnings.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install three, r3f, gsap, lenis dependencies"
```

---

## Task 2: Update Design Tokens and Global CSS

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Replace globals.css entirely**

```css
@import "tailwindcss";

/* ─── Design Tokens ─────────────────────────────────────────────────────────── */
:root {
  --bg-primary:    #030303;
  --bg-card:       rgba(255, 255, 255, 0.03);
  --bg-card-hover: rgba(255, 255, 255, 0.05);

  --accent:        #00f2ff;
  --accent-dim:    rgba(0, 242, 255, 0.06);
  --accent-border: rgba(0, 242, 255, 0.12);
  --accent-glow:   0 0 20px rgba(0, 242, 255, 0.3);

  --text-primary:  #ffffff;
  --text-secondary:#a1a1aa;
  --text-muted:    #52525b;

  --border:        rgba(255, 255, 255, 0.06);
  --border-hover:  rgba(255, 255, 255, 0.12);

  --font-sans:     var(--font-inter), system-ui, sans-serif;
  --font-mono:     var(--font-jetbrains), monospace;

  --radius-card:   2rem;
  --header-height: 80px;
}

/* ─── Reset ─────────────────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html {
  scroll-behavior: smooth;
  color-scheme: dark;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-sans);
  line-height: 1.5;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  position: relative;
}

/* ─── Grain Texture ──────────────────────────────────────────────────────────── */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 200px 200px;
}

/* ─── Scrollbar ──────────────────────────────────────────────────────────────── */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--bg-primary); }
::-webkit-scrollbar-thumb { background: rgba(0, 242, 255, 0.2); border-radius: 10px; }

/* ─── Typography ─────────────────────────────────────────────────────────────── */
h1, h2, h3, h4, h5, h6 {
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--text-primary);
}

/* ─── Focus Rings (WCAG AA) ──────────────────────────────────────────────────── */
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
  border-radius: 4px;
}

/* ─── Screen-reader Only ─────────────────────────────────────────────────────── */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.focus\:not-sr-only:focus {
  position: fixed;
  width: auto;
  height: auto;
  padding: 0.5rem 1rem;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}

/* ─── Layout ─────────────────────────────────────────────────────────────────── */
.container-wide {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

@media (max-width: 640px) {
  .container-wide { padding: 0 1rem; }
}

/* ─── Section ────────────────────────────────────────────────────────────────── */
section {
  padding: 8rem 0;
}

@media (max-width: 768px) {
  section { padding: 5rem 0; }
}

.section-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.25em;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
}

.section-label::before {
  content: "";
  display: block;
  width: 2rem;
  height: 1px;
  background: var(--accent-border);
  flex-shrink: 0;
}

.section-title {
  font-size: clamp(1.75rem, 5vw, 3.5rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.04em;
  margin-bottom: 3rem;
}

/* ─── Glassmorphism Card ─────────────────────────────────────────────────────── */
.glass-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
}

.glass-card:hover {
  background: var(--bg-card-hover);
  border-color: var(--accent-border);
  box-shadow: var(--accent-glow);
}

/* ─── Skill Pill ─────────────────────────────────────────────────────────────── */
.skill-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  background: var(--accent-dim);
  border: 1px solid var(--accent-border);
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-secondary);
  transition: color 0.2s, box-shadow 0.2s, transform 0.2s;
  white-space: nowrap;
}

.skill-pill:hover {
  color: var(--accent);
  box-shadow: 0 0 8px rgba(0, 242, 255, 0.2);
  transform: scale(1.05);
}

/* ─── Cursor: hide default on pointer devices ────────────────────────────────── */
@media (pointer: fine) {
  * { cursor: none !important; }
}

/* ─── Reduced Motion Overrides ───────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  html { scroll-behavior: auto; }
}
```

- [ ] **Step 2: Verify dev server starts with no CSS errors**

```bash
npm run dev
```

Open http://localhost:3000 — background should be `#030303`. No console errors.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "style: replace design tokens with cyan-only system + grain texture"
```

---

## Task 3: Update Data Layer

**Files:**
- Modify: `lib/data.ts`

- [ ] **Step 1: Replace the `personal` object and add Education types**

Open `lib/data.ts`. Replace the `personal` const and add new exports:

```typescript
// ─── Resume Data ────────────────────────────────────────────────────────────
// Single source of truth — synced with VeeraVDP-ReactNode.pdf

export const personal = {
  name: "Veera Palla",
  title: "Sr. React.js / Node.js Developer",
  tagline:
    "11+ years building scalable, high-performance full-stack applications with React 18, Next.js 15, Node.js, and AI integrations.",
  email: "veerapalla.work28@gmail.com",
  phone: "(989) 318-3683",
  location: "Michigan, USA",
  linkedin: "https://www.linkedin.com/in/veera-palla",
  medium: "https://medium.com/@veera.palla919",
  resumeUrl: "/resume.pdf",
} as const;
```

- [ ] **Step 2: Add Education and Certification interfaces + exports**

Append after the existing `certifications` export:

```typescript
export interface Education {
  degree: string;
  field: string;
  institution: string;
  location: string;
  year: number;
}

export const education: Education = {
  degree: "Bachelor of Technology",
  field: "Computer Science & Engineering",
  institution: "Lovely Professional University",
  location: "Jalandhar, Punjab",
  year: 2013,
};
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/data.ts
git commit -m "feat(data): add education export, swap github→medium in personal"
```

---

## Task 4: Create GSAP Registration Module

**Files:**
- Create: `lib/gsap.ts`

- [ ] **Step 1: Create the module**

```typescript
// lib/gsap.ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add lib/gsap.ts
git commit -m "feat(lib): add GSAP + ScrollTrigger registration module"
```

---

## Task 5: Create SkipLink Component

**Files:**
- Create: `components/ui/SkipLink.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/ui/SkipLink.tsx
export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[#00f2ff] focus:text-black focus:font-bold focus:rounded-lg"
    >
      Skip to main content
    </a>
  );
}
```

- [ ] **Step 2: Visual test**

Run `npm run dev`. Tab once from the browser address bar — "Skip to main content" link should appear in the top-left corner in cyan. Tab again to dismiss.

- [ ] **Step 3: Commit**

```bash
git add components/ui/SkipLink.tsx
git commit -m "feat(a11y): add SkipLink component for keyboard navigation"
```

---

## Task 6: Create CustomCursor Component

**Files:**
- Create: `components/ui/CustomCursor.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/ui/CustomCursor.tsx
"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, { stiffness: 150, damping: 15 });
  const ringY = useSpring(dotY, { stiffness: 150, damping: 15 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [dotX, dotY]);

  return (
    <>
      <motion.div
        aria-hidden="true"
        style={{ x: dotX, y: dotY, translateX: "-50%", translateY: "-50%" }}
        className="pointer-events-none fixed top-0 left-0 z-[9999] w-1.5 h-1.5 rounded-full bg-[#00f2ff]"
      />
      <motion.div
        aria-hidden="true"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        className="pointer-events-none fixed top-0 left-0 z-[9998] w-8 h-8 rounded-full border border-[#00f2ff] opacity-60"
      />
    </>
  );
}
```

- [ ] **Step 2: Visual test**

Add `<CustomCursor />` temporarily to `app/layout.tsx` body, run dev. On desktop: default cursor should be hidden, replaced by cyan dot + lagging ring. On mobile (dev tools responsive mode): cursor components render but are invisible/irrelevant — that's correct.

Remove temp import after verification.

- [ ] **Step 3: Commit**

```bash
git add components/ui/CustomCursor.tsx
git commit -m "feat(ui): add custom cyan cursor with spring-physics ring"
```

---

## Task 7: Create MagneticButton Component

**Files:**
- Create: `components/ui/MagneticButton.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/ui/MagneticButton.tsx
"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  download?: boolean;
  "aria-label"?: string;
}

export default function MagneticButton({
  children,
  className = "",
  onClick,
  href,
  download,
  "aria-label": ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const inner = (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} download={download} aria-label={ariaLabel}>
        {inner}
      </a>
    );
  }

  return (
    <button onClick={onClick} aria-label={ariaLabel}>
      {inner}
    </button>
  );
}
```

- [ ] **Step 2: Visual test**

Temporarily render `<MagneticButton className="px-6 py-3 border border-[#00f2ff] rounded-full text-white">Hover me</MagneticButton>` in `app/page.tsx`. On desktop hover: button should subtly follow cursor. Remove after test.

- [ ] **Step 3: Commit**

```bash
git add components/ui/MagneticButton.tsx
git commit -m "feat(ui): add MagneticButton with spring-physics cursor follow"
```

---

## Task 8: Create TiltCard Component

**Files:**
- Create: `components/ui/TiltCard.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/ui/TiltCard.tsx
"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function TiltCard({ children, className = "" }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const MAX_TILT = 8;
    rotateX.set(((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -MAX_TILT);
    rotateY.set(((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * MAX_TILT);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformPerspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/TiltCard.tsx
git commit -m "feat(ui): add TiltCard with 3D perspective mouse-tracking tilt"
```

---

## Task 9: Create LenisProvider Component

**Files:**
- Create: `components/LenisProvider.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/LenisProvider.tsx
"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

- [ ] **Step 2: Commit**

```bash
git add components/LenisProvider.tsx
git commit -m "feat: add LenisProvider for smooth scroll with GSAP ScrollTrigger sync"
```

---

## Task 10: Create CodeRain Component (Matrix Rain)

**Files:**
- Create: `components/three/CodeRain.tsx`

- [ ] **Step 1: Create the directory and component**

```bash
mkdir -p components/three
```

```tsx
// components/three/CodeRain.tsx
"use client";

import { useEffect, useRef } from "react";

const CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF<>/{}[]";
const FONT_SIZE = 14;

export default function CodeRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const cols = Math.floor(canvas.width / FONT_SIZE);
    const drops: number[] = Array(cols).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(3, 3, 3, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 242, 255, 0.07)";
      ctx.font = `${FONT_SIZE}px "JetBrains Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillText(char, i * FONT_SIZE, drops[i] * FONT_SIZE);
        if (drops[i] * FONT_SIZE > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
```

- [ ] **Step 2: Visual test**

Temporarily render it in `app/page.tsx` inside a `relative h-screen` div. Cyan characters should rain down at low opacity. Remove after test.

- [ ] **Step 3: Commit**

```bash
git add components/three/CodeRain.tsx
git commit -m "feat(three): add 2D canvas matrix code rain component"
```

---

## Task 11: Create FloatingGeometry Component (R3F)

**Files:**
- Create: `components/three/FloatingGeometry.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/three/FloatingGeometry.tsx
"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function OrbitingTorus({
  radius,
  speed,
  offset,
}: {
  radius: number;
  speed: number;
  offset: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed + offset;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.y = Math.sin(t) * radius * 0.4;
    ref.current.position.z = Math.sin(t * 0.7) * radius * 0.3;
    ref.current.rotation.x += 0.01;
    ref.current.rotation.y += 0.015;
  });

  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[0.18, 0.05, 64, 8]} />
      <meshBasicMaterial color="#00f2ff" wireframe />
    </mesh>
  );
}

function Scene({
  mouseX,
  mouseY,
  reducedMotion,
}: {
  mouseX: number;
  mouseY: number;
  reducedMotion: boolean;
}) {
  const icosaRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (reducedMotion) return;
    if (icosaRef.current) {
      icosaRef.current.rotation.x += 0.003;
      icosaRef.current.rotation.y += 0.005;
    }
    if (groupRef.current) {
      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x,
        mouseX * 0.5,
        0.05
      );
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        -mouseY * 0.5,
        0.05
      );
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={icosaRef}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshBasicMaterial color="#00f2ff" wireframe transparent opacity={0.45} />
      </mesh>
      {!reducedMotion && (
        <>
          <OrbitingTorus radius={2.5} speed={0.3} offset={0} />
          <OrbitingTorus radius={3.2} speed={0.5} offset={(Math.PI * 2) / 3} />
          <OrbitingTorus radius={3.8} speed={0.2} offset={(Math.PI * 4) / 3} />
        </>
      )}
    </group>
  );
}

export default function FloatingGeometry({
  mouseX,
  mouseY,
  reducedMotion,
}: {
  mouseX: number;
  mouseY: number;
  reducedMotion: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      aria-hidden
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
    >
      <Scene mouseX={mouseX} mouseY={mouseY} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/three/FloatingGeometry.tsx
git commit -m "feat(three): add R3F floating wireframe icosahedron + orbiting torus knots"
```

---

## Task 12: Create HeroCanvas Wrapper (Dynamic Import)

**Files:**
- Create: `components/three/HeroCanvas.tsx`

- [ ] **Step 1: Create the dynamic import wrapper**

```tsx
// components/three/HeroCanvas.tsx
"use client";

import dynamic from "next/dynamic";

// ssr: false prevents Three.js from running on the server (requires window/WebGL)
const FloatingGeometry = dynamic(() => import("./FloatingGeometry"), {
  ssr: false,
  loading: () => null,
});

export { FloatingGeometry as HeroGeometry };
export default FloatingGeometry;
```

- [ ] **Step 2: Commit**

```bash
git add components/three/HeroCanvas.tsx
git commit -m "feat(three): add HeroCanvas dynamic import wrapper (ssr: false)"
```

---

## Task 13: Build Navbar Component

**Files:**
- Modify: `components/Navbar.tsx`

- [ ] **Step 1: Replace Navbar.tsx entirely**

```tsx
// components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { personal } from "@/lib/data";
import MagneticButton from "./ui/MagneticButton";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

const SECTIONS = ["hero", "about", "skills", "experience", "projects", "contact"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.4 }
    );
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <AnimatePresence>
        {scrolled && (
          <motion.nav
            role="navigation"
            aria-label="Main navigation"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div
              className="flex items-center gap-1 md:gap-2 px-3 md:px-5 py-2.5 rounded-full"
              style={{
                background: "rgba(3, 3, 3, 0.75)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(0, 242, 255, 0.08)",
              }}
            >
              {/* Logo */}
              <a
                href="#hero"
                className="text-[#00f2ff] font-black font-mono text-sm mr-2 md:mr-4 min-w-[44px] min-h-[44px] flex items-center"
                aria-label="Veera Palla — back to top"
              >
                VP
              </a>

              {/* Desktop links */}
              <div className="hidden md:flex items-center gap-1">
                {NAV_LINKS.map((link) => {
                  const sectionId = link.href.replace("#", "");
                  const isActive = activeSection === sectionId;
                  return (
                    <div key={link.href} className="relative">
                      <a
                        href={link.href}
                        className="relative px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors min-h-[44px] flex items-center"
                        style={{ color: isActive ? "#00f2ff" : "#a1a1aa" }}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {link.label}
                        {isActive && (
                          <motion.span
                            layoutId="nav-active-dot"
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#00f2ff]"
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                          />
                        )}
                      </a>
                    </div>
                  );
                })}
              </div>

              {/* Resume button */}
              <div className="hidden md:block ml-2">
                <MagneticButton
                  href={personal.resumeUrl}
                  download
                  aria-label="Download resume"
                  className="px-4 py-1.5 rounded-full text-xs font-bold text-[#00f2ff] min-h-[44px] flex items-center"
                  style={{
                    border: "1px solid rgba(0, 242, 255, 0.4)",
                  } as React.CSSProperties}
                >
                  Resume ↓
                </MagneticButton>
              </div>

              {/* Mobile hamburger */}
              <button
                className="md:hidden ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-white"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
              >
                <span className="text-lg">{menuOpen ? "✕" : "☰"}</span>
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Mobile fullscreen overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center md:hidden"
            style={{ background: "rgba(3,3,3,0.97)", backdropFilter: "blur(20px)" }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <nav>
              <ul className="flex flex-col items-center gap-8 list-none" role="list">
                {NAV_LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <a
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="text-3xl font-black tracking-tight text-white hover:text-[#00f2ff] transition-colors min-h-[44px] flex items-center"
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
                <motion.li
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: NAV_LINKS.length * 0.07 }}
                >
                  <a
                    href={personal.resumeUrl}
                    download
                    className="mt-4 px-8 py-3 rounded-full border border-[#00f2ff] text-[#00f2ff] font-bold text-lg min-h-[44px] flex items-center"
                  >
                    Resume ↓
                  </a>
                </motion.li>
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

- [ ] **Step 2: Visual test**

Run dev. Scroll down 100px — pill navbar should spring in from top. On mobile viewport, hamburger appears and opens fullscreen overlay. Active section dot slides between links as you scroll.

- [ ] **Step 3: Commit**

```bash
git add components/Navbar.tsx
git commit -m "feat: build floating pill Navbar with active section tracking + mobile overlay"
```

---

## Task 14: Build Hero Section

**Files:**
- Modify: `components/Hero.tsx`
- Delete: `components/ParticleSphere.tsx`

- [ ] **Step 1: Delete old ParticleSphere**

```bash
rm components/ParticleSphere.tsx
```

- [ ] **Step 2: Replace Hero.tsx entirely**

```tsx
// components/Hero.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Typewriter from "typewriter-effect";
import dynamic from "next/dynamic";
import { personal, roles } from "@/lib/data";
import MagneticButton from "./ui/MagneticButton";

// CodeRain is a 2D canvas — dynamic import keeps it out of the initial bundle
const CodeRain = dynamic(() => import("./three/CodeRain"), { ssr: false, loading: () => null });
// HeroCanvas wraps FloatingGeometry with dynamic + ssr:false internally — import directly here
import HeroGeometry from "./three/HeroCanvas";

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.6], [1, 0.92]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    const onMouse = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener("mousemove", onMouse, { passive: true });
    return () => window.removeEventListener("mousemove", onMouse);
  }, []);

  return (
    <section
      ref={containerRef}
      id="hero"
      aria-label="Hero — introduction"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Layer 1 — Matrix Rain */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <CodeRain />
      </div>

      {/* Layer 2 — 3D Geometry */}
      <div className="absolute inset-0 z-[1]" aria-hidden="true" style={{ pointerEvents: "none" }}>
        <HeroGeometry mouseX={mouse.x} mouseY={mouse.y} reducedMotion={reducedMotion} />
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(3,3,3,0.6) 70%, rgba(3,3,3,0.95) 100%)",
        }}
      />

      {/* Layer 3 — Typography */}
      <motion.div
        style={reducedMotion ? {} : { y, opacity, scale }}
        className="container-wide relative z-10 flex flex-col items-center text-center pt-20 md:pt-0"
      >
        {/* Availability badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.2, 0, 0, 1], delay: 0 }}
          className="mb-6 md:mb-8 px-4 py-1.5 rounded-full flex items-center gap-2"
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(8px)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-green-500"
            style={{ boxShadow: "0 0 8px rgba(34,197,94,0.7)" }}
            aria-hidden="true"
          />
          <span className="text-[10px] md:text-xs font-mono tracking-widest text-white/60 uppercase">
            Available for Senior opportunities
          </span>
        </motion.div>

        {/* Name */}
        <div className="mb-6 md:mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.2, 0, 0, 1], delay: 0.2 }}
            className="font-black leading-[0.88] tracking-tighter text-white"
            style={{ fontSize: "clamp(3.5rem, 12vw, 9rem)" }}
          >
            VEERA
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.2, 0, 0, 1], delay: 0.35 }}
            className="font-black leading-[0.88] tracking-tighter"
            style={{
              fontSize: "clamp(3.5rem, 12vw, 9rem)",
              color: "#00f2ff",
              textShadow: "0 0 40px rgba(0,242,255,0.4)",
            }}
          >
            PALLA.
          </motion.h1>
        </div>

        {/* Typewriter role */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-6 h-8 font-mono text-base md:text-lg tracking-wide"
          style={{ color: "#00f2ff" }}
          aria-label={`Role: ${roles[0]}`}
        >
          {reducedMotion ? (
            <span>{roles[0]}</span>
          ) : (
            <Typewriter
              options={{
                strings: roles,
                autoStart: true,
                loop: true,
                delay: 75,
                deleteSpeed: 40,
              }}
            />
          )}
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="max-w-xs md:max-w-md text-sm md:text-base text-white/50 leading-relaxed mb-10 md:mb-12 px-4"
        >
          {personal.tagline}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <MagneticButton
            href="#projects"
            aria-label="View my work"
            className="px-7 py-3.5 rounded-full text-sm font-bold text-black bg-[#00f2ff] min-h-[44px] flex items-center hover:opacity-90 transition-opacity"
          >
            View My Work ↓
          </MagneticButton>
          <MagneticButton
            href={personal.resumeUrl}
            download
            aria-label="Download resume"
            className="px-7 py-3.5 rounded-full text-sm font-bold text-[#00f2ff] min-h-[44px] flex items-center"
            style={{ border: "1px solid rgba(0,242,255,0.4)" } as React.CSSProperties}
          >
            Download Resume
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <span className="text-[9px] uppercase tracking-[0.3em] text-white/20 font-bold">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10 bg-gradient-to-b from-[#00f2ff]/30 to-transparent"
        />
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 3: Visual test**

Run dev. Hero should show:
- Matrix rain characters in the background
- Wireframe icosahedron rotating, torus knots orbiting
- Name with cyan glow on "PALLA."
- Typewriter cycling through roles in cyan
- CTA buttons; scroll indicator at bottom

On mobile: single column, large text still readable, no overflow.

- [ ] **Step 4: Commit**

```bash
git add components/Hero.tsx
git rm components/ParticleSphere.tsx
git commit -m "feat: build 3-layer Hero with matrix rain, R3F geometry, and typed intro"
```

---

## Task 15: Build About Section

**Files:**
- Modify: `components/About.tsx`

- [ ] **Step 1: Replace About.tsx**

```tsx
// components/About.tsx
"use client";

import { useRef, useLayoutEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { gsap, ScrollTrigger } from "@/lib/gsap";

function WordReveal({
  text,
  progress,
  range,
}: {
  text: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.1, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block mr-[0.25em]">
      {text}
    </motion.span>
  );
}

const STATS = [
  { value: "11+", label: "Years Experience" },
  { value: "40+", label: "Projects Delivered" },
  { value: "5", label: "Companies" },
  { value: "3", label: "Cloud Platforms" },
];

const HIGHLIGHTS = [
  {
    label: "Architectural Depth",
    value: "Kafka · RAG · K8s",
    desc: "Building resilient distributed systems that scale beyond 50k+ daily users.",
  },
  {
    label: "Product Mindset",
    value: "UX-First Engineering",
    desc: "Bridging the gap between complex backend logic and intuitive design.",
  },
  {
    label: "Senior Leadership",
    value: "11+ Years Excellence",
    desc: "Driving technical strategy and mentoring high-performance teams.",
  },
];

const BIO =
  "I am a Senior Full-Stack Engineer with 11+ years of experience building high-performance applications. My expertise spans the entire lifecycle of software development, from designing scalable microservices to crafting immersive user experiences. I specialize in React, Node.js, and Cloud architectures, with a focus on integrating generative AI and real-time event streaming into enterprise systems.";

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const highlightsRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Stats slide in from right
      gsap.fromTo(
        statsRef.current!.children,
        { x: 40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 80%",
          },
        }
      );
      // Highlights stagger up
      gsap.fromTo(
        highlightsRef.current!.children,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: highlightsRef.current,
            start: "top 85%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const words = BIO.split(" ");

  return (
    <section
      ref={sectionRef}
      id="about"
      aria-label="About Veera Palla"
      className="container-wide"
    >
      <div className="section-label">01 // About</div>

      {/* Two-column: bio left, stats right */}
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 mb-16 md:mb-20">
        {/* Bio word reveal */}
        <div className="lg:w-[60%]">
          <p className="text-2xl md:text-3xl lg:text-4xl font-bold leading-[1.2] tracking-tight text-white">
            {words.map((word, i) => (
              <WordReveal
                key={i}
                text={word}
                progress={scrollYProgress}
                range={[i / words.length, (i + 1) / words.length]}
              />
            ))}
          </p>
        </div>

        {/* Stats */}
        <div ref={statsRef} className="lg:w-[40%] grid grid-cols-2 gap-4" aria-label="Key statistics">
          {STATS.map((stat) => (
            <article
              key={stat.label}
              className="glass-card p-6 flex flex-col"
            >
              <span className="text-3xl md:text-4xl font-black text-[#00f2ff] mb-1" aria-label={stat.value}>
                {stat.value}
              </span>
              <span className="text-xs uppercase tracking-widest text-white/40 font-bold">
                {stat.label}
              </span>
            </article>
          ))}
        </div>
      </div>

      {/* Highlights */}
      <div ref={highlightsRef} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {HIGHLIGHTS.map((item) => (
          <article key={item.label} className="glass-card p-8 md:p-10">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mb-4">
              {item.label}
            </div>
            <div className="text-xl font-bold text-white mb-2 tracking-tight">{item.value}</div>
            <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Visual test**

Scroll through About section. Words should fade in progressively. Stats cards should slide in from right. Highlights stagger up. On mobile, single column layout.

- [ ] **Step 3: Commit**

```bash
git add components/About.tsx
git commit -m "feat: build About section with word reveal, stat cards, and GSAP stagger"
```

---

## Task 16: Build Skills Section

**Files:**
- Modify: `components/Skills.tsx`

- [ ] **Step 1: Replace Skills.tsx**

```tsx
// components/Skills.tsx
"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { skillCategories } from "@/lib/data";
import { gsap } from "@/lib/gsap";
import {
  Monitor, Server, Sparkles, Cloud, Database, TestTube2, Zap,
} from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  Monitor: <Monitor size={18} aria-hidden="true" />,
  Server: <Server size={18} aria-hidden="true" />,
  Sparkles: <Sparkles size={18} aria-hidden="true" />,
  Cloud: <Cloud size={18} aria-hidden="true" />,
  Database: <Database size={18} aria-hidden="true" />,
  TestTube2: <TestTube2 size={18} aria-hidden="true" />,
  Zap: <Zap size={18} aria-hidden="true" />,
};

// AI & GenAI is the featured card (spans 2 cols on desktop)
const FEATURED_LABEL = "AI & GenAI";

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        gridRef.current!.children,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 80%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="skills"
      aria-label="Skills and tech stack"
      className="container-wide"
    >
      <div className="section-label">02 // Skills & Tech Stack</div>
      <h2 className="section-title">
        What I{" "}
        <span
          style={{
            borderBottom: "2px solid #00f2ff",
            paddingBottom: "2px",
          }}
        >
          Build
        </span>{" "}
        With
      </h2>

      {/* Mobile: accordion */}
      <div className="md:hidden flex flex-col gap-3" role="list" aria-label="Skill categories">
        {skillCategories.map((cat) => {
          const isOpen = openCategory === cat.label;
          return (
            <div key={cat.label} className="glass-card overflow-hidden" role="listitem">
              <button
                onClick={() => setOpenCategory(isOpen ? null : cat.label)}
                className="w-full flex items-center justify-between p-5 text-left min-h-[44px]"
                aria-expanded={isOpen}
                aria-controls={`skills-${cat.label}`}
              >
                <div className="flex items-center gap-3">
                  <span style={{ color: "#00f2ff" }}>{ICON_MAP[cat.icon]}</span>
                  <span className="font-bold text-white text-sm">{cat.label}</span>
                </div>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  className="text-white/40 text-xs"
                  aria-hidden="true"
                >
                  ▼
                </motion.span>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    id={`skills-${cat.label}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 flex flex-wrap gap-2">
                      {cat.skills.map((skill) => (
                        <span key={skill} className="skill-pill">{skill}</span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Tablet+ : bento grid */}
      <div
        ref={gridRef}
        className="hidden md:grid gap-4"
        style={{
          gridTemplateColumns: "repeat(3, 1fr)",
        }}
        role="list"
        aria-label="Skill categories"
      >
        {skillCategories.map((cat) => (
          <article
            key={cat.label}
            className="glass-card p-6 lg:p-8"
            style={{
              gridColumn: cat.label === FEATURED_LABEL ? "span 2" : "span 1",
            }}
            role="listitem"
          >
            <div
              className="flex items-center gap-3 mb-5"
              style={{ color: "#00f2ff" }}
            >
              {ICON_MAP[cat.icon]}
              <h3 className="font-bold text-white text-sm uppercase tracking-widest">
                {cat.label}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {cat.skills.map((skill) => (
                <span key={skill} className="skill-pill">{skill}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Visual test**

On mobile: accordion expands/collapses on tap. On tablet+: 3-column bento, AI & GenAI spans 2 columns. Cards stagger up on scroll entry.

- [ ] **Step 3: Commit**

```bash
git add components/Skills.tsx
git commit -m "feat: build Skills section with mobile accordion and desktop bento grid"
```

---

## Task 17: Build Experience Section

**Files:**
- Modify: `components/Experience.tsx`

- [ ] **Step 1: Replace Experience.tsx**

```tsx
// components/Experience.tsx
"use client";

import { useRef, useLayoutEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { experiences } from "@/lib/data";

export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Draw the timeline line on scroll
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: "top center",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "bottom 30%",
            scrub: 1,
          },
        }
      );

      // Cards fade in as they enter viewport
      gsap.utils.toArray<HTMLElement>(".exp-card").forEach((card) => {
        gsap.fromTo(
          card,
          { x: 40, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="experience"
      aria-label="Work experience"
      className="container-wide"
    >
      <div className="section-label">03 // Experience</div>
      <h2 className="section-title">Where I&apos;ve Built</h2>

      <div className="relative flex gap-6 md:gap-12">
        {/* Timeline line */}
        <div className="relative flex-shrink-0 flex justify-center" style={{ width: "2px" }}>
          <div
            ref={lineRef}
            className="absolute top-0 bottom-0 w-px origin-top"
            style={{ background: "linear-gradient(to bottom, #00f2ff, rgba(0,242,255,0.1))" }}
            aria-hidden="true"
          />
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-10 flex-1 pb-4">
          {experiences.map((exp, i) => (
            <article
              key={exp.company}
              className="exp-card glass-card p-6 md:p-8 relative"
              style={{ borderLeft: "2px solid rgba(0,242,255,0.15)" }}
            >
              {/* Timeline node */}
              <div
                className="absolute -left-[calc(1.5rem+2px)] md:-left-[calc(3rem+2px)] top-8 w-3 h-3 rounded-full border-2 border-[#00f2ff] bg-[#030303]"
                aria-hidden="true"
              />

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-lg md:text-xl font-black text-white hover:text-[#00f2ff] transition-colors">
                    {exp.company}
                  </h3>
                  <p className="text-sm font-semibold text-white/60">{exp.role}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <time
                    dateTime={exp.period.replace(" – ", "/")}
                    className="text-xs font-mono text-[#00f2ff] block"
                  >
                    {exp.period}
                  </time>
                  <span className="text-xs text-white/40">{exp.location}</span>
                </div>
              </div>

              {/* Bullets */}
              <ul className="space-y-2 mb-6 list-none" role="list">
                {exp.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2 text-sm text-white/50 leading-relaxed">
                    <span className="text-[#00f2ff] mt-1 flex-shrink-0" aria-hidden="true">›</span>
                    {bullet}
                  </li>
                ))}
              </ul>

              {/* Tech pills */}
              <div className="flex flex-wrap gap-2" aria-label="Technologies used">
                {exp.tech.map((t) => (
                  <span key={t} className="skill-pill">{t}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Visual test**

Scroll through Experience. Timeline line should draw itself as you scroll. Cards should slide in from right. Tech pills visible. On mobile, single-column layout.

- [ ] **Step 3: Commit**

```bash
git add components/Experience.tsx
git commit -m "feat: build Experience section with GSAP self-drawing timeline"
```

---

## Task 18: Build Projects Section

**Files:**
- Modify: `components/Projects.tsx`

- [ ] **Step 1: Replace Projects.tsx**

```tsx
// components/Projects.tsx
"use client";

import { useRef, useLayoutEffect } from "react";
import { gsap } from "@/lib/gsap";
import { projects } from "@/lib/data";
import TiltCard from "./ui/TiltCard";
import { ExternalLink } from "lucide-react";

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".project-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            delay: i * 0.1,
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="projects"
      aria-label="Featured projects"
      className="container-wide"
    >
      <div className="section-label">04 // Projects</div>
      <h2 className="section-title">Featured Work</h2>

      <div className="flex flex-col gap-6 md:gap-8">
        {projects.map((project, i) => (
          <TiltCard key={project.name} className="project-card">
            <article
              className="glass-card p-6 md:p-10 relative overflow-hidden"
            >
              {/* Background project number */}
              <span
                className="absolute -right-4 -top-4 text-[8rem] md:text-[12rem] font-black leading-none select-none pointer-events-none"
                style={{ color: "rgba(0,242,255,0.04)" }}
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
                <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  {project.name}
                </h3>
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${project.name} on GitHub (opens in new tab)`}
                    className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full border border-white/10 text-white/50 hover:text-[#00f2ff] hover:border-[#00f2ff]/40 transition-all min-w-[44px] min-h-[44px]"
                  >
                    <ExternalLink size={16} className="group-hover:rotate-45 transition-transform" />
                  </a>
                )}
              </div>

              {/* Description */}
              <p className="text-sm md:text-base text-white/50 leading-relaxed mb-6 relative z-10 max-w-3xl">
                {project.description}
              </p>

              {/* Highlights */}
              <ul className="space-y-2 mb-6 relative z-10 list-none" role="list">
                {project.highlights.map((h) => (
                  <li key={h} className="flex gap-2 text-sm text-white/40 leading-relaxed">
                    <span className="text-[#00f2ff] mt-1 flex-shrink-0" aria-hidden="true">›</span>
                    {h}
                  </li>
                ))}
              </ul>

              {/* Tech */}
              <div className="flex flex-wrap gap-2 relative z-10" aria-label="Technologies used">
                {project.tech.map((t) => (
                  <span key={t} className="skill-pill">{t}</span>
                ))}
              </div>
            </article>
          </TiltCard>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Visual test**

Cards stagger up on scroll. On desktop hover: 3D tilt effect, cyan glow on card border. Background project number visible. GitHub link present. On mobile: no tilt (pointer: coarse), content fully visible.

- [ ] **Step 3: Commit**

```bash
git add components/Projects.tsx
git commit -m "feat: build Projects section with TiltCard hover and GSAP stagger"
```

---

## Task 19: Build Education & Certifications Section

**Files:**
- Create: `components/Education.tsx`
- Delete: `components/Certifications.tsx`

- [ ] **Step 1: Delete old Certifications component**

```bash
rm components/Certifications.tsx
```

- [ ] **Step 2: Create Education.tsx**

```tsx
// components/Education.tsx
"use client";

import { useRef, useLayoutEffect } from "react";
import { gsap } from "@/lib/gsap";
import { education, certifications } from "@/lib/data";
import { GraduationCap } from "lucide-react";

export default function Education() {
  const sectionRef = useRef<HTMLElement>(null);
  const degreeRef = useRef<HTMLElement>(null);
  const certsRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        degreeRef.current,
        { x: -40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: degreeRef.current, start: "top 85%" },
        }
      );
      gsap.fromTo(
        certsRef.current!.children,
        { x: 40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: certsRef.current, start: "top 85%" },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="education"
      aria-label="Education and certifications"
      className="container-wide"
    >
      <div className="section-label">05 // Education & Certifications</div>
      <h2 className="section-title">Knowledge Base</h2>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Degree card */}
        <article
          ref={degreeRef}
          className="glass-card p-8 md:p-10 lg:flex-[1.6] flex flex-col justify-between min-h-[220px]"
          aria-label="Educational degree"
        >
          <div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
              style={{ background: "rgba(0,242,255,0.08)", border: "1px solid rgba(0,242,255,0.2)" }}
              aria-hidden="true"
            >
              <GraduationCap size={22} style={{ color: "#00f2ff" }} />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight mb-1">
              {education.degree}
            </h3>
            <p className="text-base font-semibold text-white/60 mb-4">{education.field}</p>
            <p className="text-sm text-white/40">{education.institution}</p>
            <p className="text-sm text-white/30">{education.location}</p>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-mono font-bold"
              style={{ background: "rgba(0,242,255,0.08)", color: "#00f2ff", border: "1px solid rgba(0,242,255,0.2)" }}
            >
              {education.year}
            </span>
            <span className="text-xs text-white/30 uppercase tracking-widest">Graduation Year</span>
          </div>
        </article>

        {/* Certifications */}
        <div className="lg:flex-1">
          <ul
            ref={certsRef}
            className="flex flex-col gap-4 list-none h-full"
            role="list"
            aria-label="Professional certifications"
          >
            {certifications.map((cert) => (
              <li key={cert.title}>
                <article className="glass-card p-6 flex items-center gap-5 h-full">
                  <div
                    className="w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-xl"
                    style={{ background: "rgba(0,242,255,0.06)", border: "1px solid rgba(0,242,255,0.15)" }}
                    aria-hidden="true"
                  >
                    <span className="text-lg font-black font-mono" style={{ color: "#00f2ff" }}>
                      {cert.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-snug">{cert.title}</h3>
                    <p className="text-xs text-white/40 mt-1">{cert.issuer}</p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Visual test**

Degree card slides in from left. Cert cards stagger in from right. On mobile, stacks to single column. Degree card stands confidently alone with graduation cap icon, year badge. Both cert cards below it.

- [ ] **Step 4: Commit**

```bash
git add components/Education.tsx
git rm components/Certifications.tsx
git commit -m "feat: build Education section with degree card + certification cards"
```

---

## Task 20: Build Contact Section

**Files:**
- Modify: `components/Contact.tsx`

- [ ] **Step 1: Create `.env.local` with EmailJS placeholders**

```bash
# Create .env.local (never commit this file)
```

```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

Verify `.gitignore` includes `.env.local` (it should — Next.js default adds it).

- [ ] **Step 2: Replace Contact.tsx**

```tsx
// components/Contact.tsx
"use client";

import { useState, useRef, useLayoutEffect } from "react";
import emailjs from "@emailjs/browser";
import { personal } from "@/lib/data";
import { gsap } from "@/lib/gsap";
import MagneticButton from "./ui/MagneticButton";
import { Mail, Linkedin, BookOpen, Phone } from "lucide-react";

interface FormState {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

type SubmitStatus = "idle" | "sending" | "success" | "error";

const CONTACT_LINKS = [
  {
    icon: <Mail size={20} aria-hidden="true" />,
    label: "Email",
    value: personal.email,
    href: `mailto:${personal.email}`,
    display: personal.email,
  },
  {
    icon: <Linkedin size={20} aria-hidden="true" />,
    label: "LinkedIn",
    value: "Veera Palla",
    href: personal.linkedin,
    display: "linkedin.com/in/veera-palla",
  },
  {
    icon: <BookOpen size={20} aria-hidden="true" />,
    label: "Medium",
    value: "@veera.palla919",
    href: personal.medium,
    display: "medium.com/@veera.palla919",
  },
  {
    icon: <Phone size={20} aria-hidden="true" />,
    label: "Phone",
    value: personal.phone,
    href: `tel:${personal.phone.replace(/\D/g, "")}`,
    display: personal.phone,
  },
];

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = "Name is required.";
  if (!form.email.trim()) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Please enter a valid email address.";
  if (!form.message.trim()) errors.message = "Message is required.";
  else if (form.message.trim().length < 10)
    errors.message = "Message must be at least 10 characters.";
  return errors;
}

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const [form, setForm] = useState<FormState>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".contact-card",
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setStatus("sending");
    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        { from_name: form.name, from_email: form.email, message: form.message },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const inputClass = (field: keyof FormErrors) =>
    `w-full bg-white/[0.04] border rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-[#00f2ff] focus:border-transparent ${
      errors[field] ? "border-red-500/60" : "border-white/10"
    }`;

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-label="Contact Veera Palla"
      className="container-wide"
    >
      <div className="section-label">06 // Contact</div>
      <h2 className="section-title">Let&apos;s Build Something.</h2>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        {/* Contact links */}
        <div className="lg:w-[42%] flex flex-col gap-4">
          {CONTACT_LINKS.map((link) => (
            <MagneticButton
              key={link.label}
              href={link.href}
              aria-label={`Contact via ${link.label}: ${link.display}`}
              className="contact-card glass-card flex items-center gap-5 p-5 min-h-[44px] w-full text-left"
            >
              <div
                className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl"
                style={{ background: "rgba(0,242,255,0.08)", color: "#00f2ff" }}
              >
                {link.icon}
              </div>
              <div>
                <div className="text-xs text-white/40 uppercase tracking-widest mb-0.5 font-bold">
                  {link.label}
                </div>
                <div className="text-sm text-white font-medium">{link.display}</div>
              </div>
            </MagneticButton>
          ))}
        </div>

        {/* EmailJS form */}
        <form
          onSubmit={handleSubmit}
          className="lg:flex-1 flex flex-col gap-5"
          noValidate
          aria-label="Send a message"
        >
          {/* Name */}
          <div>
            <label htmlFor="contact-name" className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
              Name <span aria-hidden="true">*</span>
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
              aria-required="true"
              aria-describedby={errors.name ? "name-error" : undefined}
              aria-invalid={!!errors.name}
              className={inputClass("name")}
            />
            {errors.name && (
              <p id="name-error" role="alert" className="mt-1.5 text-xs text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="contact-email" className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
              Email <span aria-hidden="true">*</span>
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              aria-required="true"
              aria-describedby={errors.email ? "email-error" : undefined}
              aria-invalid={!!errors.email}
              className={inputClass("email")}
            />
            {errors.email && (
              <p id="email-error" role="alert" className="mt-1.5 text-xs text-red-400">
                {errors.email}
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <label htmlFor="contact-message" className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
              Message <span aria-hidden="true">*</span>
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              value={form.message}
              onChange={handleChange}
              placeholder="What would you like to build together?"
              required
              aria-required="true"
              aria-describedby={errors.message ? "message-error" : undefined}
              aria-invalid={!!errors.message}
              className={`${inputClass("message")} resize-none`}
            />
            {errors.message && (
              <p id="message-error" role="alert" className="mt-1.5 text-xs text-red-400">
                {errors.message}
              </p>
            )}
          </div>

          {/* Status announcement */}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {status === "success" && "Message sent successfully. Thank you!"}
            {status === "error" && "Failed to send message. Please try again or email directly."}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full py-4 rounded-full text-sm font-bold text-[#00f2ff] border border-[#00f2ff]/40 hover:bg-[#00f2ff]/10 transition-all min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === "sending" && (
              <span
                className="w-4 h-4 border-2 border-[#00f2ff]/30 border-t-[#00f2ff] rounded-full animate-spin"
                aria-hidden="true"
              />
            )}
            {status === "idle" && "Send Message →"}
            {status === "sending" && "Sending…"}
            {status === "success" && "✓ Message Sent!"}
            {status === "error" && "Failed — try again"}
          </button>

          {status === "success" && (
            <p className="text-xs text-green-400 text-center" role="status">
              Thanks! I&apos;ll get back to you within 24 hours.
            </p>
          )}
          {status === "error" && (
            <p className="text-xs text-red-400 text-center" role="alert">
              Something went wrong. Email me directly at{" "}
              <a href={`mailto:${personal.email}`} className="underline text-[#00f2ff]">
                {personal.email}
              </a>
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Visual test**

Run dev. Fill form with empty fields → should show validation errors with red text. Fill correctly and submit → loading spinner appears. On mobile: single column, contact cards on top, form below. Tab through form fields — cyan focus rings visible.

Note: EmailJS won't send without real env vars — that's expected. Error state handles this gracefully.

- [ ] **Step 4: Commit**

```bash
git add components/Contact.tsx .env.local
git commit -m "feat: build Contact section with EmailJS form + client-side validation + ARIA"
```

---

## Task 21: Build Footer

**Files:**
- Modify: `components/Footer.tsx`

- [ ] **Step 1: Replace Footer.tsx**

```tsx
// components/Footer.tsx
import { personal } from "@/lib/data";
import { Mail, Linkedin, BookOpen, Phone } from "lucide-react";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Education", href: "#education" },
  { label: "Contact", href: "#contact" },
];

const SOCIAL_LINKS = [
  { icon: <Mail size={18} aria-hidden="true" />, label: "Email", href: `mailto:${personal.email}` },
  { icon: <Linkedin size={18} aria-hidden="true" />, label: "LinkedIn", href: personal.linkedin },
  { icon: <BookOpen size={18} aria-hidden="true" />, label: "Medium", href: personal.medium },
  { icon: <Phone size={18} aria-hidden="true" />, label: "Phone", href: `tel:${personal.phone.replace(/\D/g, "")}` },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      aria-label="Site footer"
      className="border-t"
      style={{ borderColor: "rgba(255,255,255,0.04)" }}
    >
      <div className="container-wide py-12 md:py-16">
        {/* Three-column desktop / single-column mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 mb-10">
          {/* Logo + tagline */}
          <div>
            <a
              href="#hero"
              className="inline-block text-3xl font-black font-mono mb-3"
              style={{ color: "#00f2ff" }}
              aria-label="Veera Palla — back to top"
            >
              VP
            </a>
            <p className="text-sm font-bold text-white/80 mb-1">{personal.name}</p>
            <p className="text-xs text-white/40">{personal.title}</p>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-col gap-3 list-none" role="list">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-white/50 hover:text-[#00f2ff] transition-colors"
                    style={{ textDecoration: "none" }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Socials */}
          <div>
            <p className="text-xs text-white/30 uppercase tracking-widest font-bold mb-4">Connect</p>
            <div className="flex gap-3 flex-wrap">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="w-11 h-11 flex items-center justify-center rounded-full border text-white/40 hover:text-[#00f2ff] transition-all min-w-[44px] min-h-[44px]"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-px mb-8"
          style={{ background: "rgba(0,242,255,0.12)" }}
          aria-hidden="true"
        />

        {/* Copyright */}
        <p className="text-xs text-white/25 text-center">
          © {year} {personal.name} · Built with Next.js &amp; React
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Footer.tsx
git commit -m "feat: build Footer with 3-column layout, nav links, socials, and copyright"
```

---

## Task 22: Update app/layout.tsx

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace layout.tsx**

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";
import SkipLink from "@/components/ui/SkipLink";
import CustomCursor from "@/components/ui/CustomCursor";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Veera Palla // Sr. React.js / Node.js Developer",
  description:
    "Senior Full Stack Engineer with 11+ years of experience specializing in React 18, Node.js 21, AI/RAG, and Cloud architectures.",
  keywords: [
    "Senior Full Stack Engineer",
    "React 18",
    "Node.js 21",
    "AI Engineering",
    "RAG",
    "Kafka",
    "Cloud Architecture",
    "Veera Palla",
  ],
  authors: [{ name: "Veera Palla" }],
  openGraph: {
    title: "Veera Palla // Sr. React.js / Node.js Developer",
    description: "11+ years of engineering excellence in React, Node.js, and AI systems.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">
        <SkipLink />
        <LenisProvider>
          <CustomCursor />
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(layout): wire up LenisProvider, SkipLink, and CustomCursor"
```

---

## Task 23: Assemble Page and Clean Up

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace app/page.tsx**

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

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Education />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript and build**

```bash
npx tsc --noEmit
npm run build
```

Expected: build completes with no TypeScript errors. Note any warnings but only fix errors.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: assemble final page with all sections in correct order"
```

---

## Task 24: Accessibility Audit

**Files:**
- Modify: multiple components if issues found

- [ ] **Step 1: Run the dev server and test keyboard navigation**

```bash
npm run dev
```

Open http://localhost:3000. Test:
1. Tab once → "Skip to main content" appears. Enter → focus jumps to `#main-content`.
2. Tab through the whole page — every link, button, and input must receive a visible cyan focus ring.
3. No interactive element is skipped or unreachable.
4. Mobile menu (resize to < 768px, open hamburger) → all nav links are Tab-reachable in the overlay.
5. Contact form: Tab through fields, submit empty → errors announced. Fix errors, submit → success message announced.

- [ ] **Step 2: Verify heading hierarchy**

Open browser DevTools → Elements. Confirm:
- Exactly one `<h1>` on the page (the hero VEERA PALLA — note it's split across two `<h1>` elements in the current Hero.tsx; consolidate to a single `<h1>` with `<span>` for styling)
- Each section has an `<h2>`
- Sub-items use `<h3>`

Fix if the hero has two `<h1>` elements: wrap in one `<h1>` with `<span>` children.

- [ ] **Step 3: Heading fix in Hero.tsx if needed**

Replace the two `<motion.h1>` tags in Hero.tsx with a single `<h1>`:

```tsx
<motion.h1
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.9, ease: [0.2, 0, 0, 1], delay: 0.2 }}
  className="font-black leading-[0.88] tracking-tighter"
  style={{ fontSize: "clamp(3.5rem, 12vw, 9rem)" }}
>
  <span className="block text-white">VEERA</span>
  <span
    className="block"
    style={{
      color: "#00f2ff",
      textShadow: "0 0 40px rgba(0,242,255,0.4)",
    }}
  >
    PALLA.
  </span>
</motion.h1>
```

- [ ] **Step 4: Check color contrast**

Verify in DevTools:
- White text on `#030303` background ✓ (21:1)
- `#00f2ff` on `#030303` ✓ (≈15:1)
- `text-white/50` (`rgba(255,255,255,0.5)`) on `#030303` = ~10:1 ✓
- `text-white/40` on `#030303` = ~8:1 ✓
- `text-white/30` on glass card `rgba(255,255,255,0.03)` — if below 4.5:1, increase to `/40`

- [ ] **Step 5: Verify aria-hidden on all decorative elements**

Check in DevTools that:
- `<canvas>` elements have `aria-hidden="true"`
- Background grain `::before` pseudo-element — aria-hidden not needed (pseudo-elements are ignored by AT)
- Section label `::before` lines have no text content

- [ ] **Step 6: Commit any fixes**

```bash
git add components/Hero.tsx  # (if heading fix applied)
git commit -m "fix(a11y): consolidate hero h1, verify heading hierarchy and contrast"
```

---

## Task 25: Performance Optimization and Final Commit

**Files:**
- Modify: `next.config.ts` (if exists) or create it

- [ ] **Step 1: Check if next.config exists**

```bash
ls next.config*
```

- [ ] **Step 2: Create or update next.config.ts to handle Three.js**

If no config exists, create `next.config.ts`:

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Three.js from being bundled server-side
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), "three", "@react-three/fiber", "@react-three/drei"];
    }
    return config;
  },
};

export default nextConfig;
```

- [ ] **Step 3: Run production build and check bundle**

```bash
npm run build
```

Review the route output. The `/(home)` route should show a small First Load JS. Three.js chunks should appear as lazy-loaded (separate chunk files).

If First Load JS exceeds 300KB, the Three.js `dynamic` with `ssr: false` is working — the 3D code only loads in the browser after hydration.

- [ ] **Step 4: Run dev server for final visual QA**

```bash
npm run dev
```

Check every section at three viewport widths:
- Mobile: 375px (iPhone SE)
- Tablet: 768px (iPad)
- Desktop: 1440px

Verify:
- [ ] Hero: all three layers visible and composited correctly
- [ ] Navbar: pill appears on scroll, active dot moves between sections, mobile hamburger works
- [ ] About: word reveal, stat cards, highlight cards animate
- [ ] Skills: accordion on mobile, bento grid on desktop, AI & GenAI spans 2 cols
- [ ] Experience: timeline line draws, cards slide in
- [ ] Projects: editorial cards, tilt on desktop
- [ ] Education: degree card + cert cards, side by side on desktop
- [ ] Contact: form validation, social cards
- [ ] Footer: 3-col on desktop, stacked on mobile
- [ ] Custom cursor visible on desktop, absent on mobile

- [ ] **Step 5: Verify reduced motion mode**

In browser DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`.
All animations should stop. Content must be fully readable without movement.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete portfolio redesign — hero, all sections, accessibility, performance"
```

---

## Post-Implementation Checklist

Before deploying, complete:

- [ ] Add real EmailJS credentials to `.env.local` (get from emailjs.com → Account → API Keys)
- [ ] Add `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`, `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` to Vercel environment variables
- [ ] Test contact form end-to-end with real credentials
- [ ] Confirm `public/resume.pdf` is the latest version of the resume
- [ ] Run Lighthouse audit (Chrome DevTools → Lighthouse) on production URL — target ≥ 90 Performance, 100 Accessibility
- [ ] Test on real mobile device (not just DevTools) — Chrome iOS, Safari iOS, Chrome Android
