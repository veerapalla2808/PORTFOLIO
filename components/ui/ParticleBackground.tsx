'use client';
import { useEffect, useRef } from 'react';

// Organic 2D flow field — summed sine waves, no external dep
function fieldAngle(x: number, y: number, t: number): number {
  const s = 0.0022;
  return (
    Math.sin(x * s + t * 0.38) * Math.cos(y * s * 0.8 + t * 0.28) * Math.PI * 2 +
    Math.sin(y * s * 1.2 - t * 0.18) * 0.9
  );
}

function lerp(a: number, b: number, f: number) { return a + (b - a) * f; }

function hexToRgb(raw: string): [number, number, number] {
  const s = raw.trim();
  const m = s.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (m) return [+m[1], +m[2], +m[3]];
  const hex = s.replace('#', '');
  const full = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex;
  const n = parseInt(full, 16);
  if (isNaN(n)) return [16, 185, 129];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

interface Star { x: number; y: number; vx: number; vy: number; r: number; baseOp: number; layer: number; phase: number; phaseSpd: number; }
interface Mote { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; }

// Layer config: [count, minRadius, maxRadius, minOpacity, maxOpacity, driftSpeed]
const LAYERS = [
  { n: 55, minR: 0.5, maxR: 1.4, minO: 0.10, maxO: 0.28, spd: 0.05 },
  { n: 28, minR: 1.2, maxR: 2.2, minO: 0.20, maxO: 0.44, spd: 0.10 },
  { n: 14, minR: 2.0, maxR: 3.5, minO: 0.30, maxO: 0.65, spd: 0.17 },
] as const;
// Parallax strength per layer — near layer shifts the most
const PAR = [0.013, 0.032, 0.058] as const;

export default function ParticleBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Assertions safe: we early-return above; 2d context is always non-null on a real canvas
    const cv = canvas as HTMLCanvasElement;
    const ctx = cv.getContext('2d') as CanvasRenderingContext2D;

    let W = 0, H = 0, dpr = 1, t = 0, raf = 0;
    let mx = 0, my = 0, tmx = 0, tmy = 0;
    let a1: [number, number, number] = [16, 185, 129];
    let a2: [number, number, number] = [8, 145, 178];

    function readColors() {
      const cs = getComputedStyle(document.documentElement);
      a1 = hexToRgb(cs.getPropertyValue('--accent') || '#10b981');
      a2 = hexToRgb(cs.getPropertyValue('--accent-2') || '#0891b2');
    }

    let stars: Star[] = [];
    let motes: Mote[] = [];

    function init() {
      stars = [];
      motes = [];
      LAYERS.forEach((cfg, layer) => {
        for (let i = 0; i < cfg.n; i++) {
          stars.push({
            x: Math.random() * W, y: Math.random() * H,
            vx: (Math.random() - 0.5) * cfg.spd,
            vy: (Math.random() - 0.5) * cfg.spd,
            r: cfg.minR + Math.random() * (cfg.maxR - cfg.minR),
            baseOp: cfg.minO + Math.random() * (cfg.maxO - cfg.minO),
            layer, phase: Math.random() * Math.PI * 2,
            phaseSpd: 0.008 + Math.random() * 0.018,
          });
        }
      });
      // Stagger initial lifetimes so motes don't all spawn/die at once
      for (let i = 0; i < 44; i++) spawnMote(true);
    }

    function spawnMote(stagger = false) {
      motes.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: 0, vy: 0,
        life: stagger ? Math.floor(Math.random() * 220) : 0,
        maxLife: 180 + Math.random() * 220,
      });
    }

    function tick() {
      t += 0.006;
      mx = lerp(mx, tmx, 0.05);
      my = lerp(my, tmy, 0.05);
      const dx = mx - W * 0.5;
      const dy = my - H * 0.5;

      ctx.clearRect(0, 0, W, H);
      const [r1, g1, b1] = a1;
      const [r2, g2, b2] = a2;

      // ── Depth starfield with per-layer parallax ──────────────────────────
      for (const p of stars) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -3) p.x = W + 3; else if (p.x > W + 3) p.x = -3;
        if (p.y < -3) p.y = H + 3; else if (p.y > H + 3) p.y = -3;
        p.phase += p.phaseSpd;

        const px = p.x - dx * PAR[p.layer as 0 | 1 | 2];
        const py = p.y - dy * PAR[p.layer as 0 | 1 | 2];
        const twinkle = 0.6 + 0.4 * Math.sin(p.phase);
        const mix = p.layer / 2;
        const cr = Math.round(lerp(r2, r1, mix));
        const cg = Math.round(lerp(g2, g1, mix));
        const cb = Math.round(lerp(b2, b1, mix));

        // Soft glow for mid and nearest layers
        if (p.layer >= 1) {
          ctx.beginPath();
          ctx.arc(px, py, p.r * 4.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${(p.baseOp * twinkle * 0.14).toFixed(3)})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${(p.baseOp * twinkle).toFixed(3)})`;
        ctx.fill();
      }

      // ── Flow field motes (cursor-attracted) ─────────────────────────────
      for (let i = motes.length - 1; i >= 0; i--) {
        const p = motes[i];
        p.life++;

        // Flow field steering
        const angle = fieldAngle(p.x, p.y, t);
        p.vx += Math.cos(angle) * 0.055;
        p.vy += Math.sin(angle) * 0.055;

        // Magnetic cursor pull
        const cdx = mx - p.x, cdy = my - p.y;
        const cd = Math.hypot(cdx, cdy);
        if (cd < 200 && cd > 0.5) {
          const f = ((200 - cd) / 200) * 0.28;
          p.vx += (cdx / cd) * f;
          p.vy += (cdy / cd) * f;
        }

        p.vx *= 0.91; p.vy *= 0.91;
        p.x += p.vx; p.y += p.vy;
        if (p.x < -12) p.x = W + 12; else if (p.x > W + 12) p.x = -12;
        if (p.y < -12) p.y = H + 12; else if (p.y > H + 12) p.y = -12;

        // Fade in first 12% and out last 12% of lifetime
        const lr = p.life / p.maxLife;
        const alpha = lr < 0.12 ? lr / 0.12 : lr > 0.88 ? (1 - lr) / 0.12 : 1;
        const spd = Math.hypot(p.vx, p.vy);
        const sz = 0.9 + spd * 0.4;

        // Glow corona
        ctx.beginPath();
        ctx.arc(p.x, p.y, sz * 4.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r1},${g1},${b1},${(alpha * 0.07).toFixed(3)})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r1},${g1},${b1},${(alpha * 0.55).toFixed(3)})`;
        ctx.fill();

        if (p.life >= p.maxLife) {
          motes.splice(i, 1);
          spawnMote();
        }
      }

      raf = requestAnimationFrame(tick);
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      cv.style.width = W + 'px';
      cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mx = tmx = W / 2;
      my = tmy = H / 2;
      init();
    }

    const observer = new MutationObserver(readColors);
    observer.observe(document.documentElement, {
      attributes: true, attributeFilter: ['data-theme'],
    });

    const onMove = (e: MouseEvent) => { tmx = e.clientX; tmy = e.clientY; };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('resize', resize);

    readColors();
    resize();
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}
    />
  );
}
