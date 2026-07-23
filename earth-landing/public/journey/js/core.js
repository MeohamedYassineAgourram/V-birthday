/* Router, progress, sound, confetti — a journey through five time realms. */

/* The five eras stay in a fixed order; each keeps its original minigame. */
const COUNTRIES = [
  { id: "japan",   name: "Tidebreak Isles",      city: "Year 4021 · Azure Age",      flag: "✦",
    game: "memory",   tint: "#4BC8D4", stamp: "TIDE", code: "TIDE//01",
    brief: "The sea remembers every path. Restore the lost pairs before the islands drift apart." },
  { id: "korea",   name: "Sunstone Ruins",        city: "Year 1680 · Amber Age",      flag: "☼",
    game: "valorant", tint: "#EF9C59", stamp: "SUN", code: "SUN//02",
    brief: "An old observatory is waking up. Calibrate every beacon to reopen the next era." },
  { id: "morocco", name: "The Singing Dunes",     city: "Year 0407 · Sand Age",       flag: "◈",
    game: "chocobi",  tint: "#E4B144", stamp: "DUNE", code: "DUNE//03",
    brief: "Small time-shards fall with the desert wind. Catch the bright ones and avoid the static." },
  { id: "china",   name: "The Waterfall Archives",city: "Year 2860 · Rain Age",       flag: "✺",
    game: "debugjs",  tint: "#78C99A", stamp: "RAIN", code: "RAIN//04",
    brief: "The archive's sequence is broken. Put the runes back in order to let the river flow." },
  { id: "france",  name: "The Moonlit Sanctuary", city: "Beyond time · Homeward Age", flag: "☾",
    game: "cake",     tint: "#B69AF5", stamp: "HOME", finale: true, code: "HOME//05",
    brief: "The last gate is waiting in the quiet moonlight. One wish will bring the journey home." }
];
const byId = id => COUNTRIES.find(c => c.id === id);

