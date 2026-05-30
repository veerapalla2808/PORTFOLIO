// components/journey/StationDots.tsx
'use client';
import { useEffect, useState } from 'react';
import { STATIONS } from '@/lib/journey';
import { useWarp } from '@/components/galaxy/WarpController';

export default function StationDots() {
  const { warpTo, activeSector, setActiveSector } = useWarp();
  const [, force] = useState(0);

  // Track which station is centered, to highlight its dot + drive droid narration.
  useEffect(() => {
    const els = STATIONS
      .map(s => document.querySelector(`[data-station="${s.id}"]`))
      .filter(Boolean) as Element[];
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.5) {
            const id = e.target.getAttribute('data-station');
            if (id) { setActiveSector(id); force(n => n + 1); }
          }
        }
      },
      { threshold: [0.5, 0.75] },
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [setActiveSector]);

  return (
    <nav className="station-dots" aria-label="Journey navigation">
      {STATIONS.map(s => {
        const active = activeSector === s.id;
        return (
          <button
            key={s.id}
            className={`station-dot${active ? ' is-active' : ''}`}
            onClick={() => warpTo(s.id)}
            aria-label={`Warp to ${s.label}`}
            aria-current={active ? 'true' : undefined}
          >
            <span className="station-dot-mark" />
            <span className="station-dot-label">{s.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
