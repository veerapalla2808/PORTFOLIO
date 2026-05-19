// components/Hero.tsx
'use client';
import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import MagneticButton from './ui/MagneticButton';
import { personal } from '@/lib/data';

const STATS = [
  { value: 11, suffix: '+', label: 'Yrs Exp' },
  { value: 40, suffix: '+', label: 'Projects' },
  { value: 5,  suffix: '',  label: 'Companies' },
  { value: 2,  suffix: '',  label: 'Certs' },
];

function useCountUp(target: number, inView: boolean, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { setCount(target); return; }
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);
  return count;
}

function StatItem({ value, suffix, label, inView }: typeof STATS[0] & { inView: boolean }) {
  const count = useCountUp(value, inView, 1500);
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: 'clamp(1.5rem, 4vw, 2rem)',
        fontWeight: 900,
        background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        lineHeight: 1,
      }}>
        {count}{suffix}
      </div>
      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '0.25rem' }}>
        {label}
      </div>
    </div>
  );
}

const HERO_VARIANTS = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const ITEM_VARIANT = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] as const } },
};

export default function Hero() {
  const ref         = useRef<HTMLElement>(null);
  const glowRef     = useRef<HTMLDivElement>(null);
  const [statsInView, setStatsInView] = useState(false);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const glowY    = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0px', '-60px']);
  const opacity  = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    const timer = setTimeout(() => setStatsInView(true), 700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="hero"
      ref={ref}
      className="section-bg-primary"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Parallax background glow */}
      <motion.div
        ref={glowRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: 'clamp(300px, 50vw, 600px)',
          height: 'clamp(300px, 50vw, 600px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 20%, transparent) 0%, transparent 70%)',
          pointerEvents: 'none',
          y: glowY,
        }}
      />

      {/* Subtle grid overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      />

      {/* Hero content */}
      <motion.div
        className="container-wide"
        style={{ y: contentY, opacity, position: 'relative', zIndex: 1 }}
      >
        <motion.div
          variants={HERO_VARIANTS}
          initial="hidden"
          animate="visible"
          style={{ maxWidth: 800 }}
        >
          {/* Availability badge */}
          <motion.div variants={ITEM_VARIANT} style={{ marginBottom: '1.25rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--accent-lite)',
              border: '1px solid var(--border-accent)',
              color: 'var(--accent-text)',
              padding: '0.3rem 0.9rem',
              borderRadius: 999,
              fontSize: '0.75rem',
              fontWeight: 600,
            }}>
              <motion.span
                style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }}
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              Available for opportunities
            </span>
          </motion.div>

          {/* Eyebrow */}
          <motion.p variants={ITEM_VARIANT} className="section-eyebrow">
            // Senior Software Engineer · 11 Years
          </motion.p>

          {/* Display title */}
          <motion.h1
            variants={ITEM_VARIANT}
            style={{
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              fontWeight: 900,
              lineHeight: 0.92,
              letterSpacing: '-0.05em',
              color: 'var(--text-primary)',
              marginBottom: '1.25rem',
            }}
          >
            I build systems
            <br />
            <span style={{
              color: 'transparent',
              WebkitTextStroke: '2px var(--text-muted)',
            }}>
              that handle
            </span>
            <br />
            <span className="text-grad">millions.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={ITEM_VARIANT}
            style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.75,
              maxWidth: 520,
              marginBottom: '2rem',
            }}
          >
            Fintech · Healthcare · Retail · AI — across{' '}
            <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>5 companies</strong>,{' '}
            <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>40+ projects</strong>, and{' '}
            <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>11+ years</strong> of production-grade software.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={ITEM_VARIANT} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <MagneticButton href="#projects" className="btn-primary">
              See My Work
            </MagneticButton>
            <MagneticButton href={personal.resumeUrl} className="btn-secondary">
              Resume ↓
            </MagneticButton>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            variants={ITEM_VARIANT}
            style={{
              display: 'flex',
              gap: '2rem',
              flexWrap: 'wrap',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border)',
            }}
          >
            {STATS.map(stat => (
              <StatItem key={stat.label} {...stat} inView={statsInView} />
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          translateX: '-50%',
        }}
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      >
        <div style={{
          width: 24,
          height: 36,
          border: '2px solid var(--border-accent)',
          borderRadius: 12,
          display: 'flex',
          justifyContent: 'center',
          paddingTop: 4,
        }}>
          <motion.div
            style={{ width: 4, height: 8, background: 'var(--accent)', borderRadius: 2 }}
            animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </div>
      </motion.div>
    </section>
  );
}
