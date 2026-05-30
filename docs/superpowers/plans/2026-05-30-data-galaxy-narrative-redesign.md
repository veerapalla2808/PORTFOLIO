# Data-Galaxy Narrative Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 3D blob / SVG threads / cursor-particle background with a single 2D-canvas "data-galaxy" (Matrix digital rain + parallax starfield + warp transitions), reframe each section as a narrated "sector" with an AI-guide hologram, and add scroll-boundary + nav-click warp travel — all theme-aware, mobile-first, reduced-motion safe.

**Architecture:** One fixed canvas (`DataGalaxyBackground`) driven by a framework-free `GalaxyEngine`, reading a shared `warpLevel` ref from a `WarpController` context. `WarpController` owns the warp state machine + Lenis programmatic scroll and exposes `warpTo(id)` / `pulse()`. Each section is wrapped by `Sector`, which renders a sector header + a `SectorGuide` (hologram → typewriter → HUD badge) and pulses the warp on entry. three.js is removed entirely.

**Tech Stack:** Next.js 16, React 19, TypeScript, Framer Motion 12, Lenis, Canvas 2D. (Removing `three`, `@react-three/fiber`, `@react-three/drei`.)

**Verification model (project-specific):** No unit-test framework exists (ESLint only). Each task is verified by (1) `npm run build` succeeds, (2) `npx eslint <files>` clean, (3) Playwright MCP screenshots at desktop (1440) + mobile (390), **in both light and dark themes**, with 0 console errors. There are no `*.test.ts` files.

**Theme note:** Space/Matrix is inherently dark. The engine is **theme-adaptive**: it reads `--bg-primary` (base/trail fill) and `--accent`/`--accent-2` (glyphs/stars) from CSS each frame. Dark theme → full deep-space effect; light theme → subtle low-opacity "code drizzle" on the light base. Verify both during execution.

---

## File Structure

**Create**
- `lib/galaxyTier.ts` — capability/density tiers + reduced-motion.
- `lib/sectors.ts` — sector metadata (keyed by existing DOM id).
- `lib/lenisInstance.ts` — module holder so WarpController can reach the Lenis instance.
- `components/galaxy/galaxyEngine.ts` — rain/star/warp simulation (no React).
- `components/galaxy/DataGalaxyBackground.tsx` — canvas host + RAF + theme colors + visibility pause.
- `components/galaxy/WarpController.tsx` — context: `warpTo`, `pulse`, `warpLevelRef`, `activeSector`.
- `components/galaxy/GuideAvatar.tsx` — procedural themed SVG emblem by variant.
- `components/galaxy/guides.ts` — per-sector guide data + narration copy.
- `components/galaxy/SectorGuide.tsx` — hologram + typewriter + HUD badge.
- `components/galaxy/Sector.tsx` — section wrapper: header + guide + entry pulse.

**Modify**
- `components/LenisProvider.tsx` — publish the Lenis instance to `lib/lenisInstance.ts`.
- `app/layout.tsx` — wrap in `<WarpController>`, mount `<DataGalaxyBackground />` (remove `<BackgroundManager />`).
- `app/page.tsx` — wrap each section in `<Sector id=...>`; drop `SectionReveal` blob-era usage if it conflicts (kept; see Task 9).
- `components/SideStrip.tsx`, `components/Navbar.tsx` — nav links call `warpTo(id)`.
- `app/globals.css` — galaxy/HUD utility classes + reduced-motion rules.
- `package.json` — remove three/fiber/drei (+ `@types/three`).

**Delete**
- `components/three/` (all), `components/CSS3DBackground.tsx`, `components/BackgroundManager.tsx`,
  `components/ui/ParticleBackground.tsx`, `components/ui/ThreadLines.tsx`,
  `lib/capability.ts`, `lib/useScrollProgress.ts`.

---

## Phase 1 — Galaxy background + remove old stack

### Task 1: Density tiers

**Files:** Create `lib/galaxyTier.ts`

- [ ] **Step 1: Write the module**

```ts
// lib/galaxyTier.ts
export type GalaxyTier = 'S' | 'M' | 'L';
export interface GalaxyCaps { tier: GalaxyTier; reducedMotion: boolean; }

export function detectGalaxy(): GalaxyCaps {
  if (typeof window === 'undefined') return { tier: 'S', reducedMotion: false };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const w = window.innerWidth;
  const cores = navigator.hardwareConcurrency ?? 4;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  let tier: GalaxyTier = 'L';
  if (w < 768 || coarse || cores <= 4) tier = 'S';
  else if (w < 1280 || cores <= 8) tier = 'M';
  return { tier, reducedMotion };
}

// cell = glyph cell size in px (smaller = denser rain). dprMax clamps devicePixelRatio.
export const GALAXY_DENSITY: Record<GalaxyTier, { cell: number; stars: number; dprMax: number }> = {
  S: { cell: 20, stars: 70,  dprMax: 1.5 },
  M: { cell: 17, stars: 150, dprMax: 2 },
  L: { cell: 15, stars: 230, dprMax: 2 },
};
```

