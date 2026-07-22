/* ============================================================
   The floating island — a real glTF model (models/island.glb),
   orbited slowly, with mission waypoints anchored to its surface.
   three.js r149 + GLTFLoader, both provided as window globals by
   the module bootstrap in index.html.
   ============================================================ */
const World3D = (() => {

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function supported() {
    try {
      const c = document.createElement("canvas");
      return !!(window.THREE && window.GLTFLoader && (c.getContext("webgl2") || c.getContext("webgl")));
    } catch (e) { return false; }
  }

  // one shared load — the model is reused between the map and any replays
  let cached = null;
  function loadModel() {
    if (cached) return cached;
    cached = new Promise((resolve, reject) => {
      // GLTFLoader is its own global (set by the bootstrap), not a property of THREE
      new GLTFLoader().load(
        "models/island.glb",
        gltf => resolve(gltf.scene),
        undefined,
        err => { cached = null; reject(err); }
      );
    });
    return cached;
  }

  /* small flat-shaded crystal for a waypoint (built procedurally, not from the model) */
  function marker(color) {
    const g = new THREE.Group();
    const c = new THREE.Color(color);
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(.018, .022, .34, 5),
      new THREE.MeshLambertMaterial({ color: 0x4a3b2e })
    );
    post.position.y = .17; g.add(post);
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(.16, 0),
      new THREE.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: .5, flatShading: true })
    );
    crystal.position.y = .56; g.add(crystal);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(.24, .017, 6, 20),
      new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .55 })
    );
    ring.rotation.x = Math.PI / 2; ring.position.y = .56; g.add(ring);
    g.userData = { crystal, ring };
    return g;
  }

  function createWorld(container, stops, opts = {}) {
    if (!supported()) return null;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (e) { return null; }

    const W0 = container.clientWidth || 900, H0 = container.clientHeight || 520;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(W0, H0, false);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, W0 / H0, .01, 100);
    const CAM_R = 4.4, CAM_Y = 1.7;
    let camAngle = -.6, camAngleT = -.6;

    // warm key + cool sky fill, tuned for the sunset landing
    scene.add(new THREE.HemisphereLight(0xFFE9CF, 0x5A6B7A, 1.15));
    const key = new THREE.DirectionalLight(0xFFE3B0, 2.1);
    key.position.set(-6, 5, 4); scene.add(key);
    const rim = new THREE.DirectionalLight(0xFFC89A, .8);
    rim.position.set(5, 2, -6); scene.add(rim);

    const root = new THREE.Group();
    scene.add(root);

    const markers = [];
    let modelReady = false, ISLAND_TOP = 1;

    /* interaction state (works before and after the model resolves) */
    const ray = new THREE.Raycaster();
    const ptr = new THREE.Vector2();
    let hovered = null, dragging = false, dragX = 0, moved = 0;

    const onDown = e => { dragging = true; moved = 0; dragX = e.clientX; };
    const onUp = () => {
      if (dragging && moved < 6 && hovered && opts.onPick) opts.onPick(hovered.userData.id);
      dragging = false;
    };
    const onMove = e => {
      const r = container.getBoundingClientRect();
      ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
      if (dragging) { moved += Math.abs(e.clientX - dragX); camAngleT -= (e.clientX - dragX) * .006; dragX = e.clientX; }
    };
    container.addEventListener("pointerdown", onDown);
    addEventListener("pointerup", onUp);
    container.addEventListener("pointermove", onMove);

    const ro = new ResizeObserver(() => {
      const W = container.clientWidth, H = container.clientHeight;
      if (!W || !H) return;
      camera.aspect = W / H; camera.updateProjectionMatrix();
      renderer.setSize(W, H, false);
    });
    ro.observe(container);

    /* ---- load + place ---- */
    loadModel().then(src => {
      const model = src.clone(true);

      // centre on origin, normalise to a consistent size
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const ctr = box.getCenter(new THREE.Vector3());
      const scale = 3.4 / Math.max(size.x, size.z);
      model.position.set(-ctr.x, -ctr.y, -ctr.z);
      const holder = new THREE.Group();
      holder.add(model);
      holder.scale.setScalar(scale);
      root.add(holder);

      ISLAND_TOP = (box.max.y - ctr.y) * scale;      // grass level in world units

      // waypoints on a ring over the grass, clear of the house; the wish sits centre
      const ringR = 1.0;
      stops.forEach((s, i) => {
        const m = marker(s.color);
        const a = s.mapAngle !== undefined ? s.mapAngle : (i / stops.length) * Math.PI * 2;
        const r = s.id === "cake" ? 0 : ringR;
        m.position.set(Math.cos(a) * r, ISLAND_TOP + .04, Math.sin(a) * r);
        m.userData = { ...m.userData, id: s.id, ph: i * 1.3 };
        markers.push(m); root.add(m);
      });

      modelReady = true;
      if (opts.onReady) opts.onReady();
    }).catch(err => { if (opts.onError) opts.onError(err); });

    /* ---- loop ---- */
    const clock = new THREE.Clock();
    let raf, alive = true;
    const v = new THREE.Vector3();

    const tick = () => {
      if (!alive) return;
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      if (!dragging && !reduced) camAngleT += .0012;
      camAngle += (camAngleT - camAngle) * .07;
      camera.position.set(Math.sin(camAngle) * CAM_R, CAM_Y, Math.cos(camAngle) * CAM_R);
      camera.lookAt(0, 0, 0);

      root.position.y = Math.sin(t * .5) * .05;
      root.rotation.z = Math.sin(t * .38) * .008;

      if (modelReady) {
        ray.setFromCamera(ptr, camera);
        const hits = ray.intersectObjects(markers.map(m => m.userData.crystal), false);
        const hit = hits.length ? markers.find(m => m.userData.crystal === hits[0].object) : null;
        if (hit !== hovered) {
          hovered = hit;
          container.style.cursor = hovered ? "pointer" : "grab";
          if (opts.onHover) opts.onHover(hovered ? hovered.userData.id : null);
        }

        markers.forEach(m => {
          const d = m.userData, hot = m === hovered;
          d.crystal.rotation.y += .015;
          d.crystal.position.y = .56 + Math.sin(t * 1.6 + d.ph) * .05;
          const sc = hot ? 1.4 : 1;
          d.crystal.scale.lerp(v.set(sc, sc, sc), .16);
          d.ring.rotation.z += .01;
          d.ring.material.opacity = (hot ? .85 : .5) + Math.sin(t * 2 + d.ph) * .1;
          d.ring.position.y = d.crystal.position.y;

          if (opts.onProject) {
            m.getWorldPosition(v);
            v.y += .95;
            v.project(camera);
            opts.onProject(d.id, (v.x * .5 + .5) * container.clientWidth,
                                (-v.y * .5 + .5) * container.clientHeight, v.z < 1);
          }
        });
      }

      renderer.render(scene, camera);
    };
    tick();

    return {
      isReady: () => modelReady,
      dispose() {
        alive = false;
        cancelAnimationFrame(raf);
        container.removeEventListener("pointerdown", onDown);
        removeEventListener("pointerup", onUp);
        container.removeEventListener("pointermove", onMove);
        ro.disconnect();
        scene.traverse(o => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) [].concat(o.material).forEach(m => { m.map && m.map.dispose(); m.dispose(); });
        });
        renderer.dispose();
        renderer.domElement.remove();
      }
    };
  }

  return { createWorld, supported, loadModel };
})();
