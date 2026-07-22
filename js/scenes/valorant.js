/* Stop 3 — THE RANGE. Because she plays Valorant.
   Flick onto the Shin-chans. Headshots are the top third. */
Game.scenes.valorant = (stage) => {
  const TARGET = CONFIG.rangeTargets || 15;
  const FACES = ["hero", "ramen", "night", "study", "room", "field"];

  const wrap = el(`<section class="scroll dark enter">
    <div class="head" style="margin-bottom:14px">
      <div class="glyph" style="--c:#A8503C">战</div>
      <div class="t">
        <div class="val-tag">Trial III · Battle · The Range</div>
        <h2>Flick on the Shin-chans</h2>
        <p style="margin-top:4px">
          ${TARGET} kills to clear. The top third of the head counts as a headshot 🎯
        </p>
      </div>
    </div>

    <div class="val-range" id="range">
      <div class="val-grid"></div>
    </div>

    <div class="val-hud">
      <div class="row" style="justify-content:flex-start;gap:8px">
        <div class="val-stat"><b id="kills">0</b><span>Kills</span></div>
        <div class="val-stat"><b id="acc">100%</b><span>Accuracy</span></div>
        <div class="val-stat"><b id="hs">0</b><span>Headshots</span></div>
        <div class="val-stat"><b id="streak">0</b><span>Streak</span></div>
      </div>
      <div class="muted">click / tap the targets</div>
    </div>
  </section>`);
  stage.appendChild(wrap);

  const range  = wrap.querySelector("#range");
  const $      = id => wrap.querySelector("#" + id);
  let kills = 0, shots = 0, heads = 0, streak = 0, best = 0, done = false, live = null, timer = null;

  const updateHud = () => {
    $("kills").textContent = kills;
    $("acc").textContent = shots ? Math.round(kills / shots * 100) + "%" : "100%";
    $("hs").textContent = heads;
    $("streak").textContent = best;
  };

  const float = (x, y, text, color) => {
    const f = el(`<div class="floattext" style="left:${x}px;top:${y}px;color:${color}">${text}</div>`);
    range.appendChild(f);
    setTimeout(() => f.remove(), 800);
  };

  const spawn = () => {
    if (done) return;
    clearTimeout(timer);
    if (live) live.remove();

    const face = FACES[(Math.random() * FACES.length) | 0];
    const x = 10 + Math.random() * 80;
    const y = 14 + Math.random() * 68;
    const size = 58 + Math.random() * 34;                       // smaller = harder, later on
    const t = el(`<button class="target" style="left:${x}%;top:${y}%;width:${size}px;height:${size}px">
        <img src="img/sq/${face}.jpg" alt="target">
      </button>`);

    t.onpointerdown = e => {
      e.stopPropagation();
      if (done || t.classList.contains("hit")) return;
      const r = t.getBoundingClientRect(), rr = range.getBoundingClientRect();
      const head = (e.clientY - r.top) < r.height * .34;        // top third = headshot

      shots++; kills++; streak++; best = Math.max(best, streak);
      if (head) heads++;
      t.classList.add("hit");
      Game.sfx(head ? "hit" : "shot");
      float(e.clientX - rr.left, e.clientY - rr.top,
            head ? "HEADSHOT" : "+1", head ? "#2BE0C8" : "#fff");
      updateHud();

      if (kills >= TARGET) return finish();
      setTimeout(spawn, 130);
    };

    range.appendChild(t);
    live = t;
    timer = setTimeout(spawn, 1600);                            // it just moves on, no penalty
  };

  // clicking empty space costs accuracy, nothing else
  range.onpointerdown = () => {
    if (done) return;
    shots++; streak = 0;
    Game.sfx("shot");
    updateHud();
  };

  const finish = () => {
    done = true;
    clearTimeout(timer);
    if (live) live.remove();
    const acc = shots ? Math.round(kills / shots * 100) : 100;
    range.appendChild(el(`<div class="ace">ACE</div>`));
    Game.burst(80);
    setTimeout(() => {
      Game.toast(`${acc}% accuracy · ${heads} headshots · ${best} streak 🔥`, 2600);
      Game.win("valorant");
    }, 1300);
  };

  updateHud();
  spawn();
};
