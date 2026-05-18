// components/Experience.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionTransition, { fadeUpVariant } from './ui/SectionTransition';
import { experiences } from '@/lib/data';
import { gsap, ScrollTrigger } from '@/lib/gsap';

// Map company → key impact metrics
const METRICS: Record<string, Array<{ value: string; label: string }>> = {
  'Comerica Bank': [
    { value: '2M+',  label: 'Daily Txns' },
    { value: '40%',  label: 'MTTR Reduction' },
    { value: 'AI',   label: 'RAG Assistant' },
    { value: '6',    label: 'Team Size' },
  ],
  'UCLA Health': [
    { value: '50%',  label: 'Query Perf ↑' },
    { value: '90%+', label: 'E2E Coverage' },
    { value: 'HIPAA',label: 'Compliant' },
    { value: '3+',   label: 'Yrs Tenure' },
  ],
  "Dillard's": [
    { value: 'MERN', label: 'Full-Stack' },
    { value: 'Peak', label: 'Traffic Scaled' },
    { value: 'JWT',  label: 'Auth Layer' },
    { value: '3',    label: 'Yrs Tenure' },
  ],
  'KeyBank': [
    { value: 'GraphQL', label: 'APIs Built' },
    { value: 'OWASP',   label: 'Compliant' },
    { value: 'AWS',     label: 'Infra' },
    { value: '2',       label: 'Yrs Tenure' },
  ],
  'Foxconn': [
    { value: 'D3.js', label: 'Dashboards' },
    { value: 'WCAG',  label: 'Accessible' },
    { value: 'UI/UX', label: 'Design Led' },
    { value: '3+',    label: 'Yrs Tenure' },
  ],
};

const YEARS = ['2013', '2016', '2018', '2021', '2024', 'Now'];

export default function Experience() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef  = useRef<HTMLDivElement>(null);

  const handleSelect = (i: number) => {
    setDirection(i > activeIdx ? 1 : -1);
    setActiveIdx(i);
  };

  // Animate timeline bar on scroll
  useEffect(() => {
    if (!fillRef.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set(fillRef.current, { scaleX: 1 });
        return;
      }
      gsap.fromTo(
        fillRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: trackRef.current,
            start: 'top 80%',
            end: 'top 40%',
            scrub: 1,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const exp = experiences[activeIdx];

  return (
    <section id="experience" className="section-bg-secondary">
      <div className="container-wide">
        <SectionTransition
          eyebrow="EXPERIENCE"
          title={
            <>11 years ·{' '}
              <span className="text-grad">5 companies</span>
            </>
          }
        >
          {/* ── Career Timeline ── */}
          <motion.div variants={fadeUpVariant} style={{ marginBottom: '2rem' }}>
            {/* Year labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              {YEARS.map(y => (
                <span key={y} style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {y}
                </span>
              ))}
            </div>

            {/* Progress bar */}
            <div
              ref={trackRef}
              style={{
                position: 'relative',
                height: 4,
                background: 'var(--border)',
                borderRadius: 2,
                marginBottom: '0.85rem',
                overflow: 'hidden',
              }}
            >
              <div
                ref={fillRef}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                  borderRadius: 2,
                  transformOrigin: '0%',
                }}
              />
            </div>

            {/* Company buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {experiences.map((e, i) => (
                <button
                  key={e.company}
                  onClick={() => handleSelect(i)}
                  aria-pressed={i === activeIdx}
                  style={{
                    flex: '1 1 auto',
                    minWidth: 100,
                    padding: '0.6rem 0.85rem',
                    border: i === activeIdx ? '1px solid var(--border-accent)' : '1px solid var(--border)',
                    borderRadius: 8,
                    background: i === activeIdx ? 'var(--accent-lite)' : 'var(--bg-primary)',
                    color: i === activeIdx ? 'var(--accent-text)' : 'var(--text-secondary)',
                    fontWeight: i === activeIdx ? 700 : 500,
                    fontSize: '0.78rem',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 700, color: i === activeIdx ? 'var(--accent-text)' : 'var(--text-primary)', marginBottom: 2 }}>
                    {e.company}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{e.period}</div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── Detail Panel ── */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeIdx}
              custom={direction}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 40 }),
                center: { opacity: 1, x: 0 },
                exit: (d: number) => ({ opacity: 0, x: d * -40 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-accent)',
                borderRadius: 14,
                padding: '1.75rem',
                boxShadow: 'var(--shadow)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{exp.role}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
                    {exp.company.toUpperCase()} · {exp.location}
                  </p>
                </div>
                <span style={{
                  background: 'var(--accent-lite)',
                  border: '1px solid var(--border-accent)',
                  color: 'var(--accent-text)',
                  padding: '0.2rem 0.75rem',
                  borderRadius: 999,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}>
                  {exp.period}
                </span>
              </div>

              {/* Impact metrics */}
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                {(METRICS[exp.company] ?? []).map(m => (
                  <div
                    key={m.label}
                    style={{
                      flex: '1 1 80px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding: '0.6rem 0.75rem',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: 900,
                      background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>
                      {m.value}
                    </div>
                    <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bullets */}
              <ul role="list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem', listStyle: 'none' }}>
                {exp.bullets.map(b => (
                  <li key={b} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                    <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '0.2rem', fontSize: '0.65rem' }}>▸</span>
                    {b}
                  </li>
                ))}
              </ul>

              {/* Tech pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {exp.tech.map((t, i) => (
                  <span key={t} className={i % 2 === 0 ? 'skill-pill' : 'skill-pill skill-pill-2'}>{t}</span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </SectionTransition>
      </div>
    </section>
  );
}
