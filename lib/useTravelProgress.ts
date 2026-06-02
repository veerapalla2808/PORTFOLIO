// lib/useTravelProgress.ts
'use client';
import { useRef, useEffect } from 'react';
import { DESTINATIONS } from './destinations';

function smoothstep(t: number) { return t * t * (3 - 2 * t); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

// Eased travel progress (0..1) from where the viewport center sits among the
// on-page destination anchors. Lingers at a destination, advances through gaps.
export function useTravelProgress() {
  const pRef = useRef(0);
  useEffect(() => {
    const n = DESTINATIONS.length;
    let raf = 0;
    const update = () => {
      raf = 0;
      const focus = window.innerHeight / 2;
      const pts: Array<{ c: number; u: number }> = [];
      DESTINATIONS.forEach((d, i) => {
        const el = document.querySelector(`[data-station="${d.id}"]`);
        if (!el) return;
        const r = el.getBoundingClientRect();
        pts.push({ c: r.top + r.height / 2, u: n > 1 ? i / (n - 1) : 0 });
      });
      if (pts.length === 0) return;
      if (pts.length === 1) { pRef.current = pts[0].u; return; }
      if (focus <= pts[0].c) { pRef.current = pts[0].u; return; }
      if (focus >= pts[pts.length - 1].c) { pRef.current = pts[pts.length - 1].u; return; }
      for (let k = 0; k < pts.length - 1; k++) {
        if (focus >= pts[k].c && focus <= pts[k + 1].c) {
          const t = (focus - pts[k].c) / (pts[k + 1].c - pts[k].c || 1);
          pRef.current = lerp(pts[k].u, pts[k + 1].u, smoothstep(t));
          return;
        }
      }
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
  return pRef;
}
