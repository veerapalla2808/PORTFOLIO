'use client';
// The router. A dark landing lets you choose a discipline; Front-End opens a
// light theme, Back-End a dark one (the default). View is synced to the URL
// hash so the browser back button and shared links both work.
import { useCallback, useEffect, useRef, useState } from 'react';
import ParticleField from './ParticleField';
import Landing from './Landing';
import SideView from './SideView';

type View = 'landing' | 'front' | 'back';

export default function Experience() {
  const [view, setView] = useState<View>('landing');
  const [tint, setTint] = useState<'light' | 'dark' | null>(null);
  const prevView = useRef<View>('landing');

  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace('#', '');
      setView(h === 'frontend' ? 'front' : h === 'backend' ? 'back' : 'landing');
      window.scrollTo(0, 0);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);

  const go = useCallback((v: View) => {
    prevView.current = v;
    if (v === 'landing') {
      history.pushState(null, '', window.location.pathname);
      setView('landing');
      window.scrollTo(0, 0);
    } else {
      window.location.hash = v === 'front' ? 'frontend' : 'backend';
    }
  }, []);

  // press Enter on the landing → back-end (the default door)
  useEffect(() => {
    if (view !== 'landing') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') go('back');
      if (e.key === 'ArrowLeft') go('front');
      if (e.key === 'ArrowRight') go('back');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, go]);

  const theme: 'light' | 'dark' = view === 'front' ? 'light' : 'dark';

  return (
    <div className="app" data-theme={theme} data-view={view}>
      <ParticleField theme={theme} tint={view === 'landing' ? tint : null} />
      {view === 'landing' ? (
        <Landing onChoose={go} onHover={setTint} />
      ) : (
        <SideView
          side={view === 'front' ? 'front' : 'back'}
          onSwitch={() => go(view === 'front' ? 'back' : 'front')}
          onHome={() => go('landing')}
        />
      )}
    </div>
  );
}
