// components/cockpit/Sky.tsx
'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { BackSide, type Mesh } from 'three';

/** Real Milky-Way starfield wrapping the whole scene. */
export function Skybox() {
  const tex = useTexture('/textures/2k_stars_milky_way.jpg');
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.002; });
  return (
    <mesh ref={ref} scale={[-1, 1, 1]}>
      <sphereGeometry args={[700, 60, 60]} />
      <meshBasicMaterial map={tex} side={BackSide} />
    </mesh>
  );
}

/** The Sun — a bright textured body plus a directional light for realistic shading. */
export function Sun() {
  const tex = useTexture('/textures/2k_sun.jpg');
  const pos: [number, number, number] = [200, 120, 140];
  return (
    <>
      <mesh position={pos}>
        <sphereGeometry args={[48, 48, 48]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      <directionalLight position={pos} intensity={2.6} color="#fff4e6" />
    </>
  );
}
