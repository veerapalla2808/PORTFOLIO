'use client';
// The blue pill — wake up in a phosphor terminal and read the full résumé.
// Every line of lib/data.ts, recruiter-fast, still in-world.
import DecodeText from './DecodeText';
import {
  personal, experiences, projects, skillCategories,
  certifications, education, blogPosts,
} from '@/lib/data';

function Cmd({ children }: { children: React.ReactNode }) {
  return <p className="tr-cmd"><span>operator@construct:~$</span> {children}</p>;
}

export default function TerminalResume({ onRed }: { onRed: () => void }) {
  return (
    <div className="tr-root">
      <div className="tr-frame">
        <header className="tr-bar">
          <span className="tr-bar-dot" /> /dev/tty1 — résumé.log
          <button className="tr-reenter" onClick={onRed}>◉ RED PILL ▸ RE-ENTER THE CONSTRUCT</button>
        </header>

        <div className="tr-body">
          <Cmd>whoami</Cmd>
          <h1 className="tr-name"><DecodeText text={personal.name.toUpperCase()} /></h1>
          <p className="tr-title">{personal.title} — {personal.location}</p>
          <p className="tr-tagline">{personal.tagline}</p>
          <p className="tr-contact">
            <a href={`mailto:${personal.email}`}>{personal.email}</a> · {personal.phone} ·{' '}
            <a href={personal.linkedin} target="_blank" rel="noopener noreferrer">linkedin</a> ·{' '}
            <a href={personal.resumeUrl} target="_blank" rel="noopener noreferrer">résumé.pdf ↓</a>
          </p>

          <Cmd>cat skills --all</Cmd>
          {skillCategories.map(c => (
            <div key={c.label} className="tr-skill-row">
              <h3>{c.label}</h3>
              <p>{c.skills.join(' · ')}</p>
            </div>
          ))}

          <Cmd>cat experience --full</Cmd>
          {experiences.map(e => (
            <div key={e.company} className="tr-exp">
              <div className="tr-exp-head">
                <h3>{e.role} — <em>{e.company}</em></h3>
                <span>{e.period} · {e.location}</span>
              </div>
              <ul>{e.bullets.map(b => <li key={b.slice(0, 40)}>{b}</li>)}</ul>
              <p className="tr-env">env: {e.tech.join(', ')}</p>
            </div>
          ))}

          <Cmd>cat anomalies_resolved</Cmd>
          {projects.map(p => (
            <div key={p.name} className="tr-exp">
              <div className="tr-exp-head"><h3>{p.name}</h3></div>
              <p className="tr-tagline">{p.description}</p>
              <ul>{p.highlights.map(h => <li key={h.slice(0, 40)}>{h}</li>)}</ul>
              <p className="tr-env">stack: {p.tech.join(', ')}</p>
            </div>
          ))}

          <Cmd>verify credentials</Cmd>
          <ul className="tr-creds">
            {certifications.map(c => <li key={c.title}>[{c.badge}] {c.title} — {c.issuer} ✓</li>)}
            <li>[B.TECH] {education.degree}, {education.field} — {education.institution}, {education.location} ({education.year}) ✓</li>
          </ul>

          <Cmd>tail -f transmissions</Cmd>
          <ul className="tr-creds">
            {blogPosts.map(b => (
              <li key={b.url}>
                <a href={b.url} target="_blank" rel="noopener noreferrer">{b.title}</a>
                {' '}— {b.date} · {b.readTime}
              </li>
            ))}
          </ul>

          <Cmd>./contact --now</Cmd>
          <p className="tr-cta">
            <a className="tr-cta-red" href={`mailto:${personal.email}`}>▸ TRANSMIT — {personal.email}</a>
          </p>
          <p className="tr-foot">© 2026 {personal.name} — the terminal is yours, operator.<span className="mx-cursor" /></p>
        </div>
      </div>
    </div>
  );
}
