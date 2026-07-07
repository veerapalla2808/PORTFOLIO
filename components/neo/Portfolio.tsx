'use client';
// FULL-STACK SAGA — the portfolio as a manga chapter.
// White pages on a dark desk. Panels pop in reading order, SFX slam in,
// achievements are defeated bosses, contact is a wanted poster.
// All content flows from lib/data.ts (synced to the resume PDF).
import { useEffect } from 'react';
import {
  personal, summary, stats, skillCategories, experiences, bosses, education,
} from '@/lib/data';

/* flip .is-read on each page as it enters — panels stagger via --i */
function useReading() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.page, .strip').forEach(el => el.classList.add('is-read'));
      return;
    }
    const obs = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-read');
            obs.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    document.querySelectorAll('.page').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function Strip({ items }: { items: string[] }) {
  const half = (
    <span>
      {items.map((it, i) => <span key={i}>{it}<i>◆</i></span>)}
    </span>
  );
  return (
    <div className="strip" aria-hidden="true">
      <div className="strip-track">{half}{half}</div>
    </div>
  );
}

/* one panel with reading-order stagger */
function P({ i, className = '', children, style }: {
  i: number; className?: string; children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <div className={`panel pop ${className}`} style={{ ...style, ['--i' as never]: i }}>
      {children}
    </div>
  );
}

