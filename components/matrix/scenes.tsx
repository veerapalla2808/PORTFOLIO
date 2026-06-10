'use client';
// THE GRID's set pieces — interactive, color-gated, click-to-power.
// Glow = emissive past the bloom threshold (toneMapped=false).
import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { GX, CORE_X, RACKS_X, TOWER_X, ANOM_X, PILL_X } from '@/lib/grid';
import { experiences } from '@/lib/data';

const glow = (hex: string, k: number) => new THREE.Color(hex).multiplyScalar(k);
const DARK = '#0A0D14';
const lerp = THREE.MathUtils.lerp;

function setCursor(on: boolean) {
  document.body.style.cursor = on ? 'pointer' : '';
}

// ── floor ───────────────────────────────────────────────────────────────────
export function FloorGrid() {
  return (
    <>
      <gridHelper args={[700, 160, '#13316B', '#0A1830']} position={[135, -4, -8]} />
      <gridHelper args={[700, 160, '#3A1020', '#160A12']} position={[135, 12, -8]} />
    </>
  );
}

// ── 00 / hero — interlocked red & blue rings ────────────────────────────────
export function HeroRings({ reduced }: { reduced: boolean }) {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (reduced) return;
    if (a.current) { a.current.rotation.z += dt * 0.22; a.current.rotation.x += dt * 0.06; }
    if (b.current) { b.current.rotation.z -= dt * 0.18; b.current.rotation.y += dt * 0.07; }
  });
  return (
    <group position={[0, 1.4, -7]}>
      <mesh ref={a} rotation={[0.4, 0, 0]}>
        <torusGeometry args={[6.4, 0.05, 8, 120]} />
        <meshBasicMaterial color={glow(GX.blue, 1.7)} toneMapped={false} />
      </mesh>
      <mesh ref={b} rotation={[-0.3, 0.5, 0.8]}>
        <torusGeometry args={[5.2, 0.04, 8, 120]} />
        <meshBasicMaterial color={glow(GX.red, 1.6)} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ── 01 / identity core ──────────────────────────────────────────────────────
export function IdentityCore({ unlocked }: { unlocked: boolean }) {
  const shell = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const power = useRef(0);
  const punch = useRef(0);
  const [hover, setHover] = useState(false);

  useFrame((state, dt) => {
    power.current = lerp(power.current, unlocked ? 1 : 0.08, 0.04);
    punch.current = lerp(punch.current, 0, 0.06);
    const t = state.clock.elapsedTime;
    if (shell.current) {
      shell.current.rotation.y += dt * (0.25 + power.current * 0.3);
      shell.current.rotation.x += dt * 0.07;
      const m = shell.current.material as THREE.MeshBasicMaterial;
      m.color.copy(glow(GX.blue, (0.35 + power.current * 1.4) * (hover ? 1.25 : 1)));
      const s = 1 + punch.current * 0.18;
      shell.current.scale.setScalar(s);
    }
    if (core.current) {
      const m = core.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = (0.3 + power.current * 1.6) * (1 + Math.sin(t * 2.4) * 0.18) * (hover ? 1.3 : 1);
      core.current.scale.setScalar(0.95 + Math.sin(t * 2.4) * 0.05 + punch.current * 0.3);
    }
  });

  return (
    <group
      position={[CORE_X, 1.6, -3]}
      onClick={(e) => { e.stopPropagation(); punch.current = 1; }}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); setCursor(true); }}
      onPointerOut={() => { setHover(false); setCursor(false); }}
    >
      <mesh ref={shell}>
        <icosahedronGeometry args={[2.5, 1]} />
        <meshBasicMaterial color={glow(GX.blue, 0.4)} wireframe toneMapped={false} />
      </mesh>
      <mesh ref={core}>
        <icosahedronGeometry args={[1.05, 0]} />
        <meshStandardMaterial
          color={GX.red} emissive={GX.red} emissiveIntensity={0.3}
          roughness={0.3} metalness={0.4} toneMapped={false}
        />
      </mesh>
    </group>
  );
}

