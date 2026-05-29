# Portfolio 3D + Animation + Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a mobile-first full-scene 3D background (central morphing object + ambient field), self-drawing SVG "thread" animations, a themed SVG cursor, richer scroll/parallax/depth, and a deep performance pass to the Next.js 16 / React 19 portfolio.

**Architecture:** A lazy-loaded `@react-three/fiber` Canvas renders behind all content, gated by a client-side `BackgroundManager` that picks WebGL (default, incl. mobile, with adaptive S/M/L quality tiers), a static single-frame WebGL render for reduced-motion, an animated CSS-3D scene for no-WebGL, and the legacy 2D canvas as last resort. SVG threads and parallax layer on top using the existing Framer Motion + Lenis + GSAP stack.

**Tech Stack:** Next.js 16.2.4, React 19.2, TypeScript, `@react-three/fiber` 9, `@react-three/drei` 10, `three` 0.184, Framer Motion 12, Lenis, GSAP, Tailwind v4.

**Verification model (project-specific):** This repo has **no unit-test framework** (only ESLint) and its standing rule is *visual verification in a live browser*. Therefore each task is verified by: (1) `npm run build` succeeds, (2) `npx eslint .` passes, and (3) **Playwright MCP** screenshot(s) confirm the visual result at desktop + mobile viewports. There are no `*.test.ts` files.

---

## File Structure

**Create:**
- `lib/capability.ts` — pure capability detection (WebGL version, tier, reduced-motion).
- `lib/useScrollProgress.ts` — shared 0→1 document scroll-progress ref (rAF, passive).
- `components/BackgroundManager.tsx` — picks the renderer; mounted in layout.
- `components/three/Scene3D.tsx` — the R3F `<Canvas>` + scene composition.
- `components/three/HeroObject.tsx` — central distorted icosahedron.
- `components/three/AmbientField.tsx` — instanced point field.
- `components/three/CameraRig.tsx` — scroll + pointer camera motion.
- `components/three/useThreeTheme.ts` — accent colors from CSS vars (R3F-side).
- `components/CSS3DBackground.tsx` — no-WebGL animated CSS-3D scene.
- `components/ui/ThreadLines.tsx` — self-drawing SVG thread overlay.

**Modify:**
- `app/layout.tsx` — swap direct `<ParticleBackground />` for `<BackgroundManager />`; remove `<CustomCursor />`.
- `app/globals.css` — remove `cursor:none`; add themed SVG cursor; add `content-visibility` + depth utilities.
- `components/Hero.tsx` — add ThreadLines + headline parallax.
- `components/About.tsx`, `components/Skills.tsx`, `components/Projects.tsx` — add parallax/depth where noted.
- `next.config` (if present) — ensure three is transpiled/optimized.

**Delete:**
- `components/ui/CustomCursor.tsx` — replaced by themed SVG cursor.

---

## Phase 0 — Baseline

### Task 0: Capture performance baseline

**Files:** none (measurement only).

- [ ] **Step 1: Build and run production server**

Run:
```bash
npm run build
npm run start
```
Expected: build completes with no errors; server on `http://localhost:3000`.

- [ ] **Step 2: Record baseline with Playwright MCP**