- [ ] **Step 2: Verify** — `npx tsc --noEmit && npx eslint lib/galaxyTier.ts` → clean.
- [ ] **Step 3: Commit** — `git add lib/galaxyTier.ts && git commit -m "feat: galaxy density tiers"`

### Task 2: Galaxy engine (rain + stars + warp)

**Files:** Create `components/galaxy/galaxyEngine.ts`

- [ ] **Step 1: Write the engine**

```ts
// components/galaxy/galaxyEngine.ts
// Framework-free 2D simulation: Matrix rain + parallax starfield + radial warp.
// All drawing reads colors passed in each frame so it adapts to the active theme.

export type RGB = [number, number, number];
export interface GalaxyColors { base: RGB; accent: RGB; accent2: RGB; dark: boolean; }

const GLYPHS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノﾊﾋﾌﾍﾎ0123456789ABCDEF<>/\\{}[]=*'.split('');

interface Column { chars: string[]; head: number; speed: number; }
interface Star { x: number; y: number; z: number; }

function rand(n = 1) { return Math.random() * n; }
function pick<T>(a: T[]): T { return a[(Math.random() * a.length) | 0]; }

export class GalaxyEngine {
  private W = 0; private H = 0;
  private cell = 16; private starCount = 180;
  private cols: Column[] = [];
  private stars: Star[] = [];

  configure(cell: number, starCount: number) { this.cell = cell; this.starCount = starCount; }

  resize(W: number, H: number) {
    this.W = W; this.H = H;
    const rows = Math.ceil(H / this.cell);
    const nCols = Math.ceil(W / this.cell);
    this.cols = Array.from({ length: nCols }, () => ({
      chars: Array.from({ length: rows }, () => pick(GLYPHS)),
      head: -rand(rows),
      speed: 0.18 + rand(0.5),
    }));
    this.stars = Array.from({ length: this.starCount }, () => ({ x: rand(W), y: rand(H), z: 0.2 + rand(0.8) }));
  }

  // warp: 0 = calm, 1 = full hyperspace. dt is frame delta in ~frames (1 at 60fps).
  frame(ctx: CanvasRenderingContext2D, dt: number, warp: number, c: GalaxyColors) {
    const { W, H, cell } = this;
    const [br, bg, bb] = c.base;
    const [ar, ag, ab] = c.accent;

    // Trail fade — paint the base color at low alpha so glyphs leave fading tails.
    ctx.fillStyle = `rgba(${br},${bg},${bb},${c.dark ? 0.14 : 0.20})`;
    ctx.fillRect(0, 0, W, H);

    // ── Starfield (with radial warp streaks) ─────────────────────────────────
    const cx = W / 2, cy = H / 2;
    for (const s of this.stars) {
      // gentle parallax drift downward
      s.y += (0.05 + s.z * 0.12) * dt;
      if (s.y > H) { s.y = 0; s.x = rand(W); }
      const op = (c.dark ? 0.5 : 0.25) * s.z;
      if (warp > 0.02) {
        const dx = s.x - cx, dy = s.y - cy;
        const stretch = warp * s.z * 0.9;
        ctx.strokeStyle = `rgba(${ar},${ag},${ab},${op})`;
        ctx.lineWidth = 1 + s.z;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + dx * stretch, s.y + dy * stretch);
        ctx.stroke();
      } else {
        ctx.fillStyle = `rgba(${ar},${ag},${ab},${op})`;
        ctx.fillRect(s.x, s.y, s.z * 1.6, s.z * 1.6);
      }
    }

    // ── Matrix rain ──────────────────────────────────────────────────────────
    const speedMul = 1 + warp * 6;
    ctx.font = `${cell}px var(--font-mono, monospace)`;
    ctx.textBaseline = 'top';
    const tail = 14;
    for (let i = 0; i < this.cols.length; i++) {
      const col = this.cols[i];
      col.head += col.speed * speedMul * dt;
      const headRow = Math.floor(col.head);
      const x = i * cell;
      for (let t = 0; t < tail; t++) {
        const row = headRow - t;
        if (row < 0) continue;
        const y = row * cell;
        if (y > H) continue;
        const lead = t === 0;
        const fade = (1 - t / tail) * (c.dark ? 0.85 : 0.5);
        if (lead) {
          ctx.fillStyle = c.dark ? `rgba(235,235,255,${0.95})` : `rgba(${ar},${ag},${ab},0.9)`;
        } else {
          ctx.fillStyle = `rgba(${ar},${ag},${ab},${fade.toFixed(3)})`;
        }
        // occasionally mutate a glyph for shimmer
        if (Math.random() < 0.02) col.chars[row % col.chars.length] = pick(GLYPHS);
        ctx.fillText(col.chars[row % col.chars.length], x, y);
      }
      const rows = Math.ceil(H / cell);
      if (headRow - tail > rows && Math.random() < 0.5) { col.head = -rand(rows * 0.5); col.speed = 0.18 + rand(0.5); }
    }
  }

  // Single static frame for reduced-motion (no trails / no warp).
  staticFrame(ctx: CanvasRenderingContext2D, c: GalaxyColors) {
    const { W, H, cell } = this;
    const [br, bg, bb] = c.base; const [ar, ag, ab] = c.accent;
    ctx.fillStyle = `rgb(${br},${bg},${bb})`;
    ctx.fillRect(0, 0, W, H);
    for (const s of this.stars) {
      ctx.fillStyle = `rgba(${ar},${ag},${ab},${(c.dark ? 0.5 : 0.25) * s.z})`;
      ctx.fillRect(s.x, s.y, s.z * 1.6, s.z * 1.6);
    }
    ctx.font = `${cell}px monospace`; ctx.textBaseline = 'top';
    for (let i = 0; i < this.cols.length; i++) {
      const x = i * cell;
      for (let r = 0; r < 6; r++) {
        ctx.fillStyle = `rgba(${ar},${ag},${ab},${0.12 + 0.04 * r})`;
        ctx.fillText(this.cols[i].chars[r] ?? '0', x, (r + i % 5) * cell);
      }
    }
  }
}
```

