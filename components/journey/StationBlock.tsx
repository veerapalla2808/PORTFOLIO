// components/journey/StationBlock.tsx
'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { SECTOR_BY_ID } from '@/lib/sectors';

function smoothstep(t: number) { return t * t * (3 - 2 * t); }

// A docked station: its content materializes as a holographic panel only while the
// block is near the viewport center, and dissolves back to deep space otherwise.
export default function StationBlock({ id, children }: { id: string; children: ReactNode }) {
  const meta = SECTOR_BY_ID[id];
  const ref = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current; const p = panel.current;
    if (!el || !p) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const center = r.top + r.height / 2;
      const dist = Math.abs(center - window.innerHeight / 2);
      const norm = Math.min(1, dist / (window.innerHeight * 0.46));
      const vis = smoothstep(1 - norm);
      p.style.opacity = String(vis);
      p.style.transform = `translateY(${(1 - vis) * 26}px) scale(${0.97 + vis * 0.03})`;
      p.style.pointerEvents = vis > 0.6 ? 'auto' : 'none';
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

  return (
    <div ref={ref} data-station={id} className="station-block">
      <div ref={panel} className="holo-dock">
        {meta && (
          <p className="sector-header">
            <span className="sector-num">SECTOR {meta.number}</span>
            <span className="sector-line" aria-hidden="true" />
            {meta.codename}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
