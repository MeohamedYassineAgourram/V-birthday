"use client";

import { useMemo } from "react";
import * as THREE from "three";

/* Two additive shells give the blue edge glow:
   - an outer back-side halo that flares at the silhouette (Fresnel)
   - a tighter inner rim that hugs the limb */
function fresnelMaterial({ color, power, intensity, side }) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uPower: { value: power },
      uIntensity: { value: intensity },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vView;
      uniform vec3 uColor;
      uniform float uPower;
      uniform float uIntensity;
      void main() {
        float f = pow(1.0 - abs(dot(vNormal, vView)), uPower);
        gl_FragColor = vec4(uColor, f * uIntensity);
      }
    `,
  });
}

export default function Atmosphere({ radius = 2.35 }) {
  const outer = useMemo(
    () =>
      fresnelMaterial({
        color: "#5b8def",
        power: 3.0,
        intensity: 1.15,
        side: THREE.BackSide,
      }),
    []
  );
  const inner = useMemo(
    () =>
      fresnelMaterial({
        color: "#a9c7ff",
        power: 5.5,
        intensity: 0.9,
        side: THREE.FrontSide,
      }),
    []
  );

  return (
    <group>
      <mesh material={outer} scale={radius * 1.16}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>
      <mesh material={inner} scale={radius * 1.02}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>
    </group>
  );
}
