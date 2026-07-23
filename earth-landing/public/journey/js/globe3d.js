/* ============================================================
   Globe3D — the Earth for the landing, on a dark starfield.
   Slowly rotating, faint atmosphere glow and orbit rings.
   three.js r149 + GLTFLoader (window globals from the bootstrap).
   ============================================================ */
const Globe3D = (() => {

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function supported() {
    try {
      const c = document.createElement("canvas");
      return !!(window.THREE && window.GLTFLoader && (c.getContext("webgl2") || c.getContext("webgl")));
    } catch (e) { return false; }
  }

  let cached = null;
  function loadEarth() {
    if (cached) return cached;
    cached = new Promise((res, rej) => {
      new GLTFLoader().load("models/earth.glb", g => res(g.scene), undefined,
        e => { cached = null; rej(e); });
    });
    return cached;
  }

  function mount(container, opts = {}) {
    if (!supported()) return null;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch (e) { return null; }

    const W0 = container.clientWidth || 800, H0 = container.clientHeight || 600;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(W0, H0, false);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.physicallyCorrectLights = true;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, W0 / H0, .01, 100);
    camera.position.set(0, .4, 6.2);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.HemisphereLight(0x8090b0, 0x101018, .8));
    const sun = new THREE.DirectionalLight(0xfff4e0, 2.2);
    sun.position.set(-4, 2, 5); scene.add(sun);
    const rim = new THREE.DirectionalLight(0x4a7bd0, 1.1);
    rim.position.set(5, -1, -4); scene.add(rim);

    const root = new THREE.Group();
    scene.add(root);

    // atmosphere: a slightly larger additive shell
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(1.9, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x5b8def, transparent: true, opacity: .12,
        side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    root.add(glow);

    // orbit rings
    const rings = new THREE.Group();
    rings.rotation.x = 1.15;
    root.add(rings);
    [2.5, 2.9].forEach((r, i) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, .004, 3, 128),
        new THREE.MeshBasicMaterial({ color: 0x5b8def, transparent: true, opacity: .3 - i * .1 })
      );
      ring.rotation.z = i * .5;
      ring.userData.sp = (i ? -1 : 1) * .0016;
      rings.add(ring);
    });
    // a couple of little satellites on the rings
    const sats = [];
    for (let i = 0; i < 3; i++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(.03, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0x9fc0ff }));
      s.userData = { a: Math.random() * 7, r: 2.5 + (i % 2) * .4, sp: .01 + Math.random() * .008 };
      sats.push(s); rings.add(s);
    }

    let earth = null;
    loadEarth().then(src => {
      earth = src.clone(true);
      const box = new THREE.Box3().setFromObject(earth);
      const c = box.getCenter(new THREE.Vector3());
      const sz = box.getSize(new THREE.Vector3());
      earth.position.sub(c);
      earth.scale.setScalar(1.7 / Math.max(sz.x, sz.y, sz.z));
      root.add(earth);
      if (opts.onReady) opts.onReady();
    }).catch(e => opts.onError && opts.onError(e));

    // gentle pointer parallax
    const m = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = e => {
      const r = container.getBoundingClientRect();
      m.tx = ((e.clientX - r.left) / r.width - .5) * 2;
      m.ty = ((e.clientY - r.top) / r.height - .5) * 2;
    };
    addEventListener("pointermove", onMove, { passive: true });

    const ro = new ResizeObserver(() => {
      const W = container.clientWidth, H = container.clientHeight;
      if (!W || !H) return;
      camera.aspect = W / H; camera.updateProjectionMatrix();
      renderer.setSize(W, H, false);
    });
    ro.observe(container);

    const clock = new THREE.Clock();
    let raf, alive = true, zoom = 0, focusAngle = null, focusUntil = 0;
    const tick = () => {
      if (!alive) return;
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      m.x += (m.tx - m.x) * .05; m.y += (m.ty - m.y) * .05;

      if (earth && !reduced) {
        if (focusAngle !== null && performance.now() < focusUntil) {
          let delta = (focusAngle - earth.rotation.y + Math.PI) % (Math.PI * 2) - Math.PI;
          earth.rotation.y += delta * .045;
        } else {
          focusAngle = null;
          earth.rotation.y += .0010; // approximately one complete orbit every 105 seconds at 60fps
        }
      }
      root.rotation.y = m.x * .25;
      root.rotation.x = -m.y * .12 + .05;

      rings.children.forEach(o => { if (o.userData.sp) o.rotation.z += o.userData.sp; });
      sats.forEach(s => { s.userData.a += s.userData.sp;
        s.position.set(Math.cos(s.userData.a) * s.userData.r, 0, Math.sin(s.userData.a) * s.userData.r); });
      glow.scale.setScalar(1 + Math.sin(t * 1.2) * .01);

      // optional dolly-in when accepting
      if (zoom > 0) { camera.position.z += (2.6 - camera.position.z) * .06; }

      renderer.render(scene, camera);
    };
    tick();

    return {
      zoomIn() { zoom = 1; },
      focus(index) {
        const angles = [2.15, 1.72, .34, -1.25, -2.22];
        focusAngle = angles[index % angles.length];
        focusUntil = performance.now() + 1500;
      },
      dispose() {
        alive = false; cancelAnimationFrame(raf);
        removeEventListener("pointermove", onMove); ro.disconnect();
        scene.traverse(o => { if (o.geometry) o.geometry.dispose();
          if (o.material) [].concat(o.material).forEach(x => { x.map && x.map.dispose(); x.dispose(); }); });
        renderer.dispose(); renderer.domElement.remove();
      }
    };
  }

  return { mount, supported, loadEarth };
})();
