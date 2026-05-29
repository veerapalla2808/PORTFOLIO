# Portfolio 3D + Animation + Optimization — Design Spec

**Date:** 2026-05-29
**Author:** Veera Palla (with Claude)
**Status:** Approved pending spec review

## 1. Goal

Elevate the existing Next.js 16 / React 19 portfolio into a best-in-class, visually
deep, animation-rich site while improving performance across all devices. Work is
organized into six workstreams:

1. A **full-scene 3D background** with a central morphing hero object + ambient
   particle field (Option B).
2. **Animated SVG "thread" line animations** that self-draw on scroll.
3. A **themed SVG cursor** (normal cursor behavior, accent-colored).
4. **Scroll-based animations, parallax, transitions, and added visual depth.**
5. A **deep performance optimization pass.**
6. **Mobile-first, responsive, cross-browser, all-screen-size** correctness as a
   constraint applied to every workstream above.

## 2. Guiding principle: Mobile-first 3D

The 3D scene **must run on mobile devices**, not be replaced by a 2D fallback there.
Quality scales with device capability via tiers; the scene itself is always present
on any WebGL-capable device.

- **Tier S (low / small / low-power):** reduced particle count, `dpr` capped at 1,
  lower geometry subdivision, reduced distortion + post effects off.
- **Tier M (mid):** moderate counts, `dpr` capped at 1.5.
- **Tier L (high-end desktop):** full counts, `dpr` capped at 2, full effects.

Tier is chosen from an initial heuristic (viewport size, `navigator.hardwareConcurrency`,
`navigator.deviceMemory`, pointer type) and then **auto-adjusted at runtime** by
drei `<PerformanceMonitor>` + `<AdaptiveDpr>` so a struggling device steps down a tier.

**Fallback hierarchy — "push 3D as far as possible everywhere":**

- WebGL2 unavailable → attempt **WebGL1** context before any non-3D fallback.
- `prefers-reduced-motion: reduce` → still render the **full 3D scene with depth +
  lighting, but frozen on a single frame** (`frameloop="never"`, no auto-rotate, no
  scroll/pointer motion). The user gets the rich 3D visual; their stated
  accessibility preference (no continuous/animated motion) is respected. This is a
  deliberate, documented accessibility decision — we do **not** override the OS-level
  reduced-motion signal with continuous animation.
- No WebGL at all (genuinely no context, ~<1% of devices) → animated **CSS-3D**
  scene using `transform: perspective(...)` / `rotate3d` on accent shapes
  (`CSS3DBackground.tsx`), so even non-WebGL devices see a moving 3D-style scene.
- Existing 2D `ParticleBackground` is retained only as the absolute last-resort
  safety net (e.g., CSS-3D also unsupported / errors).
- Everything else (including all modern phones) → the real WebGL 3D scene at an
  appropriate tier.

## 3. Architecture & components

### 3.1 Background system

```
BackgroundManager (client)
 ├─ detects: WebGL2/WebGL1 support, reduced-motion, capability tier
 ├─ WebGL capable + reduced-motion → Scene3D (frameloop="never", static 3D frame)
 ├─ WebGL capable                  → Scene3D (lazy, ssr:false)  ← default incl. mobile
 ├─ no WebGL                        → CSS3DBackground (animated CSS perspective scene)
 └─ CSS-3D unsupported / error      → ParticleBackground (2D canvas, last resort)
```

- **`components/BackgroundManager.tsx`** — client component. Runs detection in
  `useEffect` (post-mount, so SSR renders nothing/placeholder to avoid hydration
  mismatch). Chooses one of three renderers. Mounted once in `app/layout.tsx`,
  replacing the direct `<ParticleBackground />` mount.
- **`components/three/Scene3D.tsx`** — the R3F `<Canvas>`, lazy-loaded via
  `next/dynamic(() => import(...), { ssr: false })` so the three.js bundle is fully
  code-split. Fixed, full-viewport, `z-index:0`, `pointer-events:none`.
- **`components/three/HeroObject.tsx`** — central morphing object: an icosahedron
  with drei `MeshDistortMaterial` (or `Wobble`), accent-colored, slow auto-rotate +
  pointer/scroll reaction. Geometry detail scales with tier.
- **`components/three/AmbientField.tsx`** — instanced particle field (drei `<Points>`
  or `<Instances>`), single draw call, fog for depth. Count scales with tier.
- **`components/three/CameraRig.tsx`** — drives camera dolly/orbit from scroll
  progress and pointer parallax inside `useFrame` (lerped). Object/camera scale and
  FOV adapt to viewport aspect for responsiveness.
- **`components/three/useThreeTheme.ts`** — reads `--accent` / `--accent-2` from CSS,
  re-reads on `data-theme` mutation (mirrors current `ParticleBackground` logic).
- **`components/CSS3DBackground.tsx`** — animated CSS-3D scene
  (`transform: perspective()` / `rotate3d`) for the genuinely no-WebGL path, so even
  those devices get moving 3D-style depth.
- Reduced-motion is handled inside `Scene3D` itself (render one static frame), not a
  separate gradient component.

