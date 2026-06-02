'use client';
import { useState } from 'react';
import LivingConstellation from './LivingConstellation';
import ClusterPanel from './ClusterPanel';
import ClassicView from './ClassicView';

export default function PortfolioApp() {
  const [mode, setMode] = useState<'living' | 'classic'>('living');
  const [open, setOpen] = useState<string | null>(null);

  return (
    <>
      <button
        className="view-toggle"
        onClick={() => { setMode((m) => (m === 'living' ? 'classic' : 'living')); setOpen(null); }}
      >
        {mode === 'living' ? 'CLASSIC VIEW' : 'EXPLORE ↗'}
      </button>

      {mode === 'living' ? (
        <>
          <LivingConstellation onOpen={setOpen} dimmed={!!open} />
          <ClusterPanel open={open} onClose={() => setOpen(null)} />
          {!open && (
            <p className="lc-hint">{'//'} LIVING CONSTELLATION · MOVE YOUR CURSOR · CLICK A NODE · IT RE-FORMS EVERY VISIT</p>
          )}
        </>
      ) : (
        <ClassicView />
      )}
    </>
  );
}
