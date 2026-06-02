'use client';
import { personal, skillCategories, experiences, projects } from '@/lib/data';

// The quiet, conventional view for recruiters who just want the facts.
export default function ClassicView() {
  return (
    <div className="cv">
      <header className="cv-header">
        <h1>{personal.name}</h1>
        <p className="cv-title">{personal.title}</p>
        <p className="cv-tagline">{personal.tagline}</p>
        <div className="cv-contact">
          <a href={`mailto:${personal.email}`}>{personal.email}</a>
          <span>{personal.phone}</span>
          <span>{personal.location}</span>
          <a href={personal.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href={personal.resumeUrl} target="_blank" rel="noopener noreferrer">Résumé ↓</a>
        </div>
      </header>

      <section className="cv-sec">
        <h2>Skills</h2>
        <div className="cv-skills">
          {skillCategories.map((c) => (
            <div key={c.label}>
              <h3>{c.label}</h3>
              <p>{c.skills.map((s) => s.name).join(' · ')}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cv-sec">
        <h2>Experience</h2>
        {experiences.map((e) => (
          <div key={e.company} className="cv-exp">
            <div className="cv-exp-head">
              <h3>{e.role} — {e.company}</h3>
              <span>{e.period} · {e.location}</span>
            </div>
            <ul>{e.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
          </div>
        ))}
      </section>

      <section className="cv-sec">
        <h2>Projects</h2>
        {projects.map((p) => (
          <div key={p.name} className="cv-proj">
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <ul>{p.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
            <p className="cv-tech">{p.tech.join(' · ')}</p>
          </div>
        ))}
      </section>

      <footer className="cv-foot">
        <a href={`mailto:${personal.email}`}>{personal.email}</a> · © 2026 {personal.name}
      </footer>
    </div>
  );
}
