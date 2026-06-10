'use client';
// Orchestrator of THE GRID — jack-in boot, zone/gate state, operator lines,
// idle detection, terminal mode.
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { detectCaps, type Caps } from '@/lib/tier';
import { ZONES, zoneAt } from '@/lib/grid';
import { storyBands } from '@/lib/scrollBus';
import BootOverlay from './BootOverlay';
import OperatorHud from './OperatorHud';
import TerminalResume from './TerminalResume';
import ActPanels from './ActPanels';

const Construct = dynamic(() => import('./Construct'), { ssr: false });

const GLYPH_TITLES = ['ヴィーラ・パッラ', 'VEERA PALLA // 11Y', 'follow the white rabbit'];
const IDLE_LINE = 'You stopped. The rabbit is watching you, operator…';

export default function MatrixApp() {
  const [caps, setCaps] = useState<Caps | null>(null);
  const [booted, setBooted] = useState(false);
  const [mode, setMode] = useState<'construct' | 'terminal'>('construct');
  const [zoneIdx, setZoneIdx] = useState(0);
  const [idle, setIdle] = useState(false);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set(['gate']));
  const [interacted, setInteracted] = useState<Set<string>>(new Set());
  const [quip, setQuip] = useState<string | null>(null);

  const progressRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const lastMove = useRef(0);
  const lastOffset = useRef(0);
  const idleRef = useRef(false);
  const zoneRef = useRef(0);
  const quipTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount capability detect (SSR-safe)
    setCaps(detectCaps());
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

  // collect story bands for proximity fades
  useEffect(() => {
    storyBands.length = 0;
    if (mode !== 'construct') return;
    const root = storyRef.current;
    if (!root) return;
    for (const el of Array.from(root.querySelectorAll<HTMLElement>('.mx-sec'))) {
      storyBands.push({
        el,
        o: parseFloat(el.dataset.o ?? '0'),
        fade: parseFloat(el.dataset.fade ?? '0.05'),
      });
    }
  }, [mode, caps, unlocked, interacted]);

  const onFrame = useCallback((offset: number) => {
    for (const b of storyBands) {
      const d = Math.abs(offset - b.o) / b.fade;
      const op = Math.max(0, 1 - d * d);
      b.el.style.opacity = op.toFixed(3);
      b.el.style.visibility = op <= 0.01 ? 'hidden' : 'visible';
    }
    if (progressRef.current) progressRef.current.style.width = `${offset * 100}%`;
    const z = zoneAt(offset).idx;
    if (z !== zoneRef.current) { zoneRef.current = z; setZoneIdx(z); }
    const now = performance.now();
    if (Math.abs(offset - lastOffset.current) > 0.0004) {
      lastOffset.current = offset;
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
    quipTimer.current = setTimeout(() => setQuip(null), 5000);
  }, []);

  const onUnlock = useCallback((zoneId: string, gateQuip: string) => {
    setUnlocked(prev => new Set(prev).add(zoneId));
    sayQuip(gateQuip);
  }, [sayQuip]);

  const onBoot = useCallback((id: string) => {
    setInteracted(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev).add(id);
      return next;
    });
  }, []);

  const goTerminal = useCallback(() => setMode('terminal'), []);
  const goConstruct = useCallback(() => setMode('construct'), []);
  const onRed = useCallback(() => { window.location.href = 'mailto:veerapalla.work28@gmail.com'; }, []);

  if (!caps) return <div className="mx-void" aria-hidden="true" />;

  const zone = ZONES[zoneIdx];
  const line = quip ?? (idle ? IDLE_LINE : zone.line);

  return (
    <div className="mx-root">
      {mode === 'construct' ? (
        <>
          <Construct
            caps={caps}
            zoneIdx={zoneIdx}
            idle={idle}
            unlocked={unlocked}
            booted={interacted}
            onFrame={onFrame}
            onBoot={onBoot}
            onRed={onRed}
            onBlue={goTerminal}
          />
          <div className="mx-story" aria-hidden={!booted}>
            <div ref={storyRef} className="mx-story-track">
              <ActPanels
                unlocked={unlocked}
                booted={interacted}
                onUnlock={onUnlock}
                onBlue={goTerminal}
              />
            </div>
          </div>
          {booted && <OperatorHud code={zone.code} line={line} progressRef={progressRef} />}
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
