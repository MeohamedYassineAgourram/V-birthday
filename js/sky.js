/* ============================================================
   SkyFX — a painterly sunset cloudscape on a canvas.
   Volumetric cumulus (cool base, warm-lit top), a low sun with
   god rays and haze. Clouds are pre-painted to sprite canvases
   once, then drifted as cheap image blits with depth parallax.
   ============================================================ */
const SkyFX = (() => {

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* paint one volumetric cumulus onto its own canvas */
  function makeCloudSprite(w, h, warmth) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d");

    // tight cluster of puffs — a flatter base with billowing caps on top.
    // Everything must fade to zero *inside* the canvas or the edges clip to
    // straight lines and the cloud reads as a rectangle. maxR bounds the reach.
    const maxR = h * .34;
    const clamp1 = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    const puffs = [];
    const n = 11 + ((w / 40) | 0);
    for (let i = 0; i < n; i++) {
      const rad = Math.pow(Math.random(), .6);
      const ang = Math.random() * Math.PI * 2;
      let px = w / 2 + Math.cos(ang) * rad * (w / 2 - maxR);
      let py = h * .58 + Math.sin(ang) * rad * (h * .26) - Math.pow(Math.random(), 2) * h * .18;
      const pr = maxR * (0.55 + Math.random() * 0.45);
      // shadow pass reaches +0.1h below, so leave room for that too
      px = clamp1(px, pr, w - pr);
      py = clamp1(py, pr, h - pr - h * .1);
      puffs.push({ x: px, y: py, r: pr });
    }
    puffs.sort((a, b) => b.y - a.y);          // paint back-to-front (low y last = on top)

    // dense core, harder falloff — a smooth 0→1 fade just makes fog
    const puff = (x, y, r, col, a, coreStop = .5) => {
      const g = ctx.createRadialGradient(x, y, r * .08, x, y, r);
      g.addColorStop(0, col.replace("$a", a));
      g.addColorStop(coreStop, col.replace("$a", a * .82));
      g.addColorStop(1, col.replace("$a", 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    };

    const W2 = warmth;                        // 0 far/cool … 1 near/warm
    // 1 — cool shadow, dropped below the base (defines the underside)
    puffs.forEach(p => puff(p.x, p.y + h * .1, p.r, "rgba(58,74,120,$a)", .5, .62));
    // 2 — cool mid body
    puffs.forEach(p => puff(p.x, p.y, p.r, "rgba(120,138,178,$a)", .72, .58));
    // 3 — warm mid, sunlit side (sun is lower-left, so light wraps the lower-left flank)
    puffs.forEach(p => puff(p.x - p.r * .22, p.y + p.r * .18, p.r * .82,
      `rgba(255,${188 + W2 * 40 | 0},${150 + W2 * 30 | 0},$a)`, .55 + W2 * .2, .5));
    // 4 — hot pink/gold rim on the upper caps
    puffs.forEach(p => {
      const cap = 1 - (p.y / h);              // higher puffs get brighter rims
      if (cap < .45) return;
      puff(p.x + p.r * .1, p.y - p.r * .34, p.r * .58,
        `rgba(255,${228 + W2 * 20 | 0},${196 + W2 * 20 | 0},$a)`, .55 + cap * .4, .42);
    });
    // 5 — a few bright specular crests
    puffs.forEach(p => {
      if (Math.random() > .5 || p.y > h * .5) return;
      puff(p.x, p.y - p.r * .42, p.r * .3, "rgba(255,248,232,$a)", .8, .35);
    });
    return c;
  }

  function mount(container, opts = {}) {
    const canvas = document.createElement("canvas");
    canvas.className = "skyfx";
    container.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W = 0, H = 0;

    // sun sits low-left, like the reference
    const sun = { x: .30, y: .66 };

    // bake a blur into a sprite once, so the animation loop never pays for ctx.filter
    const blurBake = (src, px) => {
      if (!px) return src;
      const b = document.createElement("canvas");
      b.width = src.width; b.height = src.height;
      const bx = b.getContext("2d");
      bx.filter = `blur(${px}px)`;
      bx.drawImage(src, 0, 0);
      return b;
    };

    // three depth bands: far (small, hazy, slow) → near (big, bright, fast)
    const sprites = [];
    for (let i = 0; i < 4; i++) sprites.push(blurBake(makeCloudSprite(260, 150, .3), 4));  // far
    for (let i = 0; i < 4; i++) sprites.push(blurBake(makeCloudSprite(420, 230, .7), 1));  // mid
    for (let i = 0; i < 3; i++) sprites.push(makeCloudSprite(620, 330, 1));                // near

    let clouds = [];
    const seed = () => {
      clouds = [];
      const bands = [
        { list: sprites.slice(0, 4),  n: 4, yTop: .04, yBot: .30, sc: .75, sp: 5,  op: .55 },
        { list: sprites.slice(4, 8),  n: 3, yTop: .06, yBot: .28, sc: 1,   sp: 9,  op: .8  },
        { list: sprites.slice(8, 11), n: 3, yTop: .02, yBot: .24, sc: 1.2, sp: 15, op: .95 }
      ];
      bands.forEach(b => {
        for (let i = 0; i < b.n; i++) {
          clouds.push({
            sprite: b.list[(Math.random() * b.list.length) | 0],
            x: Math.random() * 1.3 - .15,
            y: b.yTop + Math.random() * (b.yBot - b.yTop),
            sc: b.sc * (.7 + Math.random() * .6),
            sp: b.sp * (.8 + Math.random() * .4),
            op: b.op, ph: Math.random() * 6
          });
        }
      });
      clouds.sort((a, b) => a.sp - b.sp);   // far first
    };

    const fit = () => {
      W = container.clientWidth; H = container.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit(); seed();
    const ro = new ResizeObserver(() => { fit(); }); ro.observe(container);

    /* the fixed sun: bloom + god rays, painted under the clouds each frame */
    const drawSun = (t) => {
      const sx = sun.x * W, sy = sun.y * H;
      // bloom — kept tighter so the blue sky and cloud shapes stay readable
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, H * .5);
      g.addColorStop(0, "rgba(255,244,214,.9)");
      g.addColorStop(.12, "rgba(255,230,184,.5)");
      g.addColorStop(.4, "rgba(255,214,160,.12)");
      g.addColorStop(1, "rgba(255,214,160,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      // core
      const core = ctx.createRadialGradient(sx, sy, 0, sx, sy, H * .1);
      core.addColorStop(0, "rgba(255,255,250,.95)");
      core.addColorStop(1, "rgba(255,246,222,0)");
      ctx.fillStyle = core; ctx.fillRect(0, 0, W, H);
      // god rays fanning up-right, localised near the sun
      ctx.save();
      ctx.translate(sx, sy);
      ctx.globalCompositeOperation = "lighter";
      const rays = 7;
      for (let i = 0; i < rays; i++) {
        const base = -0.7 + (i / rays) * 1.9;
        const ang = base + Math.sin(t * .15 + i) * .03;
        const width = .03 + (i % 3) * .016;
        ctx.save();
        ctx.rotate(ang);
        const len = H * 1.5;
        const rg = ctx.createLinearGradient(0, 0, 0, -len);
        rg.addColorStop(0, "rgba(255,240,206,.11)");
        rg.addColorStop(.45, "rgba(255,240,206,.03)");
        rg.addColorStop(1, "rgba(255,240,206,0)");
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-Math.tan(width) * len, -len);
        ctx.lineTo(Math.tan(width) * len, -len);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    };

    /* a couple of high wispy contrail streaks */
    const drawStreaks = () => {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      [[.12, .1, .5], [.2, .14, .34], [.28, .07, .28]].forEach(([y, len, op]) => {
        const gy = y * H;
        const g = ctx.createLinearGradient(0, gy, W, gy - H * .04);
        g.addColorStop(0, "rgba(255,236,210,0)");
        g.addColorStop(.5, `rgba(255,240,220,${op * .5})`);
        g.addColorStop(1, "rgba(255,236,210,0)");
        ctx.strokeStyle = g; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(W * .05, gy);
        ctx.bezierCurveTo(W * .35, gy - H * .03, W * .65, gy + H * .02, W * .96, gy - H * .05);
        ctx.stroke();
      });
      ctx.restore();
    };

    const clock = performance.now();
    let raf, alive = true;
    const tick = () => {
      if (!alive) return;
      raf = requestAnimationFrame(tick);
      const t = (performance.now() - clock) / 1000;

      ctx.clearRect(0, 0, W, H);
      drawSun(t);
      drawStreaks();

      clouds.forEach(c => {
        const spr = c.sprite;
        const w = spr.width * c.sc, h = spr.height * c.sc;
        let x = ((c.x - (reduced ? 0 : t * c.sp / 100)) % 1.3 + 1.3) % 1.3 - .15;
        const px = x * W;
        const py = c.y * H + Math.sin(t * .2 + c.ph) * 8;
        ctx.globalAlpha = c.op;
        ctx.drawImage(spr, px, py, w, h);
      });
      ctx.globalAlpha = 1;
    };
    tick();

    return {
      dispose() {
        alive = false;
        cancelAnimationFrame(raf);
        ro.disconnect();
        canvas.remove();
      }
    };
  }

  return { mount };
})();
