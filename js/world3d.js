/* ============================================================
   The floating island — low-poly, flat-shaded, warm rock and
   bright grass, drifting in an empty cream sky.
   Plain three.js r149 (UMD). No loaders, no build step.
   ============================================================ */
const World3D = (() => {

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const C = {
    grass:     0x84C24A,
    grassDeep: 0x5F9B37,
    dirt:      0x9A6B3C,
    rockA:     0xE0A868,
    rockB:     0xC98A4E,
    rockC:     0xAE7340,
    rockD:     0x8F5C33,
    trunk:     0x6B4630,
    leafA:     0x8FCB4F,
    leafB:     0x6FAE3C,
    leafC:     0xA8D95E,
    stone:     0xBFB4A4,
    cloud:     0xFFFFFF
  };

  function supported() {
    try {
      const c = document.createElement("canvas");
      return !!(window.THREE && (c.getContext("webgl2") || c.getContext("webgl")));
    } catch (e) { return false; }
  }

  /* flat shading is what gives the faceted, low-poly read */
  const mat = (color, flat = true) =>
    new THREE.MeshLambertMaterial({ color, flatShading: flat });

  /* nudge vertices so nothing looks machined */
  function rough(geo, amt, seed = 1) {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const n = Math.sin(x * 1.9 + seed * 2.3) * Math.cos(z * 2.3 + seed) * Math.sin(y * 1.4 + seed * .7);
      p.setXYZ(i, x + n * amt, y + n * amt * .35, z + n * amt);
    }
    p.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }

  /* ---------- scenery ---------- */

  function makeTree(scale) {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(
      rough(new THREE.CylinderGeometry(.075, .17, 1.5, 6, 2), .03, 3),
      mat(C.trunk)
    );
    trunk.position.y = .75;
    g.add(trunk);

    // canopy: a few faceted blobs, lighter on top
    const blobs = [
      [0, 1.95, 0, .78, C.leafA],
      [-.42, 1.66, .22, .55, C.leafB],
      [.44, 1.72, -.18, .52, C.leafB],
      [.08, 2.34, .12, .46, C.leafC]
    ];
    blobs.forEach(([x, y, z, r, col]) => {
      const b = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), mat(col));
      b.position.set(x, y, z);
      b.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      b.scale.y = .86;
      g.add(b);
    });
    g.scale.setScalar(scale);
    return g;
  }

  function makeBush(scale, col) {
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(.42, 0), mat(col || C.leafB));
    b.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    b.scale.set(scale, scale * .75, scale);
    return b;
  }

  function makeRock(scale, col) {
    const r = new THREE.Mesh(new THREE.DodecahedronGeometry(.4, 0), mat(col || C.stone));
    r.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    r.scale.set(scale, scale * .8, scale * 1.1);
    return r;
  }

  function makeCloud(scale) {
    const g = new THREE.Group();
    const m = mat(C.cloud);
    [[0,0,0,1], [.9,-.12,.2,.72], [-.85,-.15,-.15,.66], [.3,.3,-.3,.6], [-.35,.22,.3,.55]]
      .forEach(([x, y, z, r]) => {
        const b = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), m);
        b.position.set(x, y, z);
        b.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        b.scale.y = .68;
        g.add(b);
      });
    g.scale.setScalar(scale);
    return g;
  }

  /* The island: bright grass cap, dirt band, chunky rock shelves, a rough point. */
  function makeIsland(R) {
    const g = new THREE.Group();

    // grass, with a lip that overhangs the dirt
    const cap = new THREE.Mesh(rough(new THREE.CylinderGeometry(R, R * .99, .42, 11, 1), R * .085, 1), mat(C.grass));
    cap.position.y = .21; g.add(cap);
    const lip = new THREE.Mesh(rough(new THREE.CylinderGeometry(R * 1.035, R * .995, .24, 11, 1), R * .08, 7), mat(C.grassDeep));
    lip.position.y = .03; g.add(lip);

    // dirt
    const dirt = new THREE.Mesh(rough(new THREE.CylinderGeometry(R * .99, R * .9, .55, 11, 1), R * .07, 2), mat(C.dirt));
    dirt.position.y = -.3; g.add(dirt);

    // rock shelves — few sides, big facets, each rotated so edges never line up
    const shelves = [
      [R * .93, R * .76, 1.5, C.rockA],
      [R * .78, R * .56, 1.4, C.rockB],
      [R * .58, R * .36, 1.3, C.rockC],
      [R * .38, R * .18, 1.2, C.rockD]
    ];
    let y = -.55;
    shelves.forEach(([rt, rb, h, col], i) => {
      const m = new THREE.Mesh(rough(new THREE.CylinderGeometry(rt, rb, h, 8 - (i % 2), 1), rt * .13, i + 4), mat(col));
      m.position.y = y - h / 2;
      m.rotation.y = i * .52;
      g.add(m);
      y -= h * .92;
    });

    // the point
    const tip = new THREE.Mesh(rough(new THREE.ConeGeometry(R * .2, 3.0, 7, 2), R * .09, 11), mat(C.rockD));
    tip.position.y = y - 1.35;
    tip.rotation.y = .4;
    g.add(tip);

    // chunks jutting out of the cliff face
    for (let i = 0; i < 9; i++) {
      const a = Math.random() * Math.PI * 2;
      const depth = -.7 - Math.random() * 3.2;
      const rr = R * (.55 + Math.random() * .35) * (1 - Math.abs(depth) / 9);
      const c = makeRock(.5 + Math.random() * .7, [C.rockA, C.rockB, C.rockC][i % 3]);
      c.position.set(Math.cos(a) * rr, depth, Math.sin(a) * rr);
      g.add(c);
    }
    return g;
  }

  /* ---------- the world ---------- */
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
    renderer.toneMapping = THREE.NoToneMapping;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();          // transparent — the cream page shows through
    const camera = new THREE.PerspectiveCamera(34, W0 / H0, .1, 200);
    const CAM_R = 14.6, CAM_Y = 7.6;
    let camAngle = -.55, camAngleT = -.55;

    scene.add(new THREE.HemisphereLight(0xEAF4FF, 0x8A6A4A, .34));
    const sun = new THREE.DirectionalLight(0xFFF2DA, .86);
    sun.position.set(-7, 11, 7); scene.add(sun);
    const fill = new THREE.DirectionalLight(0xBBD8EE, .17);
    fill.position.set(8, 3, -6); scene.add(fill);

    const root = new THREE.Group();
    scene.add(root);

    const R = 4.6;
    root.add(makeIsland(R));

    /* the ground plan: where things sit on the grass */
    const surfaceY = .42;

    // trees
    [[-2.5, 1.4, 1.15], [2.2, -1.9, .95], [.6, 2.6, .8], [-1.4, -2.5, .7]]
      .forEach(([x, z, s]) => {
        const t = makeTree(s);
        t.position.set(x, surfaceY - .05, z);
        t.rotation.y = Math.random() * 3;
        root.add(t);
      });

    // bushes + rocks scattered on the grass
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2, rr = Math.random() * R * .82;
      const b = makeBush(.5 + Math.random() * .6, Math.random() > .5 ? C.leafB : C.leafA);
      b.position.set(Math.cos(a) * rr, surfaceY - .04, Math.sin(a) * rr);
      root.add(b);
    }
    for (let i = 0; i < 7; i++) {
      const a = Math.random() * Math.PI * 2, rr = R * (.35 + Math.random() * .5);
      const s = makeRock(.35 + Math.random() * .45);
      s.position.set(Math.cos(a) * rr, surfaceY - .06, Math.sin(a) * rr);
      root.add(s);
    }

    // debris drifting under the island
    const debris = [];
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2, rr = R * (.7 + Math.random() * 1.1);
      const d = makeRock(.3 + Math.random() * .5, [C.rockA, C.rockB, C.rockC][i % 3]);
      d.position.set(Math.cos(a) * rr, -3 - Math.random() * 4, Math.sin(a) * rr);
      d.userData = { ph: Math.random() * 6, baseY: d.position.y, spin: (Math.random() - .5) * .01 };
      debris.push(d);
      root.add(d);
    }

    /* ---------- mission markers ---------- */
    const markers = [];
    stops.forEach((s, i) => {
      const g = new THREE.Group();
      const tall = s.id === "cake";                       // the summit sits above the rest
      const ph = tall ? 1.45 : .8;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(.05, .06, ph, 5), mat(C.trunk));
      post.position.y = ph / 2; g.add(post);
      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(.42, 0),
        new THREE.MeshLambertMaterial({ color: new THREE.Color(s.color), flatShading: true,
                                        emissive: new THREE.Color(s.color), emissiveIntensity: .45 })
      );
      crystal.position.y = ph + .6; g.add(crystal);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(.62, .045, 6, 18),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(s.color), transparent: true, opacity: .5 })
      );
      ring.rotation.x = Math.PI / 2; ring.position.y = ph + .6; g.add(ring);

      g.position.set(s.pos[0], surfaceY - .05, s.pos[2]);
      g.userData = { crystal, ring, id: s.id, ph: i * 1.3, restY: ph + .6, label: ph + 1.1 };
      markers.push(g);
      root.add(g);
    });

    /* ---------- interaction ---------- */
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
      if (dragging) {
        moved += Math.abs(e.clientX - dragX);
        camAngleT -= (e.clientX - dragX) * .006;
        dragX = e.clientX;
      }
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

    /* ---------- loop ---------- */
    const clock = new THREE.Clock();
    let raf, alive = true;
    const v = new THREE.Vector3();

    const tick = () => {
      if (!alive) return;
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      if (!dragging && !reduced) camAngleT += .0011;
      camAngle += (camAngleT - camAngle) * .07;
      camera.position.set(Math.sin(camAngle) * CAM_R, CAM_Y, Math.cos(camAngle) * CAM_R);
      camera.lookAt(0, -2.9, 0);

      root.position.y = Math.sin(t * .55) * .16;
      root.rotation.z = Math.sin(t * .4) * .012;

      debris.forEach(d => {
        d.position.y = d.userData.baseY + Math.sin(t * .8 + d.userData.ph) * .35;
        d.rotation.y += d.userData.spin;
        d.rotation.x += d.userData.spin * .6;
      });

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
        d.crystal.position.y = d.restY + Math.sin(t * 1.5 + d.ph) * .14;
        const s = hot ? 1.35 : 1;
        d.crystal.scale.lerp(v.set(s, s, s), .16);
        d.ring.rotation.z += .01;
        d.ring.material.opacity = (hot ? .8 : .45) + Math.sin(t * 2 + d.ph) * .1;
        d.ring.position.y = d.crystal.position.y;

        if (opts.onProject) {
          v.set(m.position.x, m.position.y + m.userData.label, m.position.z);
          root.localToWorld(v);
          v.project(camera);
          opts.onProject(d.id, (v.x * .5 + .5) * container.clientWidth,
                              (-v.y * .5 + .5) * container.clientHeight, v.z < 1);
        }
      });

      renderer.render(scene, camera);
    };
    tick();

    return {
      dispose() {
        alive = false;
        cancelAnimationFrame(raf);
        container.removeEventListener("pointerdown", onDown);
        removeEventListener("pointerup", onUp);
        container.removeEventListener("pointermove", onMove);
        ro.disconnect();
        scene.traverse(o => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) [].concat(o.material).forEach(m => m.dispose());
        });
        renderer.dispose();
        renderer.domElement.remove();
      }
    };
  }

  return { createWorld, supported };
})();