const Game = {
  stage:   document.getElementById("stage"),
  scenes:  {},         // time-gate start, map, and one wrapper per realm
  games:   {},         // the minigame builders, keyed by game type
  order:   ["globe", "journey", ...COUNTRIES.map(c => c.id)],
  done:    new Set(),
  current: "globe",
  active:  null,       // the realm whose mission is running
  traveling: false,
  _3d:     null,
  KEY:     "vivi-time-journey-v2",

  get lit() { return this.done.size; },

  /* a realm unlocks once every earlier realm is restored (linear journey) */
  unlocked(id) {
    const i = COUNTRIES.findIndex(c => c.id === id);
    return COUNTRIES.slice(0, i).every(c => this.done.has(c.id));
  },
  nextCountry() { return COUNTRIES.find(c => !this.done.has(c.id)); },

  /* ---------- routing ---------- */
  go(name) {
    if (this._3d) { this._3d.dispose(); this._3d = null; }
    this.current = name;
    this.traveling = false;
    this.active = byId(name) || null;
    this.save();
    this.setWorld(name);
    this.stage.innerHTML = "";
    this.renderChrome();
    (this.scenes[name] || this.scenes.globe)(this.stage);
    scrollTo({ top: 0 });
  },

  /* A rift opens between each era. */
  travel(name) {
    if (this.traveling) return;
    this.traveling = true;
    const c = byId(name);
    const ov = document.getElementById("warp");
    if (!ov) { this.go(name); return; }
    ov.style.setProperty("--img", "none");
    ov.style.setProperty("--tint", c ? c.tint : "#0a0e17");
    ov.classList.remove("out"); ov.classList.add("in");
    this.sfx("whoosh");
    setTimeout(() => {
      this.go(name);
      ov.classList.remove("in"); ov.classList.add("out");
      setTimeout(() => ov.classList.remove("out"), 700);
    }, 620);
  },

  /* ---------- world theming (each realm is painted in CSS) ---------- */
  setWorld(name) {
    const c = byId(name);
    document.body.dataset.world = name;
    const bd = document.getElementById("backdrop");
    if (bd) {
      bd.style.backgroundImage = "";
      bd.classList.toggle("on", name !== "globe");
    }
    document.documentElement.style.setProperty("--tint", c ? c.tint : "#5B8DEF");
  },

  save() {
    try { localStorage.setItem(this.KEY, JSON.stringify({ scene: this.current, done: [...this.done] })); }
    catch (e) {}
  },

  /* A mission is cleared → restore a time seal, then continue the journey. */
  win() {
    const c = this.active;
    if (!c) return;
    const wasNew = !this.done.has(c.id);
    this.done.add(c.id);
    this.save();
    this.sfx("win");
    this.burst(80);
    this.renderChrome();

    if (c.finale) return;   // the final realm runs its own birthday reveal

    const next = this.nextCountry();
    const card = el(`<div class="glass narrow center enter">
      <div class="stamp" style="--c:${c.tint}">${c.flag}<span>${c.stamp}</span></div>
      <div class="kicker">${c.name} · cleared</div>
      <h2>${wasNew ? "Time seal restored" : "Restored again"}</h2>
      <p class="lead">${this.lit} of ${COUNTRIES.length} stops complete.
        ${next ? `Next: <b>${next.flag} ${next.name}</b>.` : ""}</p>
      <div class="cta-row">
        ${next ? `<button class="btn solid" id="nx">Open ${next.name} <span>→</span></button>` : ""}
        <button class="btn ghost" id="board">The time map</button>
      </div>
    </div>`);
    this.stage.innerHTML = "";
    this.stage.appendChild(card);
    const nxBtn = card.querySelector("#nx");
    if (nxBtn) nxBtn.onclick = () => this.travel(next.id);
    card.querySelector("#board").onclick = () => this.go("journey");
  },

  /* ---------- floating chrome: the era strip ---------- */
  renderChrome() {
    const onJourney = this.current !== "globe";
    document.querySelector(".chrome").classList.toggle("hidden", !onJourney);

    const nav = document.getElementById("pillnav");
    if (nav) {
      nav.innerHTML = "";
      COUNTRIES.forEach(c => {
        const done = this.done.has(c.id), open = this.unlocked(c.id), on = c.id === this.current;
        const b = el(`<button class="flag ${done ? "done" : ""} ${on ? "on" : ""}"
          ${open ? "" : "disabled"} title="${c.name}">${c.flag}</button>`);
        b.onclick = () => open && (c.id === this.current ? null : this.travel(c.id));
        nav.appendChild(b);
      });
    }
    const seals = document.getElementById("seals");
    if (seals) { seals.textContent = `${this.lit} / ${COUNTRIES.length}`; seals.onclick = () => this.go("journey"); }
    const mark = document.getElementById("mark");
    if (mark) mark.onclick = () => this.go("journey");
  },

  /* ---------- toast ---------- */
  toast(msg, ms = 2000) {
    const t = document.getElementById("toast");
    t.innerHTML = msg;
    t.classList.add("show");
    clearTimeout(this._tt);
    this._tt = setTimeout(() => t.classList.remove("show"), ms);
  },

  /* ---------- synthesized sound (zero audio files) ---------- */
  muted: true,
  ac: null,
  audio() {
    if (!this.ac) this.ac = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ac.state === "suspended") this.ac.resume();
    return this.ac;
  },
  tone(freq, dur = .12, type = "square", vol = .12, delay = 0) {
    if (this.muted) return;
    const ac = this.audio(), t = ac.currentTime + delay;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + .012);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(ac.destination);
    o.start(t); o.stop(t + dur + .02);
  },
  sfx(kind) {
    if (this.muted) return;
    if (kind === "pop")  this.tone(660, .09, "triangle", .1);
    if (kind === "good") { this.tone(880, .08, "triangle"); this.tone(1320, .1, "triangle", .1, .07); }
    if (kind === "bad")  this.tone(150, .18, "sawtooth", .08);
    if (kind === "shot") { this.tone(240, .05, "square", .07); this.tone(90, .09, "sawtooth", .06, .01); }
    if (kind === "hit")  { this.tone(1400, .05, "sine", .1); this.tone(2100, .06, "sine", .08, .04); }
    if (kind === "win")  [523, 659, 784, 1046].forEach((f, i) => this.tone(f, .2, "triangle", .12, i * .09));
    if (kind === "whoosh") { this.tone(180, .5, "sine", .07); this.tone(90, .6, "sine", .05, .05); }
  },
  melody() {
    if (this.muted) return;
    const N = { C:261.6, D:293.7, E:329.6, F:349.2, G:392 };
    [[N.C,.3],[N.C,.2],[N.D,.5],[N.C,.5],[N.F,.5],[N.E,.9],
     [N.C,.3],[N.C,.2],[N.D,.5],[N.C,.5],[N.G,.5],[N.F,.9]]
      .reduce((t, [f, d]) => { this.tone(f, d * .9, "triangle", .1, t); return t + d; }, 0);
  },

  /* ---------- confetti (leaves and petals, to match the world) ---------- */
  burst(n = 90) {
    const cv = document.getElementById("confetti"), ctx = cv.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const colors = ["#C9A64E", "#A8503C", "#6E8FA0", "#7E8F6B", "#B5766A", "#E4DAC0"];
    const bits = Array.from({ length: n }, () => ({
      x: innerWidth / 2 + (Math.random() - .5) * innerWidth * .7,
      y: innerHeight * .3,
      vx: (Math.random() - .5) * 9, vy: -Math.random() * 12 - 4,
      r: Math.random() * 9 + 5, a: Math.random() * 7, va: (Math.random() - .5) * .3,
      c: colors[(Math.random() * colors.length) | 0]
    }));
    cancelAnimationFrame(this._cf);
    const tick = () => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      let alive = 0;
      bits.forEach(b => {
        b.vy += .32; b.x += b.vx + Math.sin(b.y * .03) * .6; b.y += b.vy; b.a += b.va; b.vx *= .995;
        if (b.y < innerHeight + 40) alive++;
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a);
        ctx.fillStyle = b.c;
        ctx.beginPath();                                  // leaf shape, not a rectangle
        ctx.ellipse(0, 0, b.r * .5, b.r * .28, 0, 0, 7);
        ctx.fill();
        ctx.restore();
      });
      if (alive) this._cf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, innerWidth, innerHeight);
    };
    tick();
  },
  rain(seconds = 6) {
    const end = Date.now() + seconds * 1000;
    const loop = () => { this.burst(45); if (Date.now() < end) setTimeout(loop, 680); };
    loop();
  }
};

/* ---------- helpers ---------- */
function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(p => p[1]);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* Each realm scene = its backdrop (set in setWorld) + the minigame on top.
   Games are registered later by the scene files; read them lazily at call time. */
COUNTRIES.forEach(c => {
  Game.scenes[c.id] = (stage) => {
    Game.active = c;
    const build = Game.games[c.game];
    if (build) build(stage, c);
  };
});
