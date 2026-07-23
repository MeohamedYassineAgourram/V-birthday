/* The map: the low-poly island in an open sky, with signposts pinned to its waypoints. */
Game.scenes.world = (stage) => {
  const first = (TRIALS.find(s => !Game.done.has(s.id)) || STOPS[0]).id;
  const summitOpen = TRIALS.every(s => Game.done.has(s.id));

  const view = el(`<section class="map-wrap enter">
    <div class="eyebrow">
      <span class="leaf">🌱</span> Providing a birthday journey <span class="leaf">🌱</span>
    </div>
    <h1 class="map-title">Happy Birthday,<br>${CONFIG.name}</h1>
    <p class="map-sub">Five little trials float above the clouds. Clear them in any order —
      the summit opens once all four are done.</p>

    <div class="cta-row">
      <button class="btn solid" id="begin">${Game.lit ? "Continue" : "Begin the journey"} <span>→</span></button>
      <button class="btn ghost" id="how">How it works <span>↗</span></button>
    </div>

    <div class="viewport" id="viewport">
      <div class="stage-glow"></div>
      <div class="signposts" id="signposts"></div>
      <div class="vp-loading" id="loading"><span class="spin"></span> shaping the island…</div>
    </div>

    <p class="muted" id="blurb" style="min-height:18px;margin:2px 0 0"></p>

    <div class="map-foot-left">
      <span class="foot-ic">🎂</span>
      <span>Made for ${CONFIG.name}<br><b>24 July</b></span>
    </div>
    <div class="map-foot-right" id="footSeals"></div>
  </section>`);
  stage.appendChild(view);

  // progress badges, bottom-right, echoing the reference's icon cluster
  const footSeals = view.querySelector("#footSeals");
  STOPS.forEach(s => {
    const done = Game.done.has(s.id);
    footSeals.appendChild(el(
      `<span class="foot-seal ${done ? "on" : ""}" style="--c:${s.color}" title="${s.en}">${done ? s.cn : "·"}</span>`
    ));
  });

  view.querySelector("#begin").onclick = () => {
    Game.audio(); Game.sfx("good");
    Game.go(summitOpen ? "cake" : first);
  };
  view.querySelector("#how").onclick = () =>
    Game.toast("Click a glowing marker on the island to start a trial ✨", 2800);

  const viewport = view.querySelector("#viewport");
  const posts = view.querySelector("#signposts");
  const blurb = view.querySelector("#blurb");
  const loading = view.querySelector("#loading");
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

  // each label starts hidden (CSS) and layout() reveals it once the island projects it;
  // no parent-opacity gate — that fought the .enter animation and stuck at 0
  Game._3d = typeof World3D !== "undefined"
    ? World3D.createWorld(viewport, STOPS, {
        onReady: () => loading.classList.add("gone"),
        onError: () => {
          loading.classList.add("gone");
          Game._3d = null;
          posts.classList.add("flat");
          Object.values(nodes).forEach(n => { n.style.transform = "none"; n.style.opacity = "1"; });
          cancelAnimationFrame(layoutRaf);
        },
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
  let layoutRaf = 0;
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
