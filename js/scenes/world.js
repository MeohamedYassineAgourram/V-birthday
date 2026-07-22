/* The map: the low-poly island in an open sky, with signposts pinned to its waypoints. */
Game.scenes.world = (stage) => {
  const view = el(`<section class="map-wrap enter">
    <div class="badge">
      <span style="width:6px;height:6px;border-radius:50%;background:var(--accent);display:block"></span>
      July 24 · ${Game.lit} of ${STOPS.length} seals recovered
    </div>
    <h1 class="map-title">Happy Birthday, <em>${CONFIG.name}</em></h1>

    <div class="viewport" id="viewport">
      <div class="signposts" id="signposts"></div>
    </div>

    <!-- caption sits under the scene: markers on the far side project high in the frame -->
    <p class="muted" id="blurb" style="min-height:20px;margin:4px 0 0">
      Five trials float above the clouds. Take them in any order — the summit opens last.
    </p>
    <div class="vp-hint-static">drag to look around · click a marker to begin</div>
  </section>`);
  stage.appendChild(view);

  const viewport = view.querySelector("#viewport");
  const posts = view.querySelector("#signposts");
  const blurb = view.querySelector("#blurb");
  const defaultBlurb = blurb.textContent.trim();

  const nodes = {};
  const proj = {};                       // latest projected screen position per marker
  STOPS.forEach(s => {
    const open = Game.unlocked(s.id);
    const cleared = Game.done.has(s.id);
    const n = el(`<button class="signpost ${cleared ? "done" : ""} ${open ? "" : "locked"}" style="--c:${s.color}">
      <span class="post-cn">${s.cn}</span>
      <span class="post-en">${open ? s.en : "LOCKED"}</span>
      ${cleared ? `<span class="post-tick">✦</span>` : ""}
    </button>`);
    n.onclick = () => enter(s);
    n.onmouseenter = () => { blurb.textContent = open ? s.blurb : "Clear the four trials to open the summit."; };
    n.onmouseleave = () => { blurb.textContent = defaultBlurb; };
    posts.appendChild(n);
    nodes[s.id] = n;
  });

  const enter = (s) => {
    if (!Game.unlocked(s.id)) {
      Game.sfx("bad");
      Game.toast("The summit stays sealed until the four trials are done", 2600);
      return;
    }
    Game.audio();
    Game.sfx("good");
    Game.go(s.id);
  };

  Game._3d = typeof World3D !== "undefined"
    ? World3D.createWorld(viewport, STOPS, {
        onPick: id => { const s = STOPS.find(x => x.id === id); if (s) enter(s); },
        onHover: id => {
          const s = id && STOPS.find(x => x.id === id);
          blurb.textContent = s ? (Game.unlocked(s.id) ? s.blurb : "Sealed until the four trials are done.") : defaultBlurb;
          Object.entries(nodes).forEach(([k, n]) => n.classList.toggle("hot", k === id));
        },
        onProject: (id, x, y, visible) => { proj[id] = { x, y, visible }; }
      })
    : null;

  /* Lay the labels out once per frame.
     The summit sits at the island's centre, so whatever is directly behind it
     projects to nearly the same point — placing each label independently made
     them overlap. Resolve collisions across the whole set instead. */
  const GAP = 40, NEAR = 104;
  let layoutRaf;
  const layout = () => {
    if (!view.isConnected) return;
    layoutRaf = requestAnimationFrame(layout);
    const H = viewport.clientHeight;
    const items = STOPS
      .map(s => ({ id: s.id, ...proj[s.id] }))
      .filter(p => p.x !== undefined)
      .sort((a, b) => a.y - b.y);

    const placed = [];
    items.forEach(p => {
      let y = Math.max(52, Math.min(H - 14, p.y));
      placed.forEach(q => {
        if (Math.abs(q.x - p.x) < NEAR && Math.abs(q.y - y) < GAP) y = q.y + GAP;
      });
      placed.push({ x: p.x, y });
      const n = nodes[p.id];
      if (!n) return;
      n.style.transform = `translate(-50%,-100%) translate(${p.x}px,${y}px)`;
      n.style.opacity = p.visible ? "1" : "0";
      n.style.pointerEvents = p.visible ? "auto" : "none";
    });
  };
  if (Game._3d) layout();

  if (!Game._3d) {
    posts.classList.add("flat");
    Object.values(nodes).forEach(n => { n.style.transform = "none"; n.style.opacity = "1"; });
  }
};
