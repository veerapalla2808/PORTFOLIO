// components/space/Starfield.tsx
'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, type Points as TPoints, type Color } from 'three';

// Deterministic pseudo-random (pure → stable, no hydration noise).
function rand(n: number) { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); }

function Layer({ count, spreadXY, depth, size, opacity, color, seed }: {
  count: number; spreadXY: number; depth: number; size: number; opacity: number; color: Color; seed: number;
}) {
  const ref = useRef<TPoints>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const s = seed + i;
      arr[i * 3]     = (rand(s * 3 + 1) - 0.5) * spreadXY;
      arr[i * 3 + 1] = (rand(s * 3 + 2) - 0.5) * spreadXY;
      arr[i * 3 + 2] = 60 - rand(s * 3 + 3) * depth;
    }
    return arr;
  }, [count, spreadXY, depth, seed]);

  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * 0.004; });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={size} color={color} transparent opacity={opacity} sizeAttenuation depthWrite={false} blending={AdditiveBlending} />
    </points>
  );
}

// Layered starfield filling a large, deep volume — varied sizes + two hues for depth.
export default function Starfield({ count, color, color2 }: { count: number; color: Color; color2: Color }) {
  const far = Math.round(count * 0.55);
  const mid = Math.round(count * 0.35);
  const near = Math.round(count * 0.12);
  return (
    <>
      <Layer count={far}  spreadXY={420} depth={520} size={0.12} opacity={0.55} color={color}  seed={11} />
      <Layer count={mid}  spreadXY={300} depth={460} size={0.22} opacity={0.8}  color={color2} seed={733} />
      <Layer count={near} spreadXY={200} depth={420} size={0.4}  opacity={0.95} color={color}  seed={2087} />
    </>
  );
}
