'use client';
// THE GRID — full R3F canvas. One damped offset drives camera, scenes and HUD.
import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { GX } from '@/lib/grid';
import type { Caps } from '@/lib/tier';
import Rain from './Rain';
import CameraRig from './CameraRig';
import Rabbit from './Rabbit';
import Effects from './Effects';
import {
  FloorGrid, HeroRings, IdentityCore, ArsenalRacks, PowerTowers, Anomalies, Pills,
} from './scenes';

export default function Construct({
  caps, zoneIdx, idle, unlocked, booted, onFrame, onBoot, onRed, onBlue,
}: {
  caps: Caps;
  zoneIdx: number;
  idle: boolean;
  unlocked: Set<string>;
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
      camera={{ fov: 50, near: 0.1, far: 180, position: [0, 1.1, 16] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={[GX.bg]} />
      <fog attach="fog" args={[GX.bg, 22, 110]} />
      <PerformanceMonitor onDecline={() => setDegraded(true)} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[6, 10, 8]} intensity={0.5} color="#aac8ff" />
      <directionalLight position={[-6, 4, 6]} intensity={0.25} color="#ff9a9a" />

      <Rain tier={tier} reduced={reducedMotion} />
      <FloorGrid />
      <HeroRings reduced={reducedMotion} />
      <IdentityCore unlocked={unlocked.has('identity')} />
      <ArsenalRacks unlocked={unlocked.has('arsenal')} />
      <PowerTowers unlocked={unlocked.has('timeline')} booted={booted} onBoot={onBoot} />
      <Anomalies unlocked={unlocked.has('anomalies')} booted={booted} onBoot={onBoot} />
      <Pills onRed={onRed} onBlue={onBlue} />
      <Rabbit idle={idle} reduced={reducedMotion} />
      <CameraRig reduced={reducedMotion} onFrame={onFrame} />

      {post && <Effects tier={tier} reduced={reducedMotion} actIdx={zoneIdx} />}
    </Canvas>
  );
}
