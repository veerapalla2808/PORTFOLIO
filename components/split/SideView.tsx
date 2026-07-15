'use client';
// One discipline, full page — edge-to-edge like a product site.
// Sections are sticky-split: the heading pins to the left while the content
// scrolls on the right. Headings type out on scroll; cards rise from the
// bottom; accents parallax. Light for front-end, dark for back-end.
import { useEffect } from 'react';
import {
  personal, splitWork, skillCategories, sideConfig, note, notesBySide, now,
  education, marginNotes, highlights, principles,
} from '@/lib/data';
import Metrics from './Metrics';
import ContactForm from './ContactForm';
import { Typed, Icon, useParallax, CATEGORY_ICON } from './ui';
import { Motif } from './motifs';

function Mark() {
  return (
    <span className="mark" aria-label="Veera Palla">
      <span>V</span><span className="mark-seam" aria-hidden="true" /><span>P</span>
    </span>
  );
}

function Pipeline() {
  const nodes = ['client', 'gateway', 'service', 'db'];
  return (
    <div className="pipe" aria-hidden="true">
      <div className="pipe-wire"><span className="pipe-dot" /></div>
      <div className="pipe-nodes">
        {nodes.map(n => <span key={n} className="pipe-node">{n}</span>)}
      </div>
    </div>
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
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
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
  useParallax(side);
  const cfg = sideConfig[side];
  const other = side === 'front' ? sideConfig.back : sideConfig.front;
  const cats = cfg.categories
    .map(label => skillCategories.find(c => c.label === label))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="side">
      <header className="bar">
        <button className="bar-home" onClick={onHome} aria-label="Back to the chooser">
          <Mark />
        </button>
        <span className="bar-here">
          <Icon name={side === 'front' ? 'palette' : 'terminal'} /> {cfg.label} · {cfg.kicker}
        </span>
        <button className="bar-switch" onClick={onSwitch}>
          Switch to {other.label} <Icon name={side === 'front' ? 'dark_mode' : 'light_mode'} />
        </button>
      </header>

      {/* hero — full-bleed, hard left */}
      <section className="fhero">
        <p className="fhero-kicker">
          <Icon name={side === 'front' ? 'palette' : 'terminal'} />
          {cfg.label.toUpperCase()} — {cfg.kicker.toUpperCase()}
        </p>
        <Typed as="h1" className="fhero-title" text={cfg.title} speed={34} />
        <p className="fhero-blurb rv">{cfg.blurb}</p>
        <div className="fhero-cta rv">
          <a className="btn btn--solid" href={`mailto:${personal.email}`}><Icon name="mail" /> Email me</a>
          <a className="btn btn--ghost" href={personal.resumeUrl} download><Icon name="download" /> Resume</a>
          <button className="btn btn--ghost" onClick={onSwitch}>See the {other.label.toLowerCase()} <Icon name="arrow_forward" /></button>
        </div>
        <span className="scroll-cue" aria-hidden="true"><Icon name="keyboard_arrow_down" /> SCROLL</span>
      </section>

      {/* metrics — full-bleed strip */}
      <section className="fstrip">
        <Metrics side={side} />
      </section>

      {/* 01 — work (sticky split) */}
      <section className="fsec" id="work">
        <aside className="fsec-head">
          <span className="fsec-eyebrow"><em>01</em> The Work</span>
          <Typed as="h2" className="fsec-title" text={side === 'front' ? 'What people saw.' : 'What had to hold.'} />
          <p className="fsec-note rv">
            {side === 'front'
              ? 'Every role, told from the interface I shipped to the people using it.'
              : 'Every role, told from the system that kept the promise under load.'}
          </p>
          <span className="fsec-motif" data-parallax="0.06" aria-hidden="true">
            <Motif name={side === 'front' ? 'browser' : 'server'} />
          </span>
        </aside>
        <div className="fsec-body">
          {splitWork.map(w => (
            <article key={w.company} className={`role role--${side} rv ${w.current ? 'role--current' : ''}`}>
              {side === 'front' && <span className="role-shimmer" aria-hidden="true" />}
              <div className="role-head">
                <h3>{w.company}</h3>
                <span className="role-role">{w.role}</span>
                <span className="role-meta">{w.period} · {w.location}</span>
                {w.current && <span className="role-now"><Icon name="bolt" /> CURRENT</span>}
              </div>
              <p className="role-headline">{w.headline}</p>
              {side === 'back' && <Pipeline />}
              <ul className="role-list">
                {(side === 'front' ? w.front : w.back).map(b => <li key={b.slice(0, 24)}>{b}</li>)}
              </ul>
              {marginNotes[w.company] && (
                <p className="role-note"><Icon name="edit_note" /> {marginNotes[w.company]}</p>
              )}
              <div className="role-tech">
                {w.tech.map(t => <span key={t} className="chip">{t}</span>)}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 02 — signature wins (recruiter impact) */}
      <section className="fsec" id="wins">
        <aside className="fsec-head">
          <span className="fsec-eyebrow"><em>02</em> Signature Wins</span>
          <Typed as="h2" className="fsec-title" text="Proof, not adjectives." />
          <p className="fsec-note rv">The outcomes a recruiter can verify — measured, shipped, and still running in production.</p>
          <span className="fsec-motif" data-parallax="0.06" aria-hidden="true"><Motif name="chart" /></span>
        </aside>
        <div className="fsec-body wins">
          {highlights.map((h, i) => (
            <article key={h.title} className="win rv" style={{ transitionDelay: `${i * 0.05}s` }}>
              <span className="win-ico"><Icon name={h.icon} /></span>
              <span className="win-stat">{h.stat}</span>
              <h3>{h.title}</h3>
              <p>{h.detail}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 03 — stack (sticky split) */}
      <section className="fsec" id="stack">
        <aside className="fsec-head">
          <span className="fsec-eyebrow"><em>03</em> The Stack</span>
          <Typed as="h2" className="fsec-title" text={side === 'front' ? 'For the interface.' : 'For the load.'} />
          <p className="fsec-note rv">
            {side === 'front'
              ? 'The tools I reach for when the pixels have to feel instant.'
              : 'The tools I reach for when the traffic doesn’t stop.'}
          </p>
          <span className="fsec-motif" data-parallax="0.06" aria-hidden="true"><Motif name="grid" /></span>
        </aside>
        <div className="fsec-body stack">
          {cats.map(c => (
            <div key={c.label} className="stack-card rv">
              <div className="stack-card-top">
                <span className="stack-ico"><Icon name={CATEGORY_ICON[c.label] ?? 'code'} /></span>
                <h3>{c.label}</h3>
                <em>{String(c.skills.length).padStart(2, '0')}</em>
              </div>
              <div className="stack-chips">{c.skills.map(s => <span key={s} className="chip">{s}</span>)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 04 — how I work */}
      <section className="fsec" id="principles">
        <aside className="fsec-head">
          <span className="fsec-eyebrow"><em>04</em> How I Work</span>
          <Typed as="h2" className="fsec-title" text={side === 'front' ? 'Craft, on purpose.' : 'Discipline, on purpose.'} />
          <p className="fsec-note rv">Four habits I bring to every team — the reasons the work above held up.</p>
          <span className="fsec-motif" data-parallax="0.06" aria-hidden="true"><Motif name="compass" /></span>
        </aside>
        <div className="fsec-body principles">
          {principles.map((p, i) => (
            <article key={p.title} className="principle rv" style={{ transitionDelay: `${i * 0.05}s` }}>
              <span className="principle-ico"><Icon name={p.icon} /></span>
              <div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 05 — about (sticky split, personalized per side) */}
      <section className="fsec" id="about">
        <aside className="fsec-head">
          <span className="fsec-eyebrow"><em>05</em> In My Own Words</span>
          <Typed as="h2" className="fsec-title" text={notesBySide[side].heading + '.'} />
          <span className="fsec-motif" data-parallax="0.06" aria-hidden="true"><Motif name="signature" /></span>
        </aside>
        <div className="fsec-body about">
          <div className="about-body rv">
            {notesBySide[side].paragraphs.map(p => <p key={p.slice(0, 24)}>{p}</p>)}
            <p className="about-sign">{notesBySide[side].signoff} <b>Veera</b></p>
          </div>
          <aside className="about-facts rv">
            <h3><Icon name="info" /> SMALL PRINT</h3>
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

      {/* contact — full-bleed */}
      <section className="fcontact" id="contact">
        <div className="fcontact-grid">
          <div className="contact-intro rv">
            <span className="fsec-eyebrow"><em>06</em> Contact</span>
            <Typed
              as="h2"
              className="fcontact-title"
              text={side === 'front' ? 'Like the interface?' : 'Like the system?'}
            />
            <p className="fcontact-sub">
              {side === 'front' ? 'There’s a whole system behind it.' : 'There’s a whole interface on top.'}
              {' '}Send a note — I reply fast.
            </p>
            <div className="contact-links">
              <a className="clink" href={`mailto:${personal.email}`}><Icon name="mail" /> {personal.email}</a>
              <a className="clink" href={personal.linkedin} target="_blank" rel="noopener noreferrer"><Icon name="link" /> LinkedIn</a>
              <a className="clink" href={personal.resumeUrl} download><Icon name="description" /> Resume</a>
              <a className="clink" href={`tel:${personal.phone.replace(/-/g, '')}`}><Icon name="call" /> {personal.phone}</a>
            </div>
            <button className="btn btn--ghost contact-swap" onClick={onSwitch}>
              Walk the {other.label.toLowerCase()} <Icon name="arrow_forward" />
            </button>
          </div>
          <div className="contact-form-wrap rv">
            <ContactForm />
          </div>
        </div>
        <footer className="side-foot">
          <span className="foot-mark"><Mark /> © 2026 {personal.name}</span>
          <span>Hand-built with Next.js · two themes, one engineer</span>
        </footer>
      </section>
    </div>
  );
}