- [ ] **Step 2: Verify** — `npx tsc --noEmit && npx eslint components/galaxy/galaxyEngine.ts` → clean.
- [ ] **Step 3: Commit** — `git add components/galaxy/galaxyEngine.ts && git commit -m "feat: data-galaxy canvas engine (rain+stars+warp)"`

### Task 3: WarpController context

**Files:** Create `components/galaxy/WarpController.tsx`, `lib/lenisInstance.ts`; Modify `components/LenisProvider.tsx`

- [ ] **Step 1: Lenis instance holder**

```ts
// lib/lenisInstance.ts
import type Lenis from 'lenis';
let instance: Lenis | null = null;
export function setLenis(l: Lenis | null) { instance = l; }
export function getLenis(): Lenis | null { return instance; }
```

- [ ] **Step 2: Publish Lenis from the provider**

In `components/LenisProvider.tsx`, import the holder and register/unregister inside the existing effect:

```tsx
import { setLenis } from "@/lib/lenisInstance";
```
After `const lenis = new Lenis({...});` add `setLenis(lenis);` and in the cleanup `return () => { ... }` add `setLenis(null);` before `lenis.destroy();`.

- [ ] **Step 3: Write WarpController**

```tsx
// components/galaxy/WarpController.tsx
'use client';
import { createContext, useContext, useRef, useState, useCallback, type ReactNode, type RefObject } from 'react';
import { getLenis } from '@/lib/lenisInstance';

interface WarpApi {
  warpLevelRef: RefObject<number>;
  warpTo: (domId: string) => void;
  pulse: () => void;
  activeSector: string;
  setActiveSector: (id: string) => void;
  reducedMotion: boolean;
}

const Ctx = createContext<WarpApi | null>(null);
export function useWarp(): WarpApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useWarp must be used within <WarpController>');
  return v;
}

export default function WarpController({ children }: { children: ReactNode }) {
  const warpLevelRef = useRef(0);
  const tweenRaf = useRef(0);
  const [activeSector, setActiveSector] = useState('hero');
  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Tween warpLevelRef up to `peak`, hold, then back to 0. `onPeak` fires once near the top.
  const runWarp = useCallback((peak: number, onPeak?: () => void) => {
    if (reducedMotion) { onPeak?.(); return; }
    cancelAnimationFrame(tweenRaf.current);
    const up = 260, down = 520, start = performance.now();
    let firedPeak = false;
    const tick = (now: number) => {
      const e = now - start;
      if (e < up) warpLevelRef.current = peak * (e / up);
      else if (e < up + down) {
        if (!firedPeak) { firedPeak = true; onPeak?.(); }
        warpLevelRef.current = peak * (1 - (e - up) / down);
      } else { warpLevelRef.current = 0; return; }
      tweenRaf.current = requestAnimationFrame(tick);
    };
    tweenRaf.current = requestAnimationFrame(tick);
  }, [reducedMotion]);

  const warpTo = useCallback((domId: string) => {
    const el = document.getElementById(domId);
    if (!el) return;
    const doScroll = () => {
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(el, { duration: reducedMotion ? 0 : 1.1 });
      else el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      setActiveSector(domId);
    };
    if (reducedMotion) { doScroll(); return; }
    runWarp(1, doScroll);
  }, [reducedMotion, runWarp]);

  const pulse = useCallback(() => { if (!reducedMotion) runWarp(0.32); }, [reducedMotion, runWarp]);

  return (
    <Ctx.Provider value={{ warpLevelRef, warpTo, pulse, activeSector, setActiveSector, reducedMotion }}>
      {children}
    </Ctx.Provider>
  );
}
```

