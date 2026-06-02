'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { personal, skillCategories, experiences, projects } from '@/lib/data';

const TITLES: Record<string, string> = {
  about: 'About', skills: 'Skills', experience: 'Experience', projects: 'Projects', contact: 'Contact',
};

function AboutBody() {
  return (
    <div className="cp-prose">
      <p className="cp-lead">{personal.tagline}</p>
      <p>I&apos;m a senior full-stack engineer with 11+ years shipping production systems across
        fintech, healthcare, retail and AI — from real-time banking assistants to HIPAA-compliant
        platforms. I care about systems that scale and interfaces that feel alive.</p>
      <div className="cp-facts">
        <div><b>11+</b><span>Years</span></div>
        <div><b>5</b><span>Companies</span></div>
        <div><b>40+</b><span>Projects</span></div>
        <div><b>{personal.location}</b><span>Based in</span></div>
      </div>
    </div>
  );
}

function SkillsBody() {
  return (
    <div className="cp-skills">
      {skillCategories.map((c) => (
        <div key={c.label} className="cp-skillcat">
          <h4>{c.label}</h4>
          <div className="cp-pills">
            {c.skills.map((s) => (
              <span key={s.name} className={`cp-pill lv-${s.level.toLowerCase()}`}>{s.name}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExperienceBody() {
  return (
    <div className="cp-exp">
      {experiences.map((e) => (
        <div key={e.company} className="cp-exp-item">
          <div className="cp-exp-head">
            <h4>{e.role} · <span className="cp-accent">{e.company}</span></h4>
            <span className="cp-meta">{e.period} · {e.location}</span>
          </div>
          <ul>{e.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
          <div className="cp-pills">{e.tech.slice(0, 8).map((t) => <span key={t} className="cp-pill">{t}</span>)}</div>
        </div>
      ))}
    </div>
  );
}

function ProjectsBody() {
  return (
    <div className="cp-projects">
      {projects.map((p) => (
        <div key={p.name} className="cp-proj">
          <h4>{p.name}</h4>
          <p>{p.description}</p>
          <ul>{p.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
          <div className="cp-pills">{p.tech.map((t) => <span key={t} className="cp-pill">{t}</span>)}</div>
        </div>
      ))}
    </div>
  );
}

function ContactBody() {
  const links = [
    { label: 'Email', value: personal.email, href: `mailto:${personal.email}` },
    { label: 'Phone', value: personal.phone, href: `tel:${personal.phone}` },
    { label: 'LinkedIn', value: 'in/veera-p', href: personal.linkedin },
    { label: 'Medium', value: '@veera.palla919', href: personal.medium },
    { label: 'Résumé', value: 'Download PDF', href: personal.resumeUrl },
  ];
  return (
    <div className="cp-contact">
      <p className="cp-lead">Open to senior full-stack & AI engineering roles. Let&apos;s build something.</p>
      <ul className="cp-links">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
              <span className="cp-link-k">{l.label}</span>
              <span className="cp-link-v">{l.value}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

const BODIES: Record<string, () => React.ReactElement> = {
  about: AboutBody, skills: SkillsBody, experience: ExperienceBody, projects: ProjectsBody, contact: ContactBody,
};

export default function ClusterPanel({ open, onClose }: { open: string | null; onClose: () => void }) {
  const Body = open ? BODIES[open] : null;
  return (
    <AnimatePresence>
      {open && Body && (
        <motion.div
          className="cp-backdrop"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.section
            className="cp-panel"
            initial={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.96, filter: 'blur(6px)' }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="cp-head">
              <span className="cp-tag">{'//'} {TITLES[open].toUpperCase()}</span>
              <button className="cp-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
            </header>
            <div className="cp-scroll"><Body /></div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
