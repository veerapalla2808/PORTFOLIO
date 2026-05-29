// components/three/Scene3D.tsx
'use client';
import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor, AdaptiveDpr } from '@react-three/drei';
import { TIER_CONFIG, type Tier } from '@/lib/capability';
import { useScrollProgress } from '@/lib/useScrollProgress';
import HeroObject from './HeroObject';
import AmbientField from './AmbientField';
import CameraRig from './CameraRig';

export default function Scene3D({
  tier,
  reducedMotion,
}: {
  tier: Tier;
  reducedMotion: boolean;
}) {
  const cfg = TIER_CONFIG[tier];
  const scrollProgress = useScrollProgress();
  const [dpr, setDpr] = useState<number>(cfg.dpr[1]);

  return (
    <Canvas
      aria-hidden="true"
      frameloop={reducedMotion ? 'never' : 'always'}
      dpr={dpr}
      gl={{ antialias: tier !== 'S', powerPreference: 'high-performance', alpha: true }}
      camera={{ position: [0, 0, 6], fov: 50 }}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr((d) => Math.max(cfg.dpr[0], d - 0.5))}
      />
      <AdaptiveDpr pixelated />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} />
      <HeroObject detail={cfg.icoDetail} distortSpeed={cfg.distortSpeed} frozen={reducedMotion} />
      <AmbientField count={cfg.particleCount} frozen={reducedMotion} />
      <CameraRig scrollProgress={scrollProgress} frozen={reducedMotion} />
      <fog attach="fog" args={['#0d0d1a', 6, 16]} />
    </Canvas>
  );
}