- [ ] **Step 4: Verify** — `npx tsc --noEmit && npx eslint components/galaxy/WarpController.tsx lib/lenisInstance.ts components/LenisProvider.tsx` → clean (a `set-state-in-effect` disable is not needed here; setState is in callbacks).
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: WarpController (warp state machine + Lenis jump)"`

### Task 4: DataGalaxyBackground canvas host

**Files:** Create `components/galaxy/DataGalaxyBackground.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/galaxy/DataGalaxyBackground.tsx
'use client';
import { useEffect, useRef } from 'react';
import { GalaxyEngine, type RGB } from './galaxyEngine';
import { detectGalaxy, GALAXY_DENSITY } from '@/lib/galaxyTier';
import { useWarp } from './WarpController';

function rgb(varName: string, fallback: RGB): RGB {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  const m = raw.match(/(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (m) return [+m[1], +m[2], +m[3]];
  const hex = raw.replace('#', '');
  const full = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex;
  const n = parseInt(full, 16);
  return isNaN(n) ? fallback : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export default function DataGalaxyBackground() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { warpLevelRef } = useWarp();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const caps = detectGalaxy();
    const dens = GALAXY_DENSITY[caps.tier];
    const engine = new GalaxyEngine();
    engine.configure(dens.cell, dens.stars);

    let W = 0, H = 0, dpr = 1, raf = 0, last = performance.now();
    let colors = readColors();

    function readColors() {
      const dark = document.documentElement.getAttribute('data-theme') !== 'light';
      return {
        base: rgb('--bg-primary', dark ? [13, 13, 26] : [250, 250, 254]),
        accent: rgb('--accent', [123, 111, 255]),
        accent2: rgb('--accent-2', [192, 132, 252]),
        dark,
      };
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, dens.dprMax);
      W = window.innerWidth; H = window.innerHeight;
      canvas!.width = Math.round(W * dpr); canvas!.height = Math.round(H * dpr);
      canvas!.style.width = W + 'px'; canvas!.style.height = H + 'px';
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      engine.resize(W, H);
      if (caps.reducedMotion) engine.staticFrame(ctx!, colors);
    }

    function loop(now: number) {
      const dt = Math.min(2.5, (now - last) / 16.67); last = now;
      engine.frame(ctx!, dt, warpLevelRef.current ?? 0, colors);
      raf = requestAnimationFrame(loop);
    }

    const onTheme = () => { colors = readColors(); if (caps.reducedMotion) engine.staticFrame(ctx!, colors); };
    const themeObs = new MutationObserver(onTheme);
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const onVis = () => {
      if (caps.reducedMotion) return;
      if (document.hidden) cancelAnimationFrame(raf);
      else { last = performance.now(); raf = requestAnimationFrame(loop); }
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('resize', resize);

    resize();
    if (!caps.reducedMotion) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
      themeObs.disconnect();
    };
  }, [warpLevelRef]);

  return <canvas ref={ref} aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}
```

- [ ] **Step 2: Verify** — `npx tsc --noEmit && npx eslint components/galaxy/DataGalaxyBackground.tsx` → clean.
- [ ] **Step 3: Commit** — `git add components/galaxy/DataGalaxyBackground.tsx && git commit -m "feat: data-galaxy canvas host (theme-adaptive, visibility-paused)"`

### Task 5: Wire into layout; remove old background stack + three.js

**Files:** Modify `app/layout.tsx`, `package.json`; Delete old files.

- [ ] **Step 1: Update layout**

In `app/layout.tsx`: remove `import BackgroundManager ...`; add:
```tsx
import WarpController from "@/components/galaxy/WarpController";
import DataGalaxyBackground from "@/components/galaxy/DataGalaxyBackground";
```
Replace the `<body>` contents so the provider wraps everything and the canvas mounts inside it:
```tsx
      <body className="min-h-screen antialiased">
        <SkipLink />
        <LenisProvider>
          <WarpController>
            <DataGalaxyBackground />
            {children}
          </WarpController>
        </LenisProvider>
      </body>
```
(Keep the themed cursor CSS in globals.css; the `<CustomCursor>` was already removed earlier.)

- [ ] **Step 2: Delete the old stack**

```bash
git rm -r components/three
git rm components/CSS3DBackground.tsx components/BackgroundManager.tsx \
       components/ui/ParticleBackground.tsx components/ui/ThreadLines.tsx \
       lib/capability.ts lib/useScrollProgress.ts
```

- [ ] **Step 3: Remove three.js deps**

