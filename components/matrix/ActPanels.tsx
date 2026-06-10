'use client';
// The DOM layer of NEON GRID — bands fade in around their flight offset.
// Nothing is locked: checkpoints are optional sport, content is always open.
import DecodeText from './DecodeText';
import {
  IDENTITY_SPOT, ARSENAL_WALL, PORTALS, BILLBOARDS, CHECKPOINT_O,
  SKIP_LABEL, type Question,
} from '@/lib/grid';
import {
  personal, stats, experiences, projects, skillCategories,
  certifications, education,
} from '@/lib/data';

function Sec({
  o, align = 'center', fade = 0.045, children,
}: { o: number; align?: 'left' | 'right' | 'center'; fade?: number; children: React.ReactNode }) {
  return (
    <section className={`mx-sec mx-sec-${align}`} data-o={o} data-fade={fade}>
      {children}
    </section>
  );
}

// content panels taller than the viewport scroll internally — wheel inside
// scrolls the panel, but at its edges the wheel flies the camera again
// (never trap the traveler)
function stopWheel(e: React.WheelEvent<HTMLElement>) {
  const el = e.currentTarget;
  if (el.scrollHeight <= el.clientHeight + 4) return;
  const down = e.deltaY > 0;
  const atTop = el.scrollTop <= 0;
  const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
  if ((down && !atBottom) || (!down && !atTop)) e.stopPropagation();
}

export interface CheckpointResult { state: 'correct' | 'wrong' | 'skipped'; picked?: number }

function Checkpoint({
  index, q, result, onResult,
}: {
  index: number;
  q: Question;
  result: CheckpointResult | undefined;
  onResult: (index: number, r: CheckpointResult, line: string) => void;
}) {
  const done = result?.state === 'correct' || result?.state === 'skipped';
  const wrongPick = result?.state === 'wrong' ? result.picked : undefined;

  const pick = (i: number) => {
    if (done) return;
    if (i === q.correct) onResult(index, { state: 'correct' }, q.win);
    else onResult(index, { state: 'wrong', picked: i }, q.sass[i]);
  };

  return (
    <article className={`mx-gate${result?.state === 'correct' ? ' is-open' : ''}`}>
      <header className="mx-gate-head">
        <span className="mx-gate-id vt">OPERATOR CHECKPOINT {index + 1}/6</span>
        <span className={`mx-gate-state ${result?.state === 'correct' ? 'ok' : ''}`}>
          {result?.state === 'correct' ? '+1 RANK' : result?.state === 'skipped' ? 'SKIPPED' : 'OPTIONAL · THE RABBIT IS JUDGING'}
        </span>
      </header>
      {result?.state === 'correct' ? (
        <p className="mx-gate-win">{q.win}</p>
      ) : result?.state === 'skipped' ? (
        <p className="mx-gate-sass">Skipped. Noted. Filed. Remembered.</p>
      ) : (
        <>
          <p className="mx-gate-q">{q.q}</p>
          <div className="mx-gate-opts">
            {q.options.map((opt, i) => (
              <button
                key={opt}
                className={`mx-gate-opt${wrongPick === i ? ' is-wrong' : ''}`}
                onClick={() => pick(i)}
              >
                <span className="mx-gate-key">{String.fromCharCode(65 + i)}</span> {opt}
              </button>
            ))}
          </div>
          {result?.state === 'wrong' && wrongPick !== undefined && (
            <p className="mx-gate-sass">{'>'} {q.sass[wrongPick]}</p>
          )}
          <button
            className="mx-gate-skip"
            onClick={() => onResult(index, { state: 'skipped' }, 'Skipped. The rabbit is updating your file.')}
          >
            {SKIP_LABEL}
          </button>
        </>
      )}
    </article>
  );
}