Using Playwright MCP: navigate to `http://localhost:3000`, take a full-page screenshot at 1440×900 and at 390×844 (iPhone 12). Save observations (FPS feel, initial JS chunk size from the build output's route table) into a scratch note in the PR description later.

- [ ] **Step 3: Record initial JS bundle size**

From the `npm run build` output, note the "First Load JS" for `/`. This is the before-number for the optimization phase.

No commit (measurement only).

---

## Phase 1 — Themed SVG cursor (self-contained, lowest risk)

### Task 1: Replace custom cursor with themed SVG cursor

**Files:**
- Delete: `components/ui/CustomCursor.tsx`
- Modify: `app/layout.tsx` (remove import + mount)
- Modify: `app/globals.css:256-258` (cursor rules)

- [ ] **Step 1: Remove the CustomCursor mount from layout**

In `app/layout.tsx`, delete the import line `import CustomCursor from "@/components/ui/CustomCursor";` and remove the `<CustomCursor />` element inside `<LenisProvider>`. Result:

```tsx
        <LenisProvider>
          {children}
        </LenisProvider>
```

- [ ] **Step 2: Delete the component file**

```bash
git rm components/ui/CustomCursor.tsx
```

- [ ] **Step 3: Replace the cursor CSS**

In `app/globals.css`, replace the block:

```css
/* ─── Custom cursor — hides OS cursor so CustomCursor.tsx renders instead ── */
/* The custom cursor component provides the visual dot + ring on pointer devices */
@media (pointer: fine) { * { cursor: none !important; } }
```

with a themed SVG cursor (normal pointer behavior, accent-colored, per-theme). Default arrow uses `--accent`; interactive elements use `--accent-2`:

```css
/* ─── Themed SVG cursor (normal cursor, accent-colored, per-theme) ────────── */
/* Light theme: accent #1800ad / accent-2 #a855f7 */
@media (pointer: fine) {
  html[data-theme="light"] body {
    cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26"><path d="M5 3 L5 21 L10 16 L13.2 23 L16 21.8 L12.9 15 L20 15 Z" fill="%231800ad" stroke="white" stroke-width="1.3" stroke-linejoin="round"/></svg>') 5 3, auto;
  }
  html[data-theme="light"] a,
  html[data-theme="light"] button,
  html[data-theme="light"] [role="button"],
  html[data-theme="light"] input,
  html[data-theme="light"] textarea,
  html[data-theme="light"] select,
  html[data-theme="light"] [tabindex] {
    cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26"><path d="M5 3 L5 21 L10 16 L13.2 23 L16 21.8 L12.9 15 L20 15 Z" fill="%23a855f7" stroke="white" stroke-width="1.3" stroke-linejoin="round"/></svg>') 5 3, pointer;
  }

  /* Dark theme: accent #7b6fff / accent-2 #c084fc */
  html[data-theme="dark"] body {
    cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26"><path d="M5 3 L5 21 L10 16 L13.2 23 L16 21.8 L12.9 15 L20 15 Z" fill="%237b6fff" stroke="%230d0d1a" stroke-width="1.3" stroke-linejoin="round"/></svg>') 5 3, auto;
  }
  html[data-theme="dark"] a,
  html[data-theme="dark"] button,
  html[data-theme="dark"] [role="button"],
  html[data-theme="dark"] input,
  html[data-theme="dark"] textarea,
  html[data-theme="dark"] select,
  html[data-theme="dark"] [tabindex] {
    cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26"><path d="M5 3 L5 21 L10 16 L13.2 23 L16 21.8 L12.9 15 L20 15 Z" fill="%23c084fc" stroke="%230d0d1a" stroke-width="1.3" stroke-linejoin="round"/></svg>') 5 3, pointer;
  }
}
```

- [ ] **Step 4: Build + lint**

Run:
```bash
npm run build && npx eslint .
```
Expected: build succeeds; no eslint errors; no remaining references to `CustomCursor`.

- [ ] **Step 5: Visual verify (Playwright MCP)**

Run `npm run start`, navigate to the site. Confirm: the OS cursor is visible as an accent-colored arrow; hovering a button/link shows the `--accent-2` colored arrow; toggling the theme switches cursor color. Screenshot is insufficient for cursor (cursor isn't captured) — verify by reading computed `cursor` style via `browser_evaluate`: `getComputedStyle(document.body).cursor` should contain `url(`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: replace dot+ring cursor with themed SVG cursor (per-theme)"
```

---

## Phase 2 — Mobile-first 3D background system

### Task 2: Capability detection module

**Files:**
- Create: `lib/capability.ts`

- [ ] **Step 1: Write the capability detector**

Create `lib/capability.ts`:

```ts
// lib/capability.ts
export type Renderer = 'webgl' | 'css3d' | 'canvas2d';
export type Tier = 'S' | 'M' | 'L';

export interface Capability {
  renderer: Renderer;
  tier: Tier;
  reducedMotion: boolean;
  webglVersion: 0 | 1 | 2;
}

function detectWebGL(): 0 | 1 | 2 {
  try {
    const c = document.createElement('canvas');
    if (c.getContext('webgl2')) return 2;
    if (c.getContext('webgl') || c.getContext('experimental-webgl')) return 1;
  } catch {
    /* ignore */
  }
  return 0;
}

function detectTier(): Tier {
  const w = window.innerWidth;
  // navigator.deviceMemory is non-standard; guard it.
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const cores = navigator.hardwareConcurrency ?? 4;
  const coarse = window.matchMedia('(pointer: coarse)').matches;

  if (w < 768 || coarse || mem <= 2 || cores <= 4) return 'S';
  if (w < 1280 || mem <= 4 || cores <= 8) return 'M';
  return 'L';
}

export function detectCapability(): Capability {
  if (typeof window === 'undefined') {
    return { renderer: 'canvas2d', tier: 'S', reducedMotion: false, webglVersion: 0 };
  }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const webglVersion = detectWebGL();
  const renderer: Renderer = webglVersion > 0 ? 'webgl' : 'css3d';
  return { renderer, tier: detectTier(), reducedMotion, webglVersion };
}

// Per-tier quality knobs consumed by the 3D scene.
export const TIER_CONFIG: Record<Tier, {
  particleCount: number;
  dpr: [number, number];
  icoDetail: number;     // icosahedron subdivision
  distortSpeed: number;
}> = {
  S: { particleCount: 700,  dpr: [1, 1],   icoDetail: 4,  distortSpeed: 1.2 },
  M: { particleCount: 1600, dpr: [1, 1.5], icoDetail: 8,  distortSpeed: 1.6 },
  L: { particleCount: 3200, dpr: [1, 2],   icoDetail: 16, distortSpeed: 2.0 },
};
```

- [ ] **Step 2: Build + lint**

Run: `npx tsc --noEmit && npx eslint lib/capability.ts`
Expected: no type or lint errors.

- [ ] **Step 3: Commit**

```bash
git add lib/capability.ts
git commit -m "feat: device capability detection for adaptive 3D"
```

### Task 3: Shared scroll-progress hook

**Files:**
- Create: `lib/useScrollProgress.ts`

- [ ] **Step 1: Write the hook**

Create `lib/useScrollProgress.ts`. Returns a ref holding 0→1 document scroll progress, updated rAF-batched from a passive listener (works with Lenis since Lenis drives native scroll):

```ts
// lib/useScrollProgress.ts
'use client';
import { useRef, useEffect } from 'react';

export function useScrollProgress() {
  const progress = useRef(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return progress;
}
```

- [ ] **Step 2: Build + lint**

Run: `npx tsc --noEmit && npx eslint lib/useScrollProgress.ts`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add lib/useScrollProgress.ts
git commit -m "feat: shared rAF-batched scroll-progress hook"
```

### Task 4: R3F theme-color hook

**Files:**
- Create: `components/three/useThreeTheme.ts`

- [ ] **Step 1: Write the hook**

Create `components/three/useThreeTheme.ts`. Reads `--accent`/`--accent-2` as THREE.Color, re-reads on `data-theme` change:

```ts
// components/three/useThreeTheme.ts
'use client';
import { useState, useEffect } from 'react';
import { Color } from 'three';

function readColor(varName: string, fallback: string): Color {
  const cs = getComputedStyle(document.documentElement);
  const raw = cs.getPropertyValue(varName).trim() || fallback;
  return new Color(raw);
}

export function useThreeTheme() {
  const [colors, setColors] = useState(() => ({
    accent: new Color('#7b6fff'),
    accent2: new Color('#c084fc'),
  }));

  useEffect(() => {
    const read = () =>
      setColors({
        accent: readColor('--accent', '#7b6fff'),
        accent2: readColor('--accent-2', '#c084fc'),
      });
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  return colors;
}
```

- [ ] **Step 2: Build + lint**

Run: `npx tsc --noEmit && npx eslint components/three/useThreeTheme.ts`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/three/useThreeTheme.ts
git commit -m "feat: R3F hook reading accent colors from CSS theme"
```

### Task 5: Central morphing hero object

**Files:**
- Create: `components/three/HeroObject.tsx`

- [ ] **Step 1: Write the component**

Create `components/three/HeroObject.tsx`. Distorted icosahedron via drei `MeshDistortMaterial`, accent-colored, slow rotation (skipped when `frozen`):

```tsx
// components/three/HeroObject.tsx
'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import type { Mesh } from 'three';
import { useThreeTheme } from './useThreeTheme';

export default function HeroObject({
  detail,
  distortSpeed,
  frozen,
}: {
  detail: number;
  distortSpeed: number;
  frozen: boolean;
}) {
  const mesh = useRef<Mesh>(null);
  const { accent, accent2 } = useThreeTheme();

  useFrame((_, delta) => {
    if (frozen || !mesh.current) return;
    mesh.current.rotation.y += delta * 0.15;
    mesh.current.rotation.x += delta * 0.05;
  });

  return (
    <mesh ref={mesh} scale={1.7}>
      <icosahedronGeometry args={[1, detail]} />
      <MeshDistortMaterial
        color={accent}
        emissive={accent2}
        emissiveIntensity={0.25}
        roughness={0.25}
        metalness={0.6}
        distort={frozen ? 0.25 : 0.4}
        speed={frozen ? 0 : distortSpeed}
      />
    </mesh>
  );
}
```

- [ ] **Step 2: Build + lint**

Run: `npx tsc --noEmit && npx eslint components/three/HeroObject.tsx`
Expected: clean (verified fully when mounted in Task 8).

- [ ] **Step 3: Commit**

```bash
git add components/three/HeroObject.tsx
git commit -m "feat: morphing icosahedron hero object for 3D scene"
```

### Task 6: Ambient instanced particle field

**Files:**
- Create: `components/three/AmbientField.tsx`

- [ ] **Step 1: Write the component**

Create `components/three/AmbientField.tsx`. A single `<points>` cloud (one draw call), count from tier, gentle drift, accent-colored, additive blending for glow:

```tsx
// components/three/AmbientField.tsx
'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, type Points as TPoints } from 'three';
import { useThreeTheme } from './useThreeTheme';

export default function AmbientField({
  count,
  frozen,
}: {
  count: number;
  frozen: boolean;
}) {
  const ref = useRef<TPoints>(null);
  const { accent } = useThreeTheme();

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 18;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (frozen || !ref.current) return;
    ref.current.rotation.y += delta * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color={accent}
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}
```

- [ ] **Step 2: Build + lint**

Run: `npx tsc --noEmit && npx eslint components/three/AmbientField.tsx`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/three/AmbientField.tsx
git commit -m "feat: instanced ambient particle field for 3D scene"
```

### Task 7: Camera rig (scroll + pointer motion)

**Files:**
- Create: `components/three/CameraRig.tsx`

- [ ] **Step 1: Write the component**

Create `components/three/CameraRig.tsx`. Lerps camera Z (dolly) from scroll progress and applies subtle pointer/touch parallax. Disabled when `frozen`:

```tsx
// components/three/CameraRig.tsx
'use client';
import { useRef, useEffect, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

export default function CameraRig({
  scrollProgress,
  frozen,
}: {
  scrollProgress: RefObject<number>;
  frozen: boolean;
}) {
  const { camera } = useThree();
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (frozen) return;
    const onMove = (e: MouseEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onTouch = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      pointer.current.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.touches[0].clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouch);
    };
  }, [frozen]);

  useFrame(() => {
    if (frozen) return;
    const p = scrollProgress.current ?? 0;
    // Dolly from z=6 (top) to z=3.2 (bottom); orbit slightly with scroll.
    const targetZ = 6 - p * 2.8;
    const targetX = pointer.current.x * 0.6;
    const targetY = -pointer.current.y * 0.4 + p * 0.5;
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.position.z += (targetZ - camera.position.z) * 0.05;
    camera.lookAt(0, 0, 0);
  });

  return null;
}
```

- [ ] **Step 2: Build + lint**

Run: `npx tsc --noEmit && npx eslint components/three/CameraRig.tsx`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/three/CameraRig.tsx
git commit -m "feat: scroll-dolly + pointer-parallax camera rig"
```

### Task 8: Scene3D canvas composition

**Files:**
- Create: `components/three/Scene3D.tsx`

- [ ] **Step 1: Write the component**

Create `components/three/Scene3D.tsx`. Composes the scene, applies tier config, `frameloop="never"` when reduced-motion (renders a single static frame), and uses drei `PerformanceMonitor` + `AdaptiveDpr` for runtime step-down:

```tsx
// components/three/Scene3D.tsx
'use client';
import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor, AdaptiveDpr } from '@react-three/drei';
import { TIER_CONFIG, type Tier } from '@/lib/capability';
import { useScrollProgress } from '@/lib/useScrollProgress';
import HeroObject from './HeroObject';
import AmbientField from './AmbientField';
import CameraRig from './CameraRig';

export default function Scene3D({
  tier,
  reducedMotion,
}: {
  tier: Tier;
  reducedMotion: boolean;
}) {
  const cfg = TIER_CONFIG[tier];
  const scrollProgress = useScrollProgress();
  const [dpr, setDpr] = useState<number>(cfg.dpr[1]);

  return (
    <Canvas
      aria-hidden="true"
      frameloop={reducedMotion ? 'never' : 'always'}
      dpr={dpr}
      gl={{ antialias: tier !== 'S', powerPreference: 'high-performance', alpha: true }}
      camera={{ position: [0, 0, 6], fov: 50 }}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr((d) => Math.max(cfg.dpr[0], d - 0.5))}
      />
      <AdaptiveDpr pixelated />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} />
      <HeroObject detail={cfg.icoDetail} distortSpeed={cfg.distortSpeed} frozen={reducedMotion} />
      <AmbientField count={cfg.particleCount} frozen={reducedMotion} />
      <CameraRig scrollProgress={scrollProgress} frozen={reducedMotion} />
      <fog attach="fog" args={['#0d0d1a', 6, 16]} />
    </Canvas>
  );
}
```

- [ ] **Step 2: Build + lint**

Run: `npx tsc --noEmit && npx eslint components/three/Scene3D.tsx`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/three/Scene3D.tsx
git commit -m "feat: Scene3D canvas with adaptive dpr + reduced-motion static frame"
```

