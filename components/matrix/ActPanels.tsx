'use client';
// DOM layer of NEON CHICAGO — outdoor bands fade by street proximity;
// interior bands live inside landmarks and key off how deep you've walked in.
import DecodeText from './DecodeText';
import {
  SPAWN, HUB, CHECKPOINTS, ERA_FLOORS, LANDMARKS,
  SKIP_LABEL, type Question,
} from '@/lib/grid';
import {
  personal, stats, experiences, projects, skillCategories,
  certifications, education, blogPosts,
} from '@/lib/data';

function Sec({
  x = 0, z, r = 16, int, align = 'center', children,
}: {
  x?: number; z: number; r?: number; int?: string;
  align?: 'left' | 'right' | 'center'; children: React.ReactNode;
}) {
  return (
    <section
      className={`mx-sec mx-sec-${align}`}
      data-x={x} data-z={z} data-r={r} data-int={int}
    >
      {children}
    </section>
  );
}

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
          {result?.state === 'correct' ? '+1 RANK' : result?.state === 'skipped' ? 'SKIPPED' : 'OPTIONAL · THE PHOENIX IS JUDGING'}
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
            onClick={() => onResult(index, { state: 'skipped' }, 'Skipped. The phoenix is updating your file.')}
          >
            {SKIP_LABEL}
          </button>
        </>
      )}
    </article>
  );
}

