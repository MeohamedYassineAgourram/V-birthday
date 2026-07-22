/* ============================================================
   3D scenes, plain three.js r149 (UMD) — no loaders, no build.
   Two modes:
     "hero" — floating cake orbited by Shin-chan photo cards
     "cake" — the same cake up close, candles you can blow out
   ============================================================ */
const Hero3D = (() => {

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function supported() {
    try {
      const c = document.createElement("canvas");
      return !!(window.THREE && (c.getContext("webgl2") || c.getContext("webgl")));
    } catch (e) { return false; }
  }

  /* rounded rectangle → extruded card, with UVs remapped to 0..1 */
  function cardGeometry(w, h, r, depth) {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);     s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);     s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);         s.quadraticCurveTo(x, y, x + r, y);

    const g = new THREE.ExtrudeGeometry(s, {
      depth, bevelEnabled: true, bevelSize: .015, bevelThickness: .015,
      bevelSegments: 3, curveSegments: 14
    });
    g.center(); g.computeBoundingBox();
    const bb = g.boundingBox, pos = g.attributes.position, uv = g.attributes.uv;
    const bw = bb.max.x - bb.min.x, bh = bb.max.y - bb.min.y;
    for (let i = 0; i < pos.count; i++) {
      uv.setXY(i, (pos.getX(i) - bb.min.x) / bw, (pos.getY(i) - bb.min.y) / bh);
    }
    uv.needsUpdate = true;
    return g;
  }

  function starGeometry(outer, inner, depth) {
    const s = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2, r = i % 2 ? inner : outer;
      i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {
      depth, bevelEnabled: true, bevelSize: .03, bevelThickness: .03, bevelSegments: 2
    });
    g.center();
    return g;
  }

  function shadowTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(17,18,20,.40)");
    g.addColorStop(.45, "rgba(17,18,20,.15)");
    g.addColorStop(1, "rgba(17,18,20,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }

  /* ---------------- the scene ---------------- */
  function create(container, mode = "hero") {
    if (!supported()) return null;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (e) { return null; }

    const W0 = container.clientWidth || 800, H0 = container.clientHeight || 400;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(W0, H0, false);
    renderer.outputEncoding = THREE.sRGBEncoding;
    // NoToneMapping: ACES filmic crushes the saturation out of a bright pastel render
    renderer.toneMapping = THREE.NoToneMapping;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const isCake = mode === "cake";
    const camera = new THREE.PerspectiveCamera(isCake ? 30 : 34, W0 / H0, .1, 100);
    // cake mode looks down more steeply, otherwise the back candles hide behind the front ones
    camera.position.set(0, isCake ? 3.15 : 2.1, isCake ? 6.9 : 8.4);
    camera.lookAt(0, isCake ? 1.15 : .75, 0);

    // kept deliberately soft — too much light and the pastel cake washes out to white
    scene.add(new THREE.HemisphereLight(0xFFFFFF, 0xC9D2E0, .62));
    const key  = new THREE.DirectionalLight(0xFFFFFF, .95); key.position.set(4, 7, 6);   scene.add(key);
    const fill = new THREE.DirectionalLight(0xB9D6FF, .40); fill.position.set(-6, 2, 3); scene.add(fill);
    const rim  = new THREE.DirectionalLight(0xFFC9A6, .85); rim.position.set(0, 3, -7);  scene.add(rim);

    const root = new THREE.Group();
    root.scale.setScalar(isCake ? 1.06 : 1.14);
    scene.add(root);

    const mat = (color, rough = .78) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0 });
    const flames = [], smoke = [], orbiters = [];

    /* ---- cake ---- */
    const cake = new THREE.Group();
    root.add(cake);

    const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.62, 1.5, .12, 64), mat(0x9FC9EC, .45));
    plate.position.y = -.06; cake.add(plate);

    const t1 = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.18, .58, 64), mat(0xE0B173));
    t1.position.y = .29; cake.add(t1);
    const i1 = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.22, .18, 64), mat(0xFFC2CE, .55));
    i1.position.y = .62; cake.add(i1);

    const dripMat = mat(0xFFC2CE, .55);
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2;
      const d = new THREE.Mesh(new THREE.SphereGeometry(.1, 14, 12), dripMat);
      d.position.set(Math.cos(a) * 1.22, .55 - (i % 3) * .05, Math.sin(a) * 1.22);
      d.scale.y = 1.5; cake.add(d);
    }

    const t2 = new THREE.Mesh(new THREE.CylinderGeometry(.76, .76, .48, 64), mat(0xEBC894));
    t2.position.y = .95; cake.add(t2);
    const i2 = new THREE.Mesh(new THREE.CylinderGeometry(.8, .8, .16, 64), mat(0xFFA9BC, .55));
    i2.position.y = 1.21; cake.add(i2);

    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + .3;
      const b = new THREE.Mesh(new THREE.SphereGeometry(.11, 16, 14), mat(0xE8402A, .35));
      b.position.set(Math.cos(a) * .95, .7, Math.sin(a) * .95);
      b.scale.y = 1.25; cake.add(b);
    }

    const waxA = mat(0xFFFFFF, .45), waxB = mat(0xFF6B6B, .45), wickMat = mat(0x2B2118, .9);
    const CANDLES = 6;
    for (let i = 0; i < CANDLES; i++) {
      // an evenly spaced ring is front/back symmetric, so pairs land on the same screen x
      // and visually merge. Offsetting the ring and alternating the radius separates all six.
      const a = (i / CANDLES) * Math.PI * 2 + .42;
      const r = i % 2 ? .50 : .68;
      const px = Math.cos(a) * r, pz = Math.sin(a) * r;
      const c = new THREE.Mesh(new THREE.CylinderGeometry(.058, .058, .5, 18), i % 2 ? waxB : waxA);
      c.position.set(px, 1.54, pz); cake.add(c);
      const w = new THREE.Mesh(new THREE.CylinderGeometry(.013, .013, .08, 8), wickMat);
      w.position.set(px, 1.81, pz); cake.add(w);

      // flame: unlit teardrop. Additive glow blows out to white on a pale background,
      // and emissive+ACES desaturates — flat basic material keeps it orange.
      const f = new THREE.Group();
      const outer = new THREE.Mesh(
        new THREE.ConeGeometry(.075, .26, 20),
        new THREE.MeshBasicMaterial({ color: 0xFF7A18 })
      );
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(.075, 18, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: 0xFF7A18 })
      );
      cap.position.y = -.13;
      const inner = new THREE.Mesh(
        new THREE.ConeGeometry(.036, .15, 16),
        new THREE.MeshBasicMaterial({ color: 0xFFE9A8 })
      );
      inner.position.y = -.04;
      f.add(outer); f.add(cap); f.add(inner);
      f.position.set(px, 1.98, pz);
      f.userData = { base: 1.98, out: false, x: px, z: pz };
      flames.push(f); cake.add(f);
    }

    const flameLight = new THREE.PointLight(0xFF9A2E, 2.2, 6, 2);
    flameLight.position.set(0, 2.05, 0);
    cake.add(flameLight);

    const cushion = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 1.75, .42, 64), mat(0xF3F3F5, .85));
    cushion.position.y = -.34; cake.add(cushion);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(2.02, .13, 14, 64), mat(0xFFFFFF, .7));
    lip.rotation.x = Math.PI / 2; lip.position.y = -.16; cake.add(lip);

    const sh = new THREE.Mesh(
      new THREE.PlaneGeometry(7.5, 7.5),
      new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false })
    );
    sh.rotation.x = -Math.PI / 2; sh.position.y = -.62; root.add(sh);

    /* ---- hero-only extras: photo cards + Chocobi stars ---- */
    if (!isCake) {
      const loader = new THREE.TextureLoader();
      const cardGeo = cardGeometry(1.42, 2.0, .18, .07);
      const edgeMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: .45 });
      [
        { src: "img/hero.jpg",  a: 0,               r: 3.5, y: .95, s: 1   },
        { src: "img/field.jpg", a: Math.PI * 2 / 3, r: 3.7, y: .15, s: .82 },
        { src: "img/night.jpg", a: Math.PI * 4 / 3, r: 3.6, y: 1.5, s: .74 }
      ].forEach(c => {
        const tex = loader.load(c.src);
        tex.encoding = THREE.sRGBEncoding;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        const m = new THREE.Mesh(cardGeo, [
          new THREE.MeshStandardMaterial({ map: tex, roughness: .52 }), edgeMat
        ]);
        m.scale.setScalar(c.s);
        m.userData = { angle: c.a, radius: c.r, baseY: c.y, ph: Math.random() * 6 };
        orbiters.push(m); root.add(m);
      });

      const starGeo = starGeometry(.19, .085, .07);
      const starMat = new THREE.MeshStandardMaterial({ color: 0xD98F35, roughness: .6 });
      for (let i = 0; i < 7; i++) {
        const s = new THREE.Mesh(starGeo, starMat);
        s.scale.setScalar(.8);
        s.userData = {                                   // kept in a tight band, or they fly at the camera
          angle: Math.random() * Math.PI * 2, radius: 2.7 + Math.random() * 1.1,
          baseY: -.15 + Math.random() * 1.9, speed: .22 + Math.random() * .3,
          ph: Math.random() * 6, star: true
        };
        orbiters.push(s); root.add(s);
      }
    }

    /* ---- interaction + loop ---- */
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

      root.rotation.y = (isCake || reduced ? 0 : t * .16) + mouse.x * (isCake ? .3 : .42);
      root.rotation.x = -mouse.y * (isCake ? .1 : .16);
      root.position.y = Math.sin(t * .8) * (isCake ? .04 : .07);

      orbiters.forEach(o => {
        const d = o.userData;
        if (d.star) {
          d.angle += d.speed * .008;
          o.position.set(Math.cos(d.angle) * d.radius, d.baseY + Math.sin(t * 1.1 + d.ph) * .22, Math.sin(d.angle) * d.radius);
          o.rotation.y += .02; o.rotation.z += .012;
        } else {
          d.angle += .0026;
          o.position.set(Math.cos(d.angle) * d.radius, d.baseY + Math.sin(t * .9 + d.ph) * .18, Math.sin(d.angle) * d.radius);
          o.lookAt(camera.position);
        }
      });

      let liveFlames = 0;
      flames.forEach((f, i) => {
        if (f.userData.out) return;
        liveFlames++;
        const s = 1 + Math.sin(t * 9 + i * 1.7) * .15;      // group scale rides on the child scales
        f.scale.set(s, 2 - s, s);
        f.position.y = f.userData.base + Math.sin(t * 7 + i) * .014;
        f.rotation.y = t * .6 + i;
      });
      flameLight.intensity = (1.35 + Math.sin(t * 8.5) * .3) * (liveFlames / CANDLES);

      // smoke curls after a candle goes out
      for (let i = smoke.length - 1; i >= 0; i--) {
        const p = smoke[i];
        p.position.y += .012;
        p.position.x += Math.sin(t * 2 + p.userData.ph) * .002;
        p.scale.multiplyScalar(1.012);
        p.material.opacity -= .006;
        if (p.material.opacity <= 0) { cake.remove(p); p.geometry.dispose(); p.material.dispose(); smoke.splice(i, 1); }
      }

      renderer.render(scene, camera);
    };
    tick();

    /* ---- public API ---- */
    return {
      /* put out one candle; returns how many are still lit */
      blowOut() {
        const f = flames.find(x => !x.userData.out);
        if (!f) return 0;
        f.userData.out = true;
        f.visible = false;
        for (let i = 0; i < 5; i++) {                      // a little puff of smoke
          const p = new THREE.Mesh(
            new THREE.SphereGeometry(.05, 10, 8),
            new THREE.MeshBasicMaterial({ color: 0xBFC3CA, transparent: true, opacity: .5, depthWrite: false })
          );
          p.position.set(f.userData.x + (Math.random() - .5) * .08, 1.94 + i * .05, f.userData.z + (Math.random() - .5) * .08);
          p.userData.ph = Math.random() * 6;
          smoke.push(p); cake.add(p);
        }
        return flames.filter(x => !x.userData.out).length;
      },
      litCount: () => flames.filter(x => !x.userData.out).length,
      candles: CANDLES,
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
