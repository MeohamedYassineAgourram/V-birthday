/* Router, progress, sound, confetti. No dependencies. */

/* The five missions. `pos` is where the waypoint sits in the 3D world. */
const STOPS = [
  { id: "chocobi",  cn: "拾遗", en: "GATHER", color: "#C9A64E", photo: "room",
    pos: [-5.0, 1.0, 2.6], blurb: "Chocobi falls from the sky. Catch it." },
  { id: "memory",   cn: "解谜", en: "PUZZLE", color: "#6E8FA0", photo: "study",
    pos: [5.2, 1.0, 2.2], blurb: "Shiro buried the album. Find the pairs." },
  { id: "valorant", cn: "战斗", en: "BATTLE", color: "#A8503C", photo: "hero",
    pos: [5.4, 1.6, -3.4], blurb: "The range awaits. Flick, don't spray." },
  { id: "debugjs",  cn: "符文", en: "RUNES",  color: "#7E8F6B", photo: "night",
    pos: [-4.6, 2.2, -3.8], blurb: "Four runes, out of order. Restore them." },
  { id: "cake",     cn: "心愿", en: "WISH",   color: "#B5766A", photo: "field",
    pos: [0, 3.4, -1.2], blurb: "The summit. Make a wish." }
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
    this.stage.innerHTML = "";
    this.renderChrome();
    this.scenes[name](this.stage);
    scrollTo({ top: 0, behavior: "smooth" });
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
    const card = el(`<div class="scroll narrow center enter">
      <div class="seal-mark" style="--c:${stop.color}">${stop.cn}</div>
      <div class="rule">◆</div>
      <h2>${stop.en} COMPLETE</h2>
      <p class="lead">${wasNew ? "A seal is yours." : "Cleared again."}
        ${this.lit} of ${STOPS.length} seals recovered.</p>
      ${allDone && !this.done.has(FINALE)
        ? `<p class="lead" style="color:var(--gold)"><b>The summit path has opened.</b></p>` : ""}
      <div class="row" style="margin-top:8px">
        <button class="btn primary" id="back">↩ Return to the map</button>
      </div>
    </div>`);
    this.stage.innerHTML = "";
    this.stage.appendChild(card);
    card.querySelector("#back").onclick = () => this.go("world");
  },

  /* ---------- chrome: seals in the header, emblems in the footer ---------- */
  renderChrome() {
    const seals = document.getElementById("seals");
    if (seals) {
      seals.innerHTML = "";
      STOPS.forEach(s => {
        const d = this.done.has(s.id);
        seals.appendChild(el(
          `<span class="seal ${d ? "on" : ""}" style="--c:${s.color}" title="${s.cn} ${s.en}">${d ? s.cn : "·"}</span>`
        ));
      });
    }
    const strip = document.getElementById("emblems");
    if (strip) {
      strip.innerHTML = "";
      STOPS.forEach(s => {
        const open = this.unlocked(s.id);
        const b = el(`<button class="emblem ${this.done.has(s.id) ? "done" : ""} ${s.id === this.current ? "on" : ""}"
            ${open ? "" : "disabled"} style="--c:${s.color}">
            <b>${s.cn}</b><span>${open ? s.en : "LOCKED"}</span></button>`);
        b.onclick = () => open && this.go(s.id);
        strip.appendChild(b);
      });
    }
    const home = document.getElementById("toWorld");
    if (home) home.classList.toggle("hidden", this.current === "world");
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
