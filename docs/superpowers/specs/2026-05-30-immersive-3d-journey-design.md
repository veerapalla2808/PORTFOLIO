# Immersive 3D Journey Portfolio — Design Spec

**Date:** 2026-05-30
**Status:** Approved (user picked the droid guide and said "implement"); validate via prototype slice.
**Supersedes:** the 2D data-galaxy redesign — this rebuilds the page as a real WebGL 3D experience.

## Goal

A genuinely immersive **3D website**: the camera **flies through a 3D cosmos**, and
each portfolio section is a **station/planet** the visitor travels to and docks at.
A visible **floating droid companion** guides the journey and narrates each station.
Real `react-three-fiber` WebGL — not a 2D page with a canvas behind it.

## Core experience

- **Travel = scroll.** drei `<ScrollControls>` drives a camera path through 3D space.
  Scrolling flies forward along the route; nav clicks warp to a station.
- **Stations = sections.** Each section (Hero→Contact) is a 3D structure (ring/monolith/
  planet) positioned along the path. Approaching a station, the camera slows and the
  section's content panel faces the viewer, readable.
- **Content stays in DOM.** Section content renders in drei `<Scroll html>` (a scroll
  layer synced to the 3D), so the real resume text remains accessible/SEO-safe while the
  3D world moves around it. Existing section components are reused inside station panels.
- **Droid companion.** A glowing robot built from 3D primitives (body, eye, antennae,
  thrusters), animated in `useFrame` — bobs, follows the camera, reacts at each station,
  and emits a short narration line (data-galaxy/story flavor) per station.
- **Atmosphere.** 3D starfield + nebula fog + theme-colored accents (indigo/violet),
  subtle digital-rain accent retained as texture/particles.

## Architecture (files)

**Add deps:** `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`.

- `components/space/Experience.tsx` — the R3F `<Canvas>` + `<ScrollControls>`; composes
  world, stations, droid, camera rig; mounts the HTML scroll layer.
- `components/space/CameraRig.tsx` — moves the camera along the path from scroll offset.
- `components/space/Starfield.tsx` — instanced 3D star points + drift.
- `components/space/Nebula.tsx` — fog / soft volumetric backdrop (cheap).
- `components/space/Station.tsx` — a 3D station structure at a given path position.
- `components/space/Droid.tsx` — the companion model + animation + narration trigger.
- `components/space/Narration.tsx` — droid speech HUD (typewriter, reduced-motion safe).
- `lib/journey.ts` — ordered station definitions (id, position, codename, narration).
- `components/space/SceneContent.tsx` — the `<Scroll html>` content (reuses About,
  Skills, … inside themed station panels).
- `app/page.tsx` — render `<Experience>` full-screen + minimal floating HUD nav.
- `app/layout.tsx` — drop Lenis (ScrollControls owns scroll); keep cursor + theme.
- Remove the 2D `DataGalaxyBackground` / `WarpController` / `Sector*` galaxy modules
  once the 3D experience replaces them.

## Constraints

- **Mobile:** runs the 3D at tuned quality (lower star counts, dpr clamp, simpler droid);
  scroll-fly works with touch.
- **Reduced-motion:** no auto-fly/bob; camera jumps between stations on scroll/nav;
  droid static; narration shown without typewriter.
- **Performance:** lazy-load the 3D (`dynamic ssr:false`), DPR clamp, instancing,
  `PerformanceMonitor`/adaptive dpr, pause on tab hidden.
- **Accessibility/SEO:** content in `<Scroll html>` stays real DOM; canvas `aria-hidden`.

## Execution: prototype-first

1. **Slice:** Canvas + ScrollControls + starfield + camera fly + droid + Hero intro and
   the first docking station (About) with content. Verify the *feel* in-browser.
2. Extend to all 8 stations + per-station narration.
3. Reduced-motion + mobile + perf pass; full verification.

## Out of scope

- No third-party/anime IP (original droid only). No audio. No backend/data changes
  (`lib/data.ts` stays the content source).
