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