// ── 02 / arsenal racks — light up in sequence once unlocked ─────────────────
export function ArsenalRacks({ unlocked }: { unlocked: boolean }) {
  const since = useRef(0);
  const mats = useRef<THREE.MeshStandardMaterial[]>([]);
  const items = useMemo(() => {
    const out: { pos: [number, number, number]; idx: number; red: boolean }[] = [];
    let idx = 0;
    for (let i = 0; i < 7; i++) {
      for (const zrow of [-7, -12]) {
        out.push({ pos: [RACKS_X - 9 + i * 3.1, -1.4, zrow], idx: idx++, red: (i + (zrow === -12 ? 1 : 0)) % 3 === 0 });
      }
    }
    return out;
  }, []);
  const boxGeo = useMemo(() => new THREE.BoxGeometry(2.2, 4.6, 1.3), []);

  useFrame((_, dt) => {
    since.current = unlocked ? since.current + dt : 0;
    mats.current.forEach((m, i) => {
      if (!m) return;
      const on = unlocked && since.current > i * 0.09;
      m.emissiveIntensity = lerp(m.emissiveIntensity, on ? 1.5 : 0.06, 0.08);
    });
  });

  return (
    <group>
      {items.map((r) => (
        <mesh key={r.idx} geometry={boxGeo} position={r.pos}>
          <meshStandardMaterial
            ref={(m: THREE.MeshStandardMaterial | null) => { if (m) mats.current[r.idx] = m; }}
            color={DARK} roughness={0.5} metalness={0.55}
            emissive={r.red ? GX.red : GX.blue} emissiveIntensity={0.06} toneMapped={false}
          />
          <Edges color={glow(r.red ? GX.red : GX.blue, 1.3) as unknown as string} threshold={15} />
        </mesh>
      ))}
    </group>
  );
}

// ── 03 / power towers — click to boot a chapter ─────────────────────────────
function Tower({
  x, index, unlocked, booted, onBoot,
}: { x: number; index: number; unlocked: boolean; booted: boolean; onBoot: () => void }) {
  const red = index % 2 === 1;
  const color = red ? GX.red : GX.blue;
  const power = useRef(0);
  const slats = useRef<THREE.MeshStandardMaterial[]>([]);
  const ring = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  const bodyGeo = useMemo(() => new THREE.BoxGeometry(3, 8.4, 3), []);
  const slatGeo = useMemo(() => new THREE.BoxGeometry(3.06, 0.5, 3.06), []);

  useFrame((state, dt) => {
    power.current = lerp(power.current, booted ? 1 : 0, 0.05);
    const t = state.clock.elapsedTime;
    slats.current.forEach((m, i) => {
      if (!m) return;
      const lit = power.current * 6 > i;
      const target = lit ? 1.7 + Math.sin(t * 3 + i) * 0.25 : (hover && unlocked && !booted ? 0.35 : 0.07);
      m.emissiveIntensity = lerp(m.emissiveIntensity, target, 0.1);
    });
    if (ring.current) {
      ring.current.rotation.z += dt * power.current * 1.6;
      const m = ring.current.material as THREE.MeshBasicMaterial;
      m.color.copy(glow(color, 0.2 + power.current * 1.6));
    }
  });

  return (
    <group
      position={[x, 0.2, -4]}
      onClick={(e) => { e.stopPropagation(); if (unlocked) onBoot(); }}
      onPointerOver={(e) => { e.stopPropagation(); if (unlocked) { setHover(true); setCursor(true); } }}
      onPointerOut={() => { setHover(false); setCursor(false); }}
    >
      <mesh geometry={bodyGeo}>
        <meshStandardMaterial color={DARK} roughness={0.45} metalness={0.6} />
        <Edges color={glow(color, unlocked ? 1.5 : 0.45) as unknown as string} threshold={15} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <mesh key={i} geometry={slatGeo} position={[0, -3.4 + i * 1.35, 0]}>
          <meshStandardMaterial
            ref={(m: THREE.MeshStandardMaterial | null) => { if (m) slats.current[i] = m; }}
            color={DARK} roughness={0.4} metalness={0.5}
            emissive={color} emissiveIntensity={0.07} toneMapped={false}
          />
        </mesh>
      ))}
      <mesh ref={ring} position={[0, 5.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.1, 0.05, 8, 48]} />
        <meshBasicMaterial color={glow(color, 0.2)} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function PowerTowers({
  unlocked, booted, onBoot,
}: { unlocked: boolean; booted: Set<string>; onBoot: (id: string) => void }) {
  return (
    <>
      {experiences.map((_, i) => (
        <Tower
          key={i}
          x={TOWER_X[i]}
          index={i}
          unlocked={unlocked}
          booted={booted.has(`tower-${i}`)}
          onBoot={() => onBoot(`tower-${i}`)}
        />
      ))}
    </>
  );
}

