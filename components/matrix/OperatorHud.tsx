'use client';
// The operator — fixed terminal HUD narrating the grid.
import { useEffect, useRef, useState } from 'react';

export default function OperatorHud({
  code, rank, line, progressRef,
}: { code: string; rank: string; line: string; progressRef: React.RefObject<HTMLDivElement | null> }) {
  const [typed, setTyped] = useState('');
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    clearInterval(timer.current);
    if (reduced) {
      // reduced motion: show the full line immediately, no typewriter
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTyped(line);
      return;
    }
    setTyped('');
    let i = 0;
    timer.current = setInterval(() => {
      i++;
      setTyped(line.slice(0, i));
      if (i >= line.length) clearInterval(timer.current);
    }, 1000 / 26);
    return () => clearInterval(timer.current);
  }, [line]);

  return (
    <div className="mx-hud" aria-live="polite">
      <div className="mx-hud-top">
        <span className="mx-hud-id vt">OPERATOR</span>
        <span className="mx-hud-rank">{rank}</span>
        <span className="mx-hud-act">{code}</span>
      </div>
      <p className="mx-hud-line">
        <span className="mx-hud-prompt">{'>'}</span> {typed}
        <span className="mx-cursor" aria-hidden="true" />
      </p>
      <div className="mx-hud-trace">
        <div ref={progressRef} className="mx-hud-trace-fill" />
      </div>
    </div>
  );
}
