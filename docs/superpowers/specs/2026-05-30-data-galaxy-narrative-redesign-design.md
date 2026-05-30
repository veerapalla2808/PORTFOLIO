# Data-Galaxy — Narrative Space-Travel Portfolio Redesign

**Date:** 2026-05-30
**Author:** Veera Palla (with Claude)
**Status:** Approved pending spec review
**Supersedes:** the 3D-blob background + SVG threads from
`2026-05-29-portfolio-3d-animation-optimization-design.md` (those visuals are removed).

## 1. Goal

Transform the portfolio from a polished single-page site into a **narrative,
story-driven "data-galaxy" journey**. The visitor travels through a digital cosmos
made of falling code; each existing section becomes a *sector* of cyberspace, greeted
by a unique AI co-pilot guide that narrates that sector's chapter. All in the existing
indigo/violet theme.

This replaces the WebGL 3D blob, the SVG thread lines, and the cursor-reactive 2D
particle background with a single, lighter, fully cross-browser 2D-canvas background.

## 2. What is removed

- **SVG thread lines** — delete `components/ui/ThreadLines.tsx` and its use in Hero.
- **3D blob + WebGL stack** — delete `components/three/` (`Scene3D`, `HeroObject`,
  `AmbientField`, `CameraRig`, `useThreeTheme`) and `components/CSS3DBackground.tsx`.
- **Cursor-reactive 2D particles** — delete `components/ui/ParticleBackground.tsx`.
- **Dependencies** — remove `three`, `@react-three/fiber`, `@react-three/drei`, and
  `@types/three` from `package.json` (~230 KB bundle removed).
- **`lib/capability.ts`** — replaced by a simpler `lib/galaxyTier.ts` (no WebGL
  detection needed; only reduced-motion + density tier).

**Kept:** themed SVG cursor, Lenis smooth scroll, Framer Motion, GSAP, all section
content components, `lib/data.ts`, the side strip / navbar, theming.

## 3. Background system: "Data-Galaxy" (new)

A single fixed full-viewport `<canvas>` at `z-index:0`, theme-colored, composed of
three internal layers drawn each frame:

1. **Matrix digital rain** — columns of falling glyphs (katakana/ASCII mix) in
   `--accent`, drawn in 2–3 depth bands (far = faint/slow/small, near =
   bright/fast/large). Lead glyph brighter than the trailing fade.
2. **Parallax starfield** — drifting star points in depth layers for spatial depth;
   slight parallax toward scroll direction.
3. **Warp layer** — during a transition, stars elongate into radial hyperspace
   streaks from a vanishing point and rain accelerates/glitches; eases back to rest.

Implementation notes:
- One `requestAnimationFrame` loop; colors read from CSS vars (re-read on
  `data-theme` change), mirroring the old `ParticleBackground` pattern.
- DPR clamped (≤2 desktop, ≤1.5 mobile). Density from tier (Section 8).
- Pause the RAF when `document.hidden`.
- Lives in `components/galaxy/DataGalaxyBackground.tsx`; rain/star/warp math in
  `components/galaxy/galaxyEngine.ts` (pure functions + a small stateful class so the
  component stays thin).

## 4. Travel UX: hybrid

- **Scroll (within / between adjacent sectors):** normal Lenis scroll. As the
  boundary between two sectors crosses mid-viewport, a **light warp pulse** fires
  (brief star-streak + rain glitch + sector accent crossfade). Driven by scroll
  position via an IntersectionObserver/scroll callback, throttled.
- **Nav click (jump to a sector):** triggers a **full cinematic warp**:
  1. Warp overlay ramps up (intense streaks + rain surge + slight desaturate).
  2. Lenis programmatic scroll to the target sector (fast, eased).
  3. "Arrival" settle (streaks collapse, sector header + guide animate in).
- A central **WarpController** (React context + a small state machine) exposes
  `warpTo(sectorId)` and a `warpLevel` signal (0→1) consumed by the canvas and overlay.