export default function ActPanels({
  questions, results, onResult, booted, onBlue, cine,
}: {
  questions: Question[];
  results: Record<number, CheckpointResult>;
  onResult: (index: number, r: CheckpointResult, line: string) => void;
  booted: Set<string>;
  onBlue: () => void;
  cine: boolean;
}) {
  return (
    <div className="mx-panels">
      {/* ── hero — name decodes only after the dive lands ── */}
      <Sec x={SPAWN.x} z={SPAWN.z} r={20}>
        <div className="mx-hero">
          <p className="mx-eyebrow vt">{'>'} jacked in. neon chicago, operator…</p>
          <h1 className="mx-name"><DecodeText text="VEERA PALLA" speed={16} active={!cine} /></h1>
          <p className="mx-hero-sub">SR. REACT.JS / NODE.JS DEVELOPER · 11 YEARS · A DRIVABLE RÉSUMÉ</p>
          <p className="mx-hero-cue">
            DRIVE WITH ▲▼◀▶, SCROLL OR WASD · ENTER THE TOWERS · OR HIT “CONTINUE” AND RIDE
          </p>
        </div>
      </Sec>

      {/* hub chip */}
      <Sec x={HUB.x} z={HUB.z} r={11}>
        <p className="mx-junction">
          BEAN PLAZA <em>· every tower is a chapter — check the map ↖</em>
        </p>
      </Sec>

      {/* checkpoints */}
      {questions.map((q, i) => (
        <Sec key={`cp-${i}`} x={CHECKPOINTS[i].x} z={CHECKPOINTS[i].z} r={10}>
          <Checkpoint index={i} q={q} result={results[i]} onResult={onResult} />
        </Sec>
      ))}

      {/* ── INTERIOR: Lakeside Helix — identity ── */}
      <Sec int="identity" z={16} r={11} align="left">
        <article className="mx-slab mx-slab-wide mx-scroll" onWheel={stopWheel}>
          <header className="mx-slab-head">
            <span className="mx-slab-path">~/helix/lobby.log</span>
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

      {/* ── INTERIOR: Crossbrace Tower — arsenal ── */}
      <Sec int="arsenal" z={18} r={13}>
        <article className="mx-slab mx-slab-wide mx-scroll" onWheel={stopWheel}>
          <header className="mx-slab-head">
            <span className="mx-slab-path">~/crossbrace/armory.bin</span>
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

      {/* ── INTERIOR: Spire of Eras — five floors ── */}
      <Sec int="timeline" z={4} r={6}>
        <p className="mx-junction">
          ELEVATOR ONLINE <em>· drive forward to ascend the floors · back out to exit</em>
        </p>
      </Sec>
      {experiences.map((e, i) => (
        <Sec key={e.company} int="timeline" z={ERA_FLOORS[i].t + 4} r={8} align={i % 2 === 0 ? 'left' : 'right'}>
          <article className="mx-slab mx-slab-door mx-scroll" onWheel={stopWheel}>
            <header className="mx-slab-head">
              <span className="mx-slab-path">~/spire/floor_{ERA_FLOORS[i].floor}</span>
              <span className="mx-slab-act">03 / ERA 0{i + 1}</span>
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

      {/* ── anomaly alley (open-air) ── */}
      {projects.map((p, i) => (
        <Sec key={p.name} x={10 + i * 3} z={-103 - i * 14} r={12} align={i === 0 ? 'left' : 'right'}>
          <article className="mx-slab mx-slab-door mx-slab-anomaly mx-scroll" onWheel={stopWheel}>
            <header className="mx-slab-head">
              <span className="mx-slab-path">~/alley/case_0{i + 1}.rec</span>
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

      {/* ── INTERIOR: The Needle — credentials ── */}
      <Sec int="creds" z={16} r={11}>
        <article className="mx-slab mx-scroll" onWheel={stopWheel}>
          <header className="mx-slab-head">
            <span className="mx-slab-path">~/needle/vault.sig</span>
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

      {/* ── INTERIOR: Twin Coils — transmissions ── */}
      <Sec int="transmissions" z={16} r={11}>
        <article className="mx-slab mx-scroll" onWheel={stopWheel}>
          <header className="mx-slab-head">
            <span className="mx-slab-path">~/theatre/tonights_bill.feed</span>
            <span className="mx-slab-act">06 / TRANSMISSIONS</span>
          </header>
          <h2 className="mx-h3"><DecodeText text="TONIGHT’S TRANSMISSIONS" /></h2>
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

      {/* ── INTERIOR: Grand Mart — event docks ── */}
      <Sec int="docks" z={20} r={13}>
        <article className="mx-slab mx-scroll" onWheel={stopWheel}>
          <header className="mx-slab-head">
            <span className="mx-slab-path">~/mart/stream_floor.log</span>
            <span className="mx-slab-act">07 / EVENT DOCKS</span>
          </header>
          <h2 className="mx-h3"><DecodeText text="THE STREAM FLOOR" /></h2>
          <p className="mx-body">
            Real-time, event-driven architectures for time-sensitive systems — low-latency
            streaming for banking and healthcare: retry logic, orchestration, DDD workflows
            and WebSocket fan-out.
          </p>
          <p className="mx-chips">
            {(skillCategories.find(c => c.label === 'Messaging & Streaming')?.skills ?? []).map(t => (
              <span key={t}>{t}</span>
            ))}
          </p>
        </article>
      </Sec>

      {/* ── INTERIOR: Watchtower — observatory ── */}
      <Sec int="observatory" z={18} r={12}>
        <article className="mx-slab mx-scroll" onWheel={stopWheel}>
          <header className="mx-slab-head">
            <span className="mx-slab-path">~/watchtower/uplink.watch</span>
            <span className="mx-slab-act">08 / OBSERVATORY</span>
          </header>
          <h2 className="mx-h3"><DecodeText text="THE WATCHTOWER" /></h2>
          <p className="mx-body">
            If it moves, it gets a dashboard. Observability stacks with Prometheus and
            Grafana cut MTTR by 40% — plus end-to-end tracing and alerting across every
            cloud he touches.
          </p>
          <p className="mx-chips">
            {(skillCategories.find(c => c.label === 'Monitoring & Debugging')?.skills ?? []).map(t => (
              <span key={t}>{t}</span>
            ))}
          </p>
        </article>
      </Sec>

      {/* ── the choice — end of Navy Pier ── */}
      <Sec x={160} z={-110} r={17}>
        <div className="mx-choice">
          <h2 className="mx-h2"><DecodeText text="RED OR BLUE?" /></h2>
          <p className="mx-choice-sub">
            End of the pier, operator. The wheel turns behind you — and this question has no wrong answer.
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

      {/* keep LANDMARKS referenced for tooling */}
      <span hidden>{LANDMARKS.length}</span>
    </div>
  );
}
