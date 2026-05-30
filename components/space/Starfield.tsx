// components/space/Starfield.tsx
'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, type Points as TPoints, type Color } from 'three';
import { JOURNEY_DEPTH } from '@/lib/journey';

// Deterministic pseudo-random (pure → stable across renders, no hydration noise).
function rand(n: number) { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); }

export default function Starfield({ count, color }: { count: number; color: Color }) {
  const ref = useRef<TPoints>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const depth = JOURNEY_DEPTH + 80;
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (rand(i * 3 + 1) - 0.5) * 90;
      arr[i * 3 + 1] = (rand(i * 3 + 2) - 0.5) * 90;
      arr[i * 3 + 2] = 40 - rand(i * 3 + 3) * depth;  // spread along the flight path
    }
    return arr;
  }, [count]);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 0.01;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.18}
        color={color}
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}