- Reduced-motion: warp = instant fade + immediate scroll; no streaks/surge.

## 5. Sectors

Each existing section is wrapped as a **Sector** with identity metadata. Draft map:

| Section    | Sector id   | Codename         | Number |
| ---------- | ----------- | ---------------- | ------ |
| Hero       | `origin`    | ORIGIN SIGNAL    | 00     |
| About      | `core`      | CORE MEMORY      | 01     |
| Skills     | `arsenal`   | THE ARSENAL      | 02     |
| Experience | `voyage`    | VOYAGE LOG       | 03     |
| Projects   | `archive`   | MISSION ARCHIVE  | 04     |
| Education  | `academy`   | THE ACADEMY      | 05     |
| Blog       | `transmit`  | TRANSMISSIONS    | 06     |
| Contact    | `channel`   | OPEN CHANNEL     | 07     |

- Metadata in `lib/sectors.ts`: `{ id, number, codename, accent }` (accent is a
  per-sector hue shift within the indigo/violet family for mood variation).
- A **sector header** (e.g. `SECTOR 02 // THE ARSENAL`) renders above each section's
  existing content, in the mono eyebrow style already used.
- The existing nav (`SideStrip`/`Navbar`) links call `warpTo(sectorId)` instead of a
  plain anchor jump. Optional: a small "star-map" waypoint rail showing progress
  (nice-to-have, not required for v1).

## 6. AI guide characters

- **One unique guide per sector**, defined in `components/galaxy/guides.ts`:
  `{ sectorId, handle, avatarVariant, lines }`. `handle` is a codename (e.g. `NAV-0`,
  `MEM-1`, `ARC-2`); `avatarVariant` selects one of several **original SVG/CSS "AI
  construct" emblems** (distinct geometry + accent), built by us — no third-party IP.
- **Component `components/galaxy/SectorGuide.tsx`** behavior on first entry to a
  sector (IntersectionObserver, fire once):
  1. Hologram **glitch-in** (scanline + RGB-split + opacity flicker).
  2. **Typewriter** the sector's 1–2 narration lines.
  3. **Minimize** to a small corner HUD badge (the avatar emblem + handle). Clicking
     the badge re-expands the panel.
- Narration copy is drafted by us from `lib/data.ts` content (data-galaxy flavor) and
  is freely editable by the user. Lines live in `guides.ts`.
- The guide panel is visually decorative but its text is real DOM (readable by AT);
  `aria-live="polite"` on the typed line; badge is a labeled button.
- Reduced-motion: no glitch/typewriter — the panel appears with its full line shown,
  then minimizes without animation.

## 7. Architecture & files

**Create**
- `lib/galaxyTier.ts` — `{ tier: 'S'|'M'|'L', reducedMotion }` from viewport /
  `hardwareConcurrency` / `prefers-reduced-motion`. Density knobs per tier.
- `lib/sectors.ts` — sector metadata + ordered list.
- `components/galaxy/galaxyEngine.ts` — rain/star/warp simulation (framework-free).
- `components/galaxy/DataGalaxyBackground.tsx` — canvas host + RAF + theme colors +
  visibility pause; consumes `warpLevel`.
- `components/galaxy/WarpController.tsx` — context/provider with `warpTo`, `warpLevel`,
  `activeSector`; owns the warp state machine + Lenis programmatic scroll.
- `components/galaxy/SectorGuide.tsx` — holographic guide + typewriter + HUD badge.
- `components/galaxy/guides.ts` — per-sector guide data (+ narration copy).
- `components/galaxy/Sector.tsx` — wrapper: renders sector header, registers with
  WarpController, triggers the guide on enter, applies boundary warp pulse.
- `components/galaxy/GuideAvatar.tsx` — renders an `avatarVariant` as themed SVG.

**Modify**
- `app/layout.tsx` — replace `<BackgroundManager />` with `<DataGalaxyBackground />`
  inside a `<WarpController>` provider; keep cursor.
