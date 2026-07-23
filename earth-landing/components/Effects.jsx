"use client";

import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

// Soft cinematic bloom on the bright limb + a gentle vignette.
export default function Effects() {
  return (
    <EffectComposer disableNormalPass multisampling={0}>
      <Bloom
        intensity={0.72}
        luminanceThreshold={0.22}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.7}
      />
      <Vignette eskil={false} offset={0.35} darkness={0.55} />
    </EffectComposer>
  );
}