### Task 9: CSS-3D no-WebGL fallback

**Files:**
- Create: `components/CSS3DBackground.tsx`

- [ ] **Step 1: Write the component**

Create `components/CSS3DBackground.tsx`. Pure-CSS perspective scene: a few accent shapes rotating in 3D. Uses inline styles + a keyframe injected once. Honors reduced-motion by freezing:

```tsx
// components/CSS3DBackground.tsx
'use client';

const SHAPES = [
  { size: 220, top: '20%', left: '15%', dur: 22, delay: 0 },
  { size: 160, top: '60%', left: '70%', dur: 28, delay: -6 },
  { size: 280, top: '70%', left: '25%', dur: 34, delay: -12 },
];

export default function CSS3DBackground({ frozen }: { frozen: boolean }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        perspective: '900px',
        background: 'var(--bg-primary)',
      }}
    >
      <style>{`
        @keyframes css3d-spin {
          from { transform: rotate3d(1,1,0,0deg); }
          to   { transform: rotate3d(1,1,0,360deg); }
        }
      `}</style>
      {SHAPES.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            borderRadius: '24%',
            transformStyle: 'preserve-3d',
            background:
              'linear-gradient(135deg, var(--accent), var(--accent-2))',
            opacity: 0.18,
            filter: 'blur(2px)',
            animation: frozen
              ? 'none'
              : `css3d-spin ${s.dur}s linear ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Build + lint**

