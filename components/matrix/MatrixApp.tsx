'use client';
// Orchestrator of NEON GRID v4 — boot, open-world map (mini-map + D-pad +
// auto-drive Continue), districts, checkpoints + rank, terminal mode.
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { detectCaps, type Caps } from '@/lib/tier';
import {
  ZONES, zoneAt, zoneById, QUESTION_POOL, RANKS, STREETS, CHECKPOINTS,
  routeBetween, landmarkById, GX, type Question,
} from '@/lib/grid';
import { storyBands, scrollBus } from '@/lib/scrollBus';
import BootOverlay from './BootOverlay';
import OperatorHud from './OperatorHud';
import TerminalResume from './TerminalResume';
import ActPanels, { type CheckpointResult } from './ActPanels';
import type { Burst } from './Construct';

const Construct = dynamic(() => import('./Construct'), { ssr: false });

const SAVE_KEY = 'vp-grid-save-v1';
interface SaveData { score: number; visited: number[]; interacted: string[]; shards?: number[] }

const GLYPH_TITLES = ['ヴィーラ・パッラ', 'VEERA PALLA // 11Y', 'follow the white rabbit'];
const IDLE_LINE = 'You stopped. The phoenix circles above you, operator…';

// world → mini-map projection (city spans x −145..190, z 56..−210)
const MAP_W = 170, MAP_H = 136;
const mapX = (x: number) => ((x + 145) / 335) * MAP_W;
const mapY = (z: number) => ((56 - z) / 266) * MAP_H;

