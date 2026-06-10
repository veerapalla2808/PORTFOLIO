'use client';
// NEON GRID v4 set pieces — an open-world map. Each district has a UNIQUE
// entry portal and its own atmosphere; the hub ties the map together.
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  GX, NEONS, STREETS, SIGNPOSTS, GATE_ARCH, HUB, IDENTITY_SPOT, ARSENAL_SPOT,
  PORTAL_XS, PORTAL_Z, ANOM_SPOTS, CREDS_SPOT, TRANS_SPOT, PILLS_SPOT,
  DISTRICT_PORTALS, ZONES, zoneAt, type DistrictPortal,
} from '@/lib/grid';
import { scrollBus } from '@/lib/scrollBus';
import { skillCategories, projects, personal, certifications, education, blogPosts, experiences } from '@/lib/data';

const rnd = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
const glow = (hex: string, k: number) => new THREE.Color(hex).multiplyScalar(k);
const setCursor = (on: boolean) => { document.body.style.cursor = on ? 'pointer' : ''; };

function distToRoads(x: number, z: number) {
  let bd = Infinity;
  for (const s of STREETS) {
    const ax = s.a[0], az = s.a[1], dx = s.b[0] - ax, dz = s.b[1] - az;
    const len2 = dx * dx + dz * dz;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / len2));
    const px = ax + dx * t, pz = az + dz * t;
    bd = Math.min(bd, (x - px) * (x - px) + (z - pz) * (z - pz));
  }
  return Math.sqrt(bd);
}

