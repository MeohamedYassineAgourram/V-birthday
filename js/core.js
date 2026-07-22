/* Router, progress, sound, confetti. No dependencies. */

const STOPS = [
  { id: "chocobi",  label: "Chocobi",   color: "#E8402A", photo: "room"  },
  { id: "memory",   label: "Shiro",     color: "#2C9BE8", photo: "study" },
  { id: "valorant", label: "The Range", color: "#FF4655", photo: "hero"  },
  { id: "debugjs",  label: "debug.js",  color: "#43A94F", photo: "night" },
  { id: "spike",    label: "Spike",     color: "#FF4655", photo: "ramen" },
  { id: "cake",     label: "Cake",      color: "#E86AA0", photo: "field" }
];

const Game = {
  stage:  document.getElementById("stage"),
  scenes: {},
  order:  ["hero", ...STOPS.map(s => s.id)],
  lit:    0,
  current: "hero",
  KEY:    "shin-bday-v2",

  /* ---------- routing ---------- */
  _3d: null,
  go(name) {
    if (this._3d) { this._3d.dispose(); this._3d = null; }   // tear down any live WebGL scene
    this.current = name;
    this.lit = Math.max(this.lit, this.order.indexOf(name) - 1, 0);
    try { localStorage.setItem(this.KEY, JSON.stringify({ scene: name, lit: this.lit })); } catch (e) {}

    this.stage.innerHTML = "";
    this.renderCandles();
    this.renderStrip();
    this.scenes[name](this.stage);
    scrollTo({ top: 0, behavior: "smooth" });
  },

  /* Finished a stop: celebrate, show the inside joke, move on. */
  win(stopId) {
    const i = STOPS.findIndex(s => s.id === stopId);
    const stop = STOPS[i];
    const next = STOPS[i + 1] ? STOPS[i + 1].id : null;

    this.sfx("win"); this.burst(70);
    this.lit = Math.max(this.lit, i + 1);
    this.renderCandles(); this.renderStrip();

    const card = el(`<div class="panel tight center enter">
      <div class="win-photo"><img src="img/sq/${stop.photo}.jpg" alt=""></div>
      <div class="eyebrow"><span class="dot" style="width:8px;height:8px;border-radius:50%;background:${stop.color}"></span>
        stop ${i + 1} of ${STOPS.length} cleared</div>
      <h2>+1 candle 🕯️</h2>
      <p class="lead">${this.lit} of ${STOPS.length} candles lit.
        ${next ? "Shin-chan is already running to the next one." : "That's all of them."}</p>
      <div class="row" style="margin-top:6px">
        <button class="btn dark" id="nx">${next ? "Next stop →" : "Open the gift →"}</button>
      </div>
    </div>`);
    this.stage.innerHTML = "";
    this.stage.appendChild(card);
    card.querySelector("#nx").onclick = () => this.go(next || "cake");
  },

  /* ---------- chrome ---------- */
  renderCandles() {
    const box = document.getElementById("candles");
    box.innerHTML = "";
    for (let i = 0; i < STOPS.length; i++) {
      const c = document.createElement("div");
      c.className = "candle" + (i < this.lit ? " lit" : "");
      box.appendChild(c);
    }
  },

  renderStrip() {
    const strip = document.getElementById("stopstrip");
    strip.innerHTML = "";
    STOPS.forEach((s, i) => {
      const unlocked = i <= this.lit;
      const b = el(`<button ${unlocked ? "" : "disabled"} class="${s.id === this.current ? "on" : ""} ${i < this.lit ? "done" : ""}">
        <span class="dot" style="background:${s.color}"></span>${s.label}</button>`);
      b.onclick = () => unlocked && this.go(s.id);
      strip.appendChild(b);
    });
    document.querySelectorAll("#pillnav button").forEach(b => {
      b.classList.toggle("on",
        (b.dataset.nav === "hero" && this.current === "hero") ||
        (b.dataset.nav === "stops" && this.current !== "hero" && this.current !== "cake") ||
        (b.dataset.nav === "gift" && this.current === "cake"));
    });
  },

  /* ---------- toast ---------- */
  toast(msg, ms = 1900) {
    const t = document.getElementById("toast");
    t.textContent = msg;
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
    if (kind === "pop")   this.tone(660, .09, "square", .1);
    if (kind === "good")  { this.tone(880, .08); this.tone(1320, .1, "square", .1, .07); }
    if (kind === "bad")   this.tone(150, .18, "sawtooth", .08);
    if (kind === "shot")  { this.tone(240, .05, "square", .07); this.tone(90, .09, "sawtooth", .06, .01); }
    if (kind === "hit")   { this.tone(1400, .05, "sine", .1); this.tone(2100, .06, "sine", .08, .04); }
    if (kind === "win")   [523, 659, 784, 1046].forEach((f, i) => this.tone(f, .18, "triangle", .12, i * .09));
  },
  melody() {
    if (this.muted) return;
    const N = { C:261.6, D:293.7, E:329.6, F:349.2, G:392, A:440, C2:523.3 };
    [[N.C,.3],[N.C,.2],[N.D,.5],[N.C,.5],[N.F,.5],[N.E,.9],
     [N.C,.3],[N.C,.2],[N.D,.5],[N.C,.5],[N.G,.5],[N.F,.9]]
      .reduce((t, [f, d]) => { this.tone(f, d * .9, "triangle", .1, t); return t + d; }, 0);
  },

  /* ---------- confetti ---------- */
  burst(n = 90) {
    const cv = document.getElementById("confetti"), ctx = cv.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const colors = ["#E8402A", "#F5C518", "#C8102E", "#D9A521", "#43A94F", "#2C9BE8", "#fff"];
    const bits = Array.from({ length: n }, () => ({
      x: innerWidth / 2 + (Math.random() - .5) * innerWidth * .7,
      y: innerHeight * .3,
      vx: (Math.random() - .5) * 10, vy: -Math.random() * 13 - 4,
      r: Math.random() * 8 + 4, a: Math.random() * 7, va: (Math.random() - .5) * .32,
      c: colors[(Math.random() * colors.length) | 0]
    }));
    cancelAnimationFrame(this._cf);
    const tick = () => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      let alive = 0;
      bits.forEach(b => {
        b.vy += .38; b.x += b.vx; b.y += b.vy; b.a += b.va; b.vx *= .995;
        if (b.y < innerHeight + 40) alive++;
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a);
        ctx.fillStyle = b.c; ctx.fillRect(-b.r / 2, -b.r / 2, b.r, b.r * .62);
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
