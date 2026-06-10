'use client';
// Post stack — selective bloom (threshold 1 + emissive>1), subtle chromatic
// aberration, vignette, subliminal noise. Glitch fires only during the
// anomalies act. Tier S skips post entirely; reduced motion kills CA/glitch.
import {
  EffectComposer, Bloom, ChromaticAberration, Vignette, Noise, Glitch,
} from '@react-three/postprocessing';
import { GlitchMode } from 'postprocessing';
import * as THREE from 'three';
import type { Tier } from '@/lib/tier';

export default function Effects({
  tier, reduced, actIdx,
}: { tier: Tier; reduced: boolean; actIdx: number }) {
  const glitchActive = actIdx === 4 && !reduced;

  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={1.2} luminanceThreshold={1} luminanceSmoothing={0.025} />
      {tier === 'L' && !reduced ? (
        <ChromaticAberration offset={[0.0011, 0.0011]} />
      ) : <></>}
      {!reduced ? <Noise premultiply opacity={0.04} /> : <></>}
      <Vignette eskil={false} offset={0.32} darkness={0.78} />
      <Glitch
        active={glitchActive}
        mode={GlitchMode.SPORADIC}
        delay={new THREE.Vector2(2.5, 5.5)}
        duration={new THREE.Vector2(0.08, 0.22)}
        strength={new THREE.Vector2(0.04, 0.16)}
        ratio={0.9}
      />
    </EffectComposer>
  );
}