Run: `npx tsc --noEmit && npx eslint components/CSS3DBackground.tsx`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/CSS3DBackground.tsx
git commit -m "feat: animated CSS-3D background for no-WebGL devices"
```

### Task 10: BackgroundManager + wire into layout

**Files:**
- Create: `components/BackgroundManager.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Write BackgroundManager**

Create `components/BackgroundManager.tsx`. Detects capability after mount (avoids hydration mismatch), lazy-loads the chosen renderer:

```tsx
// components/BackgroundManager.tsx
'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { detectCapability, type Capability } from '@/lib/capability';

const Scene3D = dynamic(() => import('./three/Scene3D'), { ssr: false });
const CSS3DBackground = dynamic(() => import('./CSS3DBackground'), { ssr: false });
const ParticleBackground = dynamic(() => import('./ui/ParticleBackground'), { ssr: false });

export default function BackgroundManager() {
  const [cap, setCap] = useState<Capability | null>(null);

  useEffect(() => {
    setCap(detectCapability());
  }, []);

  if (!cap) {
    // Pre-detection: neutral painted background, no canvas (no hydration mismatch).
    return (
      <div
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'var(--bg-primary)' }}
      />
    );
  }

  try {
    if (cap.renderer === 'webgl') {
      return <Scene3D tier={cap.tier} reducedMotion={cap.reducedMotion} />;
    }
    if (cap.renderer === 'css3d') {
      return <CSS3DBackground frozen={cap.reducedMotion} />;
    }
  } catch {
    /* fall through to 2D */
  }
  return <ParticleBackground />;
}
```

