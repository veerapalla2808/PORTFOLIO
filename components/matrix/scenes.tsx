'use client';
// NEON GRID set pieces — a cyberpunk canyon you fly through. Canvas-generated
// textures give buildings windows and signs real text; glow = toneMapped=false.
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  GX, NEONS, VORTEX, IDENTITY_SPOT, ARSENAL_WALL, PORTALS, BILLBOARDS, PILLS_SPOT,
  samplePath,
} from '@/lib/grid';
import { scrollBus } from '@/lib/scrollBus';
import { skillCategories, projects, personal } from '@/lib/data';

const rnd = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
const glow = (hex: string, k: number) => new THREE.Color(hex).multiplyScalar(k);
const setCursor = (on: boolean) => { document.body.style.cursor = on ? 'pointer' : ''; };

// ── canvas texture helpers ──────────────────────────────────────────────────
function windowsTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = 128; cv.height = 256;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = '#06070D';
  ctx.fillRect(0, 0, 128, 256);
  const hues = ['#9fc7ff', '#d7a8ff', '#9dffc4', '#ff9d9d', '#fff3c4'];
  for (let y = 6; y < 250; y += 12) {
    for (let x = 6; x < 122; x += 14) {
      const r = Math.random();
      if (r < 0.42) {
        ctx.fillStyle = hues[(Math.random() * hues.length) | 0];
        ctx.globalAlpha = 0.25 + Math.random() * 0.75;
        ctx.fillRect(x, y, 8, 6);
      }
    }
  }
  ctx.globalAlpha = 1;
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function textTexture(lines: { text: string; size: number; color: string; font?: string }[], w: number, h: number, border?: string): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = 'rgba(5,6,12,0.92)';
  ctx.fillRect(0, 0, w, h);
  if (border) {
    ctx.strokeStyle = border;
    ctx.lineWidth = Math.max(4, w * 0.012);
    ctx.shadowColor = border;
    ctx.shadowBlur = 24;
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
    ctx.shadowBlur = 18;
    ctx.fillText(l.text, w / 2, y);
    y += h / (lines.length + 1);
  }
  ctx.shadowBlur = 0;
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ── city canyon — instanced neon buildings with lit windows ─────────────────
export function CityCanyon({ tier }: { tier: 'S' | 'M' | 'L' }) {
  const count = tier === 'S' ? 60 : tier === 'M' ? 100 : 140;
  const winTex = useMemo(() => windowsTexture(), []);
  const { bodyMesh, trimMesh } = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshBasicMaterial({ map: winTex, color: '#9FB4D8' });
    const body = new THREE.InstancedMesh(geo, mat, count);
    const trimGeo = new THREE.BoxGeometry(1, 1, 1);
    const trimMat = new THREE.MeshBasicMaterial({ toneMapped: false });
    const trim = new THREE.InstancedMesh(trimGeo, trimMat, count);
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const z = 30 - (i / count) * 480 + (rnd(i * 3 + 1) - 0.5) * 10;
      const x = side * (22 + rnd(i * 3 + 2) * 16);
      const w = 8 + rnd(i * 5 + 1) * 8;
      const h = 18 + rnd(i * 5 + 2) * 34;
      const d = 8 + rnd(i * 5 + 3) * 8;
      m.compose(new THREE.Vector3(x, h / 2 - 6, z), new THREE.Quaternion(), new THREE.Vector3(w, h, d));
      body.setMatrixAt(i, m);
      // rooftop neon trim
      m.compose(new THREE.Vector3(x, h - 6 + 0.1, z), new THREE.Quaternion(), new THREE.Vector3(w * 1.02, 0.18, d * 1.02));
      trim.setMatrixAt(i, m);
      c.set(NEONS[(i + (i % 3)) % NEONS.length]).multiplyScalar(1.8);
      trim.setColorAt(i, c);
    }
    body.instanceMatrix.needsUpdate = true;
    trim.instanceMatrix.needsUpdate = true;
    if (trim.instanceColor) trim.instanceColor.needsUpdate = true;
    return { bodyMesh: body, trimMesh: trim };
  }, [count, winTex]);

  // attach imperatively — keeps circular THREE objects out of JSX props
  // (Next's dev overlay JSON-serializes element props and chokes on them)
  const group = useRef<THREE.Group>(null);
  useEffect(() => {
    const g = group.current;
    if (!g) return;
    g.add(bodyMesh, trimMesh);
    return () => {
      g.remove(bodyMesh, trimMesh);
      bodyMesh.geometry.dispose();
      trimMesh.geometry.dispose();
      (bodyMesh.material as THREE.Material).dispose();
      (trimMesh.material as THREE.Material).dispose();
    };
  }, [bodyMesh, trimMesh]);

  return <group ref={group} />;
}