export default function ActPanels({
  questions, results, onResult, booted, onBlue,
}: {
  questions: Question[];
  results: Record<number, CheckpointResult>;
  onResult: (index: number, r: CheckpointResult, line: string) => void;
  booted: Set<string>;
  onBlue: () => void;
}) {
  return (
    <div className="mx-panels">
      {/* ── 00 / hero ── */}
      <Sec o={0} fade={0.055}>
        <div className="mx-hero">
          <p className="mx-eyebrow vt">{'>'} jacked in. welcome to the neon grid…</p>
          <h1 className="mx-name"><DecodeText text="VEERA PALLA" speed={20} /></h1>
          <p className="mx-hero-sub">SR. REACT.JS / NODE.JS DEVELOPER · 11 YEARS · A PLAYABLE RÉSUMÉ</p>
          <p className="mx-hero-cue">
            SCROLL TO FLY INTO THE VORTEX <span className="mx-cue-arrow">▼</span> · drag to look around
          </p>
        </div>
      </Sec>

      {/* checkpoints — optional, rotating questions */}
      {questions.map((q, i) => (
        <Sec key={`cp-${i}`} o={CHECKPOINT_O[i]} fade={0.022}>
          <Checkpoint index={i} q={q} result={results[i]} onResult={onResult} />
        </Sec>
      ))}

      {/* ── 01 / identity ── */}
      <Sec o={IDENTITY_SPOT.o} fade={0.03} align="left">
        <article className="mx-slab mx-slab-wide mx-scroll" onWheel={stopWheel}>
          <header className="mx-slab-head">
            <span className="mx-slab-path">~/grid/identity.log</span>
            <span className="mx-slab-act">01 / IDENTITY</span>
          </header>
          <h2 className="mx-h2"><DecodeText text="IDENTITY" /></h2>
          <p className="mx-lead">{personal.tagline}</p>
          <p className="mx-body">
            Senior full-stack engineer across fintech, healthcare, retail and manufacturing —
            real-time banking systems, HIPAA-compliant platforms, and GenAI/LLM-assisted
            enterprise workflows on AWS, GCP and Azure.
          </p>
          <div className="mx-stats">
            {stats.map(s => (
              <div key={s.label} className="mx-stat"><b>{s.value}</b><span>{s.label}</span></div>
            ))}
          </div>
        </article>
      </Sec>

      {/* ── 02 / arsenal ── */}
      <Sec o={ARSENAL_WALL.o} fade={0.03} align="right">
        <article className="mx-slab mx-slab-wide mx-scroll" onWheel={stopWheel}>
          <header className="mx-slab-head">
            <span className="mx-slab-path">~/grid/arsenal.bin</span>
            <span className="mx-slab-act">02 / ARSENAL</span>
          </header>
          <h2 className="mx-h2"><DecodeText text="THE ARSENAL" /></h2>
          <div className="mx-arsenal">
            {skillCategories.map(cat => (
              <div key={cat.label} className="mx-rack">
                <h3 className="mx-rack-label">
                  {cat.label} <em>{String(cat.skills.length).padStart(2, '0')}</em>
                </h3>
                <p className="mx-rack-items">{cat.skills.join(' · ')}</p>
              </div>
            ))}
          </div>
        </article>
      </Sec>

      {/* ── 03 / time tunnel — one era panel right after each portal ── */}
      {experiences.map((e, i) => (
        <Sec key={e.company} o={PORTALS[i].o + 0.016} fade={0.02} align={i % 2 === 0 ? 'left' : 'right'}>
          <article className="mx-slab mx-slab-door mx-scroll" onWheel={stopWheel}>
            <header className="mx-slab-head">
              <span className="mx-slab-path">~/timeline/era_0{i + 1}</span>
              <span className="mx-slab-act">03 / TIME TUNNEL</span>
            </header>
            <p className="mx-door-period">{e.period} · {e.location}</p>
            <h2 className="mx-h3"><DecodeText text={e.company.toUpperCase()} /></h2>
            <p className="mx-door-role">{e.role}</p>
            <ul className="mx-bullets">
              {e.bullets.slice(0, 3).map(b => <li key={b.slice(0, 32)}>{b}</li>)}
            </ul>
            <p className="mx-chips">{e.tech.slice(0, 10).map(t => <span key={t}>{t}</span>)}</p>
          </article>
        </Sec>
      ))}

      {/* ── 04 / anomalies ── */}
      {projects.map((p, i) => (
        <Sec key={p.name} o={BILLBOARDS[i].o} fade={0.026} align={i === 0 ? 'right' : 'left'}>
          <article className="mx-slab mx-slab-door mx-slab-anomaly mx-scroll" onWheel={stopWheel}>
            <header className="mx-slab-head">
              <span className="mx-slab-path">~/anomalies/case_0{i + 1}.rec</span>
              <span className="mx-slab-act mx-red">04 / ANOMALIES</span>
            </header>
            <p className="mx-anomaly-status">
              ANOMALY {i + 1}/2 — {booted.has(`anomaly-${i}`)
                ? <em>RESOLVED</em>
                : <em className="bad">ACTIVE · click the billboard ↗</em>}
            </p>
            <h2 className="mx-h3"><DecodeText text={p.name.toUpperCase()} /></h2>
            <p className="mx-body">{p.description}</p>
            <ul className="mx-bullets">
              {p.highlights.slice(0, 3).map(h => <li key={h.slice(0, 32)}>{h}</li>)}
            </ul>
            <p className="mx-chips">{p.tech.slice(0, 10).map(t => <span key={t}>{t}</span>)}</p>
          </article>
        </Sec>
      ))}

      {/* ── 05 / the choice ── */}
      <Sec o={0.97} fade={0.05}>
        <div className="mx-choice">
          <h2 className="mx-h2"><DecodeText text="RED OR BLUE?" /></h2>
          <p className="mx-choice-sub">
            You flew the grid, operator. One question left — and this one has no wrong answer.
          </p>
          <div className="mx-choice-row">
            <a className="mx-pill-btn mx-pill-red" href={`mailto:${personal.email}`}>
              <b>TAKE THE RED PILL</b>
              <span>hire him — see how deep the rabbit hole goes</span>
            </a>
            <button className="mx-pill-btn mx-pill-blue" onClick={onBlue}>
              <b>TAKE THE BLUE PILL</b>
              <span>wake up in the terminal — read the résumé</span>
            </button>
          </div>
          <p className="mx-creds-line">
            {certifications.map(c => `[${c.badge}] ${c.title}`).join(' · ')} ·
            [B.TECH] {education.field}, {education.year}
          </p>
          <p className="mx-choice-links">
            <a href={`mailto:${personal.email}`}>{personal.email}</a>
            <span>{personal.phone}</span>
            <a href={personal.linkedin} target="_blank" rel="noopener noreferrer">linkedin ↗</a>
            <a href={personal.resumeUrl} target="_blank" rel="noopener noreferrer">résumé.pdf ↓</a>
          </p>
          <p className="mx-choice-foot">© 2026 {personal.name} — there is no spoon.</p>
        </div>
      </Sec>
    </div>
  );
}
