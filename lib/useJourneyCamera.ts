// lib/useJourneyCamera.ts
'use client';
import { useRef, useEffect } from 'react';
import { STATIONS, STATION_Z } from './journey';

function smoothstep(t: number) { return t * t * (3 - 2 * t); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

// Returns a ref with the target camera z, computed from where the viewport center
// sits among the on-page station anchors. Camera lingers near a station (smoothstep)
// and flies through the empty gaps between stations.
export function useJourneyCamera() {
  const zRef = useRef(STATION_Z[STATIONS[0].id] ?? 0);

  useEffect(() => {
    const ids = STATIONS.map(s => s.id);
    const zs = STATIONS.map(s => STATION_Z[s.id]);
    let raf = 0;

    const update = () => {
      raf = 0;
      const focus = window.innerHeight / 2;
      const centers = ids.map(id => {
        const el = document.querySelector(`[data-station="${id}"]`);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return r.top + r.height / 2;
      });
      // Drop missing anchors but keep z aligned.
      const pts: Array<{ c: number; z: number }> = [];
      centers.forEach((c, i) => { if (c != null) pts.push({ c, z: zs[i] }); });
      if (pts.length === 0) return;
      if (pts.length === 1) { zRef.current = pts[0].z; return; }

      if (focus <= pts[0].c) { zRef.current = pts[0].z; return; }
      if (focus >= pts[pts.length - 1].c) { zRef.current = pts[pts.length - 1].z; return; }
      for (let k = 0; k < pts.length - 1; k++) {
        if (focus >= pts[k].c && focus <= pts[k + 1].c) {
          const t = (focus - pts[k].c) / (pts[k + 1].c - pts[k].c || 1);
          zRef.current = lerp(pts[k].z, pts[k + 1].z, smoothstep(t));
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

  return zRef;
}
