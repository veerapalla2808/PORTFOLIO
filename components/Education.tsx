'use client';
import { GraduationCap, Award } from 'lucide-react';
import SectionTransition, { fadeUpVariant } from './ui/SectionTransition';
import { motion } from 'framer-motion';
import { education, certifications } from '@/lib/data';

export default function Education() {
  return (
    <section id="education" className="section-bg-secondary">
      <div className="container-wide">
        <SectionTransition
          eyebrow="EDUCATION"
          title={<>Academic <span className="text-grad">Foundation</span></>}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}
               className="grid-cols-1 md:grid-cols-2">

            {/* Degree card */}
            <motion.div
              variants={fadeUpVariant}
              className="card-base"
              style={{ padding: '1.75rem' }}
              whileHover={{ y: -3, boxShadow: 'var(--shadow-hover)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{
                  width: 44, height: 44,
                  borderRadius: 10,
                  background: 'var(--accent-lite)',
                  border: '1px solid var(--border-accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent)',
                  flexShrink: 0,
                }}>
                  <GraduationCap size={20} />
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', fontWeight: 600 }}>
                  DEGREE
                </span>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                {education.degree}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600, marginBottom: '0.25rem' }}>
                {education.field}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>
                {education.institution}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {education.location} · {education.year}
              </p>
            </motion.div>

            {/* Certifications */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {certifications.map(cert => (
                <motion.div
                  key={cert.title}
                  variants={fadeUpVariant}
                  className="card-base"
                  style={{ padding: '1.25rem' }}
                  whileHover={{ y: -3, boxShadow: 'var(--shadow-hover)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{
                      width: 36, height: 36,
                      borderRadius: 8,
                      background: 'var(--accent-lite-2)',
                      border: '1px solid var(--border-accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--accent-2)',
                      flexShrink: 0,
                    }}>
                      <Award size={16} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                        {cert.title}
                      </p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        {cert.issuer}
                      </p>
                    </div>
                    {'badge' in cert && cert.badge && (
                      <span style={{
                        marginLeft: 'auto',
                        background: 'var(--accent-lite)',
                        border: '1px solid var(--border-accent)',
                        color: 'var(--accent-text)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 4,
                        fontSize: '0.6rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        flexShrink: 0,
                      }}>
                        {cert.badge}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </SectionTransition>
      </div>
    </section>
  );
}
