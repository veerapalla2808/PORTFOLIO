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
