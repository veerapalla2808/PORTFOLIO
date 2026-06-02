// components/cockpit/SpaceScene.tsx
'use client';
import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor, AdaptiveDpr } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Skybox, Sun } from './Sky';
import Planet from './Planet';
import ShipCamera from './ShipCamera';
import { useTravelProgress } from '@/lib/useTravelProgress';
import { DESTINATIONS, DEST_Z } from '@/lib/destinations';
import { detectGalaxy } from '@/lib/galaxyTier';

export default function SpaceScene() {
  const progress = useTravelProgress();
  const [caps] = useState(() => detectGalaxy());
  const [dpr, setDpr] = useState(caps.tier === 'S' ? 1 : 1.5);

  return (
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: '#01010a' }}>
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 0, 40], fov: 55, near: 0.1, far: 2200 }}
        gl={{ antialias: caps.tier !== 'S', powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#01010a']} />
        <ambientLight intensity={0.085} />
        <PerformanceMonitor onDecline={() => setDpr((d) => Math.max(1, d - 0.4))} />
        <AdaptiveDpr pixelated />
        <Suspense fallback={null}>
          <Skybox />
          <Sun />
          {DESTINATIONS.map((d, i) => (d.texture ? <Planet key={d.id} dest={d} z={DEST_Z[i]} /> : null))}
        </Suspense>
        <ShipCamera progressRef={progress} frozen={caps.reducedMotion} />
        {caps.tier !== 'S' && (
          <EffectComposer multisampling={0}>
            <Bloom mipmapBlur intensity={0.6} luminanceThreshold={0.6} luminanceSmoothing={0.2} radius={0.5} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
