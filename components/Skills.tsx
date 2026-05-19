// components/Skills.tsx
'use client';
import { motion } from 'framer-motion';
import {
  Monitor, Server, Sparkles, Cloud, Database, TestTube2, Zap, type LucideIcon,
} from 'lucide-react';
import SectionTransition, { fadeUpVariant } from './ui/SectionTransition';
import SkillTooltip from './ui/SkillTooltip';
import { skillCategories } from '@/lib/data';

const ICON_MAP: Record<string, LucideIcon> = {
  Monitor, Server, Sparkles, Cloud, Database, TestTube2, Zap,
};

export default function Skills() {
  return (
    <section id="skills" className="section-bg-primary">
      <div className="container-wide">
        <SectionTransition
          eyebrow="SKILLS"
          title={<>Tools I <span className="text-grad">Master</span></>}
        >
          {/* Bento grid — 4 cols desktop, 2 tablet, 1 mobile */}
          <div
            style={{
              display: 'grid',
              gap: '1rem',
            }}
            className="r-grid-4col"
          >
            {skillCategories.map((cat, i) => {
              const Icon = ICON_MAP[cat.icon] ?? Monitor;
              const isFeatured = cat.label === 'AI & GenAI';

              return (
                <motion.div
                  key={cat.label}
                  variants={fadeUpVariant}
                  className={isFeatured ? 'skills-featured' : ''}
                  style={{
                    background: isFeatured
                      ? 'linear-gradient(135deg, var(--accent-lite), var(--accent-lite-2))'
                      : 'var(--bg-card)',
                    border: '1px solid var(--border-accent)',
                    borderRadius: 12,
                    padding: '1.25rem',
                    boxShadow: 'var(--shadow)',
                    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                  }}
                  whileHover={{ y: -3, boxShadow: 'var(--shadow-hover)' }}
                >
                  {/* Category header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.9rem' }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: 'var(--accent-lite)',
                        border: '1px solid var(--border-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent)',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: 'var(--accent)',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {cat.label}
                    </span>
                    {isFeatured && (
                      <span
                        style={{
                          marginLeft: 'auto',
                          fontSize: '0.6rem',
                          background: 'var(--accent-lite)',
                          border: '1px solid var(--border-accent)',
                          color: 'var(--accent-text)',
                          padding: '0.1rem 0.5rem',
                          borderRadius: 999,
                          fontWeight: 700,
                        }}
                      >
                        ✦ Featured
                      </span>
                    )}
                  </div>

                  {/* Pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {cat.skills.map((skill, j) => (
                      <SkillTooltip
                        key={skill.name}
                        skill={skill}
                        variant={j % 2 === 0 ? 'primary' : 'secondary'}
                      />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </SectionTransition>
      </div>
    </section>
  );
}
