// components/cockpit/NavPanel.tsx
'use client';
import { useEffect } from 'react';
import { DESTINATIONS } from '@/lib/destinations';
import { useWarp } from '@/components/galaxy/WarpController';

// Cockpit flight-plan control panel, fixed to the LEFT of the dashboard.
export default function NavPanel() {
  const { warpTo, activeSector, setActiveSector } = useWarp();

  useEffect(() => {
    const els = DESTINATIONS
      .map(d => document.querySelector(`[data-station="${d.id}"]`))
      .filter(Boolean) as Element[];
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.5) {
            const id = e.target.getAttribute('data-station');
            if (id) setActiveSector(id);
          }
        }
      },
      { threshold: [0.5, 0.75] },
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [setActiveSector]);

  return (
    <nav className="nav-panel" aria-label="Flight plan">
      <p className="nav-panel-title">FLIGHT PLAN</p>
      <ul className="nav-panel-list">
        {DESTINATIONS.map((d, i) => {
          const active = activeSector === d.id;
          return (
            <li key={d.id}>
              <button
                className={`nav-wp${active ? ' is-active' : ''}`}
                onClick={() => warpTo(d.id)}
                aria-current={active ? 'true' : undefined}
              >
                <span className="nav-wp-idx">{String(i).padStart(2, '0')}</span>
                <span className="nav-wp-body">
                  <span className="nav-wp-code">{d.code}</span>
                  <span className="nav-wp-label">{d.label}</span>
                </span>
                <span className="nav-wp-mark" />
              </button>
            </li>
          );
        })}
      </ul>
      <p className="nav-panel-foot">TEX · SOLAR SYSTEM SCOPE · CC BY 4.0</p>
    </nav>
  );
}