export function Streets() {
  return (
    <>
      <gridHelper args={[1000, 200, '#1A2C5E', '#0B1228']} position={[0, -6, -190]} />
      <gridHelper args={[1000, 100, '#2A0E4F', '#120822']} position={[0, 26, -190]} />
    </>
  );
}

// ── hero vortex tunnel — fly straight into it ───────────────────────────────
export function HeroVortex({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const rings = useMemo(() => Array.from({ length: 24 }, (_, i) => ({
    z: -i * 4.6,
    r: 7.2 - i * 0.19,
    color: NEONS[i % NEONS.length],
    speed: (i % 2 === 0 ? 1 : -1) * (0.25 + rnd(i + 1) * 0.5),
  })), []);
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((_, dt) => {
    if (reduced) return;
    refs.current.forEach((m, i) => { if (m) m.rotation.z += dt * rings[i].speed; });
    if (group.current) group.current.rotation.z += dt * 0.05;
  });
  return (
    <group ref={group} position={[VORTEX.x, VORTEX.y, VORTEX.z]}>
      {rings.map((r, i) => (
        <mesh key={i} position={[0, 0, r.z]} ref={(m) => { refs.current[i] = m; }}>
          <torusGeometry args={[r.r, 0.05 + (i % 3) * 0.02, 8, 96]} />
          <meshBasicMaterial color={glow(r.color, 1.5 - i * 0.04)} toneMapped={false} transparent opacity={Math.max(0.12, 0.9 - i * 0.035)} />
        </mesh>
      ))}
    </group>
  );
}

// ── warp speed-lines (visible only while crossing a portal) ─────────────────
export function SpeedLines() {
  const mesh = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => {
    const cv = document.createElement('canvas');
    cv.width = 256; cv.height = 256;
    const ctx = cv.getContext('2d')!;
    ctx.clearRect(0, 0, 256, 256);
    for (let i = 0; i < 90; i++) {
      const x = rnd(i * 3 + 1) * 256;
      const len = 30 + rnd(i * 3 + 2) * 120;
      const y = rnd(i * 3 + 3) * 256;
      const g = ctx.createLinearGradient(0, y, 0, y + len);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(0.5, `rgba(${rnd(i * 7 + 5) > 0.5 ? '120,180,255' : '255,120,160'},0.8)`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, 1.6, len);
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
    m.visible = w > 0.03;
    if (!m.visible) return;
    m.position.copy(state.camera.position);
    m.quaternion.copy(state.camera.quaternion);
    const mat = m.material as THREE.MeshBasicMaterial;
    mat.opacity = w * 0.75;
    if (mat.map) mat.map.offset.y -= dt * (2 + w * 9);
  });
  return (
    <mesh ref={mesh}>
      <cylinderGeometry args={[6, 6, 50, 24, 1, true]} />
      <meshBasicMaterial map={tex} transparent side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

// ── identity — floating holo ID card + light beam ───────────────────────────
export function IdentityHolo({ reduced }: { reduced: boolean }) {
  const card = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => textTexture([
    { text: '◢ VP', size: 92, color: '#C964FF' },
    { text: personal.name.toUpperCase(), size: 78, color: '#F4F7FF' },
    { text: 'SR. REACT.JS / NODE.JS · 11 YEARS', size: 38, color: '#4D9FFF' },
    { text: 'FINTECH · HEALTH · RETAIL · GENAI', size: 32, color: '#7DFFAB' },
  ], 1024, 640, '#B026FF'), []);
  useFrame((state) => {
    if (!card.current || reduced) return;
    const t = state.clock.elapsedTime;
    card.current.position.y = IDENTITY_SPOT.y + Math.sin(t * 0.9) * 0.35;
    card.current.rotation.y = -0.5 + Math.sin(t * 0.4) * 0.08;
  });
  return (
    <group>
      <mesh ref={card} position={[IDENTITY_SPOT.x, IDENTITY_SPOT.y, IDENTITY_SPOT.z]} rotation={[0, -0.5, 0]}>
        <planeGeometry args={[10.4, 6.5]} />
        <meshBasicMaterial map={tex} transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[IDENTITY_SPOT.x, IDENTITY_SPOT.y - 6, IDENTITY_SPOT.z]}>
        <cylinderGeometry args={[2.6, 3.4, 6, 24, 1, true]} />
        <meshBasicMaterial color={glow(GX.purple, 0.8)} transparent opacity={0.12} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ── arsenal — a wall of flickering neon signs (one per category) ────────────
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
      const s = signs[i].seed;
      const flick = Math.sin(t * 7 + s) > -0.92 ? 1 : 0.35; // occasional dropout
      m.opacity = 0.92 * flick;
    });
  });
  return (
    <group position={[ARSENAL_WALL.x, ARSENAL_WALL.y, ARSENAL_WALL.z]} rotation={[0, Math.PI / 2, 0]}>
      {/* backing tower face */}
      <mesh position={[0, 0, -0.4]}>
        <boxGeometry args={[26, 30, 0.6]} />
        <meshBasicMaterial color={'#070910'} />
      </mesh>
      {signs.map((s, i) => (
        <mesh key={i} position={[(s.col === 0 ? -6.4 : 6.4), 11.5 - s.row * 3.7, 0.1]}>
          <planeGeometry args={[11.6, 2.2]} />
          <meshBasicMaterial ref={(m) => { mats.current[i] = m; }} map={s.tex} transparent />
        </mesh>
      ))}
    </group>
  );
}

