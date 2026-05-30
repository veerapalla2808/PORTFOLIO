// components/galaxy/galaxyEngine.ts
// Framework-free 2D simulation: Matrix rain + parallax starfield + radial warp.
// All drawing reads colors passed in each frame so it adapts to the active theme.

export type RGB = [number, number, number];
export interface GalaxyColors { base: RGB; accent: RGB; accent2: RGB; dark: boolean; }

const GLYPHS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノﾊﾋﾌﾍﾎ0123456789ABCDEF<>/\\{}[]=*'.split('');

interface Column { chars: string[]; head: number; speed: number; }
interface Star { x: number; y: number; z: number; }

function rand(n = 1) { return Math.random() * n; }
function pick<T>(a: T[]): T { return a[(Math.random() * a.length) | 0]; }

export class GalaxyEngine {
  private W = 0; private H = 0;
  private cell = 16; private starCount = 180;
  private cols: Column[] = [];
  private stars: Star[] = [];

  configure(cell: number, starCount: number) { this.cell = cell; this.starCount = starCount; }

  resize(W: number, H: number) {
    this.W = W; this.H = H;
    const rows = Math.ceil(H / this.cell);
    const nCols = Math.ceil(W / this.cell);
    this.cols = Array.from({ length: nCols }, () => ({
      chars: Array.from({ length: rows }, () => pick(GLYPHS)),
      head: -rand(rows),
      speed: 0.18 + rand(0.5),
    }));
    this.stars = Array.from({ length: this.starCount }, () => ({ x: rand(W), y: rand(H), z: 0.2 + rand(0.8) }));
  }

  // warp: 0 = calm, 1 = full hyperspace. dt is frame delta in ~frames (1 at 60fps).
  frame(ctx: CanvasRenderingContext2D, dt: number, warp: number, c: GalaxyColors) {
    const { W, H, cell } = this;
    const [br, bg, bb] = c.base;
    const [ar, ag, ab] = c.accent;

    // Trail fade — paint the base color at low alpha so glyphs leave fading tails.
    ctx.fillStyle = `rgba(${br},${bg},${bb},${c.dark ? 0.14 : 0.20})`;
    ctx.fillRect(0, 0, W, H);

    // ── Starfield (with radial warp streaks) ─────────────────────────────────
    const cx = W / 2, cy = H / 2;
    for (const s of this.stars) {
      // gentle parallax drift downward
      s.y += (0.05 + s.z * 0.12) * dt;
      if (s.y > H) { s.y = 0; s.x = rand(W); }
      const op = (c.dark ? 0.5 : 0.25) * s.z;
      if (warp > 0.02) {
        const dx = s.x - cx, dy = s.y - cy;
        const stretch = warp * s.z * 0.9;
        ctx.strokeStyle = `rgba(${ar},${ag},${ab},${op})`;
        ctx.lineWidth = 1 + s.z;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + dx * stretch, s.y + dy * stretch);
        ctx.stroke();
      } else {
        ctx.fillStyle = `rgba(${ar},${ag},${ab},${op})`;
        ctx.fillRect(s.x, s.y, s.z * 1.6, s.z * 1.6);
      }
    }

    // ── Matrix rain ──────────────────────────────────────────────────────────
    const speedMul = 1 + warp * 6;
    ctx.font = `${cell}px var(--font-mono, monospace)`;
    ctx.textBaseline = 'top';
    const tail = 14;
    for (let i = 0; i < this.cols.length; i++) {
      const col = this.cols[i];
      col.head += col.speed * speedMul * dt;
      const headRow = Math.floor(col.head);
      const x = i * cell;
      for (let t = 0; t < tail; t++) {
        const row = headRow - t;
        if (row < 0) continue;
        const y = row * cell;
        if (y > H) continue;
        const lead = t === 0;
        const fade = (1 - t / tail) * (c.dark ? 0.85 : 0.5);
        if (lead) {
          ctx.fillStyle = c.dark ? `rgba(235,235,255,0.95)` : `rgba(${ar},${ag},${ab},0.9)`;
        } else {
          ctx.fillStyle = `rgba(${ar},${ag},${ab},${fade.toFixed(3)})`;
        }
        // occasionally mutate a glyph for shimmer
        if (Math.random() < 0.02) col.chars[row % col.chars.length] = pick(GLYPHS);
        ctx.fillText(col.chars[row % col.chars.length], x, y);
      }
      const rows = Math.ceil(H / cell);
      if (headRow - tail > rows && Math.random() < 0.5) { col.head = -rand(rows * 0.5); col.speed = 0.18 + rand(0.5); }
    }
  }

  // Single static frame for reduced-motion (no trails / no warp).
  staticFrame(ctx: CanvasRenderingContext2D, c: GalaxyColors) {
    const { W, H, cell } = this;
    const [br, bg, bb] = c.base; const [ar, ag, ab] = c.accent;
    ctx.fillStyle = `rgb(${br},${bg},${bb})`;
    ctx.fillRect(0, 0, W, H);
    for (const s of this.stars) {
      ctx.fillStyle = `rgba(${ar},${ag},${ab},${(c.dark ? 0.5 : 0.25) * s.z})`;
      ctx.fillRect(s.x, s.y, s.z * 1.6, s.z * 1.6);
    }
    ctx.font = `${cell}px monospace`; ctx.textBaseline = 'top';
    for (let i = 0; i < this.cols.length; i++) {
      const x = i * cell;
      for (let r = 0; r < 6; r++) {
        ctx.fillStyle = `rgba(${ar},${ag},${ab},${0.12 + 0.04 * r})`;
        ctx.fillText(this.cols[i].chars[r] ?? '0', x, (r + i % 5) * cell);
      }
    }
  }
}
