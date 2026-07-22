/* Stop 2 — Shiro buried the photos. Match the pairs. Mismatches cost nothing. */
Game.scenes.memory = (stage) => {
  const FACES = ["hero", "field", "night", "room", "study", "ramen"];
  const deck = shuffle([...FACES, ...FACES]);

  const card = el(`<section class="panel enter" style="max-width:620px">
    <div class="head">
      <div class="glyph" style="--c:#7FA8C4">谜</div>
      <div class="t">
        <div class="kicker" style="--c:#7FA8C4">Trial · Puzzle</div>
        <h2>Shiro's Lost Photos</h2>
        <p>He buried the whole album in the garden again. Find all six pairs.</p>
      </div>
    </div>
    <div class="grid" id="grid"></div>
    <div class="row" style="margin-top:18px">
      <div class="stat"><b id="pairs">0</b><span>pairs</span></div>
      <div class="stat"><b id="flips">0</b><span>flips</span></div>
    </div>
  </section>`);
  stage.appendChild(card);

  const grid = card.querySelector("#grid");
  let open = [], lock = false, done = 0, flips = 0;

  deck.forEach(val => {
    const tile = el(`<button class="tile" aria-label="card">
      <span class="in">
        <span class="side back"><span class="brows"><i></i><i></i></span></span>
        <span class="side front"><img src="img/sq/${val}.jpg" alt=""></span>
      </span>
    </button>`);
    tile.dataset.val = val;

    tile.onclick = () => {
      if (lock || tile.classList.contains("up") || tile.classList.contains("done")) return;
      tile.classList.add("up");
      Game.sfx("pop");
      open.push(tile);
      if (open.length < 2) return;

      flips++;
      card.querySelector("#flips").textContent = flips;
      lock = true;
      const [a, b] = open;

      if (a.dataset.val === b.dataset.val) {
        setTimeout(() => {
          a.classList.add("done"); b.classList.add("done");
          open = []; lock = false; done++;
          card.querySelector("#pairs").textContent = done;
          Game.sfx("good");
          if (done === FACES.length) setTimeout(() => Game.win("memory"), 420);
        }, 300);
      } else {
        setTimeout(() => {
          a.classList.remove("up"); b.classList.remove("up");
          open = []; lock = false;
        }, 720);
      }
    };
    grid.appendChild(tile);
  });
};
