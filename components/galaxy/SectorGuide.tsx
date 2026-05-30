// components/galaxy/SectorGuide.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GUIDES } from './guides';
import { useWarp } from './WarpController';
import GuideAvatar from './GuideAvatar';

// Singleton HUD: shows the guide for the currently active sector. Rendered at the
// app root (no transformed ancestor) so its position:fixed resolves to the viewport.
export default function SectorGuide() {
  const { activeSector } = useWarp();
  // Remount per sector → fresh typewriter, no stale state.
  return <GuidePanel key={activeSector} sectorId={activeSector} />;
}

function GuidePanel({ sectorId }: { sectorId: string }) {
  const guide = GUIDES[sectorId];
  const { reducedMotion } = useWarp();
  const [minimized, setMinimized] = useState(false);
  const [typed, setTyped] = useState(reducedMotion ? (guide?.lines.join('  ') ?? '') : '');
  const startedRef = useRef(false);
  const line = guide?.lines.join('  ') ?? '';

  useEffect(() => {
    if (!guide || reducedMotion || startedRef.current) return;
    startedRef.current = true;
    let i = 0; let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      i += 1; setTyped(line.slice(0, i));
      if (i < line.length) timer = setTimeout(step, 22);
      else timer = setTimeout(() => setMinimized(true), 2600);
    };
    timer = setTimeout(step, 400);
    return () => clearTimeout(timer);
  }, [guide, line, reducedMotion]);

  if (!guide) return null;

  return (
    <AnimatePresence mode="wait">
      {!minimized ? (
        <motion.div
          key="panel"
          className="guide-panel"
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.4 }}
        >
          <div className={reducedMotion ? '' : 'guide-holo'}>
            <GuideAvatar variant={guide.variant} size={48} />
          </div>
          <div className="guide-body">
            <span className="guide-handle">{guide.handle}</span>
            <p className="guide-line" aria-live="polite">{typed}<span className="guide-caret" /></p>
          </div>
        </motion.div>
      ) : (
        <motion.button
          key="badge"
          className="guide-badge"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setMinimized(false)}
          aria-label={`Replay guide ${guide.handle}`}
        >
          <GuideAvatar variant={guide.variant} size={28} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
