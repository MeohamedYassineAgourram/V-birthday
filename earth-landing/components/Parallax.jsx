"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SOUTH_AMERICA_ROT = -1.15;   // phase that puts South America to the front
const AUTO_SPIN = 0.012;           // rad/s — "slowly rotate"
const reduced =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* Holds the offset + spin group and applies smooth, inertial mouse parallax
   to both the Earth and the camera. Children (Earth, Markers, Atmosphere)
   share the spin group so markers stay pinned to the land. */
export default function Parallax({ offset = [2, -0.15, 0], children }) {
  const spin = useRef();
  const auto = useRef(SOUTH_AMERICA_ROT);
  const camBase = useRef(null);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const px = state.pointer.x || 0;
    const py = state.pointer.y || 0;

    if (spin.current) {
      if (!reduced) auto.current += AUTO_SPIN * d;
      // inertial follow of (auto spin + mouse influence)
      const targetY = auto.current + px * 0.22;
      const targetX = 0.16 + py * 0.12;
      spin.current.rotation.y += (targetY - spin.current.rotation.y) * 0.055;
      spin.current.rotation.x += (targetX - spin.current.rotation.x) * 0.055;
      spin.current.rotation.z = 0.05;
    }

    // subtle camera parallax
    const cam = state.camera;
    if (!camBase.current) camBase.current = cam.position.clone();
    const b = camBase.current;
    cam.position.x += (b.x + px * 0.28 - cam.position.x) * 0.04;
    cam.position.y += (b.y - py * 0.2 - cam.position.y) * 0.04;
    cam.lookAt(0, 0, 0);
  });

  return (
    <group position={offset}>
      <group ref={spin} rotation={[0.16, SOUTH_AMERICA_ROT, 0.05]}>
        {children}
      </group>
    </group>
  );
}
