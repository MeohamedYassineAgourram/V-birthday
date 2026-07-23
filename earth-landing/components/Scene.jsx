"use client";

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload, AdaptiveDpr } from "@react-three/drei";

import Lighting from "./Lighting";
import Starfield from "./Starfield";
import Earth from "./Earth";
import Atmosphere from "./Atmosphere";
import Markers from "./Markers";
import Effects from "./Effects";
import Parallax from "./Parallax";
import { EarthContext } from "./earth-context";

const R = 2.35;

// Earth offset scales down on smaller viewports so it never crowds the card.
function offsetFor(w) {
  if (w < 640) return [0.55, 1.35, 0]; // mobile: shift up, roughly centred
  if (w < 1024) return [1.5, 0.05, 0]; // tablet
  return [2.05, -0.12, 0]; // desktop: dominate the right
}

export default function Scene() {
  const earthRef = useRef(null);
  const wrapRef = useRef(null);
  const offset =
    typeof window !== "undefined" ? offsetFor(window.innerWidth) : [2.05, -0.12, 0];

  return (
    <div ref={wrapRef} className="scene-in absolute inset-0 z-0">
      <EarthContext.Provider value={earthRef}>
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
          camera={{ position: [0, 0, 5.2], fov: 34, near: 0.1, far: 200 }}
        >
          <color attach="background" args={["#03040a"]} />
          <fog attach="fog" args={["#060a16", 9, 26]} />

          <Suspense fallback={null}>
            <Lighting />
            <Starfield />
            <Parallax offset={offset}>
              <Earth radius={R} />
              <Atmosphere radius={R} />
              <Markers radius={R} />
            </Parallax>
            <Effects />
            <Preload all />
          </Suspense>

          <AdaptiveDpr pixelated />
        </Canvas>
      </EarthContext.Provider>
    </div>
  );
}
