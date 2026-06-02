// components/space/Decor.tsx
'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, type Color } from 'three';
import { JOURNEY_DEPTH } from '@/lib/journey';

function rand(n: number) { const x = Math.sin(n * 91.17) * 43758.5453; return x - Math.floor(x); }

// Smooth background planet of a given size; optionally ringed. High-poly = no facets.
function Planet({ r, ringed, color, emis }: { r: number; ringed: boolean; color: Color; emis: number }) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[r, 64, 64]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emis} roughness={0.8} metalness={0.25} />
      </mesh>
      <mesh scale={1.12}><sphereGeometry args={[r, 32, 32]} /><meshBasicMaterial color={color} transparent opacity={0.08} /></mesh>
      {ringed && (
        <mesh rotation={[Math.PI / 2.3, 0.3, 0]}>
          <torusGeometry args={[r * 1.8, r * 0.12, 2, 96]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} transparent opacity={0.6} side={2} />
        </mesh>
      )}
    </group>
  );
}

/** A distant solar system — a glowing sun with smooth planets on slow orbits. */
function SolarSystem({ color, color2 }: { color: Color; color2: Color }) {
  const orbits = useRef<Group[]>([]);
  useFrame((_, dt) => orbits.current.forEach((o, i) => { if (o) o.rotation.y += dt * (0.05 + i * 0.03); }));
  return (
    <group position={[-70, 24, -JOURNEY_DEPTH * 0.55]} scale={1.6}>
      <mesh>
        <sphereGeometry args={[6, 64, 64]} />
        <meshBasicMaterial color={color2} />
      </mesh>
      <mesh scale={1.5}><sphereGeometry args={[6, 32, 32]} /><meshBasicMaterial color={color2} transparent opacity={0.18} /></mesh>
      {[12, 17, 23].map((rad, i) => (
        <group key={rad} ref={(el) => { if (el) orbits.current[i] = el; }} rotation={[0.2 * i, 0, 0.1 * i]}>
          <mesh position={[rad, 0, 0]}>
            <sphereGeometry args={[1 + i * 0.7, 48, 48]} />
            <meshStandardMaterial color={i % 2 ? color : color2} emissive={i % 2 ? color : color2} emissiveIntensity={0.3} roughness={0.7} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[rad, 0.03, 6, 120]} /><meshBasicMaterial color={color} transparent opacity={0.18} /></mesh>
        </group>
      ))}
    </group>
  );
}

// Background scenery scattered far off the flight path — varied planet sizes, a
// ringed giant, and a solar system — so the journey flies through a living galaxy.
export default function Decor({ color, color2 }: { color: Color; color2: Color }) {
  const items = useMemo(() => {
    const n = 12;
    return Array.from({ length: n }, (_, i) => {
      const side = rand(i + 1) > 0.5 ? 1 : -1;
      return {
        key: i,
        pos: [
          side * (40 + rand(i * 2 + 3) * 55),
          (rand(i * 2 + 7) - 0.5) * 60,
          -10 - rand(i * 2 + 11) * (JOURNEY_DEPTH + 60),
        ] as [number, number, number],
        r: 2 + rand(i * 3 + 5) * 9,
        ringed: rand(i * 5 + 2) > 0.7,
        emis: 0.15 + rand(i * 4 + 1) * 0.3,
      };
    });
  }, []);

  return (
    <group>
      <SolarSystem color={color} color2={color2} />
      {items.map((it) => (
        <group key={it.key} position={it.pos}>
          <Planet r={it.r} ringed={it.ringed} color={it.key % 2 ? color2 : color} emis={it.emis} />
        </group>
      ))}
    </group>
  );
}
