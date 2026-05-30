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

    function readColors() {
      const dark = document.documentElement.getAttribute('data-theme') !== 'light';
      return {
        base: rgb('--bg-primary', dark ? [13, 13, 26] : [250, 250, 254]),
        accent: rgb('--accent', [123, 111, 255]),
        accent2: rgb('--accent-2', [192, 132, 252]),
        dark,
      };
    }

    let colors = readColors();

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
