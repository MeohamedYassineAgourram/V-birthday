/* The landing hero: big type, the 3D cake, floating chips and collaborator cursors. */
Game.scenes.hero = (stage) => {
  const hero = el(`<section class="hero enter">
    <div class="eyebrow">🎂 July 24 · a small internet gift</div>
    <h1>Happy Birthday<br><span class="hl">${CONFIG.name}</span></h1>

    <div class="scene" id="scene3d">
      <div class="chip" style="left:4%;top:12%;animation-delay:-.4s">
        <span class="dot" style="background:#E8402A"></span> 6 stops
      </div>
      <div class="chip" style="right:5%;top:20%;animation-delay:-1.9s">
        <i>🎮</i> built for a Valorant main
      </div>
      <div class="chip" style="left:8%;bottom:12%;animation-delay:-3.1s">
        <i>🐶</i> Shiro approves
      </div>
      <div class="chip" style="right:7%;bottom:16%;animation-delay:-2.3s">
        <span class="dot" style="background:#43A94F"></span> you cannot lose
      </div>
    </div>

    <p class="lead center" style="margin-top:2px">
      Six little games stand between you and your present.
      Nothing here can be failed — worst case, you take the scenic route.
    </p>
    <div class="row">
      <button class="btn dark" id="start">▶ Start the quest</button>
      <button class="btn" id="skip">Skip to the gift</button>
    </div>
  </section>`);
  stage.appendChild(hero);

  /* --- collaborator cursors, like the reference --- */
  const crew = [
    { n: "Kazama", c: "#6C5CE7", x: "12%",  y: "34%", d: "0s"    },
    { n: "Nene",   c: "#E84393", x: "78%",  y: "44%", d: "-2.4s" },
    { n: "Shiro",  c: "#F0932B", x: "22%",  y: "72%", d: "-4.1s" },
    { n: "Bo",     c: "#00A8A8", x: "70%",  y: "76%", d: "-6s"   }
  ];
  const sceneEl = hero.querySelector("#scene3d");
  crew.forEach(p => {
    const c = el(`<div class="cursor" style="left:${p.x};top:${p.y};animation:float 7s ease-in-out infinite;animation-delay:${p.d}">
      <svg width="17" height="20" viewBox="0 0 17 20" fill="none">
        <path d="M1 1l14.5 8.2-6.6 1.6-2.3 6.6L1 1z" fill="${p.c}" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/>
      </svg>
      <b style="background:${p.c}">${p.n}</b>
    </div>`);
    sceneEl.appendChild(c);
  });

  /* --- 3D, with a graceful CSS fallback --- */
  // note: `const Hero3D` is script-scoped, never a window property — check with typeof
  Game._3d = typeof Hero3D !== "undefined" ? Hero3D.create(sceneEl, "hero") : null;
  if (!Game._3d) {
    sceneEl.classList.add("fallback");
    sceneEl.insertAdjacentHTML("beforeend", `
      <div style="display:flex;gap:14px;perspective:900px">
        ${["hero", "field", "night"].map((n, i) => `
          <div class="photo" style="width:min(150px,26vw);aspect-ratio:2/3;
            transform:rotateY(${(i - 1) * 16}deg) rotate(${(i - 1) * 4}deg) translateZ(${i === 1 ? 40 : 0}px);
            animation:float ${5 + i}s ease-in-out infinite">
            <img src="img/${n}.jpg" alt="">
          </div>`).join("")}
      </div>`);
  }

  hero.querySelector("#start").onclick = () => { Game.audio(); Game.go("chocobi"); };
  hero.querySelector("#skip").onclick = () => {
    Game.toast("no shortcuts today 😌 — the games are the gift", 2600);
    Game.sfx("bad");
  };
};