- [ ] **Step 2: Wire into layout**

In `app/layout.tsx`: replace `import ParticleBackground from "@/components/ui/ParticleBackground";` with `import BackgroundManager from "@/components/BackgroundManager";`, and replace `<ParticleBackground />` with `<BackgroundManager />`.

- [ ] **Step 3: Build + lint**

Run: `npm run build && npx eslint .`
Expected: build succeeds. Confirm in the route table that the three.js code is **not** in the `/` First Load JS (it should be a separately-loaded async chunk).

- [ ] **Step 4: Visual verify (Playwright MCP)**

Run `npm run start`. Navigate to site at 1440×900 and 390×844. Confirm: a 3D morphing object + particle field renders behind content; scrolling dollies the camera; pointer moves the camera slightly. Screenshot both viewports. Then emulate reduced-motion (`browser_emulate_media` / launch with reduced-motion) and confirm the scene renders but is static.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: BackgroundManager selects WebGL/CSS-3D/2D renderer (mobile-first)"
```

---

## Phase 3 — SVG thread animations

### Task 11: ThreadLines component

**Files:**
- Create: `components/ui/ThreadLines.tsx`

- [ ] **Step 1: Write the component**

Create `components/ui/ThreadLines.tsx`. Accent SVG paths whose `pathLength` animates 0→1 as the element scrolls through the viewport. Scales via `viewBox` + `preserveAspectRatio`. Reduced-motion → rendered fully drawn:

```tsx
// components/ui/ThreadLines.tsx
'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

