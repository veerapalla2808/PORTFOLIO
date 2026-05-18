// components/three/FloatingGeometry.tsx
"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function OrbitingTorus({
  radius,
  speed,
  offset,
}: {
  radius: number;
  speed: number;
  offset: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed + offset;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.y = Math.sin(t) * radius * 0.4;
    ref.current.position.z = Math.sin(t * 0.7) * radius * 0.3;
    ref.current.rotation.x += 0.01;
    ref.current.rotation.y += 0.015;
  });

  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[0.18, 0.05, 64, 8]} />
      <meshBasicMaterial color="#00f2ff" wireframe />
    </mesh>
  );
}

function Scene({
  mouseX,
  mouseY,
  reducedMotion,
}: {
  mouseX: number;
  mouseY: number;
  reducedMotion: boolean;
}) {
  const icosaRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (reducedMotion) return;
    if (icosaRef.current) {
      icosaRef.current.rotation.x += 0.003;
      icosaRef.current.rotation.y += 0.005;
    }
    if (groupRef.current) {
      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x,
        mouseX * 0.5,
        0.05
      );
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        -mouseY * 0.5,
        0.05
      );
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={icosaRef}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshBasicMaterial color="#00f2ff" wireframe transparent opacity={0.45} />
      </mesh>
      {!reducedMotion && (
        <>
          <OrbitingTorus radius={2.5} speed={0.3} offset={0} />
          <OrbitingTorus radius={3.2} speed={0.5} offset={(Math.PI * 2) / 3} />
          <OrbitingTorus radius={3.8} speed={0.2} offset={(Math.PI * 4) / 3} />
        </>
      )}
    </group>
  );
}

export default function FloatingGeometry({
  mouseX,
  mouseY,
  reducedMotion,
}: {
  mouseX: number;
  mouseY: number;
  reducedMotion: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      aria-hidden
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
    >
      <Scene mouseX={mouseX} mouseY={mouseY} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
