// components/three/Scene3D.tsx
'use client';
import { useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PerformanceMonitor, AdaptiveDpr } from '@react-three/drei';
import { TIER_CONFIG, type Tier } from '@/lib/capability';
import { useScrollProgress } from '@/lib/useScrollProgress';
import HeroObject from './HeroObject';
import AmbientField from './AmbientField';
import CameraRig from './CameraRig';

// In reduced-motion mode the canvas uses frameloop="demand" (no continuous loop,
// so no perceptible motion). This requests a fresh single frame after the layout
// has settled and whenever the viewport resizes, so the static 3D scene is drawn
// at the correct size instead of being left blank.
function StaticFrame() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let raf1 = 0, raf2 = 0;
    // Two rAFs: ensure the canvas has its final size before the one render.
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => invalidate());
    });
    const onResize = () => invalidate();
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.removeEventListener('resize', onResize);
    };
  }, [invalidate]);
  return null;
}

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
      frameloop={reducedMotion ? 'demand' : 'always'}
      dpr={dpr}
      gl={{
        antialias: tier !== 'S',
        powerPreference: 'high-performance',
        alpha: true,
        // Keep the painted frame around when motion is disabled (demand mode
        // paints rarely) so the static scene never flashes to empty.
        preserveDrawingBuffer: reducedMotion,
      }}
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
      {reducedMotion && <StaticFrame />}
    </Canvas>
  );
}