const PATHS = [
  'M0,40 C200,10 400,90 600,50 S1000,10 1200,60',
  'M0,90 C250,60 500,120 750,80 S1100,50 1200,100',
];

export default function ThreadLines({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  // Draw 0→1 across the element's scroll span.
  const drawn = useTransform(scrollYProgress, [0, 0.6], [0, 1]);

  return (
    <div ref={ref} aria-hidden="true" className={className} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      <svg width="100%" height="100%" viewBox="0 0 1200 140" preserveAspectRatio="none" fill="none">
        {PATHS.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            stroke="var(--accent)"
            strokeWidth={1.4}
            strokeOpacity={0.5}
            style={{ pathLength: reduce ? 1 : drawn }}
          />
        ))}
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Build + lint**

Run: `npx tsc --noEmit && npx eslint components/ui/ThreadLines.tsx`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/ui/ThreadLines.tsx
git commit -m "feat: self-drawing SVG thread-line overlay"
```

### Task 12: Place ThreadLines between sections

**Files:**
- Modify: `components/Hero.tsx`

- [ ] **Step 1: Add ThreadLines to the Hero section**

In `components/Hero.tsx`, import the component (`import ThreadLines from './ui/ThreadLines';`) and render it inside the `<section>` just after the grid overlay `<div>` (so it sits behind content; the section already has `position: relative` + `overflow: hidden`):

```tsx
      {/* Thread-line overlay (draws on scroll) */}
      <ThreadLines />
```

- [ ] **Step 2: Build + lint**

Run: `npm run build && npx eslint .`
Expected: clean.

- [ ] **Step 3: Visual verify (Playwright MCP)**

Run `npm run start`. Scroll the hero into/out of view; confirm thread lines draw themselves. Screenshot mid-draw at 1440 and 390. Confirm no horizontal overflow on mobile.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add self-drawing thread lines to hero"
```

---

## Phase 4 — Parallax, depth & transitions

### Task 13: Hero headline parallax + depth vignette

**Files:**
- Modify: `components/Hero.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Add a depth vignette utility**

Append to `app/globals.css`:

```css
/* ─── Depth helpers ──────────────────────────────────────────────────────── */
.depth-vignette::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at 50% 40%, transparent 55%, color-mix(in srgb, var(--bg-primary) 70%, transparent) 100%);
  z-index: 0;
}
```

- [ ] **Step 2: Add parallax to the hero headline**

In `components/Hero.tsx`, add a second transform off the existing `scrollYProgress` for a deeper layer and apply it to the `<h1>`'s wrapper. Below the existing `const opacity = ...` line add:

```tsx
  const titleY = useTransform(scrollYProgress, [0, 1], ['0px', '-120px']);
