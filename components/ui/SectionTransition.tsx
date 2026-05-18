'use client';
import { useRef } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';

interface SectionTransitionProps {
  number: string;
  eyebrow: string;
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function SectionTransition({
  number,
  eyebrow,
  title,
  children,
  className = '',
}: SectionTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-20% 0px' });

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Beat 1 — Ghost number wipe (clip-path) */}
      <motion.div
        aria-hidden="true"
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        animate={inView ? { clipPath: 'inset(0 0% 0 0)' } : {}}
        transition={{ duration: 0.6, ease: [0.77, 0, 0.18, 1] }}
        style={{
          position: 'absolute',
          top: '-1rem',
          right: '0',
          fontSize: 'clamp(5rem, 12vw, 10rem)',
          fontWeight: 900,
          lineHeight: 1,
          color: 'var(--accent-lite)',
          letterSpacing: '-0.05em',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
        }}
      >
        {number}
      </motion.div>

      {/* Beat 2 — Eyebrow + title zoom-fade */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <p className="section-eyebrow">// {number} {eyebrow}</p>
        <h2 className="section-title">{title}</h2>
      </motion.div>

      {/* Beat 3 — Content stagger */}
      <motion.div
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08, delayChildren: 0.45 } },
        }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] } },
};
