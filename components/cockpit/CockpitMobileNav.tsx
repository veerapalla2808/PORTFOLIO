// components/cockpit/CockpitMobileNav.tsx
'use client';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { DESTINATIONS } from '@/lib/destinations';
import { useWarp } from '@/components/galaxy/WarpController';

export default function CockpitMobileNav() {
  const { warpTo, activeSector } = useWarp();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <div className="cm-nav">
      <button className="cm-toggle" onClick={() => setOpen(o => !o)} aria-label={open ? 'Close flight plan' : 'Open flight plan'} aria-expanded={open}>
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {open && (
        <div className="cm-overlay" role="dialog" aria-modal="true">
          <p className="cm-eyebrow">{'>'} FLIGHT PLAN</p>
          <ul className="cm-list">
            {DESTINATIONS.map((d, i) => (
              <li key={d.id}>
                <button className={`cm-item${activeSector === d.id ? ' is-active' : ''}`} onClick={() => { warpTo(d.id); setOpen(false); }}>
                  <span className="cm-idx">{String(i).padStart(2, '0')}</span>
                  <span className="cm-code">{d.code}</span>
                  <span className="cm-label">{d.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