```

Then wrap the `<motion.h1>` parallax by changing its container: apply `style={{ y: titleY }}` to a `motion.div` wrapping the `<motion.h1>` (the h1 already uses `variants`, so add an outer `<motion.div style={{ y: titleY }}>` around it). Add `depth-vignette` to the section's `className`: `className="section-bg-primary depth-vignette"`.

- [ ] **Step 3: Build + lint**

Run: `npm run build && npx eslint .`
Expected: clean.

- [ ] **Step 4: Visual verify (Playwright MCP)**

Run `npm run start`. Scroll slowly; confirm the headline moves at a different rate than the rest (parallax) and a subtle vignette deepens the edges. Screenshot at 1440 and 390.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: hero headline parallax + depth vignette"
```

### Task 14: Card depth + tilt on Projects/Skills

**Files:**
- Modify: `components/Projects.tsx`
- Modify: `components/Skills.tsx`

- [ ] **Step 1: Wrap the primary project/skill cards in TiltCard**

In `components/Projects.tsx`, import `TiltCard` (`import TiltCard from './ui/TiltCard';`) and wrap each featured case-study card's outer element in `<TiltCard className="...">`. Do the same for the AI featured card in `components/Skills.tsx`. Keep existing classNames on the inner element. (TiltCard only adds rotateX/rotateY springs; no layout change.)

- [ ] **Step 2: Build + lint**

Run: `npm run build && npx eslint .`
Expected: clean.

- [ ] **Step 3: Visual verify (Playwright MCP)**

Run `npm run start`. Hover the project/skills cards on desktop; confirm a subtle 3D tilt. On mobile (touch) confirm cards are unaffected and still readable. Screenshot both.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: 3D tilt depth on project and skills cards"
```

---

## Phase 5 — Deep performance optimization

### Task 15: Offscreen rendering for content sections

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add content-visibility to sections**

Append to `app/globals.css` (skip `#hero` so the first paint is never deferred):

```css
/* ─── Offscreen render skipping (perf) ───────────────────────────────────── */
section:not(#hero) {
  content-visibility: auto;
  contain-intrinsic-size: auto 800px;
}
```

- [ ] **Step 2: Build + visual verify**

