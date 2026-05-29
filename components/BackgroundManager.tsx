// components/BackgroundManager.tsx
'use client';
import { useState, useEffect, Component, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { detectCapability, type Capability } from '@/lib/capability';

const Scene3D = dynamic(() => import('./three/Scene3D'), { ssr: false });
const CSS3DBackground = dynamic(() => import('./CSS3DBackground'), { ssr: false });
const ParticleBackground = dynamic(() => import('./ui/ParticleBackground'), { ssr: false });

// Falls back to the 2D particle canvas if the WebGL/CSS-3D renderer throws at
// runtime (e.g. WebGL context creation fails despite feature detection).
class BackgroundBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function BackgroundManager() {
  const [cap, setCap] = useState<Capability | null>(null);

  useEffect(() => {
    // Detect after mount (not during render) so SSR output stays neutral and the
    // client picks the renderer without a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCap(detectCapability());
  }, []);

  if (!cap) {
    // Pre-detection: neutral painted background, no canvas (no hydration mismatch).
    return (
      <div
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'var(--bg-primary)' }}
      />
    );
  }

  if (cap.renderer === 'webgl') {
    return (
      <BackgroundBoundary fallback={<ParticleBackground />}>
        <Scene3D tier={cap.tier} reducedMotion={cap.reducedMotion} />
      </BackgroundBoundary>
    );
  }
  if (cap.renderer === 'css3d') {
    return (
      <BackgroundBoundary fallback={<ParticleBackground />}>
        <CSS3DBackground frozen={cap.reducedMotion} />
      </BackgroundBoundary>
    );
  }
  return <ParticleBackground />;
}
