'use client';
// Eye-catching vector animations: line-art motifs that self-draw when they
// scroll into view (stroke-dashoffset via pathLength) plus a looping accent.
// Colors inherit currentColor, so each side themes them automatically.
import { useEffect, useRef, useState } from 'react';

function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const id = setTimeout(() => setSeen(true), 0);
      return () => clearTimeout(id);
    }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSeen(true); obs.disconnect(); } },
      { threshold: 0.35 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, seen };
}

const S = {
  stroke: 'currentColor', strokeWidth: 2.4,
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  pathLength: 1, fill: 'none',
};
const dot = { fill: 'currentColor', stroke: 'none' };

const SHAPES: Record<string, React.ReactNode> = {
  // front-end · a browser window with a blinking caret
  browser: (
    <>
      <rect x="16" y="26" width="88" height="70" rx="9" {...S} />
      <line x1="16" y1="44" x2="104" y2="44" {...S} />
      <circle cx="27" cy="35" r="2.4" {...dot} />
      <circle cx="36" cy="35" r="2.4" {...dot} />
      <circle cx="45" cy="35" r="2.4" {...dot} />
      <line x1="30" y1="60" x2="72" y2="60" {...S} />
      <line x1="30" y1="72" x2="90" y2="72" {...S} />
      <line x1="30" y1="84" x2="58" y2="84" {...S} />
      <rect className="motif-blink" x="76" y="54" width="4" height="12" {...dot} />
    </>
  ),
  // back-end · a rack of services with a live signal
  server: (
    <>
      <rect x="28" y="22" width="64" height="22" rx="5" {...S} />
      <rect x="28" y="50" width="64" height="22" rx="5" {...S} />
      <rect x="28" y="78" width="64" height="22" rx="5" {...S} />
      <circle className="motif-pulse" cx="39" cy="33" r="2.6" {...dot} />
      <circle cx="39" cy="61" r="2.6" {...dot} />
      <circle cx="39" cy="89" r="2.6" {...dot} />
      <line x1="52" y1="33" x2="82" y2="33" {...S} />
      <line x1="52" y1="61" x2="82" y2="61" {...S} />
      <line x1="52" y1="89" x2="82" y2="89" {...S} />
    </>
  ),
  // stack · a node graph
  grid: (
    <>
      <line x1="34" y1="34" x2="56" y2="56" {...S} />
      <line x1="86" y1="34" x2="64" y2="56" {...S} />
      <line x1="56" y1="64" x2="34" y2="86" {...S} />
      <line x1="64" y1="64" x2="86" y2="86" {...S} />
      <circle cx="30" cy="30" r="6" {...S} />
      <circle cx="90" cy="30" r="6" {...S} />
      <circle className="motif-node" cx="60" cy="60" r="8" {...S} />
      <circle cx="30" cy="90" r="6" {...S} />
      <circle cx="90" cy="90" r="6" {...S} />
    </>
  ),
  // signature wins · bars that grow
  chart: (
    <>
      <line x1="20" y1="100" x2="102" y2="100" {...S} />
      <g className="motif-bars">
        <rect x="30" y="62" width="13" height="38" rx="2" fill="currentColor" fillOpacity="0.85" stroke="none" />
        <rect x="53" y="44" width="13" height="56" rx="2" fill="currentColor" fillOpacity="0.85" stroke="none" />
        <rect x="76" y="28" width="13" height="72" rx="2" fill="currentColor" fillOpacity="0.85" stroke="none" />
      </g>
      <path className="motif-trend" d="M30 66 L59 48 L82 30" {...S} strokeWidth={2} />
    </>
  ),
  // note · a signature stroke
  signature: (
    <>
      <path d="M18 74 C 28 40, 44 40, 48 66 S 60 96, 70 60 S 92 38, 104 56" {...S} />
      <path className="motif-underline" d="M22 90 q 30 8 78 -2" {...S} strokeWidth={2} />
    </>
  ),
  // how I work · a compass with a sweeping needle
  compass: (
    <>
      <circle cx="60" cy="60" r="36" {...S} />
      <circle cx="60" cy="60" r="20" {...S} strokeWidth={1.8} />
      <g className="motif-needle">
        <path d="M60 60 L78 40" {...S} />
        <path d="M60 60 L48 74" {...S} strokeWidth={1.8} />
      </g>
      <circle cx="60" cy="60" r="3.2" {...dot} />
    </>
  ),
  // contact · a paper plane on a dashed trail
  plane: (
    <>
      <path className="motif-trail" d="M12 82 q 26 8 40 -4" {...S} strokeWidth={2} strokeDasharray="3 6" pathLength={undefined} />
      <path d="M22 58 L102 26 L74 98 L60 66 Z" {...S} />
      <path d="M60 66 L102 26" {...S} />
    </>
  ),
};

export function Motif({ name, className }: { name: string; className?: string }) {
  const { ref, seen } = useInView<SVGSVGElement>();
  return (
    <svg
      ref={ref}
      className={`motif ${seen ? 'is-drawn' : ''} ${className ?? ''}`}
      viewBox="0 0 120 120"
      aria-hidden="true"
    >
      {SHAPES[name] ?? SHAPES.grid}
    </svg>
  );
}
