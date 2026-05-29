// components/three/AmbientField.tsx
'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, type Points as TPoints } from 'three';
import { useThreeTheme } from './useThreeTheme';

export default function AmbientField({
  count,
  frozen,
}: {
  count: number;
  frozen: boolean;
}) {
  const ref = useRef<TPoints>(null);
  const { accent } = useThreeTheme();

  const positions = useMemo(() => {
    // Deterministic pseudo-random (pure, stable across re-renders).
    const rand = (n: number) => {
      const x = Math.sin(n * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (rand(i * 3 + 1) - 0.5) * 18;
      arr[i * 3 + 1] = (rand(i * 3 + 2) - 0.5) * 18;
      arr[i * 3 + 2] = (rand(i * 3 + 3) - 0.5) * 14;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (frozen || !ref.current) return;
    ref.current.rotation.y += delta * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color={accent}
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}
