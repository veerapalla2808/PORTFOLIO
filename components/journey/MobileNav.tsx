// components/journey/MobileNav.tsx
'use client';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { STATIONS } from '@/lib/journey';
import { SECTOR_BY_ID } from '@/lib/sectors';
import { useWarp } from '@/components/galaxy/WarpController';

export default function MobileNav() {
  const { warpTo, activeSector } = useWarp();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <div className="mobile-nav">
      <button
        className="mobile-nav-toggle"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="mobile-nav-overlay" role="dialog" aria-modal="true">
          <p className="mobile-nav-eyebrow">{'//'} NAVIGATE THE JOURNEY</p>
          <ul className="mobile-nav-list">
            {STATIONS.map(s => {
              const meta = SECTOR_BY_ID[s.id];
              return (
                <li key={s.id}>
                  <button
                    className={`mobile-nav-item${activeSector === s.id ? ' is-active' : ''}`}
                    onClick={() => { warpTo(s.id); setOpen(false); }}
                  >
                    <span className="mobile-nav-num">{meta ? meta.number : '00'}</span>
                    <span className="mobile-nav-name">{s.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
