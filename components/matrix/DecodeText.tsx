'use client';
// Glyph-decode reveal — characters cycle katakana before settling.
// `active={false}` keeps it scrambling forever (counter-style); flipping to
// true runs the settle. Reduced motion → instant text.
import { useEffect, useRef, useState } from 'react';

const POOL = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ0123456789<>*+=';

export default function DecodeText({
  text, className, once = true, speed = 28, active = true,
}: { text: string; className?: string; once?: boolean; speed?: number; active?: boolean }) {
  const [out, setOut] = useState(text);
  const ref = useRef<HTMLSpanElement>(null);
  const played = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOut(text);
      return;
    }

    let interval: ReturnType<typeof setInterval> | undefined;

    if (!active) {
      // hold: pure counter scramble, never settles
      played.current = false;
      interval = setInterval(() => {
        let s = '';
        for (let i = 0; i < text.length; i++) {
          s += text[i] === ' ' ? ' ' : POOL[(Math.random() * POOL.length) | 0];
        }
        setOut(s);
      }, 1000 / Math.min(speed, 18));
      return () => clearInterval(interval);
    }

    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || (once && played.current)) return;
      played.current = true;
      let frame = 0;
      const total = text.length * 3 + 12;
      clearInterval(interval);
      interval = setInterval(() => {
        frame++;
        const settled = Math.floor((frame / total) * text.length * 1.4);
        let s = '';
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          if (ch === ' ' || i < settled) s += ch;
          else s += POOL[(Math.random() * POOL.length) | 0];
        }
        setOut(s);
        if (settled >= text.length) {
          setOut(text);
          clearInterval(interval);
        }
      }, 1000 / speed);
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => { obs.disconnect(); clearInterval(interval); };
  }, [text, once, speed, active]);

  return <span ref={ref} className={className}>{out}</span>;
}