- `app/page.tsx` — wrap each section in `<Sector id=...>`.
- `components/Navbar.tsx`, `components/SideStrip.tsx` — nav links call `warpTo`.
- `app/globals.css` — galaxy/HUD utility classes; remove cursor-none remnants (already
  done); reduced-motion rules for warp/rain/guide.
- `package.json` — drop three/fiber/drei.

**Delete**
- `components/three/*`, `components/CSS3DBackground.tsx`,
  `components/BackgroundManager.tsx`, `components/ui/ParticleBackground.tsx`,
  `components/ui/ThreadLines.tsx`, `lib/capability.ts`, `lib/useScrollProgress.ts`
  (if unused after the swap).

## 8. Performance, mobile, accessibility, cross-browser

- **Tiers (density):** S (mobile/low) — fewer rain columns, ≤1 star band, dpr≤1.5,
  warp simplified; M — moderate; L (desktop) — full. Chosen from viewport +
  `hardwareConcurrency`; no WebGL detection needed.
- **Mobile:** full experience (rain + stars + warp + guides) at tuned density. Touch:
  warp on nav tap; no hover dependence. No horizontal overflow at ≤360px.
- **Reduced-motion:** static starfield, rain frozen or removed, warp = instant fade,
  guide static. One code path gated on `prefers-reduced-motion`.
- **Perf:** single canvas + one RAF; pause on tab hidden; `content-visibility:auto`
  retained on offscreen sections; no per-frame React state (canvas reads a ref for
  `warpLevel`). Target: no Lighthouse regression vs current; bundle smaller (three
  removed).
- **Cross-browser:** 2D canvas + standard APIs only → Chromium/Firefox/WebKit safe.
- **SEO/AT:** all section content remains in normal DOM; warp/rain are decorative
  `aria-hidden` canvas; guide text is real, `aria-live` polite.

## 9. Build phasing (one plan, sequenced tasks)

1. **Galaxy background** — `galaxyEngine` + `DataGalaxyBackground`; wire into layout;
   remove three.js/threads/blob/particles + deps. (Biggest visible change.)
2. **Sectors** — `sectors.ts`, `Sector` wrapper, sector headers, scroll-boundary warp
   pulse.
3. **Guides** — `guides.ts`, `GuideAvatar`, `SectorGuide` (glitch-in + typewriter +
   HUD badge), narration copy.
4. **Warp navigation** — `WarpController`, nav-click cinematic warp + Lenis jump.
5. **Polish/verify** — reduced-motion, mobile tuning, perf, cross-browser; live
   browser verification at all breakpoints.

## 10. Out of scope (YAGNI)

- No real third-party/anime IP art (original themed avatars only).
- No audio.
- No backend/data changes; `lib/data.ts` stays the content source.
- Star-map waypoint rail is optional, deferred unless time allows.

## 11. Risks & mitigations

| Risk | Mitigation |
| --- | --- |
| Rain + warp too busy / hurts readability | Keep rain low-opacity behind a section scrim; warp is brief; test contrast live. |
| Personality-heavy for a senior-eng audience | Restrained, premium treatment; guide minimizes fast; content always primary. |
| Canvas perf on low-end mobile | Tier S density caps + visibility pause + dpr clamp. |
| Warp + Lenis programmatic scroll conflicts | WarpController owns scroll; disable boundary pulse during a full warp. |
| Guide motion triggers vestibular issues | Reduced-motion path: no glitch/typewriter/warp. |

## 12. Success criteria

- Old blob/threads/particles + three.js fully removed; bundle smaller.
- Data-galaxy background (rain + stars) renders on desktop + mobile, themed, smooth.
- Each section shows its sector identity + a guide that materializes, narrates, and
  minimizes.
- Scroll boundary warp pulses; nav click performs a cinematic warp jump.
- Reduced-motion calm static path verified; full experience on mobile verified.
- No horizontal overflow ≤360px→1920px; 0 console errors; content readable/AT-safe.
- Verified live in browser at multiple breakpoints before completion.