Edit `package.json` to delete these lines from `dependencies`: `@react-three/drei`, `@react-three/fiber`, `three`; and from `devDependencies`: `@types/three`. Then run `npm install` to update the lockfile.

- [ ] **Step 4: Verify** — `npm run build && npx eslint .` → build succeeds; confirm no import errors referencing deleted files. Grep to be sure: `git grep -n "three\|ParticleBackground\|ThreadLines\|BackgroundManager\|Scene3D" -- "*.tsx" "*.ts"` returns nothing in `app/`,`components/`,`lib/`.

- [ ] **Step 5: Visual verify (Playwright MCP)** — `npm run start`; load at 1440 + 390, in **dark and light** themes (toggle via the theme button or `localStorage.theme`). Confirm: rain + starfield render, theme-appropriate (vivid dark / subtle light), no old blob/threads, 0 console errors, no horizontal overflow.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: mount data-galaxy bg; remove 3D blob/threads/particles + three.js"`

---

## Phase 2 — Sectors + headers + boundary pulse

### Task 6: Sector metadata

**Files:** Create `lib/sectors.ts`

- [ ] **Step 1: Write metadata** (keyed by existing DOM ids)

```ts
// lib/sectors.ts
export interface SectorMeta { id: string; number: string; codename: string; guide: string; }

export const SECTORS: SectorMeta[] = [
  { id: 'hero',       number: '00', codename: 'ORIGIN SIGNAL',   guide: 'NAV-0' },
  { id: 'about',      number: '01', codename: 'CORE MEMORY',     guide: 'MEM-1' },
  { id: 'skills',     number: '02', codename: 'THE ARSENAL',     guide: 'ARC-2' },
  { id: 'experience', number: '03', codename: 'VOYAGE LOG',      guide: 'LOG-3' },
  { id: 'projects',   number: '04', codename: 'MISSION ARCHIVE', guide: 'OPS-4' },
  { id: 'education',  number: '05', codename: 'THE ACADEMY',     guide: 'EDU-5' },
  { id: 'blog',       number: '06', codename: 'TRANSMISSIONS',   guide: 'TX-6'  },
  { id: 'contact',    number: '07', codename: 'OPEN CHANNEL',    guide: 'HAIL-7'},
];

export const SECTOR_BY_ID: Record<string, SectorMeta> =
  Object.fromEntries(SECTORS.map(s => [s.id, s]));
```

- [ ] **Step 2: Verify** — `npx tsc --noEmit && npx eslint lib/sectors.ts` → clean.
- [ ] **Step 3: Commit** — `git add lib/sectors.ts && git commit -m "feat: sector metadata"`

### Task 7: Sector wrapper (header + entry pulse + active tracking)

**Files:** Create `components/galaxy/Sector.tsx`

- [ ] **Step 1: Write the wrapper**

```tsx
// components/galaxy/Sector.tsx
'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { SECTOR_BY_ID } from '@/lib/sectors';
import { useWarp } from './WarpController';
import SectorGuide from './SectorGuide';

export default function Sector({ id, children }: { id: string; children: ReactNode }) {
  const meta = SECTOR_BY_ID[id];
  const ref = useRef<HTMLDivElement>(null);
  const seen = useRef(false);
  const { pulse, setActiveSector } = useWarp();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setActiveSector(id);
        if (!seen.current) { seen.current = true; pulse(); }
      },
      { threshold: 0.35 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [id, pulse, setActiveSector]);

  return (
    <div ref={ref} data-sector={id} style={{ position: 'relative' }}>
      {meta && id !== 'hero' && (
        <div className="container-wide" style={{ position: 'relative', zIndex: 1 }}>
          <p className="sector-header">
            <span className="sector-num">SECTOR {meta.number}</span>
            <span className="sector-line" aria-hidden="true" />
            {meta.codename}
          </p>
        </div>
      )}
      {children}
      {meta && <SectorGuide sectorId={id} />}
    </div>
  );
}
```

- [ ] **Step 2: Add header CSS** — append to `app/globals.css`:

```css
/* ─── Sector header (data-galaxy) ────────────────────────────────────────── */
.sector-header {
  display: flex; align-items: center; gap: 0.75rem;
  font-family: var(--font-mono); font-size: 0.7rem; font-weight: 600;
  letter-spacing: 0.3em; text-transform: uppercase; color: var(--accent);
  margin: 0 0 1.5rem; padding-top: 2rem;
}
.sector-num { color: var(--text-muted); }
.sector-line { flex: 1; height: 1px; background: linear-gradient(90deg, var(--border-accent), transparent); max-width: 160px; }
```

- [ ] **Step 3: Verify** — `npx tsc --noEmit && npx eslint components/galaxy/Sector.tsx` (will fail to resolve `SectorGuide` until Task 8 — acceptable; run full check after Task 8). For now just `npx eslint components/galaxy/Sector.tsx` may warn on missing module. Proceed to Task 8 then build.