// ── canvas texture helpers ──────────────────────────────────────────────────
function windowsTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = 128; cv.height = 256;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = '#05060C';
  ctx.fillRect(0, 0, 128, 256);
  const hues = ['#9FC7FF', '#C9A8FF', '#FF9DA6', '#FFE9C4', '#7FA8E8'];
  for (let y = 6; y < 250; y += 12) {
    for (let x = 6; x < 122; x += 14) {
      if (Math.random() < 0.4) {
        ctx.fillStyle = hues[(Math.random() * hues.length) | 0];
        ctx.globalAlpha = 0.22 + Math.random() * 0.78;
        ctx.fillRect(x, y, 8, 6);
      }
    }
  }
  ctx.globalAlpha = 1;
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function textTexture(
  lines: { text: string; size: number; color: string; font?: string }[],
  w: number, h: number, border?: string,
): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = 'rgba(4,5,11,0.94)';
  ctx.fillRect(0, 0, w, h);
  if (border) {
    ctx.strokeStyle = border;
    ctx.lineWidth = Math.max(4, w * 0.012);
    ctx.shadowColor = border;
    ctx.shadowBlur = 26;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.shadowBlur = 0;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let y = h / (lines.length + 1);
  for (const l of lines) {
    ctx.font = `${l.font ?? '700'} ${l.size}px "JetBrains Mono", monospace`;
    ctx.fillStyle = l.color;
    ctx.shadowColor = l.color;
    ctx.shadowBlur = 20;
    ctx.fillText(l.text, w / 2, y);
    y += h / (lines.length + 1);
  }
  ctx.shadowBlur = 0;
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function stripesTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = 128; cv.height = 128;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = 'rgba(8,2,3,0.9)';
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = GX.red;
  ctx.lineWidth = 14;
  for (let i = -128; i < 256; i += 38) {
    ctx.beginPath();
    ctx.moveTo(i, 132);
    ctx.lineTo(i + 128, -4);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  return t;
}

// ── per-district atmosphere: fog tint follows the zone you're in ────────────
export function ZoneAmbience() {
  const tmp = useMemo(() => new THREE.Color(), []);
  useFrame((state, dt) => {
    const zo = zoneAt(scrollBus.x, scrollBus.z);
    const fog = state.scene.fog as THREE.Fog | null;
    if (fog) {
      tmp.set(zo.fog);
      fog.color.lerp(tmp, Math.min(1, dt * 1.4));
    }
  });
  return (
    <group>
      {/* district ground glow discs — you can SEE you've entered a new realm */}
      {ZONES.filter(z => z.id !== 'gate').map(z => (
        <mesh key={z.id} position={[z.x, 0.03, z.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[17, 48]} />
          <meshBasicMaterial color={glow(z.accent, 0.5)} transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

// ── city blocks (kept clear of every road) ──────────────────────────────────
export function CityBlocks({ tier }: { tier: 'S' | 'M' | 'L' }) {
  const step = tier === 'S' ? 24 : tier === 'M' ? 16 : 12;
  const winTex = useMemo(() => windowsTexture(), []);
  const { body, trim } = useMemo(() => {
    const slots: { x: number; z: number; seed: number }[] = [];
    STREETS.forEach((s, si) => {
      const ax = s.a[0], az = s.a[1];
      const dx = s.b[0] - ax, dz = s.b[1] - az;
      const len = Math.hypot(dx, dz);
      const ux = dx / len, uz = dz / len;
      const nx = -uz, nz = ux;
      for (let d = 8; d < len - 4; d += step) {
        for (const side of [-1, 1]) {
          const seed = si * 997 + d * 13 + side * 7;
          const off = 16 + rnd(seed + 1) * 12;
          const X = ax + ux * d + nx * side * off;
          const Z = az + uz * d + nz * side * off;
          if (distToRoads(X, Z) < 10) continue; // never block another street
          slots.push({ x: X, z: Z, seed });
        }
      }
    });
    const n = slots.length;
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const bodyMesh = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ map: winTex, color: '#93A9D6' }), n);
    const trimMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ toneMapped: false }), n);
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    slots.forEach((sl, i) => {
      const w = 7 + rnd(sl.seed + 2) * 8;
      const h = 16 + rnd(sl.seed + 3) * 36;
      const dpt = 7 + rnd(sl.seed + 4) * 8;
      m.compose(new THREE.Vector3(sl.x, h / 2, sl.z), new THREE.Quaternion(), new THREE.Vector3(w, h, dpt));
      bodyMesh.setMatrixAt(i, m);
      m.compose(new THREE.Vector3(sl.x, h + 0.1, sl.z), new THREE.Quaternion(), new THREE.Vector3(w * 1.02, 0.2, dpt * 1.02));
      trimMesh.setMatrixAt(i, m);
      c.set(NEONS[i % NEONS.length]).multiplyScalar(2.1);
      trimMesh.setColorAt(i, c);
    });
    bodyMesh.instanceMatrix.needsUpdate = true;
    trimMesh.instanceMatrix.needsUpdate = true;
    if (trimMesh.instanceColor) trimMesh.instanceColor.needsUpdate = true;
    return { body: bodyMesh, trim: trimMesh };
  }, [step, winTex]);

  const group = useRef<THREE.Group>(null);
  useEffect(() => {
    const g = group.current;
    if (!g) return;
    g.add(body, trim);
    return () => {
      g.remove(body, trim);
      body.geometry.dispose();
      trim.geometry.dispose();
      (body.material as THREE.Material).dispose();
      (trim.material as THREE.Material).dispose();
    };
  }, [body, trim]);
  return <group ref={group} />;
}

// ── streets — ground, grid, neon lane edges ─────────────────────────────────
export function StreetLanes() {
  const lanes = useMemo(() => {
    const out: { x: number; z: number; sx: number; sz: number; color: string }[] = [];
    STREETS.forEach((s, si) => {
      const ax = s.a[0], az = s.a[1];
      const dx = s.b[0] - ax, dz = s.b[1] - az;
      const len = Math.hypot(dx, dz);
      const ux = dx / len, uz = dz / len;
      const nx = -uz, nz = ux;
      const cx = ax + dx / 2, cz = az + dz / 2;
      const horizontal = Math.abs(ux) > 0.5;
      for (const side of [-1, 1]) {
        out.push({
          x: cx + nx * side * 4.6,
          z: cz + nz * side * 4.6,
          sx: horizontal ? len : 0.16,
          sz: horizontal ? 0.16 : len,
          color: NEONS[(si + (side === 1 ? 1 : 0)) % NEONS.length],
        });
      }
    });
    return out;
  }, []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -80]}>
        <planeGeometry args={[420, 420]} />
        <meshBasicMaterial color={'#04050B'} />
      </mesh>
      <gridHelper args={[420, 84, '#12224A', '#0A0F24']} position={[0, 0.01, -80]} />
      {lanes.map((l, i) => (
        <mesh key={i} position={[l.x, 0.06, l.z]}>
          <boxGeometry args={[l.sx, 0.1, l.sz]} />
          <meshBasicMaterial color={glow(l.color, 1.25)} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

// ── city gates — neon arch (hero backdrop) ──────────────────────────────────
export function GateArch() {
  const tex = useMemo(() => textTexture([
    { text: 'VEERA PALLA', size: 110, color: GX.white },
    { text: 'THE NEON GRID · 11 YEARS IN PRODUCTION', size: 36, color: GX.blueBright },
  ], 1280, 320, GX.violet), []);
  return (
    <group position={[GATE_ARCH.x, 0, GATE_ARCH.z]}>
      {[-9, 9].map(x => (
        <mesh key={x} position={[x, 7, 0]}>
          <boxGeometry args={[1.6, 14, 1.6]} />
          <meshStandardMaterial color={'#0A0D16'} roughness={0.45} metalness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 14.6, 0]}>
        <boxGeometry args={[21, 3.6, 1.8]} />
        <meshStandardMaterial color={'#0A0D16'} roughness={0.45} metalness={0.6} />
      </mesh>
      <mesh position={[0, 14.6, 1.0]}>
        <planeGeometry args={[19.5, 4.9]} />
        <meshBasicMaterial map={tex} transparent />
      </mesh>
      {[-9, 9].map(x => (
        <mesh key={`p${x}`} position={[x + (x > 0 ? 0.95 : -0.95), 7, 0]}>
          <boxGeometry args={[0.12, 14, 0.12]} />
          <meshBasicMaterial color={glow(x > 0 ? GX.blue : GX.red, 1.9)} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, 16.55, 0]}>
        <boxGeometry args={[21.2, 0.14, 0.14]} />
        <meshBasicMaterial color={glow(GX.violet, 2)} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ── central hub — the map's beating heart ───────────────────────────────────
export function HubBeacon({ reduced }: { reduced: boolean }) {
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  const core = useRef<THREE.Mesh>(null);
  useFrame((state, dt) => {
    if (reduced) return;
    rings.current.forEach((r, i) => {
      if (!r) return;
      r.rotation.z += dt * (i % 2 === 0 ? 0.4 : -0.3);
      r.rotation.x = Math.sin(state.clock.elapsedTime * 0.4 + i) * 0.2;
    });
    if (core.current) core.current.rotation.y += dt * 0.5;
  });
  return (
    <group position={[HUB.x, 0, HUB.z]}>
      <mesh ref={core} position={[0, 7.5, 0]}>
        <icosahedronGeometry args={[1.6, 1]} />
        <meshBasicMaterial color={glow(GX.white, 1.5)} wireframe toneMapped={false} />
      </mesh>
      {[3.2, 4.4, 5.6].map((r, i) => (
        <mesh key={r} position={[0, 7.5, 0]} ref={(m) => { rings.current[i] = m; }}>
          <torusGeometry args={[r, 0.05, 8, 64]} />
          <meshBasicMaterial color={glow(NEONS[i % NEONS.length], 1.6)} toneMapped={false} transparent opacity={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 3.2, 0]}>
        <cylinderGeometry args={[0.5, 1.1, 6.4, 12, 1, true]} />
        <meshBasicMaterial color={glow(GX.violet, 0.9)} transparent opacity={0.14} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ── junction signposts — big, labeled, data-driven ──────────────────────────
export function Signposts() {
  const posts = useMemo(() => SIGNPOSTS.map(p => ({
    x: p.x, z: p.z,
    boards: p.boards.map(b => ({
      tex: textTexture([{ text: b.text, size: 54, color: b.color }], 820, 110, b.color),
    })),
  })), []);
  return (
    <group>
      {posts.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]}>
          <mesh position={[0, 3.4, 0]}>
            <cylinderGeometry args={[0.09, 0.12, 6.8, 8]} />
            <meshStandardMaterial color={'#0B0E18'} roughness={0.5} metalness={0.6} />
          </mesh>
          {p.boards.map((b, j) => (
            <mesh key={j} position={[0, 6.2 - j * 1.25, 0]}>
              <planeGeometry args={[7.4, 1.05]} />
              <meshBasicMaterial map={b.tex} transparent side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// ── UNIQUE district portals — no two alike ──────────────────────────────────
function PortalShell({ p, children }: { p: DistrictPortal; children: React.ReactNode }) {
  return (
    <group position={[p.x, 4.6, p.z]} rotation={[0, p.rotY, 0]}>
      {children}
      <mesh position={[0, -4.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.1, 3.4, 48]} />
        <meshBasicMaterial color={glow(p.color, 1.4)} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function HexPortal({ p }: { p: DistrictPortal }) {
  const ring = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (ring.current) ring.current.rotation.z += dt * 0.25; });
  return (
    <PortalShell p={p}>
      <mesh ref={ring}>
        <torusGeometry args={[4.5, 0.2, 6, 6]} />
        <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={2} toneMapped={false} roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh>
        <circleGeometry args={[4.1, 6]} />
        <meshBasicMaterial color={glow(p.color, 0.5)} transparent opacity={0.16} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </PortalShell>
  );
}

function IndustrialPortal({ p }: { p: DistrictPortal }) {
  const tex = useMemo(() => stripesTexture(), []);
  const film = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    const m = film.current?.material as THREE.MeshBasicMaterial | undefined;
    if (m?.map) m.map.offset.x += dt * 0.18;
  });
  return (
    <PortalShell p={p}>
      {[-4.2, 4.2].map(x => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.8, 9.4, 0.8]} />
          <meshStandardMaterial color={'#0C0508'} emissive={p.color} emissiveIntensity={1.4} toneMapped={false} roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 4.4, 0]}>
        <boxGeometry args={[9.2, 0.8, 0.8]} />
        <meshStandardMaterial color={'#0C0508'} emissive={p.color} emissiveIntensity={1.4} toneMapped={false} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh ref={film} position={[0, -0.2, 0]}>
        <planeGeometry args={[7.6, 8.2]} />
        <meshBasicMaterial map={tex} transparent opacity={0.32} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </PortalShell>
  );
}

function GlitchPortal({ p }: { p: DistrictPortal }) {
  const bolts = useMemo(() => {
    const mk = (seedBase: number) => {
      const pts: number[] = [];
      let x = 0, y = -4.6;
      let i = 0;
      while (y < 4.6) {
        const nx = (rnd(seedBase + i) - 0.5) * 3.4;
        const ny = y + 0.8 + rnd(seedBase + i + 50) * 0.9;
        pts.push(x, y, 0, nx, Math.min(ny, 4.6), 0);
        x = nx; y = ny; i++;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      return g;
    };
    return [mk(11), mk(77)];
  }, []);
  const mats = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    mats.current.forEach((m, i) => {
      if (m) m.opacity = Math.sin(t * (13 + i * 5) + i) > -0.6 ? 1 : 0.15;
    });
  });
  return (
    <PortalShell p={p}>
      {bolts.map((g, i) => (
        <lineSegments key={i} geometry={g} position={[i === 0 ? -0.7 : 0.7, 0, 0]}>
          <lineBasicMaterial
            ref={(m) => { mats.current[i] = m; }}
            color={glow(i === 0 ? p.color : GX.white, 2)} toneMapped={false} transparent
          />
        </lineSegments>
      ))}
      <mesh>
        <planeGeometry args={[5.6, 9]} />
        <meshBasicMaterial color={glow(p.color, 0.4)} transparent opacity={0.1} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </PortalShell>
  );
}

function DoubleRingPortal({ p }: { p: DistrictPortal }) {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (a.current) a.current.rotation.z += dt * 0.5;
    if (b.current) b.current.rotation.z -= dt * 0.7;
  });
  return (
    <PortalShell p={p}>
      <mesh ref={a}>
        <torusGeometry args={[4.7, 0.12, 10, 64]} />
        <meshBasicMaterial color={glow(GX.white, 1.7)} toneMapped={false} />
      </mesh>
      <mesh ref={b}>
        <torusGeometry args={[3.6, 0.12, 10, 64]} />
        <meshBasicMaterial color={glow(p.color, 1.9)} toneMapped={false} />
      </mesh>
      <mesh>
        <circleGeometry args={[3.4, 48]} />
        <meshBasicMaterial color={glow(p.color, 0.5)} transparent opacity={0.14} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </PortalShell>
  );
}

function ArcsPortal({ p }: { p: DistrictPortal }) {
  const arcs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    arcs.current.forEach((m, i) => {
      if (!m) return;
      const k = 1 + Math.sin(t * 2 - i * 0.9) * 0.06;
      m.scale.setScalar(k);
      (m.material as THREE.MeshBasicMaterial).opacity = 0.55 + Math.sin(t * 2 - i * 0.9) * 0.35;
    });
  });
  return (
    <PortalShell p={p}>
      {[2.6, 3.7, 4.8].map((r, i) => (
        <mesh key={r} position={[0, -1.5, 0]} ref={(m) => { arcs.current[i] = m; }}>
          <torusGeometry args={[r, 0.14, 10, 48, Math.PI]} />
          <meshBasicMaterial color={glow(p.color, 1.8)} toneMapped={false} transparent />
        </mesh>
      ))}
    </PortalShell>
  );
}

function DiamondPortal({ p }: { p: DistrictPortal }) {
  const ring = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ring.current) ring.current.rotation.z = Math.PI / 4 + Math.sin(state.clock.elapsedTime * 0.7) * 0.08;
  });
  return (
    <PortalShell p={p}>
      <mesh ref={ring} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[4.4, 0.18, 8, 4]} />
        <meshBasicMaterial color={glow(GX.white, 1.8)} toneMapped={false} />
      </mesh>
      <mesh position={[-3.4, 0, 0]}>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshBasicMaterial color={glow(GX.red, 2.2)} toneMapped={false} />
      </mesh>
      <mesh position={[3.4, 0, 0]}>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshBasicMaterial color={glow(GX.blue, 2.2)} toneMapped={false} />
      </mesh>
    </PortalShell>
  );
}

export function DistrictPortals() {
  return (
    <>
      {DISTRICT_PORTALS.map((p, i) => {
        switch (p.kind) {
          case 'hex': return <HexPortal key={i} p={p} />;
          case 'industrial': return <IndustrialPortal key={i} p={p} />;
          case 'glitch': return <GlitchPortal key={i} p={p} />;
          case 'doublering': return <DoubleRingPortal key={i} p={p} />;
          case 'arcs': return <ArcsPortal key={i} p={p} />;
          case 'diamond': return <DiamondPortal key={i} p={p} />;
        }
      })}
    </>
  );
}

// ── identity plaza ──────────────────────────────────────────────────────────
export function IdentityHolo({ reduced }: { reduced: boolean }) {
  const card = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => textTexture([
    { text: '◢ VP', size: 92, color: GX.violetBright },
    { text: personal.name.toUpperCase(), size: 78, color: GX.white },
    { text: 'SR. REACT.JS / NODE.JS · 11 YEARS', size: 38, color: GX.blueBright },
    { text: 'FINTECH · HEALTH · RETAIL · GENAI', size: 32, color: GX.redBright },
  ], 1024, 640, GX.blue), []);
  useFrame((state) => {
    if (!card.current || reduced) return;
    const t = state.clock.elapsedTime;
    card.current.position.y = IDENTITY_SPOT.y + Math.sin(t * 0.9) * 0.35;
    card.current.rotation.y = -Math.PI / 2 + Math.sin(t * 0.4) * 0.08;
  });
  return (
    <group>
      <mesh ref={card} position={[IDENTITY_SPOT.x, IDENTITY_SPOT.y, IDENTITY_SPOT.z]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10.4, 6.5]} />
        <meshBasicMaterial map={tex} transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[IDENTITY_SPOT.x, 1.2, IDENTITY_SPOT.z]}>
        <cylinderGeometry args={[2.4, 3.2, 2.4, 24, 1, true]} />
        <meshBasicMaterial color={glow(GX.blue, 0.9)} transparent opacity={0.14} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ── arsenal forge — flickering neon sign wall ───────────────────────────────
export function NeonSignWall({ reduced }: { reduced: boolean }) {
  const signs = useMemo(() => skillCategories.map((c, i) => ({
    tex: textTexture([{ text: c.label.toUpperCase(), size: 64, color: NEONS[i % NEONS.length] }], 768, 144, NEONS[i % NEONS.length]),
    row: Math.floor(i / 2),
    col: i % 2,
    seed: rnd(i * 7 + 3) * 10,
  })), []);
  const mats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    mats.current.forEach((m, i) => {
      if (!m) return;
      const flick = Math.sin(t * 7 + signs[i].seed) > -0.92 ? 1 : 0.3;
      m.opacity = 0.95 * flick;
    });
  });
  return (
    <group position={[ARSENAL_SPOT.x, ARSENAL_SPOT.y, ARSENAL_SPOT.z]} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, 0, -0.4]}>
        <boxGeometry args={[26, 28, 0.6]} />
        <meshBasicMaterial color={'#060810'} />
      </mesh>
      {signs.map((s, i) => (
        <mesh key={i} position={[(s.col === 0 ? -6.4 : 6.4), 10.5 - s.row * 3.5, 0.1]}>
          <planeGeometry args={[11.6, 2.2]} />
          <meshBasicMaterial ref={(m) => { mats.current[i] = m; }} map={s.tex} transparent />
        </mesh>
      ))}
    </group>
  );
}

