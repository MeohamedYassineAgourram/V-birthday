/* Router, progress, sound, confetti — a journey around the world. No dependencies. */

/* The five stops of the journey, in order. Each is a country + a mission. */
const COUNTRIES = [
  { id: "japan",   name: "Japan",       city: "Mt. Fuji · Kawaguchiko", flag: "🇯🇵",
    game: "memory",   tint: "#E8709E", stamp: "日本",
    brief: "Petals hide the memories. Match every pair beneath Mt. Fuji." },
  { id: "korea",   name: "South Korea", city: "Seoul",                  flag: "🇰🇷",
    game: "valorant", tint: "#5B8DEF", stamp: "한국",
    brief: "Seoul's arena is live. Flick onto every target — headshots count double." },
  { id: "morocco", name: "Morocco",     city: "The Sahara",            flag: "🇲🇦",
    game: "chocobi",  tint: "#E0A34B", stamp: "المغرب",
    brief: "Stars fall over the dunes. Catch them, dodge the thorns." },
  { id: "china",   name: "China",       city: "Shanghai",              flag: "🇨🇳",
    game: "debugjs",  tint: "#E0483B", stamp: "中国",
    brief: "Four runes glow out of order. Restore the incantation." },
  { id: "france",  name: "France",      city: "Paris",                 flag: "🇫🇷",
    game: "cake",     tint: "#8E7BF0", stamp: "Paris", finale: true,
    brief: "The journey's end. One last wish under the Eiffel lights." }
];
const byId = id => COUNTRIES.find(c => c.id === id);

const Game = {
  stage:   document.getElementById("stage"),
  scenes:  {},         // globe, journey, and one wrapper per country
  games:   {},         // the minigame builders, keyed by game type
  order:   ["globe", "journey", ...COUNTRIES.map(c => c.id)],
  done:    new Set(),
  current: "globe",
  active:  null,       // the country whose mission is running
  _3d:     null,
  KEY:     "vivi-journey-v1",

  get lit() { return this.done.size; },

  /* a country unlocks once every earlier country is done (linear journey) */
  unlocked(id) {
    const i = COUNTRIES.findIndex(c => c.id === id);
    return COUNTRIES.slice(0, i).every(c => this.done.has(c.id));
  },
  nextCountry() { return COUNTRIES.find(c => !this.done.has(c.id)); },

  /* ---------- routing ---------- */
  go(name) {
    if (this._3d) { this._3d.dispose(); this._3d = null; }
    this.current = name;
    this.active = byId(name) || null;
    this.save();
    this.setWorld(name);
    this.stage.innerHTML = "";
    this.renderChrome();
    (this.scenes[name] || this.scenes.globe)(this.stage);
    scrollTo({ top: 0 });
  },

  /* a cinematic zoom-wipe between scenes, tinted by the destination country */
  travel(name) {
    const c = byId(name);
    const ov = document.getElementById("warp");
    if (!ov) return this.go(name);
    ov.style.setProperty("--img", c ? `url("img/loc/${c.id}.jpg")` : "none");
    ov.style.setProperty("--tint", c ? c.tint : "#0a0e17");
    ov.classList.remove("out"); ov.classList.add("in");
    this.sfx("whoosh");
    setTimeout(() => {
      this.go(name);
      ov.classList.remove("in"); ov.classList.add("out");
      setTimeout(() => ov.classList.remove("out"), 700);
    }, 620);
  },

  /* ---------- world theming (per-country backdrop) ---------- */
  setWorld(name) {
    const c = byId(name);
    document.body.dataset.world = name;
    const bd = document.getElementById("backdrop");
    if (bd) {
      bd.style.backgroundImage = c ? `url("img/loc/${c.id}.jpg")` : "none";
      bd.classList.toggle("on", !!c);
    }
    document.documentElement.style.setProperty("--tint", c ? c.tint : "#5B8DEF");
  },

  save() {
    try { localStorage.setItem(this.KEY, JSON.stringify({ scene: this.current, done: [...this.done] })); }
    catch (e) {}
  },

  /* A mission is cleared → stamp the passport, then continue the journey. */
  win() {
    const c = this.active;
    if (!c) return;
    const wasNew = !this.done.has(c.id);
    this.done.add(c.id);
    this.save();
    this.sfx("win");
    this.burst(80);
    this.renderChrome();

    if (c.finale) return;   // France runs its own finale (birthday reveal)

    const next = this.nextCountry();
    const card = el(`<div class="glass narrow center enter">
      <div class="stamp" style="--c:${c.tint}">${c.flag}<span>${c.stamp}</span></div>
      <div class="kicker">${c.name} · cleared</div>
      <h2>${wasNew ? "Passport stamped" : "Cleared again"}</h2>
      <p class="lead">${this.lit} of ${COUNTRIES.length} stops complete.
        ${next ? `Next: <b>${next.flag} ${next.name}</b>.` : ""}</p>
      <div class="cta-row">
        ${next ? `<button class="btn solid" id="nx">Fly to ${next.name} <span>→</span></button>` : ""}
        <button class="btn ghost" id="board">The journey</button>
      </div>
    </div>`);
    this.stage.innerHTML = "";
    this.stage.appendChild(card);
    const nxBtn = card.querySelector("#nx");
    if (nxBtn) nxBtn.onclick = () => this.travel(next.id);
    card.querySelector("#board").onclick = () => this.go("journey");
  },

  /* ---------- floating chrome: the passport strip ---------- */
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

/* Each country scene = its backdrop (set in setWorld) + the minigame on top.
   Games are registered later by the scene files; read them lazily at call time. */
COUNTRIES.forEach(c => {
  Game.scenes[c.id] = (stage) => {
    Game.active = c;
    const build = Game.games[c.game];
    if (build) build(stage, c);
  };
});
