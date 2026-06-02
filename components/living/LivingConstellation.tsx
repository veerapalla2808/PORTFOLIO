'use client';
import { useEffect, useRef } from 'react';
import { personal, skillCategories, experiences, projects } from '@/lib/data';

// A living, generative constellation. Name at the core; clusters of drifting
// particles self-arrange organically (different every load), breathe, link with
// filaments, react to the cursor, and open into content when clicked.

const skillsN = Math.min(30, skillCategories.reduce((a, c) => a + c.skills.length, 0));
export const CLUSTERS = [
  { id: 'about', label: 'About', n: 10 },
  { id: 'skills', label: 'Skills', n: skillsN },
  { id: 'experience', label: 'Experience', n: experiences.length * 4 },
  { id: 'projects', label: 'Projects', n: Math.max(8, projects.length * 6) },
  { id: 'contact', label: 'Contact', n: 6 },
];

type Kind = 'core' | 'cluster' | 'particle';
interface Node {
  x: number; y: number; vx: number; vy: number;
  hx: number; hy: number; cl: number; kind: Kind; r: number; ph: number; fr: number;
}

export default function LivingConstellation({
  onOpen, dimmed,
}: { onOpen?: (id: string) => void; dimmed?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<(HTMLDivElement | HTMLButtonElement | null)[]>([]);
  const onOpenRef = useRef(onOpen);
  const dimRef = useRef(!!dimmed);
  useEffect(() => { onOpenRef.current = onOpen; }, [onOpen]);
  useEffect(() => { dimRef.current = !!dimmed; }, [dimmed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W = 0, H = 0, dpr = 1, raf = 0, t = 0;
    const mouse = { x: -9999, y: -9999 };
    let nodes: Node[] = [];
    const labelNodes: number[] = [];
    const rnd = (a = 1) => Math.random() * a;

    function seed() {
      nodes = []; labelNodes.length = 0;
      const cx = W / 2, cy = H / 2, minD = Math.min(W, H);
      labelNodes.push(nodes.length);
      nodes.push({ x: cx + rnd(40) - 20, y: cy + rnd(40) - 20, vx: 0, vy: 0, hx: cx, hy: cy, cl: -1, kind: 'core', r: 5, ph: rnd(6.28), fr: 0.3 });
      const base = rnd(6.28);
      const homes: Array<{ x: number; y: number }> = [];
      // Spread clusters across the full viewport (elliptical, width- & height-aware)
      // so the constellation fills the screen instead of bunching in the centre.
      const marginX = Math.min(140, W * 0.08);
      const marginY = Math.min(120, H * 0.12);
      const rxMax = (W / 2) - marginX;   // reach close to the side edges
      const ryMax = (H / 2) - marginY;
      CLUSTERS.forEach((c, i) => {
        const ang = base + (i / CLUSTERS.length) * Math.PI * 2 + (rnd(0.5) - 0.25);
        const rx = rxMax * (0.62 + rnd(0.38));
        const ry = ryMax * (0.58 + rnd(0.42));
        const hx = cx + Math.cos(ang) * rx;
        const hy = cy + Math.sin(ang) * ry;
        homes.push({ x: hx, y: hy });
        labelNodes.push(nodes.length);
        nodes.push({ x: hx + rnd(60) - 30, y: hy + rnd(60) - 30, vx: 0, vy: 0, hx, hy, cl: i, kind: 'cluster', r: 3.2, ph: rnd(6.28), fr: 0.18 + rnd(0.1) });
      });
      CLUSTERS.forEach((c, i) => {
        for (let k = 0; k < c.n; k++) {
          const a = rnd(6.28), rr = minD * (0.04 + rnd(0.11));
          const hx = homes[i].x + Math.cos(a) * rr, hy = homes[i].y + Math.sin(a) * rr;
          nodes.push({ x: hx + rnd(80) - 40, y: hy + rnd(80) - 40, vx: 0, vy: 0, hx, hy, cl: i, kind: 'particle', r: 0.8 + rnd(1.4), ph: rnd(6.28), fr: 0.25 + rnd(0.4) });
        }
      });
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas!.width = Math.round(W * dpr); canvas!.height = Math.round(H * dpr);
      canvas!.style.width = W + 'px'; canvas!.style.height = H + 'px';
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function step() {
      t += 0.016;
      const dim = dimRef.current ? 0.18 : 1;
      for (const n of nodes) {
        const driftX = reduce ? 0 : Math.sin(t * n.fr + n.ph) * (n.kind === 'particle' ? 10 : 18);
        const driftY = reduce ? 0 : Math.cos(t * n.fr * 0.9 + n.ph) * (n.kind === 'particle' ? 10 : 14);
        n.vx += (n.hx + driftX - n.x) * (n.kind === 'core' ? 0.02 : 0.012);
        n.vy += (n.hy + driftY - n.y) * (n.kind === 'core' ? 0.02 : 0.012);
        if (!dimRef.current) {
          const dxm = n.x - mouse.x, dym = n.y - mouse.y, dm = Math.hypot(dxm, dym);
          if (dm < 150 && dm > 0.1) { const f = ((150 - dm) / 150) * 2.2; n.vx += (dxm / dm) * f; n.vy += (dym / dm) * f; }
        }
      }
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < 1600 && d2 > 0.01) {
            const d = Math.sqrt(d2), f = (1 - d / 40) * 0.5, ux = dx / d, uy = dy / d;
            a.vx += ux * f; a.vy += uy * f; b.vx -= ux * f; b.vy -= uy * f;
          }
        }
      }
      for (const n of nodes) { n.vx *= 0.86; n.vy *= 0.86; n.x += n.vx; n.y += n.vy; }

      ctx!.clearRect(0, 0, W, H);
      ctx!.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          const structural = (a.kind === 'core' && b.kind === 'cluster') ||
            (a.cl === b.cl && (a.kind === 'cluster' || b.kind === 'cluster'));
          if (structural && d2 < 90000) {
            const pulse = 0.6 + 0.4 * Math.sin(t * 1.6 + i * 0.4);
            ctx!.strokeStyle = `rgba(126,240,208,${(0.2 * pulse * (1 - Math.sqrt(d2) / 300) * dim).toFixed(3)})`;
            ctx!.beginPath(); ctx!.moveTo(a.x, a.y); ctx!.lineTo(b.x, b.y); ctx!.stroke();
          } else if (d2 < 6400) {
            ctx!.strokeStyle = `rgba(170,200,210,${(0.12 * (1 - Math.sqrt(d2) / 80) * dim).toFixed(3)})`;
            ctx!.beginPath(); ctx!.moveTo(a.x, a.y); ctx!.lineTo(b.x, b.y); ctx!.stroke();
          }
        }
      }
      for (const n of nodes) {
        const twinkle = n.kind === 'particle' ? 0.7 + 0.3 * Math.sin(t * 2 + n.ph) : 1;
        const glow = n.kind === 'particle' ? n.r * 4 : n.r * 6;
        const col = n.kind === 'particle' ? '210,224,230' : '126,240,208';
        const g = ctx!.createRadialGradient(n.x, n.y, 0, n.x, n.y, glow);
        g.addColorStop(0, `rgba(${col},${((n.kind === 'particle' ? 0.5 : 0.85) * twinkle * dim).toFixed(3)})`);
        g.addColorStop(1, `rgba(${col},0)`);
        ctx!.fillStyle = g;
        ctx!.beginPath(); ctx!.arc(n.x, n.y, glow, 0, 6.2832); ctx!.fill();
        ctx!.fillStyle = `rgba(${col},${(0.95 * dim).toFixed(3)})`;
        ctx!.beginPath(); ctx!.arc(n.x, n.y, n.r, 0, 6.2832); ctx!.fill();
      }
      for (let li = 0; li < labelNodes.length; li++) {
        const el = labelRefs.current[li], n = nodes[labelNodes[li]];
        if (el && n) el.style.transform = `translate(-50%,-50%) translate(${n.x}px, ${n.y}px)`;
      }
      raf = requestAnimationFrame(step);
    }

    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseout', onLeave);
    window.addEventListener('resize', resize);
    resize(); step();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onLeave);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="lc-root">
      <canvas ref={canvasRef} className="lc-canvas" />
      <div className="lc-labels" style={{ opacity: dimmed ? 0.25 : 1, transition: 'opacity 0.5s ease' }}>
        <div ref={(el) => { labelRefs.current[0] = el; }} className="lc-core-label">
          <span className="lc-core-name">{personal.name}</span>
          <span className="lc-core-sub">{personal.title}</span>
        </div>
        {CLUSTERS.map((c, i) => (
          <button
            key={c.id}
            ref={(el) => { labelRefs.current[i + 1] = el; }}
            className="lc-cluster-label"
            onClick={() => onOpenRef.current?.(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
