'use client';
// SHONEN DEV — a neo-brutalist portfolio told as an anime series.
// Episodes reveal with slate wipes, tickers loop, stickers parallax,
// the hanko stamps the hero. All data flows from lib/data.ts.
import { useEffect, useRef } from 'react';
import {
  personal, summary, stats, skillCategories, experiences, moves,
  education, domains,
} from '@/lib/data';

/* observe every [data-ep] / .rv and flip .is-in when scrolled into view */
function useReveals() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('[data-ep], .rv').forEach(el => el.classList.add('is-in'));
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
      { threshold: 0.18 },
    );
    document.querySelectorAll('[data-ep], .rv').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* scroll + mouse parallax for the hero sticker field */
function useHeroParallax(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const layers = Array.from(root.querySelectorAll<HTMLElement>('.hero-stick'));
    let mx = 0, my = 0, sy = 0, raf = 0;
    const paint = () => {
      raf = 0;
      layers.forEach((el, i) => {
        const depth = 0.35 + (i % 4) * 0.22;
        el.style.transform =
          `translate(${mx * 18 * depth}px, ${my * 12 * depth - sy * depth * 0.35}px) rotate(${el.dataset.rot}deg)`;
      });
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(paint); };
    const onMove = (e: PointerEvent) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
      queue();
    };
    const onScroll = () => { sy = Math.min(window.scrollY, 900); queue(); };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ref]);
}

function Ticker({ items, variant = '', fast = false }: { items: string[]; variant?: string; fast?: boolean }) {
  const half = (
    <span>
      {items.map((it, i) => (
        <span key={i}>
          {it.startsWith('jp:') ? <span className="jp">{it.slice(3)}</span> : it}
          <i>★</i>
        </span>
      ))}
    </span>
  );
  return (
    <div className={`tick ${variant} ${fast ? 'tick--fast' : ''}`} aria-hidden="true">
      <div className="tick-track">{half}{half}</div>
    </div>
  );
}

function EpCard({ num, title, jp }: { num: string; title: string; jp: string }) {
  return (
    <div className="ep-card">
      <div className="ep-num">{num}</div>
      <div className="ep-title">
        <h2>{title}</h2>
        <span className="jp">{jp}</span>
      </div>
    </div>
  );
}

const HERO_STICKERS = [
  { text: 'REACT.JS', cls: 'hero-stick--blue', style: { left: '5%', top: '9%' }, rot: -6 },
  { text: 'JAVA 17', cls: 'hero-stick--red', style: { right: '22%', top: '30%' }, rot: 5 },
  { text: 'SPRING BOOT', cls: '', style: { right: '36%', top: '48%' }, rot: 3 },
  { text: 'TYPESCRIPT', cls: 'hero-stick--gray', style: { right: '8%', bottom: '30%' }, rot: -4 },
  { text: 'AWS', cls: 'hero-stick--blue', style: { right: '30%', bottom: '14%' }, rot: 7 },
  { text: 'KAFKA', cls: '', style: { left: '38%', top: '11%' }, rot: -3 },
  { text: 'jp:必殺技 MICROSERVICES', cls: 'hero-stick--red', style: { left: '58%', bottom: '8%' }, rot: 2 },
];

