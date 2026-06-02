// components/cockpit/Briefing.tsx
'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { personal } from '@/lib/data';

export default function Briefing() {
  const reduce = useReducedMotion();
  return (
    <section id="hero" data-station="hero" className="briefing-screen">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="briefing-inner"
      >
        <p className="briefing-eyebrow">{'>'} FLIGHT LOG · MISSION INITIATED</p>
        <h1 className="briefing-name">
          {personal.name.split(' ')[0]}<br />
          <span className="text-grad">{personal.name.split(' ').slice(1).join(' ')}</span>
        </h1>
        <p className="briefing-role">{personal.title} · 11 YEARS IN ORBIT</p>
        <p className="briefing-tagline">
          You&apos;re aboard the flight deck. Ahead lies a tour of the systems I&apos;ve built —
          across fintech, healthcare, retail &amp; AI. Engage thrusters to begin.
        </p>
        <div className="briefing-cue" aria-hidden="true">
          <span>SCROLL TO ENGAGE</span>
          <motion.span
            className="briefing-cue-bar"
            animate={reduce ? {} : { scaleY: [0.3, 1, 0.3], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
