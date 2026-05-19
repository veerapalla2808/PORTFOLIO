// components/Projects.tsx
'use client';
import { motion } from 'framer-motion';
import { GitFork, ExternalLink } from 'lucide-react';
import SectionTransition, { fadeUpVariant } from './ui/SectionTransition';
import TiltCard from './ui/TiltCard';
import { projects } from '@/lib/data';

export default function Projects() {
  return (
    <section id="projects" className="section-bg-primary">
      <div className="container-wide">
        <SectionTransition
          eyebrow="PROJECTS"
          title={<>Things I&apos;ve <span className="text-grad">Built</span></>}
        >
          <div style={{ display: 'grid', gap: '1.5rem' }}
               className="r-grid-2col">
            {projects.map((project, i) => (
              <motion.div key={project.name} variants={fadeUpVariant}>
                <TiltCard>
                  <div
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-accent)',
                      borderRadius: 14,
                      padding: '2rem',
                      position: 'relative',
                      overflow: 'hidden',
                      height: '100%',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    }}
                    className="card-base"
                  >
                    {/* Ghost project number */}
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        top: '-0.5rem',
                        right: '1rem',
                        fontSize: 'clamp(5rem, 10vw, 8rem)',
                        fontWeight: 900,
                        color: 'var(--accent-lite)',
                        lineHeight: 1,
                        pointerEvents: 'none',
                        userSelect: 'none',
                        transition: 'color 0.2s ease',
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>

                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', maxWidth: '75%' }}>
                        {project.name}
                      </h3>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {project.github && (
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${project.name} GitHub`}
                            style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }}
                          >
                            <GitFork size={18} />
                          </a>
                        )}
                        {project.live && (
                          <a
                            href={project.live}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${project.name} live site`}
                            style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }}
                          >
                            <ExternalLink size={18} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
                      {project.description}
                    </p>

                    {/* Highlights */}
                    <ul role="list" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem', listStyle: 'none', position: 'relative', zIndex: 1 }}>
                      {project.highlights.map(h => (
                        <li key={h} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                          <span style={{ color: 'var(--accent)', flexShrink: 0, fontSize: '0.65rem', marginTop: '0.15rem' }}>▸</span>
                          {h}
                        </li>
                      ))}
                    </ul>

                    {/* Tech pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', position: 'relative', zIndex: 1 }}>
                      {project.tech.map((t, j) => (
                        <span key={t} className={j % 2 === 0 ? 'skill-pill' : 'skill-pill skill-pill-2'}>{t}</span>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </SectionTransition>
      </div>
    </section>
  );
}
