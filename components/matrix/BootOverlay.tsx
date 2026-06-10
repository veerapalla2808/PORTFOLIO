'use client';
// Boot — POST prints, then ONE CLICK enters the grid. Enter key works too.
// No hidden gestures: recruiters click, recruiters get in.
import { useEffect, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';

const LINES = [
  'VPALLA BIOS v11.0 — TRI-PHOSPHOR OK',
  'MEMORY CHECK ............ 11 YEARS OK',
  'MOUNTING /dev/career .... 8 DISTRICTS FOUND',
  'LOADING THE GRID',
];

export default function BootOverlay({ onDone }: { onDone: () => void }) {
  const { progress, active } = useProgress();
  const [shown, setShown] = useState(0);
  const [fading, setFading] = useState(false);
  const done = useRef(false);
  const pct = active ? Math.min(100, Math.round(progress)) : 100;
  const ready = shown >= LINES.length && pct >= 100;
  const readyRef = useRef(false);
  useEffect(() => { readyRef.current = ready; }, [ready]);

  useEffect(() => {
    if (shown >= LINES.length) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => setShown(s => s + 1), reduced ? 40 : 380);
    return () => clearTimeout(t);
  }, [shown]);

  const finish = () => {
    if (done.current || !readyRef.current) return;
    done.current = true;
    setFading(true);
    setTimeout(onDone, 600);
  };

  // global Enter/Space — no focus required
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') finish();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`mx-boot${fading ? ' is-fading' : ''}`} role="presentation">
      <div className="mx-boot-ambient" aria-hidden="true" />
      <div className="mx-boot-sweep" aria-hidden="true" />

      <header className="mx-boot-bar vt" aria-hidden="true">
        <span>VPALLA SYSTEMS // BOOTSTRAP</span>
        <span className="mx-boot-bar-right">TRI-PHOSPHOR CRT · {pct}%</span>
      </header>

      <div className="mx-boot-inner vt">
        {LINES.slice(0, shown).map((l, i) => (
          <p key={l}>
            {l}
            {i === LINES.length - 1 && ` ......... ${pct}%`}
          </p>
        ))}
        {ready && (
          <div className="mx-jack">
            <p className="mx-boot-wake">THE GRID IS READY.</p>
            <button className="mx-jack-btn" onClick={finish} autoFocus>
              <span className="mx-jack-label">ENTER THE GRID ▸</span>
            </button>
            <p className="mx-boot-skip">[ or press ENTER ]</p>
          </div>
        )}
      </div>

      <footer className="mx-boot-bar mx-boot-bar-b vt" aria-hidden="true">
        <span>MEM 11Y OK · DISTRICTS 8/8 · MAP ONLINE</span>
        <span className="mx-boot-bar-right">© 2026 VEERA PALLA</span>
      </footer>
    </div>
  );
}