export default function Portfolio() {
  useReading();

  return (
    <>
      {/* ── magazine masthead ── */}
      <header className="mast">
        <span className="mast-stamp">VP</span>
        <div>
          <div className="mast-title">FULL-STACK SAGA</div>
          <div className="mast-issue">WEEKLY SHIP MAGAZINE · NEW SERIALIZATION</div>
        </div>
        <nav className="mast-nav" aria-label="Chapters">
          <a className="mast-link" href="#ch1">Ch.1 Hero</a>
          <a className="mast-link" href="#arcs">Ch.2 Arcs</a>
          <a className="mast-link" href="#bosses">Ch.3 Bosses</a>
          <a className="mast-link" href="#abilities">Ch.4 Abilities</a>
          <a className="mast-link" href="#wanted">Wanted</a>
        </nav>
        <a className="mast-cta" href={personal.resumeUrl} download>RESUME ↓</a>
      </header>

      <main className="book" id="top">
        {/* ══ COVER ══ */}
        <section className="page cover tone-dots" aria-label="Cover">
          <div className="cover-band">
            <span>WEEKLY SHIP MAGAZINE</span>
            <span><b>NEW SERIALIZATION!!</b></span>
            <span>VOL. 04 — THE FOURTH YEAR</span>
          </div>
          <div className="cover-logo-wrap">
            <p className="cover-kicker pop" style={{ ['--i' as never]: 0 }}>
              A DEVELOPER SHONEN IN {experiences.length} ARCS
            </p>
            <h1 className="cover-logo pop" style={{ ['--i' as never]: 1 }}>
              FULL-STACK SAGA
            </h1>
            <p className="cover-by pop" style={{ ['--i' as never]: 2 }}>
              STORY &amp; CODE BY {personal.name.toUpperCase()}
            </p>
            <span className="sfx pop" style={{ right: '4%', top: '8%', ['--i' as never]: 3 }}>
              SHIP!!
            </span>
          </div>
          <div className="grid cover-grid">
            <div className="cover-blurbs">
              <span className="burst pop" style={{ ['--i' as never]: 4 }}>4 YEARS IN PRODUCTION!</span>
              <span className="burst--blue burst pop" style={{ ['--i' as never]: 5 }}>REACT × JAVA 17 × AWS!</span>
              <span className="burst--ink burst pop" style={{ ['--i' as never]: 6 }}>NOW SHIPPING AT WALMART!</span>
            </div>
            <div className="cover-panel">
              <div className="narr pop" style={{ ['--i' as never]: 7 }}>
                THIS ISSUE: A FULL-STACK DEVELOPER WHO REFUSES TO PICK A SIDE OF THE STACK.
              </div>
              <div className="cover-ctas pop" style={{ ['--i' as never]: 8 }}>
                <a className="btn btn--red" href="#ch1">START READING ▸</a>
                <a className="btn" href={`mailto:${personal.email}`}>CONTACT THE AUTHOR</a>
              </div>
            </div>
          </div>
          <span className="page-folio">COVER · $0.00 — FREE TO HIRE</span>
        </section>

        <Strip items={['REACT.JS', 'TYPESCRIPT', 'JAVA 17', 'SPRING BOOT', 'MICROSERVICES', 'KAFKA', 'REDIS', 'AWS', 'KUBERNETES', 'GRAPHQL']} />

        {/* ══ CH.1 — THE HERO ══ */}
        <section className="page" id="ch1" aria-label="Chapter 1 — the hero">
          <span className="page-chapter">CH.1 — ENTER THE HERO</span>
          <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="narr pop" style={{ ['--i' as never]: 0 }}>
              IN A WORLD OF DEADLINES AND LEGACY CODE… ONE DEVELOPER WORKS BOTH SIDES OF THE STACK.
            </div>
            <div className="grid profile-grid">
              <P i={1} className="tone-dots panel--cut-tr">
                <div className="profile-head">
                  <h2>{personal.name}</h2>
                  <span className="profile-role">{personal.role}</span>
                </div>
                <div style={{ marginTop: '0.8rem' }}>
                  {summary.map((line, i) => (
                    <p key={i} style={{ fontSize: '0.9rem', marginBottom: '0.7rem' }}>{line}</p>
                  ))}
                </div>
              </P>
              <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
                <P i={2} className="tone-hatch">
                  <div className="narr" style={{ boxShadow: 'none', marginBottom: '0.4rem' }}>CHARACTER STATS</div>
                  {stats.map(s => (
                    <div key={s.label} className="statline">
                      <b>{s.value}</b>
                      <span>{s.label}</span>
                    </div>
                  ))}
                </P>
                <P i={3} style={{ border: 'none', padding: '0.4rem 0 1.6rem', overflow: 'visible', background: 'transparent' }}>
                  <div className="bubble">
                    “Front-end asks. Back-end answers. I write both sides of the conversation.”
                  </div>
                </P>
              </div>
            </div>
          </div>
          <span className="sfx sfx--small pop" style={{ left: '2%', bottom: '1.4rem', ['--i' as never]: 4 }}>
            CLACK CLACK
          </span>
          <span className="page-folio">PAGE 001</span>
        </section>

        {/* ══ CH.2 — THE ARCS (chronological, like any good saga) ══ */}
        {[...experiences].reverse().map((e, ei) => (
          <section className="page" id={ei === 0 ? 'arcs' : undefined} key={e.company} aria-label={e.arc}>
            <span className={`page-chapter ${e.current ? 'page-chapter--red' : ''}`}>
              CH.2 — {e.arc}
            </span>
            {e.current && <span className="now-badge">NOW SERIALIZING</span>}
            <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="narr pop" style={{ ['--i' as never]: 0 }}>{e.narration}</div>
              <div className="arc-head pop" style={{ ['--i' as never]: 1 }}>
                <h2>{e.company}</h2>
                <span className="profile-role">{e.role}</span>
                <span className="arc-meta">{e.period} · {e.location}</span>
              </div>
              <div className="grid arc-grid">
                {e.bullets.map((b, bi) => {
                  const spans = ['span-3', 'span-3', 'span-4', 'span-2', 'span-2', 'span-4', 'span-3', 'span-3'];
                  const tones = ['tone-dots', '', 'tone-hatch', '', 'tone-dots-lg', '', 'tone-hatch', ''];
                  const cuts = ['panel--cut-tr', '', '', 'panel--cut-bl', '', 'panel--cut-tr', '', 'panel--cut-bl'];
                  return (
                    <P key={bi} i={bi + 2} className={`${spans[bi % 8]} ${tones[bi % 8]} ${cuts[bi % 8]}`}>
                      <p>{b}</p>
                    </P>
                  );
                })}
              </div>
              <div className="arc-tech pop" style={{ ['--i' as never]: 10 }}>
                {e.tech.map(t => <span key={t} className="chip">{t}</span>)}
              </div>
            </div>
            <span
              className={`sfx pop ${ei % 2 ? 'sfx--red' : ''}`}
              style={ei % 2
                ? { left: '2%', bottom: '3.4rem', ['--i' as never]: 5 }
                : { right: '2%', bottom: '5rem', ['--i' as never]: 5 }}
            >
              {e.sfx}!!
            </span>
            <span className="page-folio">PAGE 00{ei + 2}</span>
          </section>
        ))}

        <Strip items={['RETAIL', 'AIRLINE', 'E-COMMERCE', '3,000 REQ/S', '80% COVERAGE', 'ON-CALL SURVIVOR', 'SHIP IT']} />

        {/* ══ CH.3 — BOSS BATTLES ══ */}
        <section className="page tone-speed" id="bosses" aria-label="Chapter 3 — boss battles">
          <span className="page-chapter page-chapter--red">CH.3 — BOSS BATTLES</span>
          <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="narr pop" style={{ ['--i' as never]: 0 }}>
              EVERY ARC HAS ITS MONSTER. FOUR WENT DOWN. THE RECEIPTS ARE IN THE RESUME.
            </div>
            <div className="grid boss-grid">
              {bosses.map((b, i) => (
                <P key={b.name} i={i + 1} className={`boss boss--${b.color}`} style={{ padding: 0, border: 'none' }}>
                  <div className={`boss boss--${b.color}`} style={{ borderWidth: 'var(--bw)' }}>
                    <span className="defeated">DEFEATED</span>
                    <div className="boss-no">BOSS No.{b.no}</div>
                    <h3>{b.name}</h3>
                    <div className="boss-epithet">— {b.epithet}</div>
                    <p>{b.desc}</p>
                    <div className="boss-stat">
                      <b>{b.stat}</b>
                      <span>{b.statLabel}</span>
                    </div>
                  </div>
                </P>
              ))}
            </div>
          </div>
          <span className="sfx sfx--red pop" style={{ left: '34%', top: '-1.6rem', ['--i' as never]: 5 }}>
            K.O.!!
          </span>
          <span className="page-folio">PAGE 005</span>
        </section>

        {/* ══ CH.4 — ABILITY SHEET ══ */}
        <section className="page" id="abilities" aria-label="Chapter 4 — ability sheet">
          <span className="page-chapter">CH.4 — THE ABILITY SHEET</span>
          <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="narr pop" style={{ ['--i' as never]: 0 }}>
              OFFICIAL CHARACTER DATA — EVERY TECHNIQUE LEARNED ACROSS THREE ARCS. NO FILLER.
            </div>
            <div className="grid ability-grid">
              {skillCategories.map((cat, i) => (
                <P key={cat.label} i={(i % 6) + 1} className="ability" style={{ padding: 0, border: 'none', background: 'transparent', overflow: 'visible' }}>
                  <div className="ability">
                    <div className="ability-head">
                      <h3>{cat.label}</h3>
                      <span>TECHNIQUES ×{cat.skills.length}</span>
                    </div>
                    <div className="ability-chips">
                      {cat.skills.map(s => <span key={s} className="chip">{s}</span>)}
                    </div>
                  </div>
                </P>
              ))}
            </div>
          </div>
          <span className="page-folio">PAGE 006</span>
        </section>

        {/* ══ CH.5 — THE TRAINING ARC ══ */}
        <section className="page tone-dots" aria-label="Chapter 5 — the training arc">
          <span className="page-chapter page-chapter--ink">CH.5 — THE TRAINING ARC</span>
          <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="narr pop" style={{ ['--i' as never]: 0 }}>
              — TIME SKIP: TWO YEARS OF TRAINING IN CHICAGO —
            </div>
            <P i={1} style={{ background: 'transparent', border: 'none', overflow: 'visible', padding: 0 }}>
              <div className="panel training">
                <span className="training-crest">UIC</span>
                <div>
                  <h3>{education.institution}</h3>
                  <p>{education.degree} — {education.field}</p>
                </div>
                <div className="training-meta">
                  {education.period}<br />{education.location}
                </div>
              </div>
            </P>
            <P i={2} style={{ background: 'transparent', border: 'none', overflow: 'visible', paddingBottom: '1.4rem' }}>
              <div className="bubble bubble--right" style={{ maxWidth: '34rem', marginLeft: 'auto' }}>
                “Trained by day, shipped flight-booking code by night. The training arc and
                Arc II overlap — read them side by side.”
              </div>
            </P>
          </div>
          <span className="page-folio">PAGE 007</span>
        </section>

        <Strip items={['NEXT ISSUE', 'YOUR COMPANY?', 'THE HIRING ARC', 'A NEW TEAM APPEARS', 'CLIFFHANGER']} />

        {/* ══ BACK COVER — WANTED ══ */}
        <section className="page wanted-page tone-dots-lg" id="wanted" aria-label="Wanted poster — contact">
          <div className="wanted">
            <h2 className="wanted-title pop" style={{ ['--i' as never]: 0 }}>WANTED</h2>
            <p className="wanted-sub pop" style={{ ['--i' as never]: 1 }}>HIRED OR HEADHUNTED</p>
            <div className="wanted-portrait pop" style={{ ['--i' as never]: 2 }}>
              <span className="star" style={{ top: '-2.4rem', left: '-2.6rem', width: '6rem', height: '6rem' }} aria-hidden="true" />
              <b>VP</b>
            </div>
            <p className="wanted-name pop" style={{ ['--i' as never]: 3 }}>{personal.name.toUpperCase()}</p>
            <p className="wanted-line pop" style={{ ['--i' as never]: 3 }}>
              FULL-STACK DEVELOPER · LAST SEEN SHIPPING AT WALMART
            </p>
            <p className="wanted-line pop" style={{ ['--i' as never]: 4 }}>
              REWARD: <b>YOUR BEST OFFER</b>
            </p>
            <div className="wanted-ctas pop" style={{ ['--i' as never]: 5 }}>
              <a className="btn btn--red" href={`mailto:${personal.email}`}>{personal.email}</a>
              <a className="btn btn--blue" href={personal.linkedin} target="_blank" rel="noopener noreferrer">LINKEDIN ↗</a>
              <a className="btn" href={personal.resumeUrl} download>FULL DOSSIER (PDF) ↓</a>
              <a className="btn btn--ink" href={`tel:${personal.phone.replace(/-/g, '')}`}>{personal.phone}</a>
            </div>
            <div className="wanted-foot">
              <span>APPROACH WITH A JOB DESCRIPTION. CONSIDERED ARMED WITH TYPESCRIPT.</span>
              <span>© 2026 {personal.name.toUpperCase()} · BUILT WITH NEXT.JS</span>
            </div>
          </div>
          <span className="tbc">TO BE CONTINUED →</span>
        </section>
      </main>

      <a className="top-btn" href="#top" aria-label="Back to the cover">▲</a>
    </>
  );
}
