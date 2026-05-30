// components/space/Stations.tsx
'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { type Group, type Color } from 'three';
import { STATIONS } from '@/lib/journey';

function Station({ z, side, color, color2, index }: { z: number; side: number; color: Color; color2: Color; index: number }) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.z += dt * (0.1 + index * 0.01);
    ref.current.rotation.x += dt * 0.04;
  });
  return (
    <group ref={ref} position={[side * 9, side * 1.5, z]}>
      {/* Glowing core */}
      <mesh>
        <icosahedronGeometry args={[1.1, 1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Orbiting ring */}
      <mesh rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[3.4, 0.08, 12, 80]} />
        <meshStandardMaterial color={color2} emissive={color2} emissiveIntensity={0.9} />
      </mesh>
      {/* Second ring */}
      <mesh rotation={[0, Math.PI / 3, Math.PI / 4]}>
        <torusGeometry args={[4.6, 0.05, 10, 80]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

export default function Stations({ color, color2 }: { color: Color; color2: Color }) {
  return (
    <>
      {STATIONS.map((s, i) => (
        <Station key={s.id} z={s.z} side={s.side} color={color} color2={color2} index={i} />
      ))}
    </>
  );
}
