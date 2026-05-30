// components/ui/ThreadLines.tsx
'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

const PATHS = [
  'M0,40 C200,10 400,90 600,50 S1000,10 1200,60',
  'M0,90 C250,60 500,120 750,80 S1100,50 1200,100',
];

// NOTE: the target element below is rendered UNCONDITIONALLY so the useScroll
// target ref always points to a mounted node (avoids motion's "Target ref is
// defined but not hydrated" error). Hydration safety is handled at the import
// site in Hero, where this component is loaded via next/dynamic({ ssr:false }).
export default function ThreadLines({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  // Draw 0→1 across the element's scroll span.
  const drawn = useTransform(scrollYProgress, [0, 0.6], [0, 1]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}
    >
      <svg width="100%" height="100%" viewBox="0 0 1200 140" preserveAspectRatio="none" fill="none">
        {PATHS.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            stroke="var(--accent)"
            strokeWidth={1.4}
            strokeOpacity={0.5}
            style={{ pathLength: reduce ? 1 : drawn }}
          />
        ))}
      </svg>
    </div>
  );
}
