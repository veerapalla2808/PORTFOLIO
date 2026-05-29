// components/three/HeroObject.tsx
'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import type { Mesh } from 'three';
import { useThreeTheme } from './useThreeTheme';

export default function HeroObject({
  detail,
  distortSpeed,
  frozen,
}: {
  detail: number;
  distortSpeed: number;
  frozen: boolean;
}) {
  const mesh = useRef<Mesh>(null);
  const { accent, accent2 } = useThreeTheme();

  useFrame((_, delta) => {
    if (frozen || !mesh.current) return;
    mesh.current.rotation.y += delta * 0.15;
    mesh.current.rotation.x += delta * 0.05;
  });

  return (
    <mesh ref={mesh} scale={1.45} position={[1.3, 0.1, 0]}>
      <icosahedronGeometry args={[1, detail]} />
      <MeshDistortMaterial
        color={accent}
        emissive={accent2}
        emissiveIntensity={0.3}
        roughness={0.2}
        metalness={0.65}
        distort={frozen ? 0.3 : 0.5}
        speed={frozen ? 0 : distortSpeed}
      />
    </mesh>
  );
}
