"use client";

import { useMemo, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useEarthRef } from "./earth-context";

useGLTF.preload("/models/earth.glb");

export default function Earth({ radius = 2.35 }) {
  const { scene } = useGLTF("/models/earth.glb");
  const earthRef = useEarthRef();

  // clone + normalize once: centre at origin, scale so bounding radius = `radius`
  const model = useMemo(() => {
    const root = scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    root.position.sub(center);
    const s = (radius * 2) / Math.max(size.x, size.y, size.z);
    root.scale.setScalar(s);

    root.traverse((o) => {
      if (o.isMesh) {
        o.frustumCulled = false;
        const m = o.material;
        if (m) {
          m.roughness = 0.85;
          m.metalness = 0.0;
          m.envMapIntensity = 0.4;
        }
      }
    });
    return root;
  }, [scene, radius]);

  // publish the mesh ref so markers can occlude against it
  useEffect(() => {
    let mesh = null;
    model.traverse((o) => {
      if (o.isMesh && !mesh) mesh = o;
    });
    if (earthRef) earthRef.current = mesh;
  }, [model, earthRef]);

  return <primitive object={model} />;
}
