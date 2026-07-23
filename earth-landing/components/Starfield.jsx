"use client";

import { useMemo } from "react";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

/* Deep-space environment: thousands of tiny stars + a very faint nebula glow.
   The nebula is an inward-facing sphere with an additive radial gradient — no flat image. */
function Nebula() {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uA: { value: new THREE.Color("#14203f") },
        uB: { value: new THREE.Color("#1a1236") },
      },
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vDir;
        uniform vec3 uA;
        uniform vec3 uB;
        // two soft blobs of colour, everything else black
        float blob(vec3 d, vec3 c, float s) {
          return smoothstep(s, 0.0, distance(d, normalize(c)));
        }
        void main() {
          float a = blob(vDir, vec3(-0.6, 0.3, -1.0), 1.1) * 0.5;
          float b = blob(vDir, vec3(0.8, -0.4, -0.6), 1.3) * 0.35;
          vec3 col = uA * a + uB * b;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
  }, []);

  return (
    <mesh scale={90} material={material}>
      <sphereGeometry args={[1, 32, 32]} />
    </mesh>
  );
}

export default function Starfield() {
  return (
    <group>
      <Nebula />
      <Stars
        radius={120}
        depth={60}
        count={6500}
        factor={3.2}
        saturation={0}
        fade
        speed={0.35}
      />
    </group>
  );
}
