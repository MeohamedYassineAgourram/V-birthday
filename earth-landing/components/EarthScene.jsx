"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr, Preload } from "@react-three/drei";
import * as THREE from "three";
import Earth from "./Earth";

const EARTH_RADIUS = 2.34;
const reducedMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function Atmosphere() {
  const material = useRef();

  useFrame(({ clock }) => {
    if (material.current && !reducedMotion) {
      material.current.uniforms.uPulse.value = 0.9 + Math.sin(clock.elapsedTime * 0.22) * 0.06;
    }
  });

  return (
    <mesh scale={EARTH_RADIUS * 1.07} renderOrder={2}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        ref={material}
        transparent
        depthWrite={false}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        uniforms={{ uColor: { value: new THREE.Color("#eefaff") }, uPulse: { value: 0.9 } }}
        vertexShader={`varying vec3 vNormal; varying vec3 vView; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vNormal = normalize(normalMatrix * normal); vView = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`}
        fragmentShader={`varying vec3 vNormal; varying vec3 vView; uniform vec3 uColor; uniform float uPulse; void main(){ float fresnel = pow(1.0 - abs(dot(vNormal, vView)), 3.6); gl_FragColor = vec4(uColor, fresnel * 0.22 * uPulse); }`}
      />
    </mesh>
  );
}

function CameraRig() {
  const world = useRef();
  const scroll = useRef(0);
  const cameraStart = useRef(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      scroll.current = Math.min(1, window.scrollY / Math.max(window.innerHeight, 1));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useFrame((state, delta) => {
    const safeDelta = Math.min(delta, 0.05);
    const amount = scroll.current;
    const pointerX = state.pointer.x || 0;
    const pointerY = state.pointer.y || 0;

    if (world.current) {
      if (!reducedMotion) world.current.rotation.y += safeDelta * (0.012 + amount * 0.028);
      world.current.rotation.x += (pointerY * 0.035 - world.current.rotation.x) * 0.025;
      world.current.rotation.z += (-pointerX * 0.025 - world.current.rotation.z) * 0.025;
      world.current.position.y += (-1.68 - amount * 0.36 - world.current.position.y) * 0.035;
    }

    const camera = state.camera;
    if (!cameraStart.current) cameraStart.current = camera.position.clone();
    const start = cameraStart.current;
    camera.position.x += (start.x + pointerX * 0.11 - camera.position.x) * 0.025;
    camera.position.y += (start.y - amount * 0.27 - pointerY * 0.07 - camera.position.y) * 0.025;
    camera.position.z += (start.z - amount * 0.36 - camera.position.z) * 0.025;
    camera.lookAt(0, -1.38 - amount * 0.18, 0);
  });

  return (
    <group ref={world} position={[0, -1.68, 0]} rotation={[0.16, -1.08, 0]}>
      <Earth radius={EARTH_RADIUS} />
      <Atmosphere />
    </group>
  );
}

export default function EarthScene() {
  return (
    <div className="earth-scene" aria-label="A slowly turning Earth">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0.08, 7.15], fov: 31, near: 0.1, far: 100 }}
      >
        <ambientLight intensity={1.15} color="#f6fcff" />
        <hemisphereLight args={["#dff9ff", "#c7ad83", 0.7]} />
        <directionalLight position={[-5.5, 6.5, 5]} intensity={2.5} color="#fff7df" />
        <directionalLight position={[3.5, 0.5, 4]} intensity={0.48} color="#d7f3ff" />
        <Suspense fallback={null}>
          <CameraRig />
          <Preload all />
        </Suspense>
        <AdaptiveDpr pixelated />
      </Canvas>
    </div>
  );
}
