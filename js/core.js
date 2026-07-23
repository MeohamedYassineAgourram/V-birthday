/* Router, progress, sound, confetti. No dependencies. */

/* The five missions. `pos` is where the waypoint sits in the 3D world. */
const STOPS = [
  { id: "chocobi",  cn: "拾遗", en: "GATHER", color: "#E3B341", photo: "room",  bg: "room",
    pos: [3.10, 0, 1.13], blurb: "Chocobi falls from the sky. Catch it." },
  { id: "memory",   cn: "解谜", en: "PUZZLE", color: "#7FA8C4", photo: "study", bg: "study",
    pos: [-1.13, 0, 3.10], blurb: "Shiro buried the album. Find the pairs." },
  { id: "valorant", cn: "战斗", en: "BATTLE", color: "#E8563F", photo: "hero",  bg: "night",
    pos: [-3.10, 0, -1.13], blurb: "The range awaits. Flick, don't spray." },
  { id: "debugjs",  cn: "符文", en: "RUNES",  color: "#8FB07A", photo: "night", bg: "ramen",
    pos: [1.13, 0, -3.10], blurb: "Four runes, out of order. Restore them." },
  { id: "cake",     cn: "心愿", en: "WISH",   color: "#D98E8E", photo: "field", bg: "hero",
    pos: [0, 0, 0], blurb: "The summit. Make a wish." }
];
const FINALE = "cake";
const TRIALS = STOPS.filter(s => s.id !== FINALE);   // the four that gate the summit

const Game = {
  stage:  document.getElementById("stage"),
  scenes: {},
  order:  ["world", ...STOPS.map(s => s.id)],
  done:   new Set(),
  current: "world",
  _3d:    null,
  KEY:    "shin-bday-v3",

  get lit() { return this.done.size; },

  /* the summit only opens once the four trials are done */
  unlocked(id) {
    return id !== FINALE || TRIALS.every(s => this.done.has(s.id));
  },

  /* ---------- routing ---------- */
  go(name) {
    if (this._3d) { this._3d.dispose(); this._3d = null; }
    this.current = name;
    this.save();
    this.setWorld(name);
    this.stage.innerHTML = "";
    this.renderChrome();
    this.scenes[name](this.stage);
    scrollTo({ top: 0, behavior: "smooth" });
  },

  /* every scene is its own world: a flat sky colour and whatever drifts through it */
  _sky: null,
  setWorld(name) {
    document.body.dataset.world = STOPS.some(x => x.id === name) ? name : "map";
    const amb = document.getElementById("ambient");
    if (!amb) return;
    amb.innerHTML = "";

    // the landing is clean and minimal — no weather at all; the island's own
    // orbit ring and floating accents carry it. Missions keep their weather.
    if (this._sky) { this._sky.dispose(); this._sky = null; }
    if (!STOPS.some(x => x.id === name)) return;       // map / hero: nothing drifting

    const add = (cls, style) => amb.appendChild(el(`<span class="amb ${cls}" style="${style}"></span>`));
    const rand = (a, b) => a + Math.random() * (b - a);

    const weather = {
      map:      "clouds", hero: "clouds",
      chocobi:  "clouds",
      memory:   "petals",
      valorant: "stars",
      debugjs:  "sparks",
      cake:     "rays"
    }[name] || "clouds";

    if (weather === "clouds") {
      for (let i = 0; i < 7; i++) {
        const w = rand(90, 230), t = rand(4, 74), d = rand(48, 120), del = -rand(0, 120);
        add("cloud", `width:${w}px;height:${w * .3}px;top:${t}vh;left:0;
          animation-duration:${d}s;animation-delay:${del}s;opacity:${rand(.5, .95)}`);
      }
    }
    if (weather === "petals") {
      for (let i = 0; i < 26; i++)
        add("petal", `left:${rand(0, 100)}vw;animation-duration:${rand(9, 20)}s;
          animation-delay:${-rand(0, 20)}s;opacity:${rand(.35, .8)}`);
    }
    if (weather === "stars") {
      for (let i = 0; i < 90; i++)
        add("star", `left:${rand(0, 100)}vw;top:${rand(0, 92)}vh;
          animation-duration:${rand(1.6, 5)}s;animation-delay:${-rand(0, 5)}s;
          transform:scale(${rand(.6, 2.2)})`);
    }
    if (weather === "sparks") {
      for (let i = 0; i < 28; i++)
        add("spark", `left:${rand(0, 100)}vw;animation-duration:${rand(10, 24)}s;
          animation-delay:${-rand(0, 24)}s`);
    }
    if (weather === "rays") {
      for (let i = 0; i < 4; i++)
        add("ray", `left:${rand(-6, 78)}vw;animation-delay:${-rand(0, 15)}s;opacity:${rand(.35, .75)}`);
    }
  },

  save() {
    try {
      localStorage.setItem(this.KEY, JSON.stringify({ scene: this.current, done: [...this.done] }));
    } catch (e) {}
  },

  /* Mission complete → a seal is earned, then back to the map. */
  win(id) {
    const stop = STOPS.find(s => s.id === id);
    const wasNew = !this.done.has(id);
    this.done.add(id);
    this.save();
    this.sfx("win");
    this.burst(70);
    this.renderChrome();

    const allDone = TRIALS.every(s => this.done.has(s.id));
    const card = el(`<div class="panel narrow center enter">
      <div class="win-seal" style="--c:${stop.color}">${stop.cn}</div>
      <div class="kicker" style="--c:${stop.color}">${stop.en} complete</div>
      <h2>${wasNew ? "A seal is yours" : "Cleared again"}</h2>
      <p class="lead">${this.lit} of ${STOPS.length} seals recovered.${
        allDone && !this.done.has(FINALE) ? " <b>The summit has opened.</b>" : ""}</p>
      <div class="cta-row">
        <button class="btn solid" id="back">Return to the map</button>
      </div>
    </div>`);
    this.stage.innerHTML = "";
    this.stage.appendChild(card);
    card.querySelector("#back").onclick = () => this.go("world");
  },

  /* ---------- floating chrome ---------- */
  renderChrome() {
    const nav = document.getElementById("pillnav");
    if (nav) {
      nav.innerHTML = "";
      const map = el(`<button class="${this.current === "world" ? "on" : ""}">Map</button>`);
      map.onclick = () => this.go("world");
      nav.appendChild(map);
      STOPS.forEach(s => {
        const open = this.unlocked(s.id);
        const b = el(`<button class="${s.id === this.current ? "on" : ""} ${this.done.has(s.id) ? "done" : ""}"
          ${open ? "" : "disabled"}>${s.en.charAt(0) + s.en.slice(1).toLowerCase()}</button>`);
        b.onclick = () => open && this.go(s.id);
        nav.appendChild(b);
      });
    }
    const seals = document.getElementById("seals");
    if (seals) {
      seals.textContent = `${this.lit} / ${STOPS.length}`;
      seals.onclick = () => this.go(this.current === "hero" ? "world" : "hero");
    }
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
