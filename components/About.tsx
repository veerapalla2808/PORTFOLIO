// components/About.tsx
'use client';
import { motion } from 'framer-motion';
import SectionTransition, { fadeUpVariant } from './ui/SectionTransition';

const HIGHLIGHTS = [
  {
    title: 'Architectural Depth',
    desc: 'Microservices, distributed systems, and event-driven architecture at enterprise scale.',
    color: 'var(--accent)',
  },
  {
    title: 'Product Mindset',
    desc: 'Ships end-to-end — system design, API layer, infra, observability, and developer tooling.',
    color: 'var(--accent-2)',
  },
  {
    title: 'Team Leadership',
    desc: 'Led cross-functional teams, mentored engineers, and drove cross-org technical alignment.',
    color: 'var(--accent)',
  },
];

const STATS = [
  { value: '11+', label: 'Years Experience' },
  { value: '40+', label: 'Projects Shipped' },
  { value: '5',   label: 'Companies' },
  { value: '2',   label: 'Certifications' },
];

export default function About() {
  return (
    <section id="about" className="section-bg-secondary">
      <div className="container-wide">
        <SectionTransition
          eyebrow="ABOUT"
          title={<>Engineering With <span className="text-grad">Purpose</span></>}
        >
          {/* Two-column: bio + highlights */}
          <div style={{ display: 'grid', gap: '2rem' }}
               className="r-grid-bio">

            {/* Bio */}
            <motion.div variants={fadeUpVariant} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '1.05rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.75 }}>
                I&apos;m a Senior Software Engineer with 11+ years building systems
                that run at enterprise scale — from financial platforms processing millions of transactions daily
                to HIPAA-compliant healthcare applications serving thousands of clinical staff.
              </p>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                My work sits at the intersection of system design, cloud infrastructure, and applied AI.
                I don&apos;t just build features — I build the platforms other engineers build features on.
                Whether it&apos;s RAG pipelines on AWS Bedrock, event-driven microservices on Kafka,
                or FHIR-compliant API layers, I bring the same level of rigour to the architecture as to the code.
              </p>
            </motion.div>

            {/* Highlight cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {HIGHLIGHTS.map(h => (
                <motion.div
                  key={h.title}
                  variants={fadeUpVariant}
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderLeft: `3px solid ${h.color}`,
                    borderRadius: 10,
                    padding: '0.85rem 1rem',
                    boxShadow: 'var(--shadow)',
                    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                  }}
                  whileHover={{ y: -2, boxShadow: 'var(--shadow-hover)' }}
                >
                  <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{h.title}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{h.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <motion.div
            variants={fadeUpVariant}
            className="r-grid-stats"
            style={{
              display: 'grid',
              gap: '1rem',
              marginTop: '2.5rem',
            }}
          >
            {STATS.map(s => (
              <div
                key={s.label}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-accent)',
                  borderRadius: 12,
                  padding: '1.25rem 1rem',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow)',
                }}
              >
                <div style={{
                  fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '0.3rem' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </SectionTransition>
      </div>
    </section>
  );
}