Run `npm run build && npm run start`. Scroll the full page; confirm no layout jumps, no blank sections, scroll-reveal animations still fire. Screenshot Projects + Contact at 1440 and 390.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "perf: content-visibility on offscreen sections"
```

### Task 16: Pause 2D ParticleBackground when offscreen/hidden

**Files:**
- Modify: `components/ui/ParticleBackground.tsx`

- [ ] **Step 1: Pause RAF on tab hidden**

In `components/ui/ParticleBackground.tsx`, inside the effect, add a `visibilitychange` handler that cancels the rAF when `document.hidden` and restarts `tick()` when visible. Add near the other listeners:

```tsx
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
```

And in the cleanup `return`, add: `document.removeEventListener('visibilitychange', onVisibility);`

- [ ] **Step 2: Build + lint**

Run: `npm run build && npx eslint components/ui/ParticleBackground.tsx`
Expected: clean.

- [ ] **Step 3: Visual verify**

This path only runs on no-WebGL devices. Verify build only; confirm no double-RAF (switching tabs away and back should not speed up the animation). Use `browser_evaluate` to dispatch `visibilitychange` if testing manually.

- [ ] **Step 4: Commit**

```bash
git add components/ui/ParticleBackground.tsx
git commit -m "perf: pause 2D particle RAF when tab hidden"
```

### Task 17: Verify three.js code-splitting & measure

**Files:** none (verification).

- [ ] **Step 1: Inspect the production build output**

Run: `npm run build`
Expected: the `/` route's "First Load JS" is comparable to the pre-3D baseline from Task 0 (three.js loads as a separate async chunk via the dynamic import, not in the initial bundle). If three appears in the initial chunk, confirm `Scene3D` is only imported through `next/dynamic` and never statically.

- [ ] **Step 2: Lighthouse pass (Playwright MCP or Chrome)**

Run `npm run start`. Run Lighthouse (mobile + desktop) against `http://localhost:3000`. Record Performance score, LCP, TBT, CLS. Compare against Task 0 baseline; note results in the PR description. Target: no regression in Performance score vs. baseline; CLS < 0.1.

- [ ] **Step 3: Commit (notes only, if any)**

No code commit unless a regression fix is required.

---

## Phase 6 — Cross-browser / responsive verification

### Task 18: Multi-viewport + multi-engine verification

**Files:** none (verification); fix-forward commits as needed.

- [ ] **Step 1: Responsive sweep (Playwright MCP)**

Run `npm run start`. Screenshot the full page at widths 360, 768, 1024, 1440, and 1920. Confirm: no horizontal scrollbar, hero object not clipped on portrait, threads scale, text legible, cards reflow per the existing `r-grid-*` utilities.

- [ ] **Step 2: Engine check**

Using Playwright MCP, load the site under Chromium and WebKit (and Firefox if available). Confirm the 3D scene renders (or falls back cleanly), the themed cursor applies on pointer devices, and no console errors. Note any engine-specific issues.

- [ ] **Step 3: Reduced-motion + no-WebGL checks**

Emulate `prefers-reduced-motion: reduce` → confirm the 3D scene renders static (no rotation/distortion motion). Simulate no-WebGL (e.g., disable WebGL flag, or temporarily force `renderer:'css3d'`) → confirm the CSS-3D scene animates.

- [ ] **Step 4: Fix-forward any issues, then commit**

```bash
git add -A
git commit -m "fix: cross-browser/responsive adjustments for 3D + animations"
```

---

## Self-Review (completed by plan author)

- **Spec coverage:** 3D scene (Tasks 2–10) ✓; mobile-first tiers (Task 2 + Scene3D) ✓; reduced-motion static frame (Scene3D, Task 8) ✓; WebGL1 + CSS-3D + 2D fallbacks (capability.ts + BackgroundManager, Tasks 2/9/10) ✓; SVG threads (Tasks 11–12) ✓; themed SVG cursor (Task 1) ✓; parallax/depth/transitions (Tasks 13–14) ✓; deep perf pass (Tasks 0, 15–17) ✓; responsive/cross-browser (Task 18) ✓.
- **Placeholder scan:** no TBD/TODO; all code shown inline.
- **Type consistency:** `Capability`, `Tier`, `TIER_CONFIG` keys (`particleCount`, `dpr`, `icoDetail`, `distortSpeed`) are consistent across `capability.ts`, `Scene3D`, `HeroObject`, `AmbientField`. `scrollProgress` is a `RefObject<number>` in both `useScrollProgress` and `CameraRig`. `frozen` boolean prop consistent across scene components.
- **Verification model:** adapted to this repo (no test framework) — build + eslint + Playwright visual checks, consistent with the project's standing visual-verification rule.
