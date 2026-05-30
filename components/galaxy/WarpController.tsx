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
