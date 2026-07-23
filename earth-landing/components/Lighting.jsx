"use client";

// Cinematic three-point-ish rig: warm key, cool blue rim, soft ambient fill.
export default function Lighting() {
  return (
    <>
      <ambientLight intensity={0.18} color="#8ea6d8" />
      <hemisphereLight args={["#9fb8ff", "#05060c", 0.35]} />

      {/* strong key light, upper-left — the "sun" */}
      <directionalLight position={[-6, 3.5, 4]} intensity={3.6} color="#fff3df" />

      {/* soft front fill so the camera-facing hemisphere reads clearly */}
      <directionalLight position={[0.5, 1.5, 6]} intensity={1.15} color="#dfeaff" />

      {/* cool blue rim from behind-right for the atmospheric edge */}
      <directionalLight
        position={[7, -1.5, -5]}
        intensity={1.6}
        color="#5b8def"
      />
    </>
  );
}
