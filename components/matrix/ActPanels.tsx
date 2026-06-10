'use client';
// The DOM layer of NEON GRID v3 — bands fade in by 2D proximity to their
// district on the street grid. Nothing is locked; checkpoints are sport.
import DecodeText from './DecodeText';
import {
  SPAWN, IDENTITY_SPOT, ARSENAL_SPOT, PORTAL_XS, PORTAL_Z, ANOM_SPOTS,
  CREDS_SPOT, TRANS_SPOT, PILLS_SPOT, CHECKPOINTS, JUNCTIONS,
  SKIP_LABEL, type Question,
} from '@/lib/grid';
import {
  personal, stats, experiences, projects, skillCategories,
  certifications, education, blogPosts,
} from '@/lib/data';

function Sec({
  x, z, r = 16, align = 'center', children,
}: { x: number; z: number; r?: number; align?: 'left' | 'right' | 'center'; children: React.ReactNode }) {
  return (
    <section className={`mx-sec mx-sec-${align}`} data-x={x} data-z={z} data-r={r}>
      {children}
    </section>
  );
}

// tall panels scroll internally; at their edges the wheel drives again
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
      {/* ── city gates — hero ── */}
      <Sec x={SPAWN.x} z={SPAWN.z} r={20}>
        <div className="mx-hero">
          <p className="mx-eyebrow vt">{'>'} jacked in. the city is yours, operator…</p>
          <h1 className="mx-name"><DecodeText text="VEERA PALLA" speed={20} /></h1>
          <p className="mx-hero-sub">SR. REACT.JS / NODE.JS DEVELOPER · 11 YEARS · A DRIVABLE RÉSUMÉ</p>
          <p className="mx-hero-cue">
            SCROLL ▲ TO DRIVE · A/D OR ◀ ▶ TO TURN AT JUNCTIONS · DRAG TO LOOK
          </p>
        </div>
      </Sec>

      {/* junction hints — tiny chips at every crossing */}
      {JUNCTIONS.map((j, i) => (
        <Sec key={`jx-${i}`} x={j.x} z={j.z} r={9}>
          <p className="mx-junction">
            {j.left ? `◀ ${j.left}` : `${j.right} ▶`} <em>· turn with A/D or ◀ ▶</em>
          </p>
        </Sec>
      ))}

      {/* checkpoints — optional, rotating questions, on the avenue */}
      {questions.map((q, i) => (
        <Sec key={`cp-${i}`} x={CHECKPOINTS[i].x} z={CHECKPOINTS[i].z} r={10}>
          <Checkpoint index={i} q={q} result={results[i]} onResult={onResult} />
        </Sec>
      ))}

      {/* ── 01 / identity plaza ── */}
      <Sec x={IDENTITY_SPOT.x - 16} z={IDENTITY_SPOT.z + 4} r={17} align="left">
        <article className="mx-slab mx-slab-wide mx-scroll" onWheel={stopWheel}>
          <header className="mx-slab-head">
            <span className="mx-slab-path">~/city/identity_plaza.log</span>
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

      {/* ── 02 / arsenal wall ── */}
      <Sec x={ARSENAL_SPOT.x + 18} z={ARSENAL_SPOT.z} r={17} align="right">
        <article className="mx-slab mx-slab-wide mx-scroll" onWheel={stopWheel}>
          <header className="mx-slab-head">
            <span className="mx-slab-path">~/city/arsenal_wall.bin</span>
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

      {/* ── 03 / time tunnel — era panel just past each portal ── */}
      {experiences.map((e, i) => (
        <Sec
          key={e.company}
          x={PORTAL_XS[i] + 11}
          z={PORTAL_Z}
          r={10}
          align={i % 2 === 0 ? 'left' : 'right'}
        >
          <article className="mx-slab mx-slab-door mx-scroll" onWheel={stopWheel}>
            <header className="mx-slab-head">
              <span className="mx-slab-path">~/time_tunnel/era_0{i + 1}</span>
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

      {/* ── 04 / anomaly sector ── */}
      {projects.map((p, i) => (
        <Sec
          key={p.name}
          x={ANOM_SPOTS[i].x + 14}
          z={ANOM_SPOTS[i].z + (i === 0 ? 7 : -7)}
          r={13}
          align={i === 0 ? 'right' : 'left'}
        >
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

      {/* ── 05 / credentials court ── */}
      <Sec x={CREDS_SPOT.x - 16} z={CREDS_SPOT.z + 5} r={15} align="left">
        <article className="mx-slab mx-scroll" onWheel={stopWheel}>
          <header className="mx-slab-head">
            <span className="mx-slab-path">~/city/credentials.sig</span>
            <span className="mx-slab-act">05 / CREDENTIALS</span>
          </header>
          <h2 className="mx-h3"><DecodeText text="CREDENTIALS VERIFIED" /></h2>
          <ul className="mx-creds">
            {certifications.map(c => (
              <li key={c.title}><b>[{c.badge}]</b> {c.title} — {c.issuer} ✓</li>
            ))}
            <li><b>[B.TECH]</b> {education.degree}, {education.field} — {education.institution} ({education.year}) ✓</li>
          </ul>
        </article>
      </Sec>

      {/* ── 06 / transmission row ── */}
      <Sec x={TRANS_SPOT.x + 16} z={TRANS_SPOT.z - 2} r={15} align="right">
        <article className="mx-slab mx-scroll" onWheel={stopWheel}>
          <header className="mx-slab-head">
            <span className="mx-slab-path">~/city/transmissions.feed</span>
            <span className="mx-slab-act">06 / TRANSMISSIONS</span>
          </header>
          <h2 className="mx-h3"><DecodeText text="TRANSMISSION ROW" /></h2>
          <ul className="mx-creds">
            {blogPosts.map(b => (
              <li key={b.url}>
                <a href={b.url} target="_blank" rel="noopener noreferrer">{b.title}</a>
                {' '}— {b.date} · {b.readTime}
              </li>
            ))}
          </ul>
          <p className="mx-transmissions">
            full feed: <a href={personal.medium} target="_blank" rel="noopener noreferrer">medium ↗</a>
          </p>
        </article>
      </Sec>

      {/* ── 07 / the choice ── */}
      <Sec x={PILLS_SPOT.x} z={PILLS_SPOT.z + 14} r={18}>
        <div className="mx-choice">
          <h2 className="mx-h2"><DecodeText text="RED OR BLUE?" /></h2>
          <p className="mx-choice-sub">
            You drove the whole grid, operator. One question left — and this one has no wrong answer.
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
