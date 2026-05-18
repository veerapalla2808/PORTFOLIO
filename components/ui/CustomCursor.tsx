'use client';
import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const dotX  = useMotionValue(-100);
  const dotY  = useMotionValue(-100);
  const ringX = useSpring(dotX, { stiffness: 150, damping: 18 });
  const ringY = useSpring(dotY, { stiffness: 150, damping: 18 });
  const scale = useSpring(1,   { stiffness: 200, damping: 20 });
  const isVisible = useRef(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      if (!isVisible.current) isVisible.current = true;
    };

    const onEnterInteractive = () => scale.set(2);
    const onLeaveInteractive = () => scale.set(1);

    const interactiveSelectors =
      'a, button, [role="button"], input, textarea, select, [tabindex]';

    const attachListeners = () => {
      document.querySelectorAll<HTMLElement>(interactiveSelectors).forEach(el => {
        el.addEventListener('mouseenter', onEnterInteractive);
        el.addEventListener('mouseleave', onLeaveInteractive);
      });
    };

    window.addEventListener('mousemove', onMove);
    attachListeners();

    const observer = new MutationObserver(attachListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      observer.disconnect();
    };
  }, [dotX, dotY, scale]);

  return (
    <>
      {/* Small dot — instant */}
      <motion.div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0, left: 0,
          x: dotX, y: dotY,
          translateX: '-50%',
          translateY: '-50%',
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--accent)',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      />
      {/* Ring — spring lag */}
      <motion.div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0, left: 0,
          x: ringX, y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          scale,
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '1.5px solid var(--accent)',
          opacity: 0.6,
          pointerEvents: 'none',
          zIndex: 9998,
        }}
      />
    </>
  );
}
