/* The landing: full-bleed photograph, glass chrome, one enormous line of type. */
Game.scenes.hero = (stage) => {
  const cleared = Game.lit;

  const view = el(`<section class="hero enter">
    <div class="badge">
      <span style="width:6px;height:6px;border-radius:50%;background:var(--gold);display:block"></span>
      July 24 · five missions · one wish
    </div>

    <h1>Happy Birthday,<br><em>${CONFIG.name}</em></h1>

    <p class="lead">
      An island, five small trials, and a cake at the summit.
      Nothing here can be failed — take as long as you like.
    </p>

    <div class="cta-row">
      <button class="btn solid" id="begin">${cleared ? "Continue the journey" : "Begin the journey"}</button>
      <button class="btn ghost" id="peek">See the map</button>
    </div>
  </section>`);
  stage.appendChild(view);

  view.querySelector("#begin").onclick = () => { Game.audio(); Game.sfx("good"); Game.go("world"); };
  view.querySelector("#peek").onclick = () => Game.go("world");
};
