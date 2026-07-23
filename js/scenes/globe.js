/* The landing — a globe on a dark starfield. One elegant question, one choice.
   No mention of the birthday: that's the reward at the very end. */
Game.scenes.globe = (stage) => {
  const view = el(`<section class="globe-scene enter">
    <div class="globe-stage" id="globeStage">
      <div class="globe-load" id="gload"><span class="spin"></span></div>
    </div>

    <div class="globe-copy">
      <div class="eyebrow"><span class="dot-live"></span> A challenge awaits</div>
      <h1 class="globe-title">Do you accept<br>the challenge?</h1>
      <p class="globe-sub">Five stops around the world. Clear each one to earn what waits at the end.
        There's only one way to find out what it is.</p>
      <div class="cta-row">
        <button class="btn glow" id="accept">Accept the challenge <span>→</span></button>
      </div>
      <p class="globe-fine" id="fine">the only way is forward</p>
    </div>
  </section>`);
  stage.appendChild(view);

  const host = view.querySelector("#globeStage");
  const gload = view.querySelector("#gload");

  Game._3d = typeof Globe3D !== "undefined"
    ? Globe3D.mount(host, { onReady: () => gload.classList.add("gone"),
                            onError: () => { gload.classList.add("gone"); host.classList.add("noglobe"); } })
    : null;
  if (!Game._3d) { gload.classList.add("gone"); host.classList.add("noglobe"); }

  view.querySelector("#accept").onclick = () => {
    Game.audio(); Game.sfx("good");
    if (Game._3d && Game._3d.zoomIn) Game._3d.zoomIn();
    view.querySelector("#fine").textContent = "plotting the route…";
    setTimeout(() => Game.travel("journey"), 620);
  };
};
