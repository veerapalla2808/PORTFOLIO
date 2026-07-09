'use client';
// Count-up metrics. Dark theme renders them as a system-status strip (pulsing
// dots); light theme renders score dials that fill. Numbers tick up when the
// strip scrolls into view.
import { useEffect, useRef, useState } from 'react';
import { metrics, type Metric } from '@/lib/data';

function format(m: Metric, n: number) {
  const rounded = Math.round(n);
  const body = m.format === 'comma' ? rounded.toLocaleString('en-US') : String(rounded);
  return `${m.prefix ?? ''}${body}${m.suffix ?? ''}`;
}

function Counter({ m, run, side }: { m: Metric; run: boolean; side: 'front' | 'back' }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dur = reduced ? 1 : 1100;
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(m.value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, m.value]);

  if (side === 'front') {
    const C = 2 * Math.PI * 26;
    return (
      <div className="metric metric--dial">
        <svg viewBox="0 0 64 64" className="dial">
          <circle className="dial-track" cx="32" cy="32" r="26" />
          <circle
            className="dial-fill" cx="32" cy="32" r="26"
            style={{ strokeDasharray: C, strokeDashoffset: run ? C - C * m.fill : C }}
          />
        </svg>
        <div className="metric-body">
          <b>{format(m, n)}</b>
          <span>{m.label}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="metric metric--stat">
      <span className="metric-dot" />
      <b>{format(m, n)}</b>
      <span>{m.label}</span>
    </div>
  );
}

export default function Metrics({ side }: { side: 'front' | 'back' }) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) { setRun(true); obs.disconnect(); } }),
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`metrics metrics--${side}`}>
      <span className="metrics-label">
        {side === 'back' ? 'SYSTEM STATUS' : 'DELIVERY SCORES'}
      </span>
      <div className="metrics-row">
        {metrics.map(m => <Counter key={m.label} m={m} run={run} side={side} />)}
      </div>
    </div>
  );
}
