// components/space/Structures.tsx
'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { type Group, type Color } from 'three';
import type { StructureKind } from '@/lib/journey';

interface SProps { color: Color; color2: Color }

function emissive(color: Color, i = 1) {
  return { color, emissive: color, emissiveIntensity: i };
}

/** Home origin — a glowing core wrapped in slow orbital rings. */
function Origin({ color, color2 }: SProps) {
  const g = useRef<Group>(null);
  useFrame((_, dt) => { if (g.current) g.current.rotation.y += dt * 0.2; });
  return (
    <group ref={g}>
      <mesh><icosahedronGeometry args={[1.4, 1]} /><meshStandardMaterial {...emissive(color, 1.6)} toneMapped={false} roughness={0.3} metalness={0.5} /></mesh>
      {[2.6, 3.4, 4.2].map((r, i) => (
        <mesh key={r} rotation={[Math.PI / 2 + i * 0.5, i * 0.4, 0]}>
          <torusGeometry args={[r, 0.03, 8, 80]} /><meshStandardMaterial {...emissive(i % 2 ? color2 : color, 0.8)} toneMapped={false} transparent opacity={0.75} />
        </mesh>
      ))}
    </group>
  );
}

/** Rocky planet with a glowing atmosphere shell. */
function Planet({ color, color2 }: SProps) {
  const g = useRef<Group>(null);
  useFrame((_, dt) => { if (g.current) g.current.rotation.y += dt * 0.12; });
  return (
    <group ref={g}>
      <mesh><sphereGeometry args={[3.2, 48, 48]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} roughness={0.85} metalness={0.2} /></mesh>
      <mesh scale={1.08}><sphereGeometry args={[3.2, 32, 32]} /><meshBasicMaterial color={color2} transparent opacity={0.12} /></mesh>
      <mesh scale={1.18}><sphereGeometry args={[3.2, 24, 24]} /><meshBasicMaterial color={color2} transparent opacity={0.06} /></mesh>
    </group>
  );
}

/** Orbital space station — hub, ring, modules and spokes. */
function SpaceStation({ color, color2 }: SProps) {
  const g = useRef<Group>(null);
  useFrame((_, dt) => { if (g.current) g.current.rotation.z += dt * 0.18; });
  return (
    <group ref={g} rotation={[Math.PI / 2.6, 0, 0]}>
      <mesh><cylinderGeometry args={[0.5, 0.5, 2.2, 16]} /><meshStandardMaterial color={color} metalness={0.85} roughness={0.3} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[3.4, 0.22, 16, 80]} /><meshStandardMaterial color={color} metalness={0.8} roughness={0.35} emissive={color2} emissiveIntensity={0.3} /></mesh>
      {[0, 1, 2, 3].map(i => {
        const a = (i / 4) * Math.PI * 2;
        return (
          <group key={i} rotation={[Math.PI / 2, 0, a]}>
            <mesh position={[3.4, 0, 0]}><boxGeometry args={[0.7, 0.5, 0.9]} /><meshStandardMaterial color={color} metalness={0.7} roughness={0.4} emissive={color2} emissiveIntensity={0.4} /></mesh>
            <mesh position={[1.7, 0, 0]}><boxGeometry args={[2.6, 0.06, 0.1]} /><meshStandardMaterial {...emissive(color2, 0.6)} /></mesh>
          </group>
        );
      })}
    </group>
  );
}

/** Ringed gas giant. */
function Ringworld({ color, color2 }: SProps) {
  const g = useRef<Group>(null);
  useFrame((_, dt) => { if (g.current) g.current.rotation.y += dt * 0.1; });
  return (
    <group ref={g} rotation={[0.5, 0, 0.3]}>
      <mesh><sphereGeometry args={[3, 48, 48]} /><meshStandardMaterial color={color2} emissive={color2} emissiveIntensity={0.3} roughness={0.6} metalness={0.3} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[5, 0.6, 2, 100]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.8} side={2} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[6.2, 0.25, 2, 100]} /><meshStandardMaterial {...emissive(color2, 0.5)} transparent opacity={0.6} side={2} /></mesh>
    </group>
  );
}

