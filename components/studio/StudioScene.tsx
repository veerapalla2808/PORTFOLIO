'use client';
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, Float, RoundedBox } from '@react-three/drei';
import { type Group } from 'three';

// A bright studio of glossy, iridescent tactile objects floating in colour.
function Obj({ position, scale, tint, shape }: {
  position: [number, number, number]; scale: number; tint: string;
  shape: 'box' | 'ico' | 'torus' | 'sphere' | 'capsule';
}) {
  // Holographic chrome: metallic mirror + oil-slick thin-film iridescence. The
  // colour comes mostly from the vibrant light environment it reflects.
  const mat = (
    <meshPhysicalMaterial
      color={tint} metalness={1} roughness={0.06}
      iridescence={1} iridescenceIOR={1.9} iridescenceThicknessRange={[120, 900]}
      clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={1.7}
    />
  );
  return (
    <Float speed={1.6} rotationIntensity={1.1} floatIntensity={1.4} position={position}>
      {shape === 'box' && <RoundedBox args={[1, 1, 1]} radius={0.18} smoothness={6} scale={scale}>{mat}</RoundedBox>}
      {shape === 'ico' && <mesh scale={scale}><icosahedronGeometry args={[0.7, 0]} />{mat}</mesh>}
      {shape === 'torus' && <mesh scale={scale} rotation={[0.5, 0.3, 0]}><torusGeometry args={[0.55, 0.22, 32, 96]} />{mat}</mesh>}
      {shape === 'sphere' && <mesh scale={scale}><sphereGeometry args={[0.7, 64, 64]} />{mat}</mesh>}
      {shape === 'capsule' && <mesh scale={scale} rotation={[0.3, 0, 0.6]}><capsuleGeometry args={[0.42, 0.7, 16, 32]} />{mat}</mesh>}
    </Float>
  );
}

function ParallaxRig({ children }: { children: React.ReactNode }) {
  const g = useRef<Group>(null);
  const p = useRef({ x: 0, y: 0 });
  useFrame((state) => {
    p.current.x = state.pointer.x; p.current.y = state.pointer.y;
    if (g.current) {
      g.current.rotation.y += (p.current.x * 0.35 - g.current.rotation.y) * 0.05;
      g.current.rotation.x += (-p.current.y * 0.25 - g.current.rotation.x) * 0.05;
    }
  });
  return <group ref={g}>{children}</group>;
}

export default function StudioScene() {
  return (
    <Canvas camera={{ position: [0, 0, 9], fov: 42 }} gl={{ alpha: true, antialias: true }} dpr={[1, 2]}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 6, 5]} intensity={1.1} />
      {/* Vibrant softboxes wrap the chrome in a rainbow → holographic reflections */}
      <Environment resolution={512}>
        {/* big soft fill behind the camera so chrome reflects bright, not black */}
        <Lightformer form="rect" intensity={1.5} position={[0, 0, 9]} scale={[24, 24, 1]} color="#fff3fb" />
        <Lightformer form="rect"   intensity={3}   position={[0, 6, -3]}  scale={[12, 6, 1]} color="#ffffff" />
        <Lightformer form="rect"   intensity={3.2} position={[6, 4, 3]}   scale={[8, 8, 1]}  color="#ff5cd6" />
        <Lightformer form="rect"   intensity={3.2} position={[-7, 3, 2]}  scale={[8, 8, 1]}  color="#5ce1ff" />
        <Lightformer form="circle" intensity={3}   position={[0, -5, 4]}  scale={7}          color="#b6ff5c" />
        <Lightformer form="circle" intensity={2.6} position={[4, -3, -4]} scale={6}          color="#8b5cff" />
        <Lightformer form="rect"   intensity={2.4} position={[-4, -2, 5]} scale={6}          color="#ffb45c" />
      </Environment>
      <ParallaxRig>
        <Obj position={[-3.1, 1.3, 0]} scale={1.25} tint="#f5e9ff" shape="box" />
        <Obj position={[3.2, 1.7, -1]} scale={1.5} tint="#e9f6ff" shape="ico" />
        <Obj position={[-2.4, -1.9, -0.5]} scale={1.2} tint="#f0ffe9" shape="torus" />
        <Obj position={[2.6, -1.6, 0.5]} scale={1.35} tint="#fbeaff" shape="sphere" />
        <Obj position={[0.2, 2.4, -2]} scale={0.9} tint="#fff4e9" shape="capsule" />
        <Obj position={[0.4, -2.7, -1.5]} scale={1} tint="#eafbff" shape="ico" />
      </ParallaxRig>
    </Canvas>
  );
}