export default function MatrixApp() {
  const [caps, setCaps] = useState<Caps | null>(null);
  const [booted, setBooted] = useState(false);
  const [mode, setMode] = useState<'construct' | 'terminal'>('construct');
  const [zoneIdx, setZoneIdx] = useState(0);
  const [idle, setIdle] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<Record<number, CheckpointResult>>({});
  const [interacted, setInteracted] = useState<Set<string>>(new Set());
  const [quip, setQuip] = useState<string | null>(null);
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const [score, setScore] = useState(0);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [cine, setCine] = useState(false);       // dive intro in progress
  const [topView, setTopView] = useState(false);
  const [insideId, setInsideId] = useState<string | null>(null);
  const [shards, setShards] = useState<Set<number>>(new Set());
  const restored = useRef(false);
  const burstId = useRef(1);
  const fxPulses = useRef<{ x: number; z: number; color: string; t0: number }[]>([]);
  const interiorRef = useRef<string | null>(null);

  const progressRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const warpRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLCanvasElement>(null);
  const lastMove = useRef(0);
  const lastPos = useRef({ x: 0, z: 42 });
  const idleRef = useRef(false);
  const zoneRef = useRef(0);
  const visitedRef = useRef<Set<number>>(new Set([0]));
  const quipTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    // dev/QA hook — lets E2E checks read the nav bus
    (window as unknown as { __bus?: typeof scrollBus }).__bus = scrollBus;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount detect + question rotation + save restore (SSR-safe)
    setCaps(detectCaps());
    const pool = [...QUESTION_POOL];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setQuestions(pool.slice(0, 6));
    lastMove.current = performance.now();
    // restore persistent progress
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const save = JSON.parse(raw) as SaveData;
        if (typeof save.score === 'number') setScore(save.score);
        if (Array.isArray(save.visited) && save.visited.length > 0) {
          visitedRef.current = new Set(save.visited);
          setVisited(visitedRef.current);
        }
        if (Array.isArray(save.interacted)) setInteracted(new Set(save.interacted));
        if (Array.isArray(save.shards)) setShards(new Set(save.shards));
        restored.current = true;
      }
    } catch { /* fresh start */ }
  }, []);

  // persist progress across visits
  useEffect(() => {
    if (!booted && !restored.current) return;
    try {
      const save: SaveData = { score, visited: [...visited], interacted: [...interacted], shards: [...shards] };
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch { /* storage unavailable — no problem */ }
  }, [score, visited, interacted, shards, booted]);

  // viewport watchdog — when the window moves between monitors with different
  // DPI, Chromium can leave a stale layout viewport (page renders narrower
  // than the window). Detect size/DPR drift and force a re-layout.
  useEffect(() => {
    let w = window.innerWidth, h = window.innerHeight, dpr = window.devicePixelRatio;
    const nudge = () => {
      window.dispatchEvent(new Event('resize'));
      // hard reflow of the fixed shells
      document.body.style.minHeight = '100.0001vh';
      requestAnimationFrame(() => { document.body.style.minHeight = ''; });
    };
    const tick = setInterval(() => {
      if (window.innerWidth !== w || window.innerHeight !== h || window.devicePixelRatio !== dpr) {
        w = window.innerWidth; h = window.innerHeight; dpr = window.devicePixelRatio;
        nudge();
      }
    }, 800);
    const vv = window.visualViewport;
    const onVV = () => nudge();
    vv?.addEventListener('resize', onVV);
    const mq = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    const onMq = () => nudge();
    mq.addEventListener?.('change', onMq);
    return () => {
      clearInterval(tick);
      vv?.removeEventListener('resize', onVV);
      mq.removeEventListener?.('change', onMq);
    };
  }, []);

  // exit a building cleanly: walking back out, Esc, ⏏ button — and the
  // BROWSER BACK BUTTON. Entering pushes a history state; pressing back while
  // inside pops it and steps you out instead of leaving the site.
  const exitBuilding = useCallback(() => {
    if (scrollBus.interior) scrollBus.intT = 0;
  }, []);

  useEffect(() => {
    if (insideId) {
      history.pushState({ gridInterior: insideId }, '');
    }
  }, [insideId]);

  useEffect(() => {
    const onPop = () => { if (scrollBus.interior) scrollBus.intT = 0; };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && scrollBus.interior) scrollBus.intT = 0;
    };
    window.addEventListener('popstate', onPop);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const sayQuip = useCallback((text: string) => {
    clearTimeout(quipTimer.current);
    setQuip(text);
    quipTimer.current = setTimeout(() => setQuip(null), 5200);
  }, []);

  // celebration: 3D glyph burst + mini-map pulse
  const fire = useCallback((x: number, z: number, color: string) => {
    const id = burstId.current++;
    setBursts(prev => [...prev.slice(-3), { id, x, z, color }]);
    fxPulses.current.push({ x, z, color, t0: performance.now() });
    if (fxPulses.current.length > 6) fxPulses.current.shift();
  }, []);

  // welcome back, operator
  useEffect(() => {
    if (booted && restored.current) {
      const rk = RANKS[Math.min(score, RANKS.length - 1)];
      sayQuip(`Welcome back, ${rk}. The grid remembered you.`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % GLYPH_TITLES.length;
      document.title = GLYPH_TITLES[i];
    }, 4200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    storyBands.length = 0;
    if (mode !== 'construct') return;
    const root = storyRef.current;
    if (!root) return;
    for (const el of Array.from(root.querySelectorAll<HTMLElement>('.mx-sec'))) {
      storyBands.push({
        el,
        x: parseFloat(el.dataset.x ?? '0'),
        z: parseFloat(el.dataset.z ?? '0'),
        r: parseFloat(el.dataset.r ?? '16'),
        int: el.dataset.int || undefined,
      });
    }
  }, [mode, caps, questions, results, interacted]);

  const drawMap = useCallback((x: number, z: number) => {
    const cv = mapRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, MAP_W, MAP_H);
    // streets (polylines — curves included)
    ctx.strokeStyle = 'rgba(102,176,255,0.45)';
    ctx.lineWidth = 2;
    for (const s of STREETS) {
      ctx.beginPath();
      ctx.moveTo(mapX(s.pts[0][0]), mapY(s.pts[0][1]));
      for (let i = 1; i < s.pts.length; i++) {
        ctx.lineTo(mapX(s.pts[i][0]), mapY(s.pts[i][1]));
      }
      ctx.stroke();
    }
    // the lake + the river Y (main branch flows into the lake)
    ctx.fillStyle = 'rgba(20,50,90,0.3)';
    ctx.fillRect(mapX(66), 0, MAP_W - mapX(66), MAP_H);
    ctx.fillRect(mapX(-51), mapY(28), mapX(-39) - mapX(-51), MAP_H - mapY(28));
    ctx.fillRect(mapX(-51), mapY(28), mapX(66) - mapX(-51), mapY(16) - mapY(28));
    // the elevated Loop
    ctx.strokeStyle = 'rgba(200,160,90,0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(mapX(-70), mapY(-40), mapX(-20) - mapX(-70), mapY(-150) - mapY(-40));
    // districts: hollow = unvisited, filled = visited
    for (const zo of ZONES) {
      if (zo.id === 'gate') continue;
      const px = mapX(zo.x), py = mapY(zo.z);
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      if (visitedRef.current.has(zo.idx)) {
        ctx.fillStyle = zo.accent;
        ctx.fill();
      } else {
        ctx.strokeStyle = zo.accent;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
    // celebration pulses — expanding rings where something just happened
    const now = performance.now();
    for (const fx of fxPulses.current) {
      const age = (now - fx.t0) / 1400;
      if (age > 1) continue;
      ctx.beginPath();
      ctx.arc(mapX(fx.x), mapY(fx.z), 4 + age * 12, 0, Math.PI * 2);
      ctx.strokeStyle = fx.color;
      ctx.globalAlpha = 1 - age;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // player arrow
    const px = mapX(x), py = mapY(z);
    const ang = Math.atan2(scrollBus.hx, -scrollBus.hz);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(ang);
    ctx.fillStyle = '#F4F7FF';
    ctx.shadowColor = '#F4F7FF';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(4, 4);
    ctx.lineTo(-4, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }, []);

  const frameNo = useRef(0);

  const onFrame = useCallback((x: number, z: number) => {
    frameNo.current++;
    const inside = scrollBus.interior;
    for (const b of storyBands) {
      let op = 0;
      if (inside) {
        if (b.int === inside) {
          const d = Math.abs(scrollBus.intT - b.z) / b.r;
          op = Math.max(0, 1 - d * d);
        }
      } else if (!b.int) {
        const d = Math.hypot(x - b.x, z - b.z) / b.r;
        op = Math.max(0, 1 - d * d);
      }
      if (b.lastOp !== undefined && Math.abs(op - b.lastOp) < 0.012) continue;
      b.lastOp = op;
      b.el.style.opacity = op.toFixed(3);
      b.el.style.visibility = op <= 0.01 ? 'hidden' : 'visible';
    }
    if (warpRef.current) warpRef.current.style.opacity = (scrollBus.warp * 0.55).toFixed(3);

    // enter/exit narration + exit-button UI state
    if (inside !== interiorRef.current) {
      const lm = landmarkById(inside ?? interiorRef.current ?? '');
      interiorRef.current = inside;
      setInsideId(inside);
      if (inside && lm) sayQuip(`Inside ${lm.name}. Back out, Esc, or ⏏ to leave.`);
      else if (lm) sayQuip('Back on the street, operator.');
    }

    const zo = inside ? zoneById(inside) : zoneAt(x, z);
    if (zo.idx !== zoneRef.current) { zoneRef.current = zo.idx; setZoneIdx(zo.idx); }
    if (!visitedRef.current.has(zo.idx) && Math.hypot(x - zo.x, z - zo.z) < 24) {
      visitedRef.current = new Set(visitedRef.current).add(zo.idx);
      setVisited(visitedRef.current);
      fire(zo.x, zo.z, zo.accent); // first arrival — light it up
    }
    if (progressRef.current) {
      progressRef.current.style.width = `${(visitedRef.current.size / ZONES.length) * 100}%`;
    }
    if (frameNo.current % 3 === 0) drawMap(x, z); // mini-map at ~20fps is plenty

    const now = performance.now();
    if (Math.hypot(x - lastPos.current.x, z - lastPos.current.z) > 0.04) {
      lastPos.current = { x, z };
      lastMove.current = now;
      if (idleRef.current) { idleRef.current = false; setIdle(false); }
    } else if (!idleRef.current && now - lastMove.current > 5000) {
      idleRef.current = true;
      setIdle(true);
    }
  }, [drawMap, fire, sayQuip]);

  const onBurstDone = useCallback((id: number) => {
    setBursts(prev => prev.filter(b => b.id !== id));
  }, []);

  const resultsRef = useRef(results);
  useEffect(() => { resultsRef.current = results; }, [results]);

  const onResult = useCallback((index: number, r: CheckpointResult, line: string) => {
    setResults(prev => ({ ...prev, [index]: r }));
    if (r.state === 'correct') {
      setScore(s => s + 1);
      fire(scrollBus.x, scrollBus.z, GX.violetBright);
    }
    sayQuip(line);
  }, [sayQuip, fire]);

  const onBoot = useCallback((id: string) => {
    setInteracted(prev => {
      if (prev.has(id)) return prev;
      fire(scrollBus.x, scrollBus.z, GX.blueBright);
      return new Set(prev).add(id);
    });
  }, [fire]);

  // drive-through shard pickup
  const onShard = useCallback((i: number) => {
    setShards(prev => {
      if (prev.has(i)) return prev;
      const next = new Set(prev).add(i);
      fire(scrollBus.x, scrollBus.z, GX.white);
      sayQuip(next.size >= 12
        ? 'All 12 shards. The grid has nothing left to hide from you.'
        : `Data shard secured — ${next.size}/12.`);
      return next;
    });
  }, [fire, sayQuip]);

  // the phoenix leads you to the nearest unanswered question
  const onQuest = useCallback(() => {
    const open = CHECKPOINTS
      .map((c, i) => ({ ...c, i }))
      .filter(c => {
        const r = (resultsRef.current ?? {})[c.i];
        return !r || r.state === 'wrong';
      });
    if (open.length === 0) {
      sayQuip('Nothing left to ask you. The phoenix dips a wing, operator.');
      return;
    }
    open.sort((a, b) =>
      Math.hypot(a.x - scrollBus.x, a.z - scrollBus.z) - Math.hypot(b.x - scrollBus.x, b.z - scrollBus.z));
    const t = open[0];
    const route = routeBetween(scrollBus.x, scrollBus.z, t.x, t.z);
    scrollBus.route.length = 0;
    scrollBus.route.push(...route);
    sayQuip('The phoenix knows a question you haven’t answered. Follow it.');
  }, [sayQuip]);

  // easter egg: type N-E-O (or ↑↑↓↓) → 5 seconds of free flight
  useEffect(() => {
    const st = { seq: [] as string[], lastT: 0 };
    const onKey = (e: KeyboardEvent) => {
      const now = performance.now();
      if (now - st.lastT > 1600) st.seq.length = 0;
      st.lastT = now;
      st.seq.push(e.key.toLowerCase());
      while (st.seq.length > 4) st.seq.shift();
      const s = st.seq.join(',');
      if (s.endsWith('n,e,o') || s === 'arrowup,arrowup,arrowdown,arrowdown') {
        st.seq.length = 0;
        scrollBus.flightUntil = performance.now() + 5200;
        sayQuip('There is no spoon. Enjoy the view, operator.');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sayQuip]);

  // CONTINUE — auto-drive to the next unvisited district (or the choice)
  const nextTarget = ZONES.find(z => z.idx !== 0 && !visited.has(z.idx)) ?? ZONES[ZONES.length - 1];
  const goNext = useCallback(() => {
    if (scrollBus.interior) scrollBus.intT = 0; // step outside first
    const t = ZONES.find(z => z.idx !== 0 && !visitedRef.current.has(z.idx)) ?? ZONES[ZONES.length - 1];
    const route = routeBetween(scrollBus.x, scrollBus.z, t.x, t.z);
    scrollBus.route.length = 0;
    scrollBus.route.push(...route);
    sayQuip(`Auto-driving to ${t.code.split('/')[1]?.trim() ?? t.id.toUpperCase()}. Touch anything to take the wheel.`);
  }, [sayQuip]);

  const goTerminal = useCallback(() => setMode('terminal'), []);
  const goConstruct = useCallback(() => setMode('construct'), []);
  const onRed = useCallback(() => { window.location.href = 'mailto:veerapalla.work28@gmail.com'; }, []);

  // ENTER → cinematic dive from the sky into the city gates
  const onEnter = useCallback(() => {
    setBooted(true);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    scrollBus.introUntil = performance.now() + 4200;
    setCine(true);
    setTimeout(() => {
      setCine(false);
      sayQuip('Touchdown. The city is yours, operator.');
    }, 4300);
  }, [sayQuip]);

  const toggleTop = useCallback(() => {
    setTopView(v => {
      scrollBus.topView = !v;
      return !v;
    });
  }, []);

  if (!caps) return <div className="mx-void" aria-hidden="true" />;

  const rank = RANKS[Math.min(score, RANKS.length - 1)];
  const zone = ZONES[zoneIdx];
  const line = quip ?? (idle ? IDLE_LINE : zone.line);

  return (
    <div className="mx-root">
      {mode === 'construct' ? (
        <>
          <Construct
            caps={caps}
            idle={idle}
            booted={interacted}
            bursts={bursts}
            onFrame={onFrame}
            onBoot={onBoot}
            onRed={onRed}
            onBlue={goTerminal}
            onQuest={onQuest}
            onBurstDone={onBurstDone}
            shards={shards}
            onShard={onShard}
          />
          <div className="mx-story" aria-hidden={!booted}>
            <div ref={storyRef} className="mx-story-track">
              <ActPanels
                questions={questions}
                results={results}
                onResult={onResult}
                booted={interacted}
                onBlue={goTerminal}
                cine={cine}
              />
            </div>
          </div>
          {/* dimension-travel pre-roll */}
          {cine && (
            <div className="mx-enterflash" aria-hidden="true">
              <p className="mx-enterflash-text vt">ジャック・イン</p>
              <p className="mx-enterflash-main">ENTERING THE GRID</p>
            </div>
          )}
          <div ref={warpRef} className="mx-warp" aria-hidden="true" />
          {booted && !cine && (
            <>
              <OperatorHud
                code={zone.code}
                rank={`DISTRICTS ${visited.size}/${ZONES.length} · SHARDS ${shards.size}/12 · RANK ${score}/6 · ${rank}`}
                line={line}
                progressRef={progressRef}
              />
              {/* live mini-map — where you are, where you've been, where to go */}
              <div className="mx-map" aria-label="City map">
                <canvas ref={mapRef} width={MAP_W} height={MAP_H} />
                <p className="mx-map-label">{zone.code}</p>
                <button className="mx-topview" onClick={toggleTop}>
                  {topView ? '◉ STREET VIEW' : '▣ TOP VIEW'}
                </button>
              </div>
              {/* big labeled controls — no hidden gestures */}
              <div className="mx-dpad" aria-label="Drive controls">
                <div className="mx-dpad-row">
                  <button
                    className="mx-dpad-btn"
                    aria-label="Drive forward"
                    onPointerDown={() => { scrollBus.route.length = 0; scrollBus.cmdMove = 1; }}
                    onPointerUp={() => { scrollBus.cmdMove = 0; }}
                    onPointerLeave={() => { scrollBus.cmdMove = 0; }}
                  >▲</button>
                </div>
                <div className="mx-dpad-row">
                  <button
                    className="mx-dpad-btn"
                    aria-label="Turn left"
                    onClick={() => { scrollBus.route.length = 0; scrollBus.cmdTurn = -1; }}
                  >◀</button>
                  <button
                    className="mx-dpad-btn"
                    aria-label="Drive backward"
                    onPointerDown={() => { scrollBus.route.length = 0; scrollBus.cmdMove = -1; }}
                    onPointerUp={() => { scrollBus.cmdMove = 0; }}
                    onPointerLeave={() => { scrollBus.cmdMove = 0; }}
                  >▼</button>
                  <button
                    className="mx-dpad-btn"
                    aria-label="Turn right"
                    onClick={() => { scrollBus.route.length = 0; scrollBus.cmdTurn = 1; }}
                  >▶</button>
                </div>
                <p className="mx-dpad-hint">DRIVE · TURN</p>
                <button className="mx-continue" onClick={goNext}>
                  CONTINUE ▸ {nextTarget.code.split('/')[1]?.trim() ?? 'NEXT'}
                </button>
              </div>
              {insideId && (
                <button className="mx-exit" onClick={exitBuilding}>
                  ⏏ EXIT {landmarkById(insideId)?.name ?? 'BUILDING'}
                </button>
              )}
            </>
          )}
          {!booted && <BootOverlay onDone={onEnter} />}
          <button className="mx-toggle" onClick={goTerminal}>BLUE PILL ▸ TERMINAL</button>
        </>
      ) : (
        <>
          <TerminalResume onRed={goConstruct} />
          <button className="mx-toggle" onClick={goConstruct}>RED PILL ▸ THE GRID</button>
        </>
      )}
      <div className="mx-crt" aria-hidden="true" />
    </div>
  );
}