/** A core with several satellites on independent orbits. */
function Satellites({ color, color2 }: SProps) {
  const g = useRef<Group>(null);
  const orbits = useRef<Group[]>([]);
  useFrame((_, dt) => {
    if (g.current) g.current.rotation.y += dt * 0.08;
    orbits.current.forEach((o, i) => { if (o) o.rotation.y += dt * (0.4 + i * 0.18); });
  });
  return (
    <group ref={g}>
      <mesh><dodecahedronGeometry args={[1.3, 0]} /><meshStandardMaterial {...emissive(color, 1)} toneMapped={false} roughness={0.3} metalness={0.6} /></mesh>
      {[2.8, 3.8, 4.8].map((r, i) => (
        <group key={r} ref={(el) => { if (el) orbits.current[i] = el; }} rotation={[i * 0.5, 0, i * 0.3]}>
          <mesh position={[r, 0, 0]}>
            <boxGeometry args={[0.5, 0.3, 0.3]} /><meshStandardMaterial color={color} metalness={0.8} roughness={0.3} emissive={color2} emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[r, 0, 0]}><boxGeometry args={[0.06, 0.9, 0.5]} /><meshStandardMaterial {...emissive(color2, 0.5)} /></mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[r, 0.015, 6, 80]} /><meshStandardMaterial {...emissive(color, 0.3)} transparent opacity={0.4} /></mesh>
        </group>
      ))}
    </group>
  );
}

/** Academy — stacked rings around a central spire. */
function Academy({ color, color2 }: SProps) {
  const g = useRef<Group>(null);
  useFrame((_, dt) => { if (g.current) g.current.rotation.y -= dt * 0.14; });
  return (
    <group ref={g}>
      <mesh><coneGeometry args={[0.6, 4.5, 6]} /><meshStandardMaterial color={color} metalness={0.7} roughness={0.35} emissive={color2} emissiveIntensity={0.4} /></mesh>
      {[-1.4, 0, 1.4].map((y, i) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.6 - Math.abs(y) * 0.5, 0.12, 10, 64]} /><meshStandardMaterial {...emissive(i % 2 ? color2 : color, 0.7)} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/** Comms beacon — tower with a pulsing emitter and signal rings. */
function Beacon({ color, color2 }: SProps) {
  const g = useRef<Group>(null);
  const pulse = useRef<Group>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    if (g.current) g.current.rotation.y += dt * 0.16;
    t.current += dt;
    if (pulse.current) { const s = 1 + (Math.sin(t.current * 2) * 0.5 + 0.5) * 2.2; pulse.current.scale.setScalar(s); }
  });
  return (
    <group ref={g}>
      <mesh position={[0, -1.4, 0]}><cylinderGeometry args={[0.18, 0.4, 3.2, 10]} /><meshStandardMaterial color={color} metalness={0.85} roughness={0.3} /></mesh>
      <mesh position={[0, 0.6, 0]}><sphereGeometry args={[0.5, 24, 24]} /><meshStandardMaterial {...emissive(color2, 2)} toneMapped={false} /></mesh>
      <group ref={pulse} position={[0, 0.6, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.8, 0.02, 6, 48]} /><meshBasicMaterial color={color2} transparent opacity={0.4} /></mesh>
      </group>
    </group>
  );
}

/** Wormhole portal — twin rings around a swirling disc. */
function Portal({ color, color2 }: SProps) {
  const g = useRef<Group>(null);
  const disc = useRef<Group>(null);
  useFrame((_, dt) => {
    if (g.current) g.current.rotation.z += dt * 0.12;
    if (disc.current) disc.current.rotation.z -= dt * 0.9;
  });
  return (
    <group ref={g}>
      <mesh><torusGeometry args={[3.4, 0.18, 16, 100]} /><meshStandardMaterial {...emissive(color, 1.2)} toneMapped={false} /></mesh>
      <mesh scale={0.86}><torusGeometry args={[3.4, 0.08, 12, 100]} /><meshStandardMaterial {...emissive(color2, 1.4)} toneMapped={false} /></mesh>
      <group ref={disc}>
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 2.4, Math.sin(a) * 2.4, 0]} rotation={[0, 0, a]}>
              <planeGeometry args={[1.6, 0.18]} /><meshBasicMaterial color={i % 2 ? color : color2} transparent opacity={0.5} side={2} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

const MAP: Record<StructureKind, (p: SProps) => React.ReactElement> = {
  origin: Origin, planet: Planet, station: SpaceStation, ringworld: Ringworld,
  satellites: Satellites, academy: Academy, beacon: Beacon, portal: Portal,
};

export default function Structure({ kind, color, color2 }: SProps & { kind: StructureKind }) {
  const Comp = MAP[kind];
  return <Comp color={color} color2={color2} />;
}
