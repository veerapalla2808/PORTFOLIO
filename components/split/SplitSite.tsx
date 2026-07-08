'use client';
// THE SPLIT STACK — the full site.
// The hero's seam is the thesis; every section below keeps the two-sided
// language: work as dual ledgers, skills sorted by side, a shared spine
// for everything that crosses it.
import { useEffect } from 'react';
import SplitHero from './SplitHero';
import {
  personal, splitWork, stackSides, stats, education, note, now, marginNotes,
} from '@/lib/data';

/* the monogram — the seam runs through my initials */
function Mark({ className = '' }: { className?: string }) {
  return (
    <span className={`mark ${className}`} aria-label="Veera Palla">
      <span>V</span>
      <span className="mark-seam" aria-hidden="true" />
      <span>P</span>
    </span>
  );
}

/* a small hand-drawn pin for the margin notes */
function Pin() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 14c3-6 6-9 12-11M14 3l-4 .3M14 3l-.4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function useReveals() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.rv').forEach(el => el.classList.add('is-in'));
      return;
    }
    const obs = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            obs.unobserve(e.target);
          }
        }
      },
      { threshold: 0.14 },
    );
    document.querySelectorAll('.rv').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export default function SplitSite() {
  useReveals();

  return (
    <>
      {/* minimal nav — blend-mode keeps it legible over both panes */}
      <nav className="nav" aria-label="Site">
        <a className="nav-mark" href="#top"><Mark /></a>
        <div className="nav-links">
          <a href="#work">Work</a>
          <a href="#stack">Stack</a>
          <a href="#note">About me</a>
          <a href="#contact">Contact</a>
        </div>
        <a className="nav-resume" href={personal.resumeUrl} download>Resume ↓</a>
      </nav>

      <div id="top"><SplitHero /></div>

      {/* ── THE WORK — dual ledgers ── */}
      <section className="sec" id="work">
        <header className="sec-head rv">
          <span className="sec-eyebrow">01 — THE WORK</span>
          <h2>Every role, told from<br />both sides of the wire.</h2>
          <p className="sec-sub">
            On the left, what people saw. On the right, what the system did to
            keep that promise. I have spent four years living in the gap between
            those two columns.
          </p>
        </header>

        <div className="ledgers">
          {splitWork.map((w, i) => (
            <article key={w.company} className={`ledger rv ${w.current ? 'ledger--current' : ''}`} style={{ transitionDelay: `${i * 0.06}s` }}>
              <header className="ledger-head">
                <div>
                  <h3>{w.company}</h3>
                  <p className="ledger-headline">{w.headline}</p>
                </div>
                <div className="ledger-meta">
                  <span className="ledger-role">{w.role}</span>
                  <span className="ledger-period">{w.period} · {w.location}</span>
                  {w.current && <span className="ledger-now">CURRENT</span>}
                </div>
              </header>
              <div className="ledger-body">
                <div className="ledger-col ledger-col--front">
                  <span className="col-label">THE INTERFACE</span>
                  <ul>{w.front.map(b => <li key={b.slice(0, 24)}>{b}</li>)}</ul>
                </div>
                <div className="ledger-col ledger-col--back">
                  <span className="col-label">THE SYSTEM</span>
                  <ul>{w.back.map(b => <li key={b.slice(0, 24)}>{b}</li>)}</ul>
                </div>
              </div>
              {marginNotes[w.company] && (
                <p className="margin-note">
                  <Pin />
                  {marginNotes[w.company]}
                </p>
              )}
              {w.seam.length > 0 && (
                <div className="ledger-seam">
                  <span className="col-label">ACROSS THE SEAM</span>
                  <p>{w.seam.join(' ')}</p>
                </div>
              )}
              <div className="ledger-tech">
                {w.tech.map(t => <span key={t} className="chip">{t}</span>)}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── NUMBERS THAT HELD ── */}
      <section className="sec sec--band">
        <div className="band rv">
          {stats.map(s => (
            <div key={s.label} className="band-stat">
              <b>{s.value}</b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── THE STACK ── */}
      <section className="sec" id="stack">
        <header className="sec-head rv">
          <span className="sec-eyebrow">02 — THE STACK</span>
          <h2>Sorted by side.</h2>
        </header>

        <div className="stack-grid">
          <div className="stack-lane stack-lane--front rv">
            <span className="lane-label">INTERFACE SIDE</span>
            {stackSides.front.map(c => (
              <div key={c.label} className="stack-card">
                <h3>{c.label}</h3>
                <div className="stack-chips">{c.skills.map(s => <span key={s} className="chip">{s}</span>)}</div>
              </div>
            ))}
          </div>
          <div className="stack-lane stack-lane--back rv">
            <span className="lane-label">SYSTEM SIDE</span>
            {stackSides.back.map(c => (
              <div key={c.label} className="stack-card">
                <h3>{c.label}</h3>
                <div className="stack-chips">{c.skills.map(s => <span key={s} className="chip">{s}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="stack-seam rv">
          <span className="lane-label">SHARED ACROSS THE SEAM</span>
          <div className="stack-seam-grid">
            {stackSides.seam.map(c => (
              <div key={c.label} className="stack-card">
                <h3>{c.label}</h3>
                <div className="stack-chips">{c.skills.map(s => <span key={s} className="chip">{s}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── A NOTE FROM ME ── */}
      <section className="sec" id="note">
        <header className="sec-head rv">
          <span className="sec-eyebrow">03 — IN MY OWN WORDS</span>
          <h2>{note.heading}</h2>
        </header>
        <div className="note-wrap">
          <div className="note-body rv">
            {note.paragraphs.map(p => <p key={p.slice(0, 26)}>{p}</p>)}
            <div className="note-sign">
              <span>{note.signoff}</span>
              <span className="sig">Veera</span>
            </div>
          </div>
          <aside className="note-facts rv">
            <h3>SMALL PRINT</h3>
            {note.facts.map(f => (
              <div key={f.k} className="fact">
                <b>{f.k}</b>
                <span>{f.v}</span>
              </div>
            ))}
            <div className="now-lines">
              <p><b>Now</b>{now.line}</p>
              <p><b>Reading</b>{now.reading}</p>
              <p><b>Learning</b>{now.learning}</p>
            </div>
          </aside>
        </div>
      </section>

      {/* ── EDUCATION ── */}
      <section className="sec" id="education">
        <header className="sec-head rv">
          <span className="sec-eyebrow">04 — EDUCATION</span>
          <h2>Chicago, between the arcs.</h2>
        </header>
        <div className="edu rv">
          <div>
            <h3>{education.institution}</h3>
            <p>{education.degree} — {education.field}</p>
          </div>
          <div className="edu-meta">
            <span>{education.period}</span>
            <span>{education.location}</span>
          </div>
        </div>
      </section>

      {/* ── CONTACT — the seam closes ── */}
      <section className="sec sec--contact" id="contact">
        <div className="contact-split" aria-hidden="true" />
        <div className="contact-inner rv">
          <span className="sec-eyebrow">05 — CONTACT</span>
          <h2>Both sides.<br />One inbox.</h2>
          <p className="sec-sub">
            React-heavy, Java-heavy, or the messy middle — either half of this
            page is home for me. Email reaches me fastest; I answer everything.
          </p>
          <div className="contact-ctas">
            <a className="cta cta--invert" href={`mailto:${personal.email}`}>{personal.email}</a>
            <a className="cta cta--line" href={personal.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
            <a className="cta cta--line" href={personal.resumeUrl} download>Resume ↓</a>
            <a className="cta cta--line" href={`tel:${personal.phone.replace(/-/g, '')}`}>{personal.phone}</a>
          </div>
          <footer className="foot">
            <span className="foot-mark">
              <Mark />
              <span>© 2026 {personal.name}</span>
            </span>
            <span className="hand">hand-built, no templates — Next.js, one long weekend</span>
          </footer>
        </div>
      </section>
    </>
  );
}
