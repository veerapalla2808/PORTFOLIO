// components/cockpit/ConsoleBlock.tsx
'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { DESTINATIONS } from '@/lib/destinations';

function smoothstep(t: number) { return t * t * (3 - 2 * t); }
const BY_ID = Object.fromEntries(DESTINATIONS.map((d, i) => [d.id, { d, i }]));

// A destination's data appears on a cockpit console screen only while the ship is
// docked there; it dissolves back to open space during travel.
export default function ConsoleBlock({ id, children }: { id: string; children: ReactNode }) {
  const entry = BY_ID[id];
  const ref = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current; const s = screen.current;
    if (!el || !s) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const center = r.top + r.height / 2;
      const dist = Math.abs(center - window.innerHeight / 2);
      const vis = smoothstep(Math.max(0, 1 - dist / (window.innerHeight * 0.46)));
      s.style.opacity = String(vis);
      s.style.transform = `translateY(${(1 - vis) * 24}px)`;
      s.style.pointerEvents = vis > 0.6 ? 'auto' : 'none';
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
    <div ref={ref} data-station={id} className="console-block">
      <div ref={screen} className="console-screen">
        <div className="console-bar">
          <span className="console-dot" />
          <span className="console-code">DESTINATION {String(entry?.i ?? 0).padStart(2, '0')} · {entry?.d.code}</span>
          <span className="console-bar-line" />
          <span className="console-status">DOCKED</span>
        </div>
        {children}
      </div>
    </div>
  );
}
