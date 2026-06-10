'use client';
// NEON GRID v3 — the canvas. A drivable city of streets and districts.
import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { GX } from '@/lib/grid';
import type { Caps } from '@/lib/tier';
import Rain from './Rain';
import CameraRig from './CameraRig';
import Effects from './Effects';
import {
  CityBlocks, StreetLanes, GateArch, Signposts, IdentityHolo, NeonSignWall,
  EraPortals, SpeedLines, AnomalyBillboards, CredsCourt, TransmissionRow,
  Pills, Rabbit, HubBeacon, DistrictPortals, ZoneAmbience, GlyphBurst,
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
      camera={{ fov: 52, near: 0.1, far: 240, position: [0, 2.2, 30] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={[GX.bg]} />
      <fog attach="fog" args={[GX.bg, 24, 150]} />
      <PerformanceMonitor onDecline={() => setDegraded(true)} />

      <ambientLight intensity={0.42} />
      <directionalLight position={[8, 16, 10]} intensity={0.38} color="#9CC2FF" />
      <directionalLight position={[-8, 10, -10]} intensity={0.3} color="#C9A8FF" />

      <Rain tier={degraded ? 'S' : tier} reduced={reducedMotion} />
      <ZoneAmbience />
      <StreetLanes />
      <CityBlocks tier={degraded ? 'S' : tier} reduced={reducedMotion} />
      <GateArch />
      <HubBeacon reduced={reducedMotion} />
      <DistrictPortals />
      <Signposts />
      <IdentityHolo reduced={reducedMotion} />
      <NeonSignWall reduced={reducedMotion} />
      <EraPortals />
      <AnomalyBillboards booted={booted} onBoot={onBoot} />
      <CredsCourt reduced={reducedMotion} />
      <TransmissionRow />
      <Pills onRed={onRed} onBlue={onBlue} />
      <Rabbit idle={idle} reduced={reducedMotion} onQuest={onQuest} />
      {bursts.map(b => (
        <GlyphBurst key={b.id} x={b.x} z={b.z} color={b.color} onDone={() => onBurstDone(b.id)} />
      ))}
      <SpeedLines />
      <CameraRig reduced={reducedMotion} onFrame={onFrame} />

      {post && <Effects reduced={reducedMotion} />}
    </Canvas>
  );
}