- [ ] **Step 4: Commit** — `git add components/galaxy/Sector.tsx app/globals.css && git commit -m "feat: Sector wrapper + sector header"`

---

## Phase 3 — AI guide system

### Task 8: Guide avatar, data, and SectorGuide

**Files:** Create `components/galaxy/GuideAvatar.tsx`, `components/galaxy/guides.ts`, `components/galaxy/SectorGuide.tsx`

- [ ] **Step 1: Procedural themed avatar**

```tsx
// components/galaxy/GuideAvatar.tsx
'use client';
// One procedural SVG "AI construct" emblem; `variant` (0..7) changes geometry + hue.
export default function GuideAvatar({ variant, size = 44 }: { variant: number; size?: number }) {
  const spokes = 3 + (variant % 5);            // 3..7
  const rot = (variant * 24) % 360;
  const hue = variant % 2 === 0 ? 'var(--accent)' : 'var(--accent-2)';
  const pts = Array.from({ length: spokes }, (_, i) => {
    const a = (i / spokes) * Math.PI * 2 + (rot * Math.PI) / 180;
    return [50 + Math.cos(a) * 34, 50 + Math.sin(a) * 34];
  });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="none" stroke={hue} strokeWidth="2" strokeOpacity="0.5" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="var(--accent-2)" strokeWidth="1" strokeOpacity="0.4" />
      {pts.map(([x, y], i) => (
        <line key={i} x1="50" y1="50" x2={x} y2={y} stroke={hue} strokeWidth="1.5" strokeOpacity="0.7" />
      ))}
      {pts.map(([x, y], i) => <circle key={`d${i}`} cx={x} cy={y} r="3.5" fill={hue} />)}
      <circle cx="50" cy="50" r={6 + (variant % 3)} fill="var(--accent)" />
    </svg>
  );
}
```

- [ ] **Step 2: Guide data + narration**

```ts
// components/galaxy/guides.ts
export interface Guide { handle: string; variant: number; lines: string[]; }

// Narration drafted from lib/data.ts; edit wording freely.
export const GUIDES: Record<string, Guide> = {
  hero:       { handle: 'NAV-0',  variant: 0, lines: ['Booting navigation core…', 'Welcome aboard, operator. Plotting a course through eleven years of signal.'] },
  about:      { handle: 'MEM-1',  variant: 1, lines: ['Decrypting core memory…', 'Origin: a full-stack engineer forged across fintech, health, retail and AI.'] },
  skills:     { handle: 'ARC-2',  variant: 2, lines: ['Arsenal online.', 'Loadout: React, Node, AI/RAG, Kafka, cloud — calibrated for production scale.'] },
  experience: { handle: 'LOG-3',  variant: 3, lines: ['Reading voyage log…', 'Five star systems served — Comerica, UCLA Health, Dillard’s, KeyBank, Foxconn.'] },
  projects:   { handle: 'OPS-4',  variant: 4, lines: ['Mission archive unsealed.', 'Flagship ops: an AI banking assistant and a HIPAA EMR platform.'] },
  education:  { handle: 'EDU-5',  variant: 5, lines: ['Accessing the academy.', 'Credentials verified — certified across Node.js and React.'] },
  blog:       { handle: 'TX-6',   variant: 6, lines: ['Incoming transmissions…', 'Field notes and signals broadcast from the engineering frontier.'] },
  contact:    { handle: 'HAIL-7', variant: 7, lines: ['Channel open.', 'Hailing frequencies clear. Transmit to begin a new mission together.'] },
};
```

- [ ] **Step 3: SectorGuide (hologram → typewriter → HUD badge)**

