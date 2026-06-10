'use client';
// The white rabbit — hops along the grid just ahead of you; stop moving and
// it turns to look back at you.
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GX, WORLD_X } from '@/lib/grid';
import { scrollBus } from '@/lib/scrollBus';

export default function Rabbit({ idle, reduced }: { idle: boolean; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const target = useRef(new THREE.Vector3());
  const white = useMemo(() => new THREE.Color(GX.white).multiplyScalar(1.6), []);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const x = Math.min(1, scrollBus.offset + 0.035) * WORLD_X;
    target.current.set(x + 4.5, -2.2, 3.5);
    g.position.lerp(target.current, 0.06);
    if (!reduced) {
      const t = state.clock.elapsedTime;
      g.position.y += Math.abs(Math.sin(t * 2.6)) * 0.24;
    }
    if (idle) {
      g.lookAt(state.camera.position);
    } else {
      g.lookAt(g.position.x + 4, g.position.y, g.position.z);
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
