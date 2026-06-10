'use client';
// The story/UI layer of THE GRID — fixed bands that fade in around their
// world position. Gates carry the Operator's questions; zone panels decrypt
// once unlocked; tower/anomaly panels reveal after you interact in 3D.
import { useState } from 'react';
import DecodeText from './DecodeText';
import { ox, GATES, SKIP_LABEL, SKIP_QUIP, CORE_X, RACKS_X, TOWER_X, ANOM_X, PILL_X, type Gate } from '@/lib/grid';
import {
  personal, stats, experiences, projects, skillCategories,
  certifications, education,
} from '@/lib/data';

function Sec({
  o, align = 'center', fade = 0.05, children,
}: { o: number; align?: 'left' | 'right' | 'center'; fade?: number; children: React.ReactNode }) {
  return (
    <section className={`mx-sec mx-sec-${align}`} data-o={o} data-fade={fade}>
      {children}
    </section>
  );
}

function Encrypted({ label }: { label: string }) {
  return (
    <div className="mx-encrypted">
      <p className="mx-encrypted-glyphs" aria-hidden="true">アクセス拒否 ▚▞▚ 暗号化 ▞▚▞ ロック</p>
      <p className="mx-encrypted-label">{label} — ENCRYPTED</p>
      <p className="mx-encrypted-hint">answer the Operator at the gate to decrypt</p>
    </div>
  );
}

// ── gate terminal ────────────────────────────────────────────────────────────
function GatePanel({
  gate, unlocked, onUnlock,
}: { gate: Gate; unlocked: boolean; onUnlock: (quip: string) => void }) {
  const [sass, setSass] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const pick = (i: number) => {
    if (done || unlocked) return;
    if (i === gate.correct) {
      setDone(true);
      setSass(gate.win);
      onUnlock(gate.win);
    } else {
      setSass(gate.sass[i]);
    }
  };
  const skip = () => {
    if (done || unlocked) return;
    setDone(true);
    setSass(SKIP_QUIP);
    onUnlock(SKIP_QUIP);
  };

  return (
    <article className={`mx-gate${unlocked ? ' is-open' : ''}`}>
      <header className="mx-gate-head">
        <span className="mx-gate-id vt">OPERATOR CHECKPOINT</span>
        <span className={`mx-gate-state ${unlocked ? 'ok' : ''}`}>
          {unlocked ? 'ACCESS GRANTED' : 'LOCKED'}
        </span>
      </header>
      {unlocked ? (
        <p className="mx-gate-win">{sass ?? 'ACCESS GRANTED — proceed, operator.'}</p>
      ) : (
        <>
          <p className="mx-gate-q">{gate.q}</p>
          <div className="mx-gate-opts">
            {gate.options.map((opt, i) => (
              <button key={opt} className="mx-gate-opt" onClick={() => pick(i)}>
                <span className="mx-gate-key">{String.fromCharCode(65 + i)}</span> {opt}
              </button>
            ))}
          </div>
          {sass && <p className="mx-gate-sass">{'>'} {sass}</p>}
          <button className="mx-gate-skip" onClick={skip}>{SKIP_LABEL}</button>
        </>
      )}
    </article>
  );
}

