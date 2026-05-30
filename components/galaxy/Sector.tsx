// components/galaxy/Sector.tsx
'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { SECTOR_BY_ID } from '@/lib/sectors';
import { useWarp } from './WarpController';

export default function Sector({ id, children }: { id: string; children: ReactNode }) {
  const meta = SECTOR_BY_ID[id];
  const ref = useRef<HTMLDivElement>(null);
  const seen = useRef(false);
  const { pulse, setActiveSector } = useWarp();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setActiveSector(id);
        if (!seen.current) { seen.current = true; pulse(); }
      },
      { threshold: 0.35 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [id, pulse, setActiveSector]);

  return (
    <div ref={ref} data-sector={id} style={{ position: 'relative' }}>
      {meta && id !== 'hero' && (
        <div className="container-wide" style={{ position: 'relative', zIndex: 1 }}>
          <p className="sector-header">
            <span className="sector-num">SECTOR {meta.number}</span>
            <span className="sector-line" aria-hidden="true" />
            {meta.codename}
          </p>
        </div>
      )}
      {children}
    </div>
  );
}