// ── era portals along the TIME TUNNEL (ring top) ────────────────────────────
function filmTexture(color: string): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = 256; cv.height = 256;
  const ctx = cv.getContext('2d')!;
  const g = ctx.createRadialGradient(128, 128, 20, 128, 128, 126);
  g.addColorStop(0, 'rgba(255,255,255,0.05)');
  g.addColorStop(0.55, `${color}26`);
  g.addColorStop(0.82, `${color}88`);
  g.addColorStop(1, `${color}EE`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(cv);
}

function EraPortal({ index }: { index: number }) {
  const x = PORTAL_XS[index];
  const color = NEONS[index % NEONS.length];
  const film = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => filmTexture(color), [color]);
  const label = useMemo(() => textTexture([
    { text: `ERA 0${index + 1}`, size: 54, color: GX.white },
    { text: experiences[index].period.toUpperCase(), size: 34, color },
  ], 640, 200, color), [index, color]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (film.current) {
      const s = 1 + Math.sin(t * 1.8 + index) * 0.045;
      film.current.scale.setScalar(s);
      (film.current.material as THREE.MeshBasicMaterial).opacity = 0.55 + Math.sin(t * 2.3 + index * 2) * 0.15;
    }
    if (ring.current) {
      const m = ring.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 1.9 + Math.sin(t * 2 + index) * 0.5 + scrollBus.warp * 1.6;
    }
  });
  return (
    <group position={[x, 4.6, PORTAL_Z]} rotation={[0, Math.PI / 2, 0]}>
      <mesh ref={ring}>
        <torusGeometry args={[4.4, 0.2, 14, 96]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.9} toneMapped={false} roughness={0.25} metalness={0.5} />
      </mesh>
      <mesh ref={film}>
        <circleGeometry args={[4.22, 48]} />
        <meshBasicMaterial map={tex} transparent opacity={0.6} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, 6.4, 0]}>
        <planeGeometry args={[5.4, 1.7]} />
        <meshBasicMaterial map={label} transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -4.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.2, 3.5, 48]} />
        <meshBasicMaterial color={glow(color, 1.4)} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function EraPortals() {
  return <>{PORTAL_XS.map((_, i) => <EraPortal key={i} index={i} />)}</>;
}