// ── the layer ────────────────────────────────────────────────────────────────
export default function ActPanels({
  unlocked, booted, onUnlock, onBlue,
}: {
  unlocked: Set<string>;
  booted: Set<string>;
  onUnlock: (zoneId: string, quip: string) => void;
  onBlue: () => void;
}) {
  return (
    <div className="mx-panels">
      {/* ── 00 / hero ── */}
      <Sec o={0} fade={0.06}>
        <div className="mx-hero">
          <p className="mx-eyebrow vt">{'>'} jacked in. welcome to the grid…</p>
          <h1 className="mx-name"><DecodeText text="VEERA PALLA" speed={20} /></h1>
          <p className="mx-hero-sub">SR. REACT.JS / NODE.JS DEVELOPER · 11 YEARS · A PLAYABLE RÉSUMÉ</p>
          <p className="mx-hero-cue">
            EXPLORE <span className="mx-cue-arrow">▶</span> — scroll, drag, or arrow keys ·
            the Operator has questions
          </p>
        </div>
      </Sec>

      {/* gates */}
      {GATES.map(g => (
        <Sec key={g.id} o={ox(g.x)} fade={0.026}>
          <GatePanel
            gate={g}
            unlocked={unlocked.has(g.unlocks)}
            onUnlock={(quip) => onUnlock(g.unlocks, quip)}
          />
        </Sec>
      ))}

      {/* ── 01 / identity ── */}
      <Sec o={ox(CORE_X)} fade={0.035} align="left">
        <article className="mx-slab mx-slab-wide">
          <header className="mx-slab-head">
            <span className="mx-slab-path">~/grid/identity.log</span>
            <span className="mx-slab-act">01 / IDENTITY</span>
          </header>
          {unlocked.has('identity') ? (
            <>
              <h2 className="mx-h2"><DecodeText text="IDENTITY" /></h2>
              <p className="mx-lead">{personal.tagline}</p>
              <p className="mx-body">
                Senior full-stack engineer operating across fintech, healthcare, retail and
                manufacturing — real-time banking systems, HIPAA-compliant platforms, and
                GenAI/LLM-assisted enterprise workflows on AWS, GCP and Azure.
              </p>
              <div className="mx-stats">
                {stats.map(s => (
                  <div key={s.label} className="mx-stat"><b>{s.value}</b><span>{s.label}</span></div>
                ))}
              </div>
            </>
          ) : <Encrypted label="IDENTITY" />}
        </article>
      </Sec>

      {/* ── 02 / arsenal ── */}
      <Sec o={ox(RACKS_X)} fade={0.035}>
        <article className="mx-slab mx-slab-wide">
          <header className="mx-slab-head">
            <span className="mx-slab-path">~/grid/arsenal.bin</span>
            <span className="mx-slab-act">02 / ARSENAL</span>
          </header>
          {unlocked.has('arsenal') ? (
            <>
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
            </>
          ) : <Encrypted label="ARSENAL" />}
        </article>
      </Sec>

      {/* ── 03 / five towers ── */}
      {experiences.map((e, i) => {
        const id = `tower-${i}`;
        const side = i % 2 === 0 ? 'right' : 'left';
        return (
          <Sec key={e.company} o={ox(TOWER_X[i])} fade={0.024} align={side as 'left' | 'right'}>
            {!unlocked.has('timeline') ? (
              <article className="mx-slab mx-slab-door"><Encrypted label={`TOWER 0${i + 1}`} /></article>
            ) : !booted.has(id) ? (
              <article className="mx-slab mx-slab-door mx-boot-hint">
                <p className="mx-door-period">TOWER 0{i + 1} / 05 · OFFLINE</p>
                <h2 className="mx-h3">{'>'} CLICK THE TOWER TO BOOT IT</h2>
                <p className="mx-body">Chapter {i + 1} of 5 is stored in this machine.</p>
              </article>
            ) : (
              <article className="mx-slab mx-slab-door">
                <header className="mx-slab-head">
                  <span className="mx-slab-path">~/towers/0{i + 1}_online</span>
                  <span className="mx-slab-act">03 / TIMELINE</span>
                </header>
                <p className="mx-door-period">{e.period} · {e.location}</p>
                <h2 className="mx-h3"><DecodeText text={e.company.toUpperCase()} /></h2>
                <p className="mx-door-role">{e.role}</p>
                <ul className="mx-bullets">
                  {e.bullets.slice(0, 4).map(b => <li key={b.slice(0, 32)}>{b}</li>)}
                </ul>
                <p className="mx-chips">{e.tech.slice(0, 12).map(t => <span key={t}>{t}</span>)}</p>
              </article>
            )}
          </Sec>
        );
      })}

      {/* ── 04 / anomalies ── */}
      {projects.map((p, i) => {
        const id = `anomaly-${i}`;
        return (
          <Sec key={p.name} o={ox(ANOM_X[i])} fade={0.026} align={i === 0 ? 'right' : 'left'}>
            {!unlocked.has('anomalies') ? (
              <article className="mx-slab mx-slab-door mx-slab-anomaly"><Encrypted label={`ANOMALY ${i + 1}`} /></article>
            ) : !booted.has(id) ? (
              <article className="mx-slab mx-slab-door mx-slab-anomaly mx-boot-hint">
                <p className="mx-anomaly-status">ANOMALY {i + 1}/2 — <em className="bad">ACTIVE</em></p>
                <h2 className="mx-h3">{'>'} CLICK THE MONOLITH TO CONTAIN IT</h2>
              </article>
            ) : (
              <article className="mx-slab mx-slab-door mx-slab-anomaly">
                <header className="mx-slab-head">
                  <span className="mx-slab-path">~/anomalies/case_0{i + 1}.rec</span>
                  <span className="mx-slab-act mx-red">04 / ANOMALIES</span>
                </header>
                <p className="mx-anomaly-status">ANOMALY {i + 1}/2 — <em>RESOLVED</em></p>
                <h2 className="mx-h3"><DecodeText text={p.name.toUpperCase()} /></h2>
                <p className="mx-body">{p.description}</p>
                <ul className="mx-bullets">
                  {p.highlights.slice(0, 3).map(h => <li key={h.slice(0, 32)}>{h}</li>)}
                </ul>
                <p className="mx-chips">{p.tech.slice(0, 10).map(t => <span key={t}>{t}</span>)}</p>
              </article>
            )}
          </Sec>
        );
      })}

      {/* ── 05 / the choice ── */}
      <Sec o={ox(PILL_X)} fade={0.05}>
        <div className="mx-choice">
          {unlocked.has('choice') ? (
            <>
              <h2 className="mx-h2"><DecodeText text="RED OR BLUE?" /></h2>
              <p className="mx-choice-sub">
                You played the grid, operator. One question left — and this one has no wrong answer.
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
            </>
          ) : <Encrypted label="THE CHOICE" />}
        </div>
      </Sec>
    </div>
  );
}
