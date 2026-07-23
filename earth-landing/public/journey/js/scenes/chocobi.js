/* Era 3 — Azure Coves. Catch bright time-shards, dodge the static. */
Game.games.chocobi = (stage, c) => {
  const target = CONFIG.chocobiTarget;

  const card = el(`<section class="glass enter">
    <div class="head">
        <div class="glyph" style="--c:#E3B341">◈</div>
      <div class="t">
        <div class="kicker" style="--c:${(c&&c.tint)||'#7FA8C4'}">${c?c.flag+' '+c.name:''} · Gather</div>
        <h2>Falling tide-shards</h2>
        <p>Catch <b>${target}</b> bright shards. The green static interrupts the signal.</p>
      </div>
    </div>
    <div class="frame" id="frame">
      <div class="frame-bg" style="background-image:url('${c.image}')"></div>
      <div class="frame-veil"></div>
      <div class="hud-pill" id="score">0 / ${target}</div>
      <div class="hud-hint">mouse · finger · ← →</div>
      <canvas id="cv"></canvas>
    </div>
  </section>`);
  stage.appendChild(card);

  const frame = card.querySelector("#frame");
  const cv = card.querySelector("#cv");
  const ctx = cv.getContext("2d");
  const scoreEl = card.querySelector("#score");

  let W = 0, H = 0;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const fit = () => {
    const r = frame.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  fit();
  const ro = new ResizeObserver(fit); ro.observe(frame);

  let bx = .5, caught = 0, items = [], t = 0, running = true;
  const keys = {};
  const BW = () => Math.max(74, W * .16), BH = 36;

  const point = e => {
    const r = frame.getBoundingClientRect();
    bx = clamp(((e.touches ? e.touches[0].clientX : e.clientX) - r.left) / r.width, 0, 1);
  };
  frame.addEventListener("pointermove", point);
  frame.addEventListener("touchmove", e => { e.preventDefault(); point(e); }, { passive: false });
  const kd = e => keys[e.key] = true, ku = e => keys[e.key] = false;
  addEventListener("keydown", kd); addEventListener("keyup", ku);

  const stop = () => {
    running = false; ro.disconnect();
    removeEventListener("keydown", kd); removeEventListener("keyup", ku);
  };

  const spawn = () => items.push({
    x: .08 + Math.random() * .84, y: -.08,
    v: .0034 + Math.random() * .0032 + caught * .00012,
    r: 18, rot: Math.random() * 6, vr: (Math.random() - .5) * .09,
    bad: Math.random() < .28
  });

  const loop = () => {
    if (!running) return;
    t++;
    if (keys.ArrowLeft)  bx -= .018;
    if (keys.ArrowRight) bx += .018;
    bx = clamp(bx, 0, 1);
    if (t % 34 === 0) spawn();

    ctx.clearRect(0, 0, W, H);
    const px = bx * W, py = H - 22 - BH;
    DRAW.basket(ctx, px, py, BW(), BH);

    items.forEach(o => {
      o.y += o.v; o.rot += o.vr;
      const ox = o.x * W, oy = o.y * H;
      (o.bad ? DRAW.pepper : DRAW.chocobi)(ctx, ox, oy, o.r, o.rot);

      if (!o.hit && oy > py - 8 && oy < py + BH && Math.abs(ox - px) < BW() / 2 + 8) {
        o.hit = o.dead = true;
        if (o.bad) {
          Game.sfx("bad"); caught = Math.max(0, caught - 1);
          Game.toast("Static cloud — not a shard", 1100);
        } else { Game.sfx("good"); caught++; }
        scoreEl.textContent = `${caught} / ${target}`;
        if (caught >= target) { stop(); setTimeout(() => Game.win(), 300); }
      }
      if (oy > H + 40) o.dead = true;
    });
    items = items.filter(o => !o.dead);
    requestAnimationFrame(loop);
  };
  loop();
};