// ── warp speed-lines ────────────────────────────────────────────────────────
export function SpeedLines() {
  const mesh = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => {
    const cv = document.createElement('canvas');
    cv.width = 256; cv.height = 256;
    const ctx = cv.getContext('2d')!;
    ctx.clearRect(0, 0, 256, 256);
    for (let i = 0; i < 110; i++) {
      const x = rnd(i * 3 + 1) * 256;
      const len = 26 + rnd(i * 3 + 2) * 130;
      const y = rnd(i * 3 + 3) * 256;
      const g = ctx.createLinearGradient(0, y, 0, y + len);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(0.5, `rgba(${rnd(i * 7 + 5) > 0.5 ? '130,180,255' : '200,140,255'},0.9)`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, 1.8, len);
    }
    const t = new THREE.CanvasTexture(cv);
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    return t;
  }, []);
  useFrame((state, dt) => {
    const m = mesh.current;
    if (!m) return;
    const w = scrollBus.warp;
    m.visible = w > 0.025;
    if (!m.visible) return;
    m.position.copy(state.camera.position);
    m.quaternion.copy(state.camera.quaternion);
    m.rotateX(Math.PI / 2);
    const mat = m.material as THREE.MeshBasicMaterial;
    mat.opacity = Math.min(1, w * 1.25);
    if (mat.map) mat.map.offset.y -= dt * (3 + w * 11);
  });
  return (
    <mesh ref={mesh}>
      <cylinderGeometry args={[6, 6, 60, 24, 1, true]} />
      <meshBasicMaterial map={tex} transparent side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

// ── anomaly billboards ──────────────────────────────────────────────────────
function Billboard({ index, stabilized, onStabilize }: { index: number; stabilized: boolean; onStabilize: () => void }) {
  const spot = ANOM_SPOTS[index];
  const proj = projects[index];
  const group = useRef<THREE.Group>(null);
  const t0 = useRef(0);
  const activeTex = useMemo(() => textTexture([
    { text: `ANOMALY 0${index + 1} — ACTIVE`, size: 44, color: GX.redBright },
    { text: proj.name.toUpperCase(), size: 54, color: GX.white },
    { text: '[ CLICK TO STABILIZE ]', size: 34, color: GX.blueBright },
  ], 1024, 560, GX.red), [index, proj.name]);
  const stableTex = useMemo(() => textTexture([
    { text: `ANOMALY 0${index + 1} — RESOLVED`, size: 44, color: GX.blueBright },
    { text: proj.name.toUpperCase(), size: 54, color: GX.white },
    { text: 'p95 < 350ms · SHIPPED · AUDITED', size: 34, color: GX.violetBright },
  ], 1024, 560, GX.blue), [index, proj.name]);
  useFrame((state, dt) => {
    t0.current += dt;
    const g = group.current;
    if (!g) return;
    if (!stabilized) {
      g.position.x = spot.x + (rnd(Math.floor(t0.current * 19) + index * 7) - 0.5) * 0.3;
      g.position.y = 6 + (rnd(Math.floor(t0.current * 23) + index * 13) - 0.5) * 0.22;
    } else {
      g.position.x += (spot.x - g.position.x) * 0.1;
      g.position.y = 6 + Math.sin(state.clock.elapsedTime * 0.8 + index) * 0.15;
    }
  });
  return (
    <group ref={group} position={[spot.x, 6, spot.z]} rotation={[0, index === 0 ? 0.9 : -0.4, 0]}>
      <mesh
        onClick={(e) => { e.stopPropagation(); onStabilize(); }}
        onPointerOver={(e) => { e.stopPropagation(); if (!stabilized) setCursor(true); }}
        onPointerOut={() => setCursor(false)}
      >
        <planeGeometry args={[12, 6.6]} />
        <meshBasicMaterial map={stabilized ? stableTex : activeTex} transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -4.6, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 3.4, 8]} />
        <meshBasicMaterial color={'#0A0D16'} />
      </mesh>
    </group>
  );
}

