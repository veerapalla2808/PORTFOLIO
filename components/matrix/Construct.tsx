'use client';
// NEON CHICAGO — the canvas. Curved streets, enterable landmarks, the lake.
import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { GX } from '@/lib/grid';
import type { Caps } from '@/lib/tier';
import Rain from './Rain';
import CameraRig from './CameraRig';
import Effects from './Effects';
import {
  RainMatDriver, ZoneAmbience, StreetLanes, StreetLights, CityBlocks,
  Lake, NavyPier, BeanPlaza, Landmarks, Interiors, GateArch, Signposts,
  AnomalyBillboards, Pills, Phoenix, SpeedLines, GlyphBurst,
  SkyTraffic, Searchlights,
} from './scenes';

export interface Burst { id: number; x: number; z: number; color: string }

export default function Construct({
  caps, idle, booted, bursts, onFrame, onBoot, onRed, onBlue, onQuest, onBurstDone,
}: {
  caps: Caps;
  idle: boolean;
  booted: Set<string>;
  bursts: Burst[];
  onFrame: (x: number, z: number) => void;
  onBoot: (id: string) => void;
  onRed: () => void;
  onBlue: () => void;
  onQuest: () => void;
  onBurstDone: (id: number) => void;
}) {
  const [degraded, setDegraded] = useState(false);
  const { tier, reducedMotion } = caps;
  const dpr: [number, number] = degraded || tier === 'S' ? [1, 1.25] : [1, tier === 'L' ? 2 : 1.5];
  const post = tier !== 'S' && !degraded;

  return (
    <Canvas
      className="mx-canvas"
      dpr={dpr}
      camera={{ fov: 52, near: 0.1, far: 280, position: [-20, 2.2, 44] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={[GX.bg]} />
      <fog attach="fog" args={[GX.bg, 24, 170]} />
      <PerformanceMonitor onDecline={() => setDegraded(true)} />

      <ambientLight intensity={0.42} />
      <directionalLight position={[8, 16, 10]} intensity={0.38} color="#9CC2FF" />
      <directionalLight position={[-8, 10, -10]} intensity={0.3} color="#C9A8FF" />

      <RainMatDriver reduced={reducedMotion} />
      <Rain tier={degraded ? 'S' : tier} reduced={reducedMotion} />
      <ZoneAmbience />
      <StreetLanes />
      <StreetLights />
      {tier !== 'S' && !degraded && <SkyTraffic reduced={reducedMotion} />}
      {tier !== 'S' && !degraded && <Searchlights reduced={reducedMotion} />}
      <CityBlocks tier={degraded ? 'S' : tier} />
      <Lake reduced={reducedMotion} />
      <NavyPier reduced={reducedMotion} />
      <BeanPlaza reduced={reducedMotion} />
      <Landmarks />
      <Interiors reduced={reducedMotion} />
      <GateArch />
      <Signposts />
      <AnomalyBillboards booted={booted} onBoot={onBoot} />
      <Pills onRed={onRed} onBlue={onBlue} />
      <Phoenix idle={idle} reduced={reducedMotion} onQuest={onQuest} />
      {bursts.map(b => (
        <GlyphBurst key={b.id} x={b.x} z={b.z} color={b.color} onDone={() => onBurstDone(b.id)} />
      ))}
      <SpeedLines />
      <CameraRig reduced={reducedMotion} onFrame={onFrame} />

      {post && <Effects reduced={reducedMotion} />}
    </Canvas>
  );
}
