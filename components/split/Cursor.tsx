'use client';
// An additive cursor companion — a terminal block on the dark side, a
// precision caret on the light side. It trails the real pointer (which stays
// visible, so clicks are precise) and grows over interactive elements.
// Disabled on touch and reduced-motion.
import { useEffect, useRef } from 'react';

export default function Cursor({ theme }: { theme: 'light' | 'dark' }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ref.current;
    if (!el) return;

    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let tx = x, ty = y, raf = 0;

    const move = (e: PointerEvent) => { tx = e.clientX; ty = e.clientY; el.style.opacity = '1'; };
    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      el.classList.toggle('is-hot', !!(t && t.closest('a,button,.door,.role,.stack-card,.metric')));
    };
    const leave = () => { el.style.opacity = '0'; };

    const loop = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      el.style.transform = `translate(${x}px, ${y}px)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', over, { passive: true });
    document.addEventListener('pointerleave', leave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
      document.removeEventListener('pointerleave', leave);
    };
  }, []);

  return <div ref={ref} className="cursor" data-cursor={theme} aria-hidden="true" />;
}
