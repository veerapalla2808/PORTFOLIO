'use client';
// NEON GRID — the canvas. One damped offset flies the whole world.
import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { GX } from '@/lib/grid';
import type { Caps } from '@/lib/tier';
import Rain from './Rain';
import CameraRig from './CameraRig';
import Effects from './Effects';
import {
  CityCanyon, Streets, HeroVortex, SpeedLines, IdentityHolo,
  NeonSignWall, EraPortals, AnomalyBillboards, Pills, Rabbit,
} from './scenes';

export default function Construct({
  caps, idle, booted, onFrame, onBoot, onRed, onBlue,
}: {
  caps: Caps;
  idle: boolean;
  booted: Set<string>;
  onFrame: (offset: number) => void;
  onBoot: (id: string) => void;
  onRed: () => void;
  onBlue: () => void;
}) {
  const [degraded, setDegraded] = useState(false);
  const { tier, reducedMotion } = caps;
  const dpr: [number, number] = degraded || tier === 'S' ? [1, 1.25] : [1, tier === 'L' ? 2 : 1.5];
  const post = tier !== 'S' && !degraded;

  return (
    <Canvas
      className="mx-canvas"
      dpr={dpr}
      camera={{ fov: 52, near: 0.1, far: 320, position: [0, 2, 40] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={[GX.bg]} />
      <fog attach="fog" args={[GX.bg, 30, 190]} />
      <PerformanceMonitor onDecline={() => setDegraded(true)} />

      <ambientLight intensity={0.45} />
      <directionalLight position={[8, 14, 10]} intensity={0.4} color="#aac8ff" />
      <directionalLight position={[-8, 6, -10]} intensity={0.3} color="#d9a8ff" />

      <Rain tier={tier} reduced={reducedMotion} />
      <Streets />
      <CityCanyon tier={tier} />
      <HeroVortex reduced={reducedMotion} />
      <IdentityHolo reduced={reducedMotion} />
      <NeonSignWall reduced={reducedMotion} />
      <EraPortals />
      <AnomalyBillboards booted={booted} onBoot={onBoot} />
      <Pills onRed={onRed} onBlue={onBlue} />
      <Rabbit idle={idle} reduced={reducedMotion} />
      <SpeedLines />
      <CameraRig reduced={reducedMotion} onFrame={onFrame} />

      {post && <Effects reduced={reducedMotion} />}
    </Canvas>
  );
}
