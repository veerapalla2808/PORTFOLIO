'use client';
import { useState, useId } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Skill } from '@/lib/data';

interface SkillTooltipProps {
  skill: Skill;
  variant?: 'primary' | 'secondary';
}

const levelColor: Record<Skill['level'], string> = {
  Expert:     'var(--accent)',
  Proficient: 'var(--accent-2)',
  Familiar:   'var(--text-muted)',
};

export default function SkillTooltip({ skill, variant = 'primary' }: SkillTooltipProps) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  const pillClass = variant === 'primary' ? 'skill-pill' : 'skill-pill skill-pill-2';

  return (
    <span
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      aria-describedby={visible ? id : undefined}
    >
      <span className={pillClass} tabIndex={0} style={{ cursor: 'default' }}>
        {skill.name}
      </span>

      <AnimatePresence>
        {visible && (
          <motion.div
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-accent)',
              borderRadius: 8,
              padding: '0.4rem 0.75rem',
              boxShadow: 'var(--shadow-hover)',
              whiteSpace: 'nowrap',
              zIndex: 50,
              pointerEvents: 'none',
            }}
          >
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {skill.name}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', margin: '0 0.35rem' }}>
              ·
            </span>
            <span style={{ fontSize: '0.65rem', color: levelColor[skill.level], fontWeight: 600 }}>
              {skill.level}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>
              {skill.years}yr{skill.years !== 1 ? 's' : ''}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