```tsx
// components/galaxy/SectorGuide.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GUIDES } from './guides';
import { useWarp } from './WarpController';
import GuideAvatar from './GuideAvatar';

type Phase = 'idle' | 'open' | 'badge';

export default function SectorGuide({ sectorId }: { sectorId: string }) {
  const guide = GUIDES[sectorId];
  const { reducedMotion } = useWarp();
  const hostRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [typed, setTyped] = useState('');
  const firedRef = useRef(false);
  const line = guide?.lines.join('  ') ?? '';

  // Reveal once when the sector enters view.
  useEffect(() => {
    const el = hostRef.current?.closest('[data-sector]');
    if (!el || !guide) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !firedRef.current) {
        firedRef.current = true;
        setPhase('open');
      }
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [guide]);

  // Typewriter, then auto-minimize. Reduced-motion shows full line immediately.
  useEffect(() => {
    if (phase !== 'open') return;
    if (reducedMotion) {
      setTyped(line);
      return;
    }
    let i = 0; let raf = 0; let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      i += 1; setTyped(line.slice(0, i));
      if (i < line.length) timer = setTimeout(step, 22);
      else timer = setTimeout(() => setPhase('badge'), 2600);
    };
    timer = setTimeout(step, 400);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [phase, line, reducedMotion]);

  if (!guide) return null;

  return (
    <div ref={hostRef}>
      <AnimatePresence mode="wait">
        {phase === 'open' && (
          <motion.div
            key="panel"
            className="guide-panel"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
          >
            <div className={reducedMotion ? '' : 'guide-holo'}>
              <GuideAvatar variant={guide.variant} size={48} />
            </div>
            <div className="guide-body">
              <span className="guide-handle">{guide.handle}</span>
              <p className="guide-line" aria-live="polite">{typed}<span className="guide-caret" /></p>
            </div>
          </motion.div>
        )}
        {phase === 'badge' && (
          <motion.button
            key="badge"
            className="guide-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setPhase('open')}
            aria-label={`Replay guide ${guide.handle}`}
          >
            <GuideAvatar variant={guide.variant} size={28} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 4: Guide CSS** — append to `app/globals.css`:

```css
/* ─── Sector guide HUD ───────────────────────────────────────────────────── */
.guide-panel {
  position: fixed; right: clamp(1rem, 3vw, 2.5rem); bottom: clamp(1rem, 4vh, 2.5rem);
  z-index: 60; display: flex; gap: 0.85rem; align-items: center;
  max-width: min(420px, 86vw); padding: 0.85rem 1rem;
  background: color-mix(in srgb, var(--bg-card) 92%, transparent);
  border: 1px solid var(--border-accent); border-radius: 14px;
  box-shadow: var(--shadow-hover); backdrop-filter: blur(10px);
}
.guide-body { min-width: 0; }
.guide-handle { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.25em; color: var(--accent); text-transform: uppercase; }
.guide-line { font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5; margin-top: 0.15rem; }
.guide-caret { display: inline-block; width: 7px; height: 1em; margin-left: 2px; background: var(--accent); vertical-align: text-bottom; animation: guide-blink 1s steps(2) infinite; }
@keyframes guide-blink { 0%,50% { opacity: 1; } 50.01%,100% { opacity: 0; } }
.guide-holo { animation: guide-glitch 0.6s steps(3) 1; }
@keyframes guide-glitch { 0% { filter: hue-rotate(0) drop-shadow(2px 0 var(--accent-2)); opacity: 0.4; } 50% { filter: hue-rotate(40deg) drop-shadow(-2px 0 var(--accent)); } 100% { filter: none; opacity: 1; } }
.guide-badge {
  position: fixed; right: clamp(1rem, 3vw, 2.5rem); bottom: clamp(1rem, 4vh, 2.5rem);
  z-index: 60; width: 48px; height: 48px; display: grid; place-items: center;
  background: color-mix(in srgb, var(--bg-card) 90%, transparent);
  border: 1px solid var(--border-accent); border-radius: 50%; cursor: pointer;
}
@media (prefers-reduced-motion: reduce) {
  .guide-caret, .guide-holo { animation: none; }
}
```

- [ ] **Step 5: Verify** — `npm run build && npx eslint components/galaxy` → build succeeds, clean. (Resolves the Task 7 forward-reference.)
- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: AI sector guide (hologram, typewriter, HUD badge)"`

### Task 9: Wrap sections in Sector

**Files:** Modify `app/page.tsx`

- [ ] **Step 1: Wrap each section**

Replace the `<main>` body in `app/page.tsx` so every section is wrapped in `<Sector>` (keep existing `SectionReveal` variants inside):

```tsx
import Sector from "@/components/galaxy/Sector";
// ...
        <main id="main-content" tabIndex={-1}>
          <Sector id="hero"><Hero /></Sector>
          <Sector id="about"><SectionReveal variant="fold"><About /></SectionReveal></Sector>
          <Sector id="skills"><SectionReveal variant="sweep-left"><Skills /></SectionReveal></Sector>
          <Sector id="experience"><SectionReveal variant="curtain"><Experience /></SectionReveal></Sector>
          <Sector id="projects"><SectionReveal variant="zoom"><Projects /></SectionReveal></Sector>
          <Sector id="education"><SectionReveal variant="sweep-right"><Education /></SectionReveal></Sector>
          <Sector id="blog"><SectionReveal variant="fold"><Blog /></SectionReveal></Sector>
          <Sector id="contact"><SectionReveal variant="blur-in"><Contact /></SectionReveal></Sector>
        </main>
```

- [ ] **Step 2: Verify** — `npm run build && npx eslint app/page.tsx` → clean.
- [ ] **Step 3: Visual verify (Playwright MCP)** — `npm run start`; scroll through all sections at 1440 + 390. Confirm: each non-hero section shows its `SECTOR NN // CODENAME` header; entering a section makes the guide materialize, type its line, then shrink to the badge; badge re-expands on click. 0 console errors.
- [ ] **Step 4: Commit** — `git add app/page.tsx && git commit -m "feat: wrap sections as narrated sectors"`

