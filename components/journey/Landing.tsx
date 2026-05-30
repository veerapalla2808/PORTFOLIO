// components/journey/Landing.tsx
'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { personal } from '@/lib/data';

export default function Landing() {
  const reduce = useReducedMotion();
  return (
    <section id="hero" data-station="hero" className="landing-screen">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="landing-inner"
      >
        <p className="landing-eyebrow">{'//'} SENIOR SOFTWARE ENGINEER · 11 YEARS</p>
        <h1 className="landing-name">
          {personal.name.split(' ')[0]}{' '}
          <span className="text-grad">{personal.name.split(' ').slice(1).join(' ')}</span>
        </h1>
        <p className="landing-tagline">
          Let&apos;s explore the journey — eleven years of systems,
          across <span className="text-grad">fintech, health, retail &amp; AI</span>.
        </p>
        <div className="landing-cue" aria-hidden="true">
          <span>SCROLL TO LAUNCH</span>
          <motion.span
            className="landing-cue-line"
            animate={reduce ? {} : { scaleY: [0.3, 1, 0.3], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
