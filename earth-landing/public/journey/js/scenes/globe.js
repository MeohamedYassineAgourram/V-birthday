/* The fallback start scene, used after a full replay.
   The Next landing is the normal entrance; this keeps the static game self-contained. */
Game.scenes.globe = stage => {
  const view = el(`<section class="timegate-start enter">
    <div class="timegate-stars" aria-hidden="true"></div>
    <div class="timegate-orbit orbit-one" aria-hidden="true"></div>
    <div class="timegate-orbit orbit-two" aria-hidden="true"></div>
    <div class="timegate-arch" aria-hidden="true"><i></i><i></i><b></b></div>
    <div class="timegate-copy">
      <div class="eyebrow"><span class="dot-live"></span> The horizon has opened</div>
      <h1>Five eras.<br>One way home.</h1>
      <p>A rift has scattered its seals across impossible places. Step through the first gate whenever you are ready.</p>
      <button class="btn solid" id="begin">Open the first gate <span>→</span></button>
    </div>
  </section>`);
  stage.appendChild(view);

  view.querySelector("#begin").onclick = () => {
    Game.audio();
    Game.sfx("good");
    Game.travel("journey");
  };
};
