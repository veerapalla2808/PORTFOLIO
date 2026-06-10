'use client';
// Post stack — selective bloom, vignette, subliminal noise. Static props only:
// @react-three/postprocessing JSON-stringifies effect props as a cache key,
// so never pass refs/objects here. The portal warp flash is done via renderer
// exposure in CameraRig instead.
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';

export default function Effects({ reduced }: { reduced: boolean }) {
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={1.15} luminanceThreshold={1} luminanceSmoothing={0.025} />
      {!reduced ? <Noise premultiply opacity={0.035} /> : <></>}
      <Vignette eskil={false} offset={0.3} darkness={0.75} />
    </EffectComposer>
  );
}