// ── 04 / anomalies — click to contain (red → blue) ──────────────────────────
function Anomaly({
  x, index, unlocked, resolved, onResolve,
}: { x: number; index: number; unlocked: boolean; resolved: boolean; onResolve: () => void }) {
  const k = useRef(0);
  const edge = useRef<THREE.LineBasicMaterial | null>(null);
  const [hover, setHover] = useState(false);
  const geo = useMemo(() => new THREE.BoxGeometry(3.6, 11, 1.6), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo, 15), [geo]);
  const redC = useMemo(() => glow(GX.red, 2), []);
  const blueC = useMemo(() => glow(GX.blue, 1.8), []);
  const tmp = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    k.current = lerp(k.current, resolved ? 1 : 0, 0.04);
    if (edge.current) {
      const t = state.clock.elapsedTime;
      const pulse = resolved ? 1 : 0.75 + Math.sin(t * (6 - index)) * 0.25;
      tmp.lerpColors(redC, blueC, k.current).multiplyScalar(pulse * (hover && !resolved ? 1.3 : 1));
      edge.current.color.copy(tmp);
    }
  });

  return (
    <group
      position={[x, 1.4, -4.5]}
      rotation={[0, index === 0 ? 0.28 : -0.28, 0]}
      onClick={(e) => { e.stopPropagation(); if (unlocked) onResolve(); }}
      onPointerOver={(e) => { e.stopPropagation(); if (unlocked && !resolved) { setHover(true); setCursor(true); } }}
      onPointerOut={() => { setHover(false); setCursor(false); }}
    >
      <mesh geometry={geo}>
        <meshStandardMaterial color={'#080A10'} roughness={0.4} metalness={0.6} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial ref={edge} color={redC} toneMapped={false} />
      </lineSegments>
    </group>
  );
}

export function Anomalies({
  unlocked, booted, onBoot,
}: { unlocked: boolean; booted: Set<string>; onBoot: (id: string) => void }) {
  return (
    <>
      {[0, 1].map(i => (
        <Anomaly
          key={i}
          x={ANOM_X[i]}
          index={i}
          unlocked={unlocked}
          resolved={booted.has(`anomaly-${i}`)}
          onResolve={() => onBoot(`anomaly-${i}`)}
        />
      ))}
    </>
  );
}

// ── 05 / the choice ──────────────────────────────────────────────────────────
function Pill({ dx, color, onPick }: { dx: number; color: string; onPick: () => void }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = 0.3 + Math.sin(t * 1.4 + dx) * 0.14;
    ref.current.rotation.z = 0.5 + Math.sin(t * 0.7 + dx) * 0.12;
    ref.current.rotation.y += 0.004;
  });
  return (
    <group position={[PILL_X + dx, 1, -2]}>
      <group
        ref={ref}
        onClick={(e) => { e.stopPropagation(); onPick(); }}
        onPointerOver={(e) => { e.stopPropagation(); setCursor(true); }}
        onPointerOut={() => setCursor(false)}
      >
        <mesh>
          <capsuleGeometry args={[0.4, 0.9, 12, 24]} />
          <meshStandardMaterial
            color={color} roughness={0.16} metalness={0.25}
            emissive={color} emissiveIntensity={1.4} toneMapped={false}
          />
        </mesh>
      </group>
      <mesh position={[0, -1.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.025, 8, 64]} />
        <meshBasicMaterial color={glow(color, 1.1)} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function Pills({ onRed, onBlue }: { onRed: () => void; onBlue: () => void }) {
  return (
    <>
      <Pill dx={-2} color={GX.red} onPick={onRed} />
      <Pill dx={2} color={GX.blue} onPick={onBlue} />
    </>
  );
}