// ── era portals — fly through your timeline ─────────────────────────────────
function swirlTexture(color: string): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = 256; cv.height = 256;
  const ctx = cv.getContext('2d')!;
  ctx.translate(128, 128);
  for (let i = 0; i < 70; i++) {
    const a = (i / 70) * Math.PI * 6;
    const r0 = 10 + (i / 70) * 110;
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.05 + (1 - i / 70) * 0.25;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, 0, r0, a, a + 1.1);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(cv);
  return t;
}

function Portal({ index }: { index: number }) {
  const p = PORTALS[index];
  const color = NEONS[index % NEONS.length];
  const disc = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => swirlTexture(color), [color]);
  useFrame((_, dt) => {
    if (disc.current) disc.current.rotation.z -= dt * 1.4;
    if (ring.current) ring.current.rotation.z += dt * 0.3;
  });
  return (
    <group position={[p.x, p.y, p.z]}>
      <mesh ref={ring}>
        <torusGeometry args={[4.4, 0.16, 12, 96]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.9} toneMapped={false} roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh>
        <torusGeometry args={[5.1, 0.04, 8, 96]} />
        <meshBasicMaterial color={glow(color, 1.1)} toneMapped={false} transparent opacity={0.6} />
      </mesh>
      <mesh ref={disc}>
        <circleGeometry args={[4.25, 48]} />
        <meshBasicMaterial map={tex} transparent opacity={0.85} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function EraPortals() {
  return <>{PORTALS.map((_, i) => <Portal key={i} index={i} />)}</>;
}

// ── anomaly billboards — glitching until you stabilize them ─────────────────
function Billboard({ index, stabilized, onStabilize }: { index: number; stabilized: boolean; onStabilize: () => void }) {
  const b = BILLBOARDS[index];
  const proj = projects[index];
  const group = useRef<THREE.Group>(null);
  const t0 = useRef(0);
  const activeTex = useMemo(() => textTexture([
    { text: `ANOMALY 0${index + 1} — ACTIVE`, size: 44, color: '#FF5252' },
    { text: proj.name.toUpperCase(), size: 56, color: '#F4F7FF' },
    { text: '[ CLICK TO STABILIZE ]', size: 34, color: '#FFB36B' },
  ], 1024, 560, '#E62429'), [index, proj.name]);
  const stableTex = useMemo(() => textTexture([
    { text: `ANOMALY 0${index + 1} — RESOLVED`, size: 44, color: '#7DFFAB' },
    { text: proj.name.toUpperCase(), size: 56, color: '#F4F7FF' },
    { text: 'p95 < 350ms · SHIPPED · AUDITED', size: 34, color: '#4D9FFF' },
  ], 1024, 560, '#2BFF6F'), [index, proj.name]);
  useFrame((state, dt) => {
    t0.current += dt;
    const g = group.current;
    if (!g) return;
    if (!stabilized) {
      // glitch jitter
      g.position.x = b.x + (rnd(Math.floor(t0.current * 19) + index * 7) - 0.5) * 0.25;
      g.position.y = b.y + (rnd(Math.floor(t0.current * 23) + index * 13) - 0.5) * 0.18;
    } else {
      g.position.x += (b.x - g.position.x) * 0.1;
      g.position.y = b.y + Math.sin(state.clock.elapsedTime * 0.8 + index) * 0.15;
    }
  });
  return (
    <group ref={group} position={[b.x, b.y, b.z]} rotation={[0, index === 0 ? 0.6 : -0.6, 0]}>
      <mesh
        onClick={(e) => { e.stopPropagation(); onStabilize(); }}
        onPointerOver={(e) => { e.stopPropagation(); if (!stabilized) setCursor(true); }}
        onPointerOut={() => setCursor(false)}
      >
        <planeGeometry args={[12, 6.6]} />
        <meshBasicMaterial map={stabilized ? stableTex : activeTex} transparent side={THREE.DoubleSide} />
      </mesh>
      {/* support pylon */}
      <mesh position={[0, -6.4, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 7, 8]} />
        <meshBasicMaterial color={'#0B0E18'} />
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

// ── the choice — rooftop pills ──────────────────────────────────────────────
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
          <meshStandardMaterial color={color} roughness={0.16} metalness={0.25} emissive={color} emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

export function Pills({ onRed, onBlue }: { onRed: () => void; onBlue: () => void }) {
  return (
    <group>
      {/* rooftop pad */}
      <mesh position={[PILLS_SPOT.x, PILLS_SPOT.y - 2.6, PILLS_SPOT.z]}>
        <boxGeometry args={[14, 0.5, 10]} />
        <meshStandardMaterial color={'#0A0D16'} roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[PILLS_SPOT.x, PILLS_SPOT.y - 2.3, PILLS_SPOT.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.4, 3.55, 64]} />
        <meshBasicMaterial color={glow(GX.purple, 1.5)} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <Pill dx={-2.1} color={GX.red} onPick={onRed} />
      <Pill dx={2.1} color={GX.blue} onPick={onBlue} />
    </group>
  );
}

// ── the white rabbit — now flies the 3D path ahead of you ───────────────────
export function Rabbit({ idle, reduced }: { idle: boolean; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const p = useRef({ x: 0, y: 2, z: 0 });
  const target = useRef(new THREE.Vector3());
  const white = useMemo(() => new THREE.Color(GX.white).multiplyScalar(1.6), []);
  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    samplePath(Math.min(1, scrollBus.offset + 0.03), p.current);
    target.current.set(p.current.x + 2.2, p.current.y - 1.6, p.current.z);
    g.position.lerp(target.current, 0.06);
    if (!reduced) g.position.y += Math.abs(Math.sin(state.clock.elapsedTime * 2.6)) * 0.22;
    if (idle) g.lookAt(state.camera.position);
    else {
      samplePath(Math.min(1, scrollBus.offset + 0.06), p.current);
      g.lookAt(p.current.x, g.position.y, p.current.z);
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

