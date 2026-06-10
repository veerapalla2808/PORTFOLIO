'use client';
// Orchestrator of NEON GRID v4 — boot, open-world map (mini-map + D-pad +
// auto-drive Continue), districts, checkpoints + rank, terminal mode.
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { detectCaps, type Caps } from '@/lib/tier';
import {
  ZONES, zoneAt, QUESTION_POOL, RANKS, STREETS, routeBetween, type Question,
} from '@/lib/grid';
import { storyBands, scrollBus } from '@/lib/scrollBus';
import BootOverlay from './BootOverlay';
import OperatorHud from './OperatorHud';
import TerminalResume from './TerminalResume';
import ActPanels, { type CheckpointResult } from './ActPanels';

const Construct = dynamic(() => import('./Construct'), { ssr: false });

const GLYPH_TITLES = ['ヴィーラ・パッラ', 'VEERA PALLA // 11Y', 'follow the white rabbit'];
const IDLE_LINE = 'You stopped. The rabbit is watching you, operator…';

// world → mini-map projection
const MAP_W = 132, MAP_H = 150;
const mapX = (x: number) => ((x + 105) / 210) * MAP_W;
const mapY = (z: number) => ((52 - z) / 264) * MAP_H;

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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount detect + per-visit question rotation (SSR-safe)
    setCaps(detectCaps());
    const pool = [...QUESTION_POOL];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setQuestions(pool.slice(0, 6));
    lastMove.current = performance.now();
  }, []);

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
      });
    }
  }, [mode, caps, questions, results, interacted]);

  const drawMap = useCallback((x: number, z: number) => {
    const cv = mapRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, MAP_W, MAP_H);
    // streets
    ctx.strokeStyle = 'rgba(102,176,255,0.45)';
    ctx.lineWidth = 2;
    for (const s of STREETS) {
      ctx.beginPath();
      ctx.moveTo(mapX(s.a[0]), mapY(s.a[1]));
      ctx.lineTo(mapX(s.b[0]), mapY(s.b[1]));
      ctx.stroke();
    }
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

  const onFrame = useCallback((x: number, z: number) => {
    for (const b of storyBands) {
      const d = Math.hypot(x - b.x, z - b.z) / b.r;
      const op = Math.max(0, 1 - d * d);
      b.el.style.opacity = op.toFixed(3);
      b.el.style.visibility = op <= 0.01 ? 'hidden' : 'visible';
    }
    if (warpRef.current) warpRef.current.style.opacity = (scrollBus.warp * 0.4).toFixed(3);

    const zo = zoneAt(x, z);
    if (zo.idx !== zoneRef.current) { zoneRef.current = zo.idx; setZoneIdx(zo.idx); }
    if (!visitedRef.current.has(zo.idx) && Math.hypot(x - zo.x, z - zo.z) < 24) {
      visitedRef.current = new Set(visitedRef.current).add(zo.idx);
      setVisited(visitedRef.current);
    }
    if (progressRef.current) {
      progressRef.current.style.width = `${(visitedRef.current.size / ZONES.length) * 100}%`;
    }
    drawMap(x, z);

    const now = performance.now();
    if (Math.hypot(x - lastPos.current.x, z - lastPos.current.z) > 0.04) {
      lastPos.current = { x, z };
      lastMove.current = now;
      if (idleRef.current) { idleRef.current = false; setIdle(false); }
    } else if (!idleRef.current && now - lastMove.current > 5000) {
      idleRef.current = true;
      setIdle(true);
    }
  }, [drawMap]);

  const sayQuip = useCallback((text: string) => {
    clearTimeout(quipTimer.current);
    setQuip(text);
    quipTimer.current = setTimeout(() => setQuip(null), 5200);
  }, []);

  const onResult = useCallback((index: number, r: CheckpointResult, line: string) => {
    setResults(prev => ({ ...prev, [index]: r }));
    sayQuip(line);
  }, [sayQuip]);

  const onBoot = useCallback((id: string) => {
    setInteracted(prev => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);

  // CONTINUE — auto-drive to the next unvisited district (or the choice)
  const nextTarget = ZONES.find(z => z.idx !== 0 && !visited.has(z.idx)) ?? ZONES[ZONES.length - 1];
  const goNext = useCallback(() => {
    const t = ZONES.find(z => z.idx !== 0 && !visitedRef.current.has(z.idx)) ?? ZONES[ZONES.length - 1];
    const route = routeBetween(scrollBus.x, scrollBus.z, t.x, t.z);
    scrollBus.route.length = 0;
    scrollBus.route.push(...route);
    sayQuip(`Auto-driving to ${t.code.split('/')[1]?.trim() ?? t.id.toUpperCase()}. Touch anything to take the wheel.`);
  }, [sayQuip]);

  const goTerminal = useCallback(() => setMode('terminal'), []);
  const goConstruct = useCallback(() => setMode('construct'), []);
  const onRed = useCallback(() => { window.location.href = 'mailto:veerapalla.work28@gmail.com'; }, []);

  if (!caps) return <div className="mx-void" aria-hidden="true" />;

  const score = Object.values(results).filter(r => r.state === 'correct').length;
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
            onFrame={onFrame}
            onBoot={onBoot}
            onRed={onRed}
            onBlue={goTerminal}
          />
          <div className="mx-story" aria-hidden={!booted}>
            <div ref={storyRef} className="mx-story-track">
              <ActPanels
                questions={questions}
                results={results}
                onResult={onResult}
                booted={interacted}
                onBlue={goTerminal}
              />
            </div>
          </div>
          <div ref={warpRef} className="mx-warp" aria-hidden="true" />
          {booted && (
            <>
              <OperatorHud
                code={zone.code}
                rank={`DISTRICTS ${visited.size}/${ZONES.length} · RANK ${score}/6 · ${rank}`}
                line={line}
                progressRef={progressRef}
              />
              {/* live mini-map — where you are, where you've been, where to go */}
              <div className="mx-map" aria-label="City map">
                <canvas ref={mapRef} width={MAP_W} height={MAP_H} />
                <p className="mx-map-label">{zone.code}</p>
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
            </>
          )}
          {!booted && <BootOverlay onDone={() => setBooted(true)} />}
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
