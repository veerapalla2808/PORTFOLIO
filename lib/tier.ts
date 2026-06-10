// lib/tier.ts — device capability tiers for the construct
export type Tier = 'S' | 'M' | 'L';
export interface Caps { tier: Tier; reducedMotion: boolean }

export function detectCaps(): Caps {
  if (typeof window === 'undefined') return { tier: 'S', reducedMotion: false };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const w = window.innerWidth;
  const cores = navigator.hardwareConcurrency ?? 4;
  let tier: Tier = 'L';
  if (w < 768 || coarse || cores <= 4) tier = 'S';
  else if (w < 1280 || cores <= 8) tier = 'M';
  return { tier, reducedMotion };
}
