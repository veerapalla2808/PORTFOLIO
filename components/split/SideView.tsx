'use client';
// One discipline, full page. Light for front-end, dark for back-end.
// The hero sits over the particle field; sections below use a solid themed
// surface. A persistent bar lets you swap sides or return to the chooser.
import { useEffect } from 'react';
import {
  personal, splitWork, skillCategories, sideConfig, note, now,
  education, marginNotes,
} from '@/lib/data';

function Mark() {
  return (
    <span className="mark" aria-label="Veera Palla">
      <span>V</span><span className="mark-seam" aria-hidden="true" /><span>P</span>
    </span>
  );
}

function useReveals(dep: string) {
  useEffect(() => {
    const els = document.querySelectorAll('.rv');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(el => el.classList.add('is-in'));
      return;
    }
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); obs.unobserve(e.target); }
      }),
      { threshold: 0.14 },
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [dep]);
}

export default function SideView({
  side, onSwitch, onHome,
}: {
  side: 'front' | 'back';
  onSwitch: () => void;
  onHome: () => void;
}) {
  useReveals(side);
  const cfg = sideConfig[side];
  const other = side === 'front' ? sideConfig.back : sideConfig.front;
  const cats = cfg.categories
    .map(label => skillCategories.find(c => c.label === label))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="side">
      {/* persistent bar */}
      <header className="bar">
        <button className="bar-home" onClick={onHome} aria-label="Back to the chooser">
          <Mark />
        </button>
        <span className="bar-here">{cfg.label} · {cfg.kicker}</span>
        <button className="bar-switch" onClick={onSwitch}>
          Switch to {other.label} <span aria-hidden="true">{side === 'front' ? '→ dark' : '→ light'}</span>
        </button>
      </header>

      {/* hero over the particle field */}
      <section className="side-hero">
        <p className="side-kicker">{cfg.label.toUpperCase()} — {cfg.kicker.toUpperCase()}</p>
        <h1 className="side-title">{cfg.title}</h1>
        <p className="side-blurb">{cfg.blurb}</p>
        <div className="side-cta">
          <a className="btn btn--solid" href={`mailto:${personal.email}`}>Email me</a>
          <a className="btn btn--ghost" href={personal.resumeUrl} download>Resume</a>
          <button className="btn btn--ghost" onClick={onSwitch}>See the {other.label.toLowerCase()} →</button>
        </div>
        <span className="scroll-cue">SCROLL <span aria-hidden="true">▾</span></span>
      </section>

      {/* work — this side's story per role */}
      <section className="side-sec" id="work">
        <header className="side-head rv">
          <span className="side-eyebrow">01 — THE WORK</span>
          <h2>{side === 'front' ? 'What each role looked like to the people using it.' : 'What each role had to survive under the hood.'}</h2>
        </header>
        <div className="roles">
          {splitWork.map((w, i) => (
            <article key={w.company} className={`role rv ${w.current ? 'role--current' : ''}`} style={{ transitionDelay: `${i * 0.05}s` }}>
              <div className="role-head">
                <h3>{w.company}</h3>
                <span className="role-role">{w.role}</span>
                <span className="role-meta">{w.period} · {w.location}</span>
                {w.current && <span className="role-now">CURRENT</span>}
              </div>
              <p className="role-headline">{w.headline}</p>
              <ul className="role-list">
                {(side === 'front' ? w.front : w.back).map(b => <li key={b.slice(0, 24)}>{b}</li>)}
              </ul>
              {marginNotes[w.company] && (
                <p className="role-note">— {marginNotes[w.company]}</p>
              )}
              <div className="role-tech">
                {w.tech.map(t => <span key={t} className="chip">{t}</span>)}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* stack — this side's tools */}
      <section className="side-sec" id="stack">
        <header className="side-head rv">
          <span className="side-eyebrow">02 — THE STACK</span>
          <h2>{side === 'front' ? 'What I reach for on the interface.' : 'What I reach for under load.'}</h2>
        </header>
        <div className="stack">
          {cats.map((c, i) => (
            <div key={c.label} className="stack-card rv" style={{ transitionDelay: `${i * 0.04}s` }}>
              <h3>{c.label}</h3>
              <div className="stack-chips">{c.skills.map(s => <span key={s} className="chip">{s}</span>)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* a note from me */}
      <section className="side-sec" id="about">
        <header className="side-head rv">
          <span className="side-eyebrow">03 — IN MY OWN WORDS</span>
          <h2>{note.heading}</h2>
        </header>
        <div className="about">
          <div className="about-body rv">
            {note.paragraphs.map(p => <p key={p.slice(0, 24)}>{p}</p>)}
            <p className="about-sign">{note.signoff} <b>Veera</b></p>
          </div>
          <aside className="about-facts rv">
            <h3>SMALL PRINT</h3>
            {note.facts.map(f => (
              <div key={f.k} className="fact"><b>{f.k}</b><span>{f.v}</span></div>
            ))}
            <div className="about-now">
              <p><b>Now</b> {now.line}</p>
              <p><b>Learning</b> {now.learning}</p>
            </div>
            <div className="fact fact--edu">
              <b>Education</b>
              <span>{education.degree}, {education.field} — {education.institution} ({education.period})</span>
            </div>
          </aside>
        </div>
      </section>

      {/* contact */}
      <section className="side-sec side-contact" id="contact">
        <div className="rv">
          <span className="side-eyebrow">04 — CONTACT</span>
          <h2>{side === 'front' ? 'Like the interface? There’s a system behind it.' : 'Like the system? There’s an interface on top.'}</h2>
          <p className="side-blurb">
            React-heavy, Java-heavy, or the messy middle — I’m at home on either
            side of this page. Email reaches me fastest.
          </p>
          <div className="contact-ctas">
            <a className="btn btn--solid" href={`mailto:${personal.email}`}>{personal.email}</a>
            <a className="btn btn--ghost" href={personal.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
            <a className="btn btn--ghost" href={personal.resumeUrl} download>Resume ↓</a>
            <a className="btn btn--ghost" href={`tel:${personal.phone.replace(/-/g, '')}`}>{personal.phone}</a>
            <button className="btn btn--ghost" onClick={onSwitch}>Walk the {other.label.toLowerCase()} →</button>
          </div>
          <footer className="side-foot">
            <span className="foot-mark"><Mark /> © 2026 {personal.name}</span>
            <span>Hand-built with Next.js · two themes, one engineer</span>
          </footer>
        </div>
      </section>
    </div>
  );
}
