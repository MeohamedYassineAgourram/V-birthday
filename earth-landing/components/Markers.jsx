"use client";

import { useMemo } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useEarthRef } from "./earth-context";

/* Marker anchor directions (unit vectors), clustered over the front-facing
   South-America / Amazon region of the globe. Multiplied onto the surface. */
const DIRS = [
  [0.10, -0.12, 0.98],
  [0.28, -0.02, 0.96],
  [0.16, -0.30, 0.94],
  [0.36, -0.20, 0.91],
  [0.02, 0.06, 1.0],
];

export default function Markers({ radius = 2.35 }) {
  const earthRef = useEarthRef();
  const points = useMemo(
    () =>
      DIRS.map((d) => new THREE.Vector3(...d).normalize().multiplyScalar(radius * 1.015)),
    [radius]
  );

  return (
    <>
      {points.map((p, i) => (
        <Html
          key={i}
          position={p}
          center
          distanceFactor={7}
          occlude={earthRef?.current ? [earthRef] : undefined}
          zIndexRange={[20, 10]}
          style={{ pointerEvents: "none" }}
        >
          {/* CSS-driven entrance (staggered) + pulse — independent of load timing */}
          <div className="marker" style={{ animationDelay: `${1.0 + i * 0.18}s` }}>
            <span className="marker__pulse" style={{ animationDelay: `${i * 0.4}s` }} />
            <span className="marker__ring" />
            <span className="marker__dot" />
          </div>
        </Html>
      ))}
    </>
  );
}
