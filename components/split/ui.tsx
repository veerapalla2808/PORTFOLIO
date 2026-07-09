'use client';
// Small UI kit for the full-bleed redesign: a scroll-triggered typewriter,
// a parallax hook, and a Material Symbols icon.
import { useEffect, useState } from 'react';

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Types the text out character-by-character the first time it scrolls in. */
export function Typed({
  text, as: Tag = 'span', className, speed = 30,
}: { text: string; as?: React.ElementType; className?: string; speed?: number }) {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!node) return;
    if (prefersReduced()) {
      const id = setTimeout(() => { setShown(text); setDone(true); }, 0);
      return () => clearTimeout(id);
    }
    let iv: ReturnType<typeof setInterval> | undefined;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let i = 0;
      iv = setInterval(() => {
        i += 1;
        setShown(text.slice(0, i));
        if (i >= text.length) { clearInterval(iv); setDone(true); }
      }, 1000 / speed);
    }, { threshold: 0.55 });
    obs.observe(node);
    return () => { obs.disconnect(); clearInterval(iv); };
  }, [node, text, speed]);

  return (
    <Tag ref={setNode} className={className} data-done={done ? '' : undefined}>
      {shown || '​'}
      <i className="type-caret" aria-hidden="true" />
    </Tag>
  );
}

/* Moves [data-parallax] elements at a fraction of scroll for depth. */
export function useParallax(dep: unknown) {
  useEffect(() => {
    if (prefersReduced()) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
    if (!els.length) return;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const vh = window.innerHeight;
      for (const el of els) {
        const speed = parseFloat(el.dataset.parallax || '0.12');
        const r = el.getBoundingClientRect();
        const fromCenter = r.top + r.height / 2 - vh / 2;
        el.style.transform = `translate3d(0, ${(-fromCenter * speed).toFixed(1)}px, 0)`;
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(paint); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [dep]);
}

export function Icon({ name, className }: { name: string; className?: string }) {
  return <span className={`msym ${className ?? ''}`} aria-hidden="true">{name}</span>;
}

// Material Symbol per skill category
export const CATEGORY_ICON: Record<string, string> = {
  Frontend: 'web',
  Backend: 'dns',
  Databases: 'database',
  Caching: 'bolt',
  Messaging: 'sync_alt',
  Cloud: 'cloud',
  'Cloud Services': 'cloud',
  'APIs & Security': 'shield_lock',
  Testing: 'science',
  'DevOps & Build': 'deployed_code',
  Monitoring: 'monitoring',
  'AI Tools & IDEs': 'smart_toy',
};
