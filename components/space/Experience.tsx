// components/space/Experience.tsx
'use client';
import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor, AdaptiveDpr } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Color } from 'three';
import { detectGalaxy, GALAXY_DENSITY } from '@/lib/galaxyTier';
import { useScrollProgress } from '@/lib/useScrollProgress';
import { useWarp } from '@/components/galaxy/WarpController';
import { GUIDES } from '@/components/galaxy/guides';
import Starfield from './Starfield';
import Stations from './Stations';
import Droid from './Droid';
import CameraRig from './CameraRig';

function readColor(varName: string, fallback: string): Color {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return new Color(raw || fallback);
}

export default function Experience() {
  const scrollProgress = useScrollProgress();
  const { warpLevelRef, activeSector, reducedMotion } = useWarp();
  const [caps] = useState(() => detectGalaxy());
  const dens = GALAXY_DENSITY[caps.tier];
  const [dpr, setDpr] = useState(dens.dprMax);
  const [colors, setColors] = useState(() => ({ accent: new Color('#7b6fff'), accent2: new Color('#c084fc'), base: new Color('#07070f') }));

  useEffect(() => {
    const read = () => setColors({
      accent: readColor('--accent', '#7b6fff'),
      accent2: readColor('--accent-2', '#c084fc'),
      base: document.documentElement.getAttribute('data-theme') === 'light'
        ? new Color('#e9e7ff') : new Color('#07070f'),
    });
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const line = (GUIDES[activeSector]?.lines.join('  ')) ?? '';
  const starCount = dens.stars * 6;

  return (
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas
        frameloop={reducedMotion ? 'demand' : 'always'}
        dpr={dpr}
        gl={{ antialias: caps.tier !== 'S', powerPreference: 'high-performance', alpha: true }}
        camera={{ position: [0, 0, 6], fov: 62, near: 0.1, far: 400 }}
      >
        <color attach="background" args={[colors.base.r, colors.base.g, colors.base.b]} />
        <fog attach="fog" args={[colors.base.getHex(), 14, 90]} />
        <PerformanceMonitor onDecline={() => setDpr((d) => Math.max(dens.dprMax - 0.5, d - 0.5))} />
        <AdaptiveDpr pixelated />

        <ambientLight intensity={0.5} />
        <pointLight position={[8, 6, 8]} intensity={120} color={colors.accent} distance={60} />
        <pointLight position={[-8, -4, -10]} intensity={90} color={colors.accent2} distance={60} />

        <Starfield count={starCount} color={colors.accent} />
        <Stations color={colors.accent} color2={colors.accent2} />
        <Droid color={colors.accent} color2={colors.accent2} line={line} frozen={caps.reducedMotion} />
        <CameraRig scrollProgress={scrollProgress} warpLevelRef={warpLevelRef} frozen={caps.reducedMotion} />

        {caps.tier !== 'S' && (
          <EffectComposer>
            <Bloom mipmapBlur intensity={1.1} luminanceThreshold={0.25} luminanceSmoothing={0.35} radius={0.8} />
            <Vignette eskil={false} offset={0.25} darkness={0.75} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