---

## Phase 4 — Warp navigation

### Task 10: Route nav clicks through warpTo

**Files:** Modify `components/SideStrip.tsx`, `components/Navbar.tsx`

- [ ] **Step 1: SideStrip nav → warp**

In `components/SideStrip.tsx`: import the hook (`import { useWarp } from './galaxy/WarpController';`), call `const { warpTo, activeSector } = useWarp();` inside the component, drop the local `active` IntersectionObserver state (use `activeSector` from context instead), and change each section `<a>` to:
```tsx
            <a
              key={id}
              href={`#${id}`}
              aria-current={activeSector === id ? 'true' : undefined}
              onClick={(e) => { e.preventDefault(); warpTo(id); }}
              style={{ /* unchanged styles; replace `isActive` with activeSector === id */ }}
            >
```
Replace the two `isActive` reads with `activeSector === id`. Remove the now-unused `active`/`setActive` state and its `useEffect`.

- [ ] **Step 2: Navbar nav → warp**

In `components/Navbar.tsx`: import `useWarp`, call `const { warpTo } = useWarp();`. For each desktop `<a href={link.href}>` and each mobile `<motion.a href={link.href}>`, add `onClick={(e) => { e.preventDefault(); warpTo(link.href.slice(1)); setMenuOpen(false); }}` (desktop omit `setMenuOpen`). Keep the existing active-section observer for the underline indicator (or switch to `activeSector` — either is fine; keep existing to minimize churn).

- [ ] **Step 3: Verify** — `npm run build && npx eslint components/SideStrip.tsx components/Navbar.tsx` → clean.
- [ ] **Step 4: Visual verify (Playwright MCP)** — `npm run start` at 1440: click several nav destinations; confirm a warp animation fires (star streaks) and the page travels to that sector and settles. At 390: open the mobile menu, tap a destination, confirm warp + menu closes. 0 console errors.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: nav clicks trigger cinematic warp jump"`

---

## Phase 5 — Polish & verification

### Task 11: Reduced-motion, mobile, perf, cross-browser

**Files:** Verification; fix-forward as needed (likely `app/globals.css`, engine tuning).

- [ ] **Step 1: Reduced-motion** — Playwright: emulate `prefers-reduced-motion: reduce`, reload. Confirm: canvas shows a **static** starfield + faint rain (no trails/warp), nav jumps are instant scrolls, guides appear with full line and no glitch/typewriter, badge still works. 0 console errors.

- [ ] **Step 2: Mobile tuning** — at 360 + 390: confirm rain density is comfortable (not overwhelming), guide panel fits (`max-width: 86vw`), no horizontal overflow, warp on nav tap is smooth. If rain too dense/janky, raise tier-S `cell` and lower `stars` in `lib/galaxyTier.ts`.

- [ ] **Step 3: Theme check** — toggle light/dark at 1440: confirm dark = vivid deep-space; light = subtle, readable (rain not muddying text). Tune light-mode alphas in `galaxyEngine.ts` if needed.

- [ ] **Step 4: Perf** — `npm run build`; confirm three.js is gone from the chunk list and First Load JS dropped vs the 3D version. Spot-check smooth scrolling/warp on desktop.

- [ ] **Step 5: Cross-browser** — load under Chromium (and WebKit if available); 2D canvas + standard APIs only. Confirm render + warp + guides + 0 console errors.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "polish: reduced-motion, mobile, theme + perf tuning for data-galaxy"`

---

## Self-Review (plan author)

- **Spec coverage:** remove blob/threads/particles/three (Task 5) ✓; data-galaxy rain+stars+warp engine (Tasks 2,4) ✓; theme-adaptive (Task 4 colors) ✓; hybrid travel — boundary pulse (Task 7) + nav warp (Tasks 3,10) ✓; sectors + headers (Tasks 6,7,9) ✓; AI guides hologram/typewriter/badge (Task 8) ✓; reduced-motion static + mobile full + cross-browser (Tasks 4,8,11) ✓; SEO/AT (content in DOM, aria-live, aria-hidden canvas — Tasks 4,8) ✓.
- **Placeholder scan:** no TBD/TODO; all code inline; narration strings concrete.
- **Type consistency:** `warpLevelRef: RefObject<number>` defined in WarpController, consumed in DataGalaxyBackground ✓; `GalaxyColors`/`RGB` consistent between engine + host ✓; `SECTOR_BY_ID`/`GUIDES` keyed by the same DOM ids used by `warpTo` and `Sector` ✓; `useWarp()` API (`warpTo`,`pulse`,`activeSector`,`setActiveSector`,`reducedMotion`,`warpLevelRef`) matches all consumers ✓.
- **Verification model:** adapted to this repo (build + eslint + Playwright in both themes), consistent with the standing visual-verification rule.