### 3.2 SVG thread animations

- **`components/ui/ThreadLines.tsx`** — reusable component rendering accent-colored
  SVG `<path>`s whose `pathLength` animates from 0→1 driven by Framer Motion
  `useScroll`/`whileInView`. Used as section connectors / decorative overlays.
  `viewBox`-based and `preserveAspectRatio` so threads scale across screen sizes.
  Honors `prefers-reduced-motion` (renders fully drawn, no animation).

### 3.3 Themed SVG cursor

- Remove `components/ui/CustomCursor.tsx` (dot + ring) and its mount in
  `app/layout.tsx`.
- Remove the global `@media (pointer: fine) { * { cursor: none !important; } }` rule
  in `globals.css`.
- Add accent-colored SVG cursors via CSS `cursor: url("data:image/svg+xml,...") x y, auto`
  on `body`/interactive elements, with per-theme color (`#1800ad` light, `#7b6fff`
  dark) selected through `[data-theme]` selectors. Pointer/hand variant for
  interactive elements. Falls back to native `auto`/`pointer` where custom cursors
  unsupported. No effect on touch devices (they have no cursor).

### 3.4 Scroll / parallax / depth / transitions

- Add `useScroll`/`useTransform` parallax to section headings and key cards
  (subtle, GPU-friendly transforms only — `transform`/`opacity`).
- Increase depth via layered shadows, gradient/vignette overlays between the 3D
  canvas and content, and broader use of the existing `TiltCard`.
- Keep and refine existing `SectionReveal` transition variants.

## 4. Performance optimization pass

- **Code-splitting:** dynamic-import three.js scene and any other heavy client-only
  components; verify three.js is absent from the initial JS chunk.
- **Canvas/RAF hygiene:** clamp `dpr` per tier; `<PerformanceMonitor>` +
  `<AdaptiveDpr>` + `<AdaptiveEvents>`; **pause the render loop** when the tab is
  hidden (`visibilitychange`) or the canvas is scrolled fully off-screen
  (IntersectionObserver); throttle/scale work on Tier S.
- **React hygiene:** memoize expensive components, eliminate avoidable re-renders,
  ensure all scroll/move/resize listeners are `passive` and debounced/rAF-batched.
- **CSS:** `content-visibility:auto` + `contain-intrinsic-size` on offscreen
  sections; targeted `will-change` only during active animation.
- **Measurement:** Lighthouse (mobile + desktop) before/after; record key metrics
  (LCP, TBT, CLS, bundle size) in the implementation notes.

## 5. Responsive / cross-browser / multi-device requirements

- All new UI uses fluid units (`clamp`, `vw/vh`, `%`) and the existing responsive
  grid utilities; verified at ≤360px, 768px, 1024px, 1440px, and ultra-wide.
- Canvas + camera respond to viewport aspect; hero object never clips on portrait
  phones.
- WebGL feature-detect before mounting `Scene3D`; `-webkit-` prefixes where needed;
  pointer/touch events handled for both mouse and touch parallax.
- Touch parallax: use `touchmove` (and optionally `deviceorientation` with
  permission) so mobile users still get reactive motion.
- Tested behavior on Chromium, Firefox, and WebKit/Safari (incl. iOS Safari quirks:
  `100vh`, passive listeners, devicePixelRatio).

## 6. Out of scope (YAGNI)

- No new heavy GLB/3D model assets (procedural geometry only).
- No audio, no scroll-jacking multi-room narrative (Option C).
- No backend/data changes; `lib/data.ts` remains the content source of truth.
- Contact form remains as-is.

## 7. Risks & mitigations

| Risk | Mitigation |
| --- | --- |
| Full 3D on low-end phones janks | Tier S + runtime `PerformanceMonitor` step-down; pause off-screen. |
| three.js bloats initial load | Lazy `ssr:false` dynamic import; verify chunk split. |
| Hydration mismatch from capability detection | Detect in `useEffect` after mount; SSR renders neutral placeholder. |
| iOS Safari WebGL / `100vh` quirks | Feature-detect; use `dvh`/`svh` units and resize handling. |
| Custom SVG cursor unsupported / ugly on some OS | CSS fallback to native `auto`/`pointer`. |
| Reduced-motion users still need depth without motion-sickness risk | Render static single-frame 3D scene (`frameloop="never"`); never force continuous motion. |
| No-WebGL device still expected to show 3D | Animated CSS-3D perspective scene; 2D canvas only as final safety net. |

## 8. Success criteria

- Central morphing 3D hero object + ambient field renders on desktop **and** mobile.
- Reduced-motion users see a static 3D frame (depth, no motion); no-WebGL users see
  an animated CSS-3D scene — i.e. some form of 3D depth is shown on every device.
- SVG threads self-draw on scroll; themed SVG cursor active on pointer devices.
- Parallax/depth/transitions present and smooth.
- Lighthouse performance not regressed (ideally improved) vs. baseline on mobile.
- Layout correct and animations functional across target screen sizes and the three
  major browser engines.
- Verified visually in a live browser before completion (standing project rule).