export function AnomalyBillboards({ booted, onBoot }: { booted: Set<string>; onBoot: (id: string) => void }) {
  return (
    <>
      {[0, 1].map(i => (
        <Billboard key={i} index={i} stabilized={booted.has(`anomaly-${i}`)} onStabilize={() => onBoot(`anomaly-${i}`)} />
      ))}
    </>
  );
}

// ── credentials court — plaques in READING ORDER along the approach ─────────
export function CredsCourt({ reduced }: { reduced: boolean }) {
  // approach is north→south on RING EAST: lower z = encountered first.
  // Order: NODE cert → REACT cert → B.TECH (matches the DOM panel order).
  const cards = useMemo(() => [
    {
      tex: textTexture([
        { text: `[${certifications[0].badge}] VERIFIED ✓`, size: 44, color: GX.blueBright },
        { text: certifications[0].title.toUpperCase(), size: 40, color: GX.white },
        { text: certifications[0].issuer.toUpperCase(), size: 30, color: GX.violetBright },
      ], 900, 420, GX.blue),
      z: CREDS_SPOT.z + 10, y: 5.2,
    },
    {
      tex: textTexture([
        { text: `[${certifications[1].badge}] VERIFIED ✓`, size: 44, color: GX.blueBright },
        { text: certifications[1].title.toUpperCase(), size: 40, color: GX.white },
        { text: certifications[1].issuer.toUpperCase(), size: 30, color: GX.violetBright },
      ], 900, 420, GX.blue),
      z: CREDS_SPOT.z, y: 6.4,
    },
    {
      tex: textTexture([
        { text: '[B.TECH] VERIFIED ✓', size: 44, color: GX.violetBright },
        { text: education.field.toUpperCase(), size: 38, color: GX.white },
        { text: `${education.institution.toUpperCase()} · ${education.year}`, size: 28, color: GX.blueBright },
      ], 900, 420, GX.violet),
      z: CREDS_SPOT.z - 10, y: 5.2,
    },
  ], []);
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    refs.current.forEach((g, i) => {
      if (!g) return;
      g.position.y = cards[i].y + Math.sin(t * 0.8 + i * 2) * 0.3;
    });
  });
  return (
    <group>
      {cards.map((c, i) => (
        <group key={i} ref={(g) => { refs.current[i] = g; }} position={[CREDS_SPOT.x, c.y, c.z]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh>
            <planeGeometry args={[8.6, 4]} />
            <meshBasicMaterial map={c.tex} transparent side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── transmission row ────────────────────────────────────────────────────────
export function TransmissionRow() {
  const boards = useMemo(() => blogPosts.map((b, i) => ({
    tex: textTexture([
      { text: `TRANSMISSION 0${i + 1}`, size: 34, color: NEONS[i % NEONS.length] },
      { text: b.tags[0].toUpperCase(), size: 48, color: GX.white },
      { text: `${b.date.toUpperCase()} · ${b.readTime.toUpperCase()}`, size: 26, color: GX.dim },
    ], 860, 380, NEONS[i % NEONS.length]),
    z: TRANS_SPOT.z + (1 - i) * 10, // first post encountered first (north → south)
  })), []);
  return (
    <group>
      {boards.map((b, i) => (
        <group key={i} position={[TRANS_SPOT.x, 5 + (i % 2) * 2.2, b.z]} rotation={[0, Math.PI / 2, 0]}>
          <mesh>
            <planeGeometry args={[8, 3.6]} />
            <meshBasicMaterial map={b.tex} transparent side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── the choice ──────────────────────────────────────────────────────────────
function Pill({ dx, color, onPick }: { dx: number; color: string; onPick: () => void }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = 0.9 + Math.sin(t * 1.4 + dx) * 0.16;
    ref.current.rotation.z = 0.5 + Math.sin(t * 0.7 + dx) * 0.12;
    ref.current.rotation.y += 0.004;
  });
  return (
    <group position={[PILLS_SPOT.x + dx, PILLS_SPOT.y, PILLS_SPOT.z]}>
      <group
        ref={ref}
        onClick={(e) => { e.stopPropagation(); onPick(); }}
        onPointerOver={(e) => { e.stopPropagation(); setCursor(true); }}
        onPointerOut={() => setCursor(false)}
      >
        <mesh>
          <capsuleGeometry args={[0.42, 0.95, 12, 24]} />
          <meshStandardMaterial color={color} roughness={0.16} metalness={0.25} emissive={color} emissiveIntensity={1.8} toneMapped={false} />
        </mesh>
      </group>
      <mesh position={[0, -2.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1, 1.12, 48]} />
        <meshBasicMaterial color={glow(color, 1.6)} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function Pills({ onRed, onBlue }: { onRed: () => void; onBlue: () => void }) {
  return (
    <group>
      <mesh position={[PILLS_SPOT.x, 0.08, PILLS_SPOT.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.6, 4.8, 64]} />
        <meshBasicMaterial color={glow(GX.violet, 1.7)} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <Pill dx={-2.1} color={GX.red} onPick={onRed} />
      <Pill dx={2.1} color={GX.blue} onPick={onBlue} />
    </group>
  );
}

// ── the white rabbit ────────────────────────────────────────────────────────
export function Rabbit({ idle, reduced }: { idle: boolean; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const target = useRef(new THREE.Vector3());
  const white = useMemo(() => new THREE.Color(GX.white).multiplyScalar(1.7), []);
  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    target.current.set(
      scrollBus.x + scrollBus.hx * 9 - scrollBus.hz * 1.6,
      0.55,
      scrollBus.z + scrollBus.hz * 9 + scrollBus.hx * 1.6,
    );
    g.position.lerp(target.current, 0.055);
    if (!reduced) g.position.y += Math.abs(Math.sin(state.clock.elapsedTime * 2.6)) * 0.26;
    if (idle) {
      g.lookAt(state.camera.position);
    } else {
      g.lookAt(g.position.x + scrollBus.hx * 4, g.position.y, g.position.z + scrollBus.hz * 4);
    }
  });
  return (
    <group ref={group} scale={0.9}>
      <mesh position={[0, 0, 0.1]} rotation={[0.5, 0, 0]}>
        <icosahedronGeometry args={[0.42, 0]} />
        <meshBasicMaterial color={white} wireframe toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.42, -0.28]}>
        <icosahedronGeometry args={[0.26, 0]} />
        <meshBasicMaterial color={white} wireframe toneMapped={false} />
      </mesh>
      <mesh position={[-0.12, 0.92, -0.3]} rotation={[0.15, 0, 0.18]}>
        <coneGeometry args={[0.09, 0.62, 4]} />
        <meshBasicMaterial color={white} wireframe toneMapped={false} />
      </mesh>
      <mesh position={[0.12, 0.92, -0.3]} rotation={[0.15, 0, -0.18]}>
        <coneGeometry args={[0.09, 0.62, 4]} />
        <meshBasicMaterial color={white} wireframe toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.05, 0.52]}>
        <icosahedronGeometry args={[0.11, 0]} />
        <meshBasicMaterial color={white} wireframe toneMapped={false} />
      </mesh>
    </group>
  );
}
