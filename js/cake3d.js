/* ============================================================
   The summit cake — 3D, five candles, blown out one at a time.
   Colours tuned to the parchment world rather than pastel.
   ============================================================ */
const Cake3D = (() => {

  function supported() {
    try {
      const c = document.createElement("canvas");
      return !!(window.THREE && (c.getContext("webgl2") || c.getContext("webgl")));
    } catch (e) { return false; }
  }

  function shadowTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(42,38,32,.42)");
    g.addColorStop(.45, "rgba(42,38,32,.16)");
    g.addColorStop(1, "rgba(42,38,32,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }

  function create(container, candleCount = 5) {
    if (!supported()) return null;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (e) { return null; }

    const W0 = container.clientWidth || 800, H0 = container.clientHeight || 400;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(W0, H0, false);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.NoToneMapping;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, W0 / H0, .1, 100);
    camera.position.set(0, 3.15, 6.9);
    camera.lookAt(0, 1.15, 0);

    scene.add(new THREE.HemisphereLight(0xF4EEDC, 0x5B6353, .8));
    const key = new THREE.DirectionalLight(0xFFF3DC, .9); key.position.set(4, 7, 6); scene.add(key);
    const fill = new THREE.DirectionalLight(0xB7CBCC, .4); fill.position.set(-6, 2, 3); scene.add(fill);
    const rim = new THREE.DirectionalLight(0xE8C9A6, .7); rim.position.set(0, 3, -7); scene.add(rim);

    const root = new THREE.Group();
    root.scale.setScalar(1.06);
    scene.add(root);

    const mat = c => new THREE.MeshLambertMaterial({ color: c });
    const flames = [], smoke = [];
    const cake = new THREE.Group();
    root.add(cake);

    const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.62, 1.5, .12, 48), mat(0x9DB0AE));
    plate.position.y = -.06; cake.add(plate);

    const t1 = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.18, .58, 48), mat(0xC79E62));
    t1.position.y = .29; cake.add(t1);
    const i1 = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.22, .18, 48), mat(0xE9DCC0));
    i1.position.y = .62; cake.add(i1);

    const dripMat = mat(0xE9DCC0);
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const d = new THREE.Mesh(new THREE.SphereGeometry(.1, 12, 10), dripMat);
      d.position.set(Math.cos(a) * 1.22, .55 - (i % 3) * .05, Math.sin(a) * 1.22);
      d.scale.y = 1.5; cake.add(d);
    }

    const t2 = new THREE.Mesh(new THREE.CylinderGeometry(.76, .76, .48, 48), mat(0xD2AE77));
    t2.position.y = .95; cake.add(t2);
    const i2 = new THREE.Mesh(new THREE.CylinderGeometry(.8, .8, .16, 48), mat(0xC08A78));
    i2.position.y = 1.21; cake.add(i2);

    for (let i = 0; i < 8; i++) {                       // berries
      const a = (i / 8) * Math.PI * 2 + .3;
      const b = new THREE.Mesh(new THREE.SphereGeometry(.11, 12, 10), mat(0xA8503C));
      b.position.set(Math.cos(a) * .95, .7, Math.sin(a) * .95);
      b.scale.y = 1.25; cake.add(b);
    }

    const waxA = mat(0xF0E6CE), waxB = mat(0xA8503C), wickMat = mat(0x2A2620);
    for (let i = 0; i < candleCount; i++) {
      // offset ring + alternating radius, or pairs merge on screen from a fixed camera
      const a = (i / candleCount) * Math.PI * 2 + .42;
      const r = i % 2 ? .50 : .68;
      const px = Math.cos(a) * r, pz = Math.sin(a) * r;

      const c = new THREE.Mesh(new THREE.CylinderGeometry(.058, .058, .5, 14), i % 2 ? waxB : waxA);
      c.position.set(px, 1.54, pz); cake.add(c);
      const w = new THREE.Mesh(new THREE.CylinderGeometry(.013, .013, .08, 6), wickMat);
      w.position.set(px, 1.81, pz); cake.add(w);

      // unlit teardrop — emissive + tone mapping washes out on a light background
      const f = new THREE.Group();
      const outer = new THREE.Mesh(new THREE.ConeGeometry(.075, .26, 16),
        new THREE.MeshBasicMaterial({ color: 0xF2952A }));
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(.075, 14, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: 0xF2952A }));
      cap.position.y = -.13;
      const inner = new THREE.Mesh(new THREE.ConeGeometry(.036, .15, 12),
        new THREE.MeshBasicMaterial({ color: 0xFFE9A8 }));
      inner.position.y = -.04;
      f.add(outer); f.add(cap); f.add(inner);
      f.position.set(px, 1.98, pz);
      f.userData = { base: 1.98, out: false, x: px, z: pz };
      flames.push(f); cake.add(f);
    }

    const flameLight = new THREE.PointLight(0xF2952A, 2, 6, 2);
    flameLight.position.set(0, 2.05, 0);
    cake.add(flameLight);

    const cushion = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 1.75, .42, 48), mat(0xDCD0B0));
    cushion.position.y = -.34; cake.add(cushion);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(2.02, .13, 10, 44), mat(0xE9DFC4));
    lip.rotation.x = Math.PI / 2; lip.position.y = -.16; cake.add(lip);

    const sh = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 7.5),
      new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = -.62; root.add(sh);

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = e => {
      const r = container.getBoundingClientRect();
      mouse.tx = ((e.clientX - r.left) / r.width - .5) * 2;
      mouse.ty = ((e.clientY - r.top) / r.height - .5) * 2;
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
    let raf, alive = true;

    const tick = () => {
      if (!alive) return;
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      mouse.x += (mouse.tx - mouse.x) * .06;
      mouse.y += (mouse.ty - mouse.y) * .06;
      root.rotation.y = mouse.x * .3;
      root.rotation.x = -mouse.y * .1;
      root.position.y = Math.sin(t * .8) * .04;

      let live = 0;
      flames.forEach((f, i) => {
        if (f.userData.out) return;
        live++;
        const s = 1 + Math.sin(t * 9 + i * 1.7) * .15;
        f.scale.set(s, 2 - s, s);
        f.position.y = f.userData.base + Math.sin(t * 7 + i) * .014;
        f.rotation.y = t * .6 + i;
      });
      flameLight.intensity = (1.35 + Math.sin(t * 8.5) * .3) * (live / candleCount);

      for (let i = smoke.length - 1; i >= 0; i--) {
        const p = smoke[i];
        p.position.y += .012;
        p.scale.multiplyScalar(1.012);
        p.material.opacity -= .006;
        if (p.material.opacity <= 0) { cake.remove(p); p.geometry.dispose(); p.material.dispose(); smoke.splice(i, 1); }
      }
      renderer.render(scene, camera);
    };
    tick();

    return {
      blowOut() {
        const f = flames.find(x => !x.userData.out);
        if (!f) return 0;
        f.userData.out = true;
        f.visible = false;
        for (let i = 0; i < 5; i++) {
          const p = new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6),
            new THREE.MeshBasicMaterial({ color: 0xB9B4A4, transparent: true, opacity: .5, depthWrite: false }));
          p.position.set(f.userData.x + (Math.random() - .5) * .08, 1.94 + i * .05,
                         f.userData.z + (Math.random() - .5) * .08);
          smoke.push(p); cake.add(p);
        }
        return flames.filter(x => !x.userData.out).length;
      },
      litCount: () => flames.filter(x => !x.userData.out).length,
      candles: candleCount,
      dispose() {
        alive = false;
        cancelAnimationFrame(raf);
        removeEventListener("pointermove", onMove);
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

  return { create, supported };
})();
