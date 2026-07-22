/* ============================================================
   The 3D world — a painterly diorama island you orbit around,
   with mission waypoints anchored to it, plus the cake finale.
   Plain three.js r149 (UMD). No loaders, no build step.
   ============================================================ */
const World3D = (() => {

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const PALETTE = {
    skyTop:    0x9FC0C6,
    skyLow:    0xE4DCC2,
    fog:       0xC2C9B4,
    grass:     0x4E6B45,
    grassDark: 0x354C38,
    rock:      0x5E5039,
    rockDark:  0x3D3428,
    trunk:     0x3E3123,
    tree:      0x1F3527,
    treeLight: 0x2C4832,
    silhouette:0x1A2620,
    stone:     0x9C927A,
    roof:      0x8C5648,
    cloth:     0xA8503C
  };

  function supported() {
    try {
      const c = document.createElement("canvas");
      return !!(window.THREE && (c.getContext("webgl2") || c.getContext("webgl")));
    } catch (e) { return false; }
  }

  // flat-shaded lambert keeps the painterly, illustrated look (no specular highlights)
  const mat = color => new THREE.MeshLambertMaterial({ color });

  /* deform a geometry's vertices for a hand-sculpted, non-CAD silhouette */
  function rough(geo, amount = .12, seed = 1) {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const n = Math.sin(x * 2.7 + seed) * Math.cos(z * 3.1 - seed) * Math.sin(y * 1.9 + seed * 2);
      p.setXYZ(i, x + n * amount, y + n * amount * .5, z + n * amount);
    }
    p.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }

  /* ---------- pieces of scenery ---------- */

  /* Terraced cliff island: a domed grass cap over stacked, shrinking rock shelves.
     A single cylinder + cone reads as a layer cake, so the base is built in steps. */
  function makeIsland(radius, height, colTop, colBase, seed) {
    const g = new THREE.Group();

    const cap = new THREE.Mesh(
      rough(new THREE.SphereGeometry(radius, 20, 8, 0, Math.PI * 2, 0, Math.PI * .34), radius * .05, seed),
      mat(colTop)
    );
    cap.scale.y = .42;
    g.add(cap);

    const skirt = new THREE.Mesh(
      rough(new THREE.CylinderGeometry(radius, radius * .93, height * .22, 20, 1), radius * .05, seed + 1),
      mat(colTop)
    );
    skirt.position.y = -height * .1;
    g.add(skirt);

    const shelves = 4;
    for (let i = 0; i < shelves; i++) {
      const f = i / shelves;
      const r = radius * (.92 - f * .5);
      const h = height * .26;
      const shelf = new THREE.Mesh(
        rough(new THREE.CylinderGeometry(r, r * .8, h, 13 - i, 1), r * .12, seed + i * 4),
        mat(i % 2 ? colBase : PALETTE.rockDark)
      );
      shelf.position.y = -height * .2 - i * h * .82;
      shelf.rotation.y = i * .7;
      g.add(shelf);
    }

    const tip = new THREE.Mesh(
      rough(new THREE.ConeGeometry(radius * .34, height * .7, 9, 2), radius * .1, seed + 21),
      mat(PALETTE.rockDark)
    );
    tip.position.y = -height * .2 - shelves * height * .26 * .82 - height * .3;
    g.add(tip);
    return g;
  }

  function makeTree(scale, dark) {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.07, .11, .7, 6), mat(PALETTE.trunk));
    trunk.position.y = .35; g.add(trunk);
    for (let i = 0; i < 3; i++) {
      const r = .52 - i * .13;
      const c = new THREE.Mesh(
        new THREE.ConeGeometry(r, .75, 7),
        mat(dark ? PALETTE.tree : PALETTE.treeLight)
      );
      c.position.y = .85 + i * .42;
      c.rotation.y = i * .7;
      g.add(c);
    }
    g.scale.setScalar(scale);
    return g;
  }

  function makeWindmill() {
    const g = new THREE.Group();
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(.26, .42, 1.5, 8), mat(PALETTE.stone));
    tower.position.y = .75; g.add(tower);
    const roofM = new THREE.Mesh(new THREE.ConeGeometry(.44, .45, 8), mat(PALETTE.roof));
    roofM.position.y = 1.7; g.add(roofM);
    const blades = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(.09, .95, .02), mat(0xD8CDAF));
      b.position.y = .48;
      const arm = new THREE.Group();
      arm.add(b);
      arm.rotation.z = (i / 4) * Math.PI * 2;
      blades.add(arm);
    }
    blades.position.set(0, 1.55, .42);
    g.add(blades);
    g.userData.blades = blades;
    return g;
  }

  function makeCastle() {
    const g = new THREE.Group();
    const spec = [[0, 0, 0, .62, 2.4], [.85, 0, .35, .42, 1.7], [-.8, 0, .25, .38, 1.5], [.15, 0, -.8, .34, 1.9]];
    spec.forEach(([x, , z, r, h], i) => {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.12, h, 9), mat(PALETTE.stone));
      t.position.set(x, h / 2, z); g.add(t);
      const roofM = new THREE.Mesh(new THREE.ConeGeometry(r * 1.25, r * 2.1, 9), mat(PALETTE.roof));
      roofM.position.set(x, h + r * 1.05, z); g.add(roofM);
    });
    return g;
  }

  /* the little hero and the cat, echoing the poster */
  function makeHero() {
    const g = new THREE.Group();
    const legs = new THREE.Mesh(new THREE.CylinderGeometry(.1, .09, .26, 7), mat(0x4A4335));
    legs.position.y = .13; g.add(legs);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(.13, .15, .32, 8), mat(0x5E5240));
    body.position.y = .42; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.14, 12, 10), mat(0xDBAE84));
    head.position.y = .69; g.add(head);
    // dark hair cap — matching the skin tone made the head read as a featureless ball
    const hair = new THREE.Mesh(new THREE.SphereGeometry(.148, 12, 8, 0, 6.3, 0, 1.35), mat(0x241C16));
    hair.position.y = .71; g.add(hair);
    // the red cape
    const cape = new THREE.Mesh(new THREE.ConeGeometry(.26, .62, 8, 1, true), mat(PALETTE.cloth));
    cape.position.set(0, .40, -.09);
    cape.rotation.x = -.16;
    g.add(cape);
    g.userData.cape = cape;
    return g;
  }

  function makeCat() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), mat(0x241F1E));
    body.scale.set(1, .9, 1.25); body.position.y = .12; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.09, 10, 8), mat(0x241F1E));
    head.position.set(0, .25, .09); g.add(head);
    [-1, 1].forEach(s => {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(.035, .07, 4), mat(0x241F1E));
      ear.position.set(.045 * s, .33, .09); g.add(ear);
    });
    const scarf = new THREE.Mesh(new THREE.TorusGeometry(.075, .022, 6, 12), mat(PALETTE.cloth));
    scarf.rotation.x = Math.PI / 2; scarf.position.set(0, .2, .06); g.add(scarf);
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(.02, .03, .3, 5), mat(0x241F1E));
    tail.position.set(0, .18, -.14); tail.rotation.x = .9; g.add(tail);
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

    const scene = new THREE.Scene();

    scene.fog = new THREE.Fog(0x54748F, 30, 90);   // matches the scrimmed sky behind the canvas       // atmospheric perspective, like the poster

    const camera = new THREE.PerspectiveCamera(38, W0 / H0, .1, 400);
    const CAM_R = 22, CAM_Y = 9.4;
    let camAngle = -.5, camAngleT = -.5;

    scene.add(new THREE.HemisphereLight(0xBFD2D8, 0x27332E, .46));
    const sun = new THREE.DirectionalLight(0xFFE9C9, .78);
    sun.position.set(-8, 12, 6); scene.add(sun);
    const back = new THREE.DirectionalLight(0x8FB3C6, .34);
    back.position.set(7, 5, -9); scene.add(back);

    const root = new THREE.Group();
    scene.add(root);

    /* The grass cap is a squashed dome, so the ground is a curved surface, not a flat
       disc. Everything standing on the island is placed with surfaceY(). */
    const ISLAND_R = 7.2, CAP_H = ISLAND_R * .42;
    const surfaceY = (x, z) => {
      const r = Math.min(Math.hypot(x, z) / ISLAND_R, 1);
      return CAP_H * Math.sqrt(1 - r * r);
    };

    const island = makeIsland(ISLAND_R, 5.2, PALETTE.grass, PALETTE.rock, 1);
    root.add(island);

    /* a raised summit for the final mission, seated on the dome */
    const SUMMIT_R = 2.4;
    const summit = makeIsland(SUMMIT_R, 1.8, PALETTE.grass, PALETTE.rockDark, 5);
    const SUMMIT_BASE = surfaceY(0, -1.2) - .5;
    summit.position.set(0, SUMMIT_BASE, -1.2);
    root.add(summit);
    const SUMMIT_TOP = SUMMIT_BASE + SUMMIT_R * .42;

    /* winding path up to the summit */
    for (let i = 0; i < 16; i++) {
      const t = i / 15;
      const a = -2.2 + t * 3.2;
      const r = 5.6 - t * 3.2;
      const x = Math.cos(a) * r, z = Math.sin(a) * r + .4;
      const d = new THREE.Mesh(new THREE.CylinderGeometry(.4, .4, .06, 8), mat(0xA89571));
      d.position.set(x, surfaceY(x, z) + .03, z);
      d.scale.x = 1.5;
      root.add(d);
    }

    /* trees around the rim */
    for (let i = 0; i < 30; i++) {
      const a = (i / 30) * Math.PI * 2 + Math.random() * .22;
      const r = 4.2 + Math.random() * 2.6;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      const t = makeTree(.7 + Math.random() * .55, Math.random() > .45);
      t.position.set(x, surfaceY(x, z) - .06, z);
      t.rotation.y = Math.random() * 3;
      root.add(t);
    }

    /* landmarks, kept clear of the waypoint angles */
    const windmill = makeWindmill();
    windmill.position.set(.8, surfaceY(.8, 5.4) - .05, 5.4);
    windmill.rotation.y = -.6;
    root.add(windmill);

    const castle = makeCastle();
    castle.position.set(-5.4, surfaceY(-5.4, .4) - .05, .4);
    castle.scale.setScalar(.8);
    root.add(castle);

    /* the hero and the cat, on the near edge looking out */
    const hero = makeHero();
    hero.position.set(-1.0, surfaceY(-1.0, 4.6) - .05, 4.6);
    hero.rotation.y = .35;
    hero.scale.setScalar(3.4);
    root.add(hero);
    const cat = makeCat();
    cat.position.set(.55, surfaceY(.55, 4.7) - .05, 4.7);
    cat.rotation.y = .2;
    cat.scale.setScalar(3.0);
    root.add(cat);

    /* floating islets */
    const floaters = [];
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + .8;
      const r = 26 + Math.random() * 10;
      const f = makeIsland(1.1 + Math.random() * .9, 1.6, PALETTE.grass, PALETTE.rockDark, i + 9);
      f.position.set(Math.cos(a) * r, 7 + Math.random() * 5, Math.sin(a) * r);
      const t = makeTree(.5, true); t.position.y = .2; f.add(t);
      f.userData.ph = Math.random() * 6;
      f.userData.baseY = f.position.y;
      floaters.push(f);
      scene.add(f);
    }

    /* ---------- mission waypoints ---------- */
    const markers = [];
    stops.forEach((s, i) => {
      const g = new THREE.Group();
      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(.34, 0),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(s.color) })
      );
      crystal.position.y = 1.15;
      g.add(crystal);
      // a soft beam so the waypoint reads from any angle
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(.1, .34, 2.2, 10, 1, true),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(s.color), transparent: true, opacity: .16,
          side: THREE.DoubleSide, depthWrite: false
        })
      );
      beam.position.y = 1.1;
      g.add(beam);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(.05, .06, .8, 6), mat(PALETTE.trunk));
      post.position.y = .4;
      g.add(post);
      const gx = s.pos[0], gz = s.pos[2];
      const gy = (s.id === "cake" ? SUMMIT_TOP : surfaceY(gx, gz)) + (s.pos[1] || 0) * .12;
      g.position.set(gx, gy, gz);
      g.userData = { crystal, beam, index: i, id: s.id, ph: i * 1.3 };
      markers.push(g);
      root.add(g);
    });

    /* ---------- interaction ---------- */
    const ray = new THREE.Raycaster();
    const ptr = new THREE.Vector2();
    let hovered = null, dragging = false, dragX = 0, moved = 0;

    const rel = e => {
      const r = container.getBoundingClientRect();
      return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
    };

    const onDown = e => { dragging = true; moved = 0; dragX = e.clientX; container.setPointerCapture?.(e.pointerId); };
    const onUp = e => {
      container.releasePointerCapture?.(e.pointerId);
      if (dragging && moved < 6 && hovered && opts.onPick) opts.onPick(hovered.userData.id);
      dragging = false;
    };
    const onMove = e => {
      const [nx, ny] = rel(e);
      ptr.set(nx * 2 - 1, -(ny * 2 - 1));
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
    const screen = new THREE.Vector3();

    const tick = () => {
      if (!alive) return;
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      if (!dragging && !reduced) camAngleT += .0009;
      camAngle += (camAngleT - camAngle) * .07;
      camera.position.set(Math.sin(camAngle) * CAM_R, CAM_Y, Math.cos(camAngle) * CAM_R);
      camera.lookAt(0, .6, 0);

      if (windmill.userData.blades) windmill.userData.blades.rotation.z += .012;
      floaters.forEach(f => { f.position.y = f.userData.baseY + Math.sin(t * .7 + f.userData.ph) * .28; });
      hero.userData.cape.rotation.z = Math.sin(t * 1.6) * .06;

      // waypoint hover test
      ray.setFromCamera(ptr, camera);
      const hits = ray.intersectObjects(markers.map(m => m.userData.crystal), false);
      const hit = hits.length ? markers.find(m => m.userData.crystal === hits[0].object) : null;
      if (hit !== hovered) {
        hovered = hit;
        container.style.cursor = hovered ? "pointer" : "grab";
        if (opts.onHover) opts.onHover(hovered ? hovered.userData.id : null);
      }

      markers.forEach(m => {
        const d = m.userData;
        const isHot = m === hovered;
        d.crystal.rotation.y += .016;
        d.crystal.rotation.x = Math.sin(t + d.ph) * .18;
        d.crystal.position.y = 1.15 + Math.sin(t * 1.4 + d.ph) * .12;
        const s = isHot ? 1.35 : 1;
        d.crystal.scale.lerp(new THREE.Vector3(s, s, s), .16);
        d.beam.material.opacity = (isHot ? .3 : .16) + Math.sin(t * 2 + d.ph) * .04;

        // hand the 2D screen position back so HTML signposts can follow
        if (opts.onProject) {
          screen.set(m.position.x, m.position.y + 1.9, m.position.z);
          root.localToWorld(screen);
          screen.project(camera);
          opts.onProject(d.id, (screen.x * .5 + .5) * container.clientWidth,
                              (-screen.y * .5 + .5) * container.clientHeight,
                              screen.z < 1);
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

  return { createWorld, supported, PALETTE };
})();