export default function Portfolio() {
  useReveals();
  const heroRef = useRef<HTMLDivElement>(null);
  useHeroParallax(heroRef);

  return (
    <>
      {/* ── header ── */}
      <header className="hd">
        <a className="hd-logo" href="#top">
          <span className="hd-hanko">パラ</span>
          VEERA PALLA
        </a>
        <nav className="hd-nav" aria-label="Sections">
          <a className="hd-link" href="#about">About</a>
          <a className="hd-link" href="#experience">Experience</a>
          <a className="hd-link" href="#skills">Skills</a>
          <a className="hd-link" href="#moves">Highlights</a>
          <a className="hd-link" href="#contact">Contact</a>
        </nav>
        <span className="hd-open">OPEN TO WORK</span>
        <a className="nb-btn nb-btn--blue hd-cta" href={personal.resumeUrl} download>
          RESUME ↓
        </a>
      </header>

      <main id="top">
        {/* ── hero ── */}
        <section className="hero" ref={heroRef}>
          <div className="hero-speed" aria-hidden="true" />
          <div className="hero-sun" aria-hidden="true" />
          <div className="hero-stickers" aria-hidden="true">
            {HERO_STICKERS.map(s => (
              <span
                key={s.text}
                className={`hero-stick ${s.cls}`}
                style={{ ...s.style, transform: `rotate(${s.rot}deg)` }}
                data-rot={s.rot}
              >
                {s.text.startsWith('jp:')
                  ? <><span className="jp">{s.text.slice(3).split(' ')[0]}</span>{s.text.slice(3).split(' ').slice(1).join(' ')}</>
                  : s.text}
              </span>
            ))}
          </div>

          <p className="hero-eyebrow">
            <span className="jp">{personal.nameJp}</span>
            FULL-STACK · RETAIL × AIRLINE × E-COMMERCE
          </p>
          <h1 className="hero-name">
            VEERA<br /><span className="stroke">PALLA</span>
          </h1>
          <p className="hero-role">FULL-STACK DEVELOPER — REACT × JAVA 17 × AWS</p>
          <p className="hero-tag">
            {'Around '}<b>4 years</b>{' building scalable, high-performance applications — '}
            <b>React + TypeScript</b>{' front-ends on '}<b>Spring Boot microservices</b>
            {', shipped on AWS. Currently at '}<b>Walmart</b>.
          </p>
          <div className="hero-ctas">
            <a className="nb-btn nb-btn--red" href="#experience">VIEW THE STORY ▸</a>
            <a className="nb-btn" href={`mailto:${personal.email}`}>SAY HELLO</a>
          </div>

          <div className="hero-hanko" aria-hidden="true">承<br />認</div>
          <span className="hero-scroll" aria-hidden="true">SCROLL<span>▼</span></span>
        </section>

        <Ticker
          fast
          items={['REACT.JS', 'TYPESCRIPT', 'JAVA 17', 'SPRING BOOT', 'MICROSERVICES', 'KAFKA', 'REDIS', 'AWS', 'KUBERNETES', 'GRAPHQL', 'jp:フルスタック開発者']}
        />

        {/* ── EP 01 — about ── */}
        <section className="ep" id="about" data-ep>
          <EpCard num="EP.01" title="The Protagonist" jp="自己紹介" />
          <div className="ep-inner about-grid">
            <div className="nb-box about-card rv rv--left">
              {summary.map(line => <p key={line.slice(0, 24)}>{line}</p>)}
            </div>
            <div className="stats">
              {stats.map((s, i) => (
                <div key={s.label} className={`stat rv rv--pop rv-d${i + 1}`}>
                  <span className="jp">{s.jp}</span>
                  <b>{s.value}</b>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── EP 02 — experience ── */}
        <section className="ep ep--gray" id="experience" data-ep>
          <EpCard num="EP.02" title="The Three Arcs" jp="経歴" />
          <div className="ep-inner exp-list">
            {experiences.map((e, i) => (
              <article key={e.company} className={`panel rv ${i % 2 ? 'rv--right' : 'rv--left'} ${e.current ? 'panel--current' : ''}`}>
                <span className="panel-arc">
                  {e.arc}<span className="jp">{e.arcJp}</span>
                </span>
                <div className="panel-head">
                  <h3>{e.company}</h3>
                  <span className="panel-role">{e.role}</span>
                  <span className="panel-meta">{e.period} · {e.location}</span>
                </div>
                <ul>
                  {e.bullets.map(b => <li key={b.slice(0, 28)}>{b}</li>)}
                </ul>
                <div className="panel-tech">
                  {e.tech.map(t => <span key={t} className="nb-tag">{t}</span>)}
                </div>
              </article>
            ))}
          </div>
        </section>

        <Ticker
          variant="tick--red"
          items={[...domains, 'jp:頑張って', 'SHIP IT', '3,000 REQ/S', '80% COVERAGE', 'jp:継続は力なり', 'ON-CALL SURVIVOR']}
        />

        {/* ── EP 03 — skills ── */}
        <section className="ep" id="skills" data-ep>
          <EpCard num="EP.03" title="The Arsenal" jp="技術" />
          <div className="ep-inner skills-grid">
            {skillCategories.map((cat, i) => (
              <div key={cat.label} className={`skill-card rv rv--pop rv-d${(i % 4) + 1}`}>
                <div className="skill-head">
                  <h3>{cat.label}</h3>
                  <span className="jp">{cat.jp}</span>
                </div>
                <div className="skill-chips">
                  {cat.skills.map(s => <span key={s} className="nb-tag">{s}</span>)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── EP 04 — signature moves ── */}
        <section className="ep ep--ink" id="moves" data-ep>
          <EpCard num="EP.04" title="Signature Moves" jp="必殺技" />
          <div className="ep-inner moves-grid">
            {moves.map((m, i) => (
              <article key={m.name} className={`move move--${m.color} rv rv--pop rv-d${i + 1}`}>
                <div className="move-slash" aria-hidden="true" />
                <span className="move-kind">{m.kind}</span>
                <h3>{m.name}</h3>
                <span className="jp">{m.nameJp}</span>
                <p>{m.desc}</p>
                <div className="move-stat">
                  <b>{m.stat}</b>
                  <span>{m.statLabel}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── EP 05 — education ── */}
        <section className="ep" id="education" data-ep>
          <EpCard num="EP.05" title="The Training Grounds" jp="学歴" />
          <div className="ep-inner">
            <div className="edu rv rv--pop">
              <span className="edu-crest">UIC</span>
              <div>
                <h3>{education.institution}</h3>
                <p>{education.degree} — {education.field}</p>
              </div>
              <div className="edu-meta">
                {education.period}<br />{education.location}
                <span className="jp">シカゴ</span>
              </div>
            </div>
          </div>
        </section>

        <Ticker
          variant="tick--blue"
          items={['LET’S BUILD SOMETHING', 'jp:一緒に作ろう', 'AVAILABLE FOR FULL-STACK ROLES', 'REACT × JAVA × AWS', 'jp:よろしくお願いします']}
        />

        {/* ── finale — contact ── */}
        <section className="ep ep--ink fin" id="contact" data-ep>
          <div className="ep-inner">
            <p className="fin-kicker rv">最終回 — THE FINAL EPISODE</p>
            <h2 className="rv rv-d1">LET’S SHIP<br /><em>THE NEXT ARC.</em></h2>
            <p className="fin-sub rv rv-d2">
              Full-stack roles, React or Java-heavy — either side of the stack is home turf.
              The inbox is faster than the phone, but both work.
            </p>
            <div className="fin-ctas rv rv-d3">
              <a className="nb-btn nb-btn--red" href={`mailto:${personal.email}`}>{personal.email}</a>
              <a className="nb-btn nb-btn--paper" href={personal.linkedin} target="_blank" rel="noopener noreferrer">
                LINKEDIN ↗
              </a>
              <a className="nb-btn nb-btn--blue" href={personal.resumeUrl} download>RESUME.PDF ↓</a>
              <a className="nb-btn nb-btn--ink" href={`tel:${personal.phone.replace(/-/g, '')}`}>{personal.phone}</a>
            </div>
            <div className="fin-foot">
              <span className="jp">つづく…</span>
              <span>to be continued — additional episodes in production.</span>
              <span className="end">© 2026 VEERA PALLA · BUILT WITH NEXT.JS · 制作</span>
            </div>
          </div>
        </section>
      </main>

      <a className="top-btn" href="#top" aria-label="Back to top">▲</a>
    </>
  );
}
