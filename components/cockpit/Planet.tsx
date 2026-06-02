// components/cockpit/Planet.tsx
'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { RingGeometry, Vector3, DoubleSide, type Mesh, type Group } from 'three';
import type { Destination } from '@/lib/destinations';

// Remap a RingGeometry's UVs so the ring-alpha strip maps along the radius.
function useRingGeometry(inner: number, outer: number) {
  return useMemo(() => {
    const g = new RingGeometry(inner, outer, 128, 1);
    const pos = g.attributes.position;
    const uv = g.attributes.uv;
    const v = new Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const t = (v.length() - inner) / (outer - inner);
      uv.setXY(i, t, 0.5);
    }
    return g;
  }, [inner, outer]);
}

function Ring({ radius }: { radius: number }) {
  const tex = useTexture('/textures/2k_saturn_ring_alpha.png');
  const geo = useRingGeometry(radius * 1.3, radius * 2.3);
  return (
    <mesh geometry={geo} rotation={[Math.PI / 2.1, 0.15, 0]}>
      <meshBasicMaterial color="#d9c9a6" alphaMap={tex} transparent side={DoubleSide} depthWrite={false} />
    </mesh>
  );
}

function Clouds({ radius }: { radius: number }) {
  const tex = useTexture('/textures/2k_earth_clouds.jpg');
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.012; });
  return (
    <mesh ref={ref} scale={1.015}>
      <sphereGeometry args={[radius, 48, 48]} />
      <meshStandardMaterial map={tex} transparent opacity={0.45} depthWrite={false} />
    </mesh>
  );
}

export default function Planet({ dest, z }: { dest: Destination; z: number }) {
  const group = useRef<Group>(null);
  const surface = useRef<Mesh>(null);
  const map = useTexture(`/textures/${dest.texture}`);

  useFrame((_, dt) => { if (surface.current) surface.current.rotation.y += dt * 0.02; });

  return (
    <group ref={group} position={[dest.offset[0], dest.offset[1], z]} rotation={[0.2, 0, 0.12]}>
      <mesh ref={surface}>
        <sphereGeometry args={[dest.radius, 64, 64]} />
        <meshStandardMaterial map={map} roughness={1} metalness={0} />
      </mesh>
      {dest.clouds && <Clouds radius={dest.radius} />}
      {dest.ring && <Ring radius={dest.radius} />}
    </group>
  );
}
