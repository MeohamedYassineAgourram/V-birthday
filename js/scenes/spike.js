/* Stop 5 — SPIKE DEFUSE.
   Hold to defuse. Half-defuse checkpoint at the midpoint, exactly like the real thing.
   The timer running out doesn't fail her — it just resets, and the checkpoint is kept. */
Game.scenes.spike = (stage) => {
  const TOTAL  = CONFIG.spikeSeconds  || 45;
  const DEFUSE = CONFIG.defuseSeconds || 7;

  const wrap = el(`<section class="val-wrap enter">
    <div class="head" style="margin-bottom:14px">
      <div class="n" style="background:var(--val)">05</div>
      <div class="t">
        <div class="val-tag">Ascent · Site B</div>
        <h2>Defuse the spike</h2>
        <p style="color:#8E96A3;margin-top:4px">
          Hold <b>SPACE</b> — or press and hold the button. Let go and you keep the half-defuse.
        </p>
      </div>
    </div>

    <div class="spike-stage" id="stageBox">
      <div class="spike-timer" id="timer">0:45</div>
      <div class="spike" id="spike">
        <span class="core"></span>
        <span class="fin f1"></span><span class="fin f2"></span>
        <span class="fin f3"></span><span class="fin f4"></span>
      </div>
      <div class="defuse-track">
        <div class="checkpoint"></div>
        <i id="fill"></i>
      </div>
      <div class="spike-status" id="status">SPIKE PLANTED</div>
    </div>

    <div class="val-hud" style="justify-content:center;margin-top:18px">
      <button class="btn val" id="hold" style="padding:16px 40px;font-size:15px">Hold to defuse</button>
    </div>
  </section>`);
  stage.appendChild(wrap);

  const $ = id => wrap.querySelector("#" + id);
  const spike = $("spike"), fill = $("fill"), timerEl = $("timer"), statusEl = $("status"), holdBtn = $("hold");
  const box = $("stageBox");

  let left = TOTAL;          // seconds on the clock
  let progress = 0;          // 0..1 defuse progress
  let holding = false, done = false;
  let last = performance.now(), nextBeep = 0;

  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  const setStatus = (text, color) => {
    statusEl.textContent = text;
    statusEl.style.color = color || "var(--val)";
  };

  const finish = () => {
    done = true;
    holding = false;
    box.classList.add("defused");
    setStatus("SPIKE DEFUSED", "#2BE0C8");
    Game.sfx("win");
    Game.burst(90);
    setTimeout(() => Game.win("spike"), 1500);
  };

  const boom = () => {
    // no fail state: the spike "goes off", Shin-chan is unbothered, the clock resets
    progress = progress >= .5 ? .5 : 0;            // the half-defuse survives the explosion
    left = TOTAL;
    box.classList.add("boom");
    setTimeout(() => box.classList.remove("boom"), 600);
    Game.sfx("bad");
    Game.toast("💥 …Shin-chan slept through it. Clock reset — try again 😌", 3000);
  };

  const loop = (now) => {
    if (!wrap.isConnected) return;                 // scene was torn down — stop the beeping
    const dt = Math.min(.05, (now - last) / 1000);
    last = now;

    if (!done) {
      left -= dt;

      if (holding) {
        progress += dt / DEFUSE;
        if (progress >= 1) { progress = 1; finish(); }
      }

      if (left <= 0) boom();

      // beeps get faster as the clock runs down
      nextBeep -= dt;
      if (nextBeep <= 0) {
        const frac = clamp(left / TOTAL, 0, 1);
        nextBeep = .18 + frac * .82;
        Game.tone(left < TOTAL * .25 ? 1200 : 880, .05, "square", .05);
        spike.classList.remove("beat"); void spike.offsetWidth; spike.classList.add("beat");
      }

      timerEl.textContent = fmt(Math.max(0, left));
      timerEl.classList.toggle("urgent", left < TOTAL * .25);
      fill.style.width = (progress * 100) + "%";
      box.classList.toggle("holding", holding);
      if (progress >= .5) box.classList.add("half");
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  /* ---- hold input: pointer, keyboard, touch ---- */
  const start = e => {
    if (done) return;
    if (e) e.preventDefault();
    if (holding) return;
    holding = true;
    setStatus("DEFUSING…", "#FFD86B");
    Game.tone(300, .12, "sawtooth", .06);
  };
  const end = () => {
    if (done || !holding) return;
    holding = false;
    if (progress >= .5) {
      progress = Math.max(progress, .5);            // half-defuse locks in
      setStatus("HALF DEFUSED — you keep this", "#2BE0C8");
    } else {
      progress = 0;
      setStatus("SPIKE PLANTED", "var(--val)");
    }
  };

  holdBtn.addEventListener("pointerdown", start);
  spike.addEventListener("pointerdown", start);
  addEventListener("pointerup", end);
  addEventListener("pointercancel", end);

  const kd = e => { if (e.code === "Space" && !e.repeat) { e.preventDefault(); start(); } };
  const ku = e => { if (e.code === "Space") { e.preventDefault(); end(); } };
  addEventListener("keydown", kd);
  addEventListener("keyup", ku);

  // clean up the window-level listeners once this scene is gone
  const observer = new MutationObserver(() => {
    if (!wrap.isConnected) {
      removeEventListener("pointerup", end);
      removeEventListener("pointercancel", end);
      removeEventListener("keydown", kd);
      removeEventListener("keyup", ku);
      observer.disconnect();
    }
  });
  observer.observe(Game.stage, { childList: true });
};
