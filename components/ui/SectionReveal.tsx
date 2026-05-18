'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export type RevealVariant =
  | 'fold'         // About      – rises + unfolds clip-path from below
  | 'sweep-left'   // Skills     – sweeps in from the left
  | 'curtain'      // Experience – drops in via clip-path from top
  | 'zoom'         // Projects   – scales from 0.86 with spring overshoot
  | 'sweep-right'  // Education  – sweeps in from the right
  | 'blur-in';     // Contact    – sharpens from 14px blur (focus-pull)

// Bezier curves – typed as const tuple so Framer Motion's strict Easing type accepts them
const E_SPRING  = [0.16, 1,    0.3,  1] as const;
const E_SWEEP   = [0.22, 1,    0.36, 1] as const;
const E_ZOOM    = [0.34, 1.08, 0.64, 1] as const;  // slight overshoot on scale

type Hidden  = Parameters<typeof motion.div>[0]['initial'];
type Visible = Parameters<typeof motion.div>[0]['animate'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HIDDEN: Record<RevealVariant, any> = {
  'fold':        { opacity: 0, y: 80,  clipPath: 'inset(0 0 120% 0)' },
  'sweep-left':  { opacity: 0, x: -120 },
  'curtain':     { opacity: 0, clipPath: 'inset(100% 0 0 0)' },
  'zoom':        { opacity: 0, scale: 0.86, y: 50 },
  'sweep-right': { opacity: 0, x: 120 },
  'blur-in':     { opacity: 0, filter: 'blur(14px)', scale: 0.98 },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const VISIBLE: Record<RevealVariant, any> = {
  'fold':        { opacity: 1, y: 0,  clipPath: 'inset(0 0 0% 0)' },
  'sweep-left':  { opacity: 1, x: 0 },
  'curtain':     { opacity: 1, clipPath: 'inset(0% 0 0 0)' },
  'zoom':        { opacity: 1, scale: 1, y: 0 },
  'sweep-right': { opacity: 1, x: 0 },
  'blur-in':     { opacity: 1, filter: 'blur(0px)', scale: 1 },
};

const TRANSITION: Record<RevealVariant, { duration: number; ease: readonly [number, number, number, number] }> = {
  'fold':        { duration: 1.05, ease: E_SPRING },
  'sweep-left':  { duration: 0.90, ease: E_SWEEP  },
  'curtain':     { duration: 1.10, ease: E_SPRING },
  'zoom':        { duration: 1.00, ease: E_ZOOM   },
  'sweep-right': { duration: 0.90, ease: E_SWEEP  },
  'blur-in':     { duration: 1.05, ease: E_SWEEP  },
};

export default function SectionReveal({
  children,
  variant = 'fold',
  delay = 0,
}: {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Triggers when the section is 80 px below the viewport bottom — animation is
  // already running by the time the user sees the leading edge of the section.
  const inView = useInView(ref, { once: true, margin: '0px 0px 80px 0px' });

  return (
    <motion.div
      ref={ref}
      initial={HIDDEN[variant] as Hidden}
      animate={(inView ? VISIBLE[variant] : HIDDEN[variant]) as Visible}
      transition={{ ...TRANSITION[variant], delay }}
    >
      {children}
    </motion.div>
  );
}
