'use client';
import { useEffect, useRef } from 'react';

// Organic flow field via summed sine waves
function fieldAngle(x: number, y: number, t: number): number {
  const s = 0.0020;
  return (
    Math.sin(x * s + t * 0.35) * Math.cos(y * s * 0.8 + t * 0.25) * Math.PI * 2 +
    Math.sin(y * s * 1.1 - t * 0.18) * 1.1
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

// Depth layers: count, minR, maxR, minOpacity, maxOpacity, drift speed
const LAYERS = [
  { n: 90,  minR: 0.6, maxR: 1.8, minO: 0.18, maxO: 0.45, spd: 0.05 },  // deep
  { n: 55,  minR: 1.5, maxR: 2.8, minO: 0.38, maxO: 0.70, spd: 0.10 },  // mid
  { n: 25,  minR: 2.4, maxR: 5.0, minO: 0.60, maxO: 0.92, spd: 0.17 },  // near
] as const;

// Parallax shift per layer — near moves most
const PAR = [0.016, 0.040, 0.075] as const;

export default function ParticleBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cv = canvas as HTMLCanvasElement;
    const gc = ctx as CanvasRenderingContext2D;

    let W = 0, H = 0, dpr = 1, t = 0, raf = 0;
    let mx = 0, my = 0, tmx = 0, tmy = 0;
    let a1: [number, number, number] = [99, 102, 241];   // #6366f1 indigo-500
    let a2: [number, number, number] = [168, 85, 247];   // #a855f7 violet-500

    function readColors() {
      const cs = getComputedStyle(document.documentElement);
      a1 = hexToRgb(cs.getPropertyValue('--accent') || '#6366f1');
      a2 = hexToRgb(cs.getPropertyValue('--accent-2') || '#a855f7');
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
            layer,
            phase: Math.random() * Math.PI * 2,
            phaseSpd: 0.007 + Math.random() * 0.016,
          });
        }
      });
      for (let i = 0; i < 80; i++) spawnMote(true);
    }

    function spawnMote(stagger = false) {
      motes.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: 0, vy: 0,
        life: stagger ? Math.floor(Math.random() * 250) : 0,
        maxLife: 200 + Math.random() * 250,
      });
    }

    function tick() {
      t += 0.006;
      mx = lerp(mx, tmx, 0.05);
      my = lerp(my, tmy, 0.05);

      gc.clearRect(0, 0, W, H);
      const [r1, g1, b1] = a1;
      const [r2, g2, b2] = a2;

      // ── Ambient drift blobs ─────────────────────────────────────────────
      // Three large soft gradient orbs that slowly orbit the viewport
      const blobs = [
        { bx: (0.15 + Math.sin(t * 0.10) * 0.14) * W,  by: (0.30 + Math.cos(t * 0.08) * 0.12) * H,  radius: Math.min(W, H) * 0.42, c: a1 },
        { bx: (0.85 + Math.sin(t * 0.09 + 2) * 0.12) * W, by: (0.70 + Math.cos(t * 0.11) * 0.10) * H, radius: Math.min(W, H) * 0.36, c: a2 },
        { bx: (0.50 + Math.sin(t * 0.07 + 4) * 0.18) * W, by: (0.15 + Math.cos(t * 0.09 + 1) * 0.08) * H, radius: Math.min(W, H) * 0.30, c: a1 },
      ];
      for (const b of blobs) {
        const g = gc.createRadialGradient(b.bx, b.by, 0, b.bx, b.by, b.radius);
        g.addColorStop(0, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0.07)`);
        g.addColorStop(0.5, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0.03)`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        gc.fillStyle = g;
        gc.fillRect(0, 0, W, H);
      }

      // ── Cursor spotlight ────────────────────────────────────────────────
      const spot = gc.createRadialGradient(mx, my, 0, mx, my, 420);
      spot.addColorStop(0,   `rgba(${r1},${g1},${b1},0.11)`);
      spot.addColorStop(0.4, `rgba(${r1},${g1},${b1},0.05)`);
      spot.addColorStop(1,   'rgba(0,0,0,0)');
      gc.fillStyle = spot;
      gc.fillRect(0, 0, W, H);

      // ── Depth starfield with parallax ───────────────────────────────────
      const dx = mx - W * 0.5;
      const dy = my - H * 0.5;

      for (const p of stars) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -4) p.x = W + 4; else if (p.x > W + 4) p.x = -4;
        if (p.y < -4) p.y = H + 4; else if (p.y > H + 4) p.y = -4;
        p.phase += p.phaseSpd;

        const px = p.x - dx * PAR[p.layer as 0 | 1 | 2];
        const py = p.y - dy * PAR[p.layer as 0 | 1 | 2];
        const twinkle = 0.55 + 0.45 * Math.sin(p.phase);
        const mix = p.layer / 2;
        const cr = Math.round(lerp(r2, r1, mix));
        const cg = Math.round(lerp(g2, g1, mix));
        const cb = Math.round(lerp(b2, b1, mix));
        const op = p.baseOp * twinkle;

        // Large soft glow for mid + near layers
        if (p.layer >= 1) {
          const glowR = p.r * (p.layer === 2 ? 7 : 5);
          const glowG = gc.createRadialGradient(px, py, 0, px, py, glowR);
          glowG.addColorStop(0,   `rgba(${cr},${cg},${cb},${(op * 0.22).toFixed(3)})`);
          glowG.addColorStop(0.5, `rgba(${cr},${cg},${cb},${(op * 0.08).toFixed(3)})`);
          glowG.addColorStop(1,   'rgba(0,0,0,0)');
          gc.fillStyle = glowG;
          gc.beginPath();
          gc.arc(px, py, glowR, 0, Math.PI * 2);
          gc.fill();
        }

        // Core dot
        gc.beginPath();
        gc.arc(px, py, p.r, 0, Math.PI * 2);
        gc.fillStyle = `rgba(${cr},${cg},${cb},${op.toFixed(3)})`;
        gc.fill();
      }

      // ── Flow motes ──────────────────────────────────────────────────────
      for (let i = motes.length - 1; i >= 0; i--) {
        const p = motes[i];
        p.life++;

        const angle = fieldAngle(p.x, p.y, t);
        p.vx += Math.cos(angle) * 0.060;
        p.vy += Math.sin(angle) * 0.060;

        // Strong cursor pull
        const cdx = mx - p.x, cdy = my - p.y;
        const cd = Math.hypot(cdx, cdy);
        if (cd < 220 && cd > 0.5) {
          const f = ((220 - cd) / 220) * 0.40;
          p.vx += (cdx / cd) * f;
          p.vy += (cdy / cd) * f;
        }

        p.vx *= 0.90; p.vy *= 0.90;
        p.x += p.vx; p.y += p.vy;
        if (p.x < -14) p.x = W + 14; else if (p.x > W + 14) p.x = -14;
        if (p.y < -14) p.y = H + 14; else if (p.y > H + 14) p.y = -14;

        const lr = p.life / p.maxLife;
        const alpha = lr < 0.10 ? lr / 0.10 : lr > 0.90 ? (1 - lr) / 0.10 : 1;
        const spd = Math.hypot(p.vx, p.vy);
        const sz = 1.1 + spd * 0.5;

        // Wide corona
        const mG = gc.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz * 6);
        mG.addColorStop(0,   `rgba(${r1},${g1},${b1},${(alpha * 0.18).toFixed(3)})`);
        mG.addColorStop(0.6, `rgba(${r1},${g1},${b1},${(alpha * 0.06).toFixed(3)})`);
        mG.addColorStop(1,   'rgba(0,0,0,0)');
        gc.fillStyle = mG;
        gc.beginPath();
        gc.arc(p.x, p.y, sz * 6, 0, Math.PI * 2);
        gc.fill();

        // Bright core
        gc.beginPath();
        gc.arc(p.x, p.y, sz, 0, Math.PI * 2);
        gc.fillStyle = `rgba(${r1},${g1},${b1},${(alpha * 0.80).toFixed(3)})`;
        gc.fill();

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
      cv.width  = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      cv.style.width  = W + 'px';
      cv.style.height = H + 'px';
      gc.setTransform(dpr, 0, 0, dpr, 0, 0);
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
