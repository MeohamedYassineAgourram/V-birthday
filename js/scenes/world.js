/* The hub: a 3D island you orbit, with mission signposts pinned to its waypoints. */
Game.scenes.world = (stage) => {
  const view = el(`<section class="world enter">
    <div class="world-title">
      <h1>奇幻旅程</h1>
      <div class="sub">→&nbsp; ${CONFIG.name.toUpperCase()}'S JOURNEY &nbsp;←</div>
      <div class="ribbon">生日快乐 · 一段关于蜡笔小新的旅程</div>
    </div>

    <div class="viewport" id="viewport">
      <div class="signposts" id="signposts"></div>
      <div class="vp-hint">drag to look around · click a marker to begin</div>
    </div>

    <div class="world-foot">
      <p class="lead center" id="blurb">
        Five seals are scattered across the island. Bring them all to the summit.
      </p>
    </div>
  </section>`);
  stage.appendChild(view);

  const viewport = view.querySelector("#viewport");
  const posts = view.querySelector("#signposts");
  const blurb = view.querySelector("#blurb");
  const defaultBlurb = blurb.textContent.trim();

  /* one wooden signpost per mission, positioned each frame from the 3D projection */
  const nodes = {};
  STOPS.forEach(s => {
    const open = Game.unlocked(s.id);
    const cleared = Game.done.has(s.id);
    const n = el(`<button class="signpost ${cleared ? "done" : ""} ${open ? "" : "locked"}" style="--c:${s.color}">
      <span class="post-cn">${s.cn}</span>
      <span class="post-en">${open ? s.en : "封印"}</span>
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
      Game.toast("The summit is sealed until the four trials are done 🔒", 2600);
      return;
    }
    Game.audio();
    Game.sfx("good");
    Game.go(s.id);
  };

  /* ---- 3D world, with a flat fallback ---- */
  Game._3d = typeof World3D !== "undefined"
    ? World3D.createWorld(viewport, STOPS, {
        onPick: id => { const s = STOPS.find(x => x.id === id); if (s) enter(s); },
        onHover: id => {
          const s = id && STOPS.find(x => x.id === id);
          blurb.textContent = s ? (Game.unlocked(s.id) ? s.blurb : "Sealed until the four trials are done.") : defaultBlurb;
          Object.entries(nodes).forEach(([k, n]) => n.classList.toggle("hot", k === id));
        },
        onProject: (id, x, y, visible) => {
          const n = nodes[id];
          if (!n) return;
          n.style.transform = `translate(-50%,-100%) translate(${x}px,${y}px)`;
          n.style.opacity = visible ? "1" : "0";
          n.style.pointerEvents = visible ? "auto" : "none";
        }
      })
    : null;

  if (!Game._3d) {
    // no WebGL — fall back to a flat illustrated map
    viewport.classList.add("flat");
    posts.classList.add("flat");
    Object.values(nodes).forEach(n => { n.style.transform = "none"; n.style.opacity = "1"; });
  }
};
