'use client';
// Magnetic wave-particle field (Antigravity-style).
// A dot grid that breathes with layered sine waves (pulsating wave) and
// scatters away from the cursor (magnetic repulsion). Colors lerp between
// themes so switching sides recolors smoothly. Canvas 2D — cheap, 60fps.
import { useEffect, useRef } from 'react';

type Theme = 'light' | 'dark';

// dot color per theme, as [r,g,b]
const COLOR: Record<Theme, [number, number, number]> = {
  dark: [128, 152, 255],
  light: [34, 58, 140],
};

export default function ParticleField({ theme, tint }: { theme: Theme; tint?: Theme | null }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef<Theme>(tint ?? theme);

  // keep the animation loop reading the latest target without re-subscribing
  useEffect(() => { targetRef.current = tint ?? theme; }, [tint, theme]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0, h = 0, dpr = 1, spacing = 30, cols = 0, rows = 0, raf = 0;
    const t0 = performance.now();
    const mouse = { x: -9999, y: -9999, active: false };
    let mix = targetRef.current === 'light' ? 1 : 0; // 0 = dark, 1 = light

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      spacing = w < 640 ? 34 : 28;
      cols = Math.ceil(w / spacing) + 2;
      rows = Math.ceil(h / spacing) + 2;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.active = true;
    };
    const onLeave = () => { mouse.active = false; mouse.x = -9999; mouse.y = -9999; };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);

    // scroll velocity feeds a ripple into the wave amplitude
    let scrollV = 0;
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      scrollV = Math.min(1.4, scrollV + Math.abs(y - lastY) / 90);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const R = 165; // magnetic radius

    const frame = (now: number) => {
      const t = (now - t0) / 1000;
      // ease theme mix toward target
      const goal = targetRef.current === 'light' ? 1 : 0;
      mix += (goal - mix) * 0.06;
      const r = Math.round(COLOR.dark[0] + (COLOR.light[0] - COLOR.dark[0]) * mix);
      const g = Math.round(COLOR.dark[1] + (COLOR.light[1] - COLOR.dark[1]) * mix);
      const b = Math.round(COLOR.dark[2] + (COLOR.light[2] - COLOR.dark[2]) * mix);
      const glow = 1 - mix * 0.45; // dark side glows a touch stronger

      scrollV *= 0.92; // decay the scroll ripple
      const amp = 1 + scrollV * 1.4;

      ctx.clearRect(0, 0, w, h);
      const cx = w * 0.5, cy = h * 0.42;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          let px = i * spacing;
          let py = j * spacing;

          // pulsating wave: a ring rippling out from center + a drifting swell,
          // amplified briefly by scroll velocity
          const dx = px - cx, dy = py - cy;
          const dC = Math.sqrt(dx * dx + dy * dy);
          const wave = (Math.sin(dC * 0.016 - t * 1.9) * 0.6
            + Math.sin(px * 0.010 + t * 0.7) * 0.25
            + Math.sin(py * 0.013 - t * 0.5) * 0.15) * amp;
          const wn = wave * 0.5 + 0.5;

          let size = 0.9 + wn * 1.5;
          let alpha = (0.08 + wn * 0.26) * glow;

          // magnetic repulsion + brightening near the cursor
          if (mouse.active) {
            const mdx = px - mouse.x, mdy = py - mouse.y;
            const md = Math.sqrt(mdx * mdx + mdy * mdy);
            if (md < R) {
              const f = 1 - md / R;
              const push = f * f * 30;
              const inv = md > 0.001 ? 1 / md : 0;
              px += mdx * inv * push;
              py += mdy * inv * push;
              size += f * 2.6;
              alpha += f * 0.55;
            }
          }

          // clamp: the scroll-amplified wave can drive these out of range
          size = Math.max(0.1, size);
          alpha = Math.max(0, Math.min(alpha, 1));
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.fill();
        }
      }

      if (!reduced) raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return <canvas ref={ref} className="pfield" aria-hidden="true" />;
}
