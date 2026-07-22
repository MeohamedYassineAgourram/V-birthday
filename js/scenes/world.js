/* The map: the 3D island composited straight over the photograph, glass signposts on top. */
Game.scenes.world = (stage) => {
  const view = el(`<section class="map-wrap enter">
    <div class="badge">${Game.lit} of ${STOPS.length} seals recovered</div>
    <h2 style="margin-bottom:6px">Choose a trial</h2>
    <p class="muted" id="blurb" style="min-height:22px">
      The four trials can be taken in any order. The summit opens once all four are done.
    </p>

    <div class="viewport" id="viewport">
      <div class="signposts" id="signposts"></div>
      <div class="vp-hint">drag to look around</div>
    </div>
  </section>`);
  stage.appendChild(view);

  const viewport = view.querySelector("#viewport");
  const posts = view.querySelector("#signposts");
  const blurb = view.querySelector("#blurb");
  const defaultBlurb = blurb.textContent.trim();

  const nodes = {};
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
    posts.classList.add("flat");
    Object.values(nodes).forEach(n => { n.style.transform = "none"; n.style.opacity = "1"; });
  }
};
