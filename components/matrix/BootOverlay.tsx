'use client';
// Interactive jack-in — the POST prints, then YOU hold the plug to enter.
// (Reduced motion / keyboard: a single click works too.)
import { useEffect, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';

const LINES = [
  'VPALLA BIOS v11.0 — DUAL PHOSPHOR OK',
  'MEMORY CHECK ............ 11 YEARS OK',
  'MOUNTING /dev/career .... 5 SYSTEMS FOUND',
  'LOADING THE GRID',
];

export default function BootOverlay({ onDone }: { onDone: () => void }) {
  const { progress, active } = useProgress();
  const [shown, setShown] = useState(0);
  const [charge, setCharge] = useState(0);
  const [fading, setFading] = useState(false);
  const done = useRef(false);
  const holdTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const pct = active ? Math.min(100, Math.round(progress)) : 100;
  const ready = shown >= LINES.length && pct >= 100;

  useEffect(() => {
    if (shown >= LINES.length) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => setShown(s => s + 1), reduced ? 40 : 380);
    return () => clearTimeout(t);
  }, [shown]);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    clearInterval(holdTimer.current);
    setFading(true);
    setTimeout(onDone, 600);
  };

  const startHold = () => {
    if (done.current || !ready) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return; }
    clearInterval(holdTimer.current);
    holdTimer.current = setInterval(() => {
      setCharge(c => {
        const next = Math.min(1, c + 0.055);
        if (next >= 1) finish();
        return next;
      });
    }, 30);
  };
  const stopHold = () => {
    clearInterval(holdTimer.current);
    if (!done.current) setCharge(c => (c >= 1 ? c : 0));
  };

  return (
    <div className={`mx-boot${fading ? ' is-fading' : ''}`} role="presentation">
      {/* full-bleed ambient — the screen itself is alive */}
      <div className="mx-boot-ambient" aria-hidden="true" />
      <div className="mx-boot-sweep" aria-hidden="true" />

      <header className="mx-boot-bar vt" aria-hidden="true">
        <span>VPALLA SYSTEMS // BOOTSTRAP</span>
        <span className="mx-boot-bar-right">DUAL-PHOSPHOR CRT · {pct}%</span>
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
            <button
              className="mx-jack-btn"
              onPointerDown={startHold}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') finish(); }}
            >
              <span className="mx-jack-fill" style={{ width: `${charge * 100}%` }} />
              <span className="mx-jack-label">
                {charge > 0 ? 'JACKING IN…' : 'HOLD TO JACK IN'}
              </span>
            </button>
            <p className="mx-boot-skip">[ or press ENTER ]</p>
          </div>
        )}
      </div>

      <footer className="mx-boot-bar mx-boot-bar-b vt" aria-hidden="true">
        <span>MEM 11Y OK · SYS 5/5 · CLOUDS 3/3</span>
        <span className="mx-boot-bar-right">© 2026 VEERA PALLA</span>
      </footer>
    </div>
  );
}
