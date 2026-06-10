'use client';
// Orchestrator of NEON GRID v3 — jack-in, district tracking, rotating
// checkpoints + rank, operator lines, idle detection, terminal mode.
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { detectCaps, type Caps } from '@/lib/tier';
import { ZONES, zoneAt, QUESTION_POOL, RANKS, type Question } from '@/lib/grid';
import { storyBands, scrollBus } from '@/lib/scrollBus';
import BootOverlay from './BootOverlay';
import OperatorHud from './OperatorHud';
import TerminalResume from './TerminalResume';
import ActPanels, { type CheckpointResult } from './ActPanels';

const Construct = dynamic(() => import('./Construct'), { ssr: false });

const GLYPH_TITLES = ['ヴィーラ・パッラ', 'VEERA PALLA // 11Y', 'follow the white rabbit'];
const IDLE_LINE = 'You stopped. The rabbit is watching you, operator…';

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
  const lastMove = useRef(0);
  const lastPos = useRef({ x: 0, z: 30 });
  const idleRef = useRef(false);
  const zoneRef = useRef(0);
  const visitedRef = useRef<Set<number>>(new Set([0]));
  const quipTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
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

  // tab title life sign
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

  // collect story bands for 2D proximity fades
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
    if (!visitedRef.current.has(zo.idx) && Math.hypot(x - zo.x, z - zo.z) < 26) {
      visitedRef.current = new Set(visitedRef.current).add(zo.idx);
      setVisited(visitedRef.current);
    }
    if (progressRef.current) {
      progressRef.current.style.width = `${(visitedRef.current.size / ZONES.length) * 100}%`;
    }

    const now = performance.now();
    if (Math.hypot(x - lastPos.current.x, z - lastPos.current.z) > 0.04) {
      lastPos.current = { x, z };
      lastMove.current = now;
      if (idleRef.current) { idleRef.current = false; setIdle(false); }
    } else if (!idleRef.current && now - lastMove.current > 5000) {
      idleRef.current = true;
      setIdle(true);
    }
  }, []);

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
          {/* portal-crossing flash tint */}
          <div ref={warpRef} className="mx-warp" aria-hidden="true" />
          {booted && (
            <OperatorHud
              code={zone.code}
              rank={`SECTORS ${visited.size}/8 · RANK ${score}/6 · ${rank}`}
              line={line}
              progressRef={progressRef}
            />
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
