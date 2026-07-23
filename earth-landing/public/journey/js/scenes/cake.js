/* Era 5 — the Floating Sanctuary. Blow out the candles, then the reveal. */
Game.games.cake = (stage, c) => {
  const N = 5;

  const card = el(`<section class="glass center enter">
    <div class="head" style="text-align:left">
        <div class="glyph" style="--c:#8E7BF0">☾</div>
      <div class="t">
        <div class="kicker" style="--c:#8E7BF0">${c ? c.name : "The Floating Sanctuary"} · the final gate</div>
        <h2>You made it through every era</h2>
        <p id="prompt">Five candles for five time seals. Blow into your microphone to put them out.</p>
      </div>
    </div>

    <div class="viewport" id="cake3d" style="height:min(42vh,380px);margin:0;cursor:default"></div>
    <div id="fallback"></div>

    <div class="meter"><i id="bar"></i></div>
    <div class="cta-row">
      <button class="btn solid" id="mic">🎤 Turn on the microphone</button>
      <button class="btn ghost" id="manual">…or click to blow 💨</button>
    </div>
    <p class="muted" style="margin-top:12px">
      Nothing is recorded or sent anywhere — the page only measures how loud it is.
    </p>
  </section>`);
  stage.appendChild(card);

  const sceneEl = card.querySelector("#cake3d");
  const bar = card.querySelector("#bar");
  const prompt = card.querySelector("#prompt");
  let stream = null, raf = null, blowFrames = 0, finished = false;

  Game._3d = typeof Cake3D !== "undefined" ? Cake3D.create(sceneEl, N) : null;
  let fallbackLit = N;
  if (!Game._3d) {
    sceneEl.style.display = "none";
    card.querySelector("#fallback").innerHTML =
      `<div style="font-size:clamp(44px,12vw,88px);line-height:1.2" id="fbCake">${"🕯️".repeat(N)}<br>🎂</div>`;
  }

  const puff = () => {
    if (finished) return;
    let left;
    if (Game._3d) {
      left = Game._3d.blowOut();
    } else {
      fallbackLit = Math.max(0, fallbackLit - 1);
      left = fallbackLit;
      card.querySelector("#fbCake").innerHTML = "🕯️".repeat(left) + "💨".repeat(N - left) + "<br>🎂";
    }
    Game.sfx("pop");
    if (left <= 0) finish();
    else prompt.textContent = `${left} to go… keep going 💨`;
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(raf);
    if (stream) stream.getTracks().forEach(t => t.stop());
    Game.done.add("france");
    Game.save();
    Game.renderChrome();
    Game.melody();
    Game.rain(7);
    setTimeout(() => showLetter(stage), 1000);
  };

  card.querySelector("#manual").onclick = puff;

  card.querySelector("#mic").onclick = async (e) => {
    const btn = e.currentTarget;
    try {
      Game.audio();
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ac = Game.audio();
      const an = ac.createAnalyser();
      an.fftSize = 1024;
      ac.createMediaStreamSource(stream).connect(an);
      const data = new Uint8Array(an.frequencyBinCount);

      btn.disabled = true;
      btn.textContent = "🎤 listening…";
      prompt.textContent = "Now blow! 💨";

      const tick = () => {
        an.getByteFrequencyData(data);
        let sum = 0;                                   // low band ≈ breath, not speech
        for (let i = 2; i < 26; i++) sum += data[i];
        const level = Math.min(1, (sum / 24) / 128);
        bar.style.width = (level * 100) + "%";
        if (level > .42) { blowFrames++; if (blowFrames % 20 === 0) puff(); }
        else blowFrames = 0;
        if (!finished) raf = requestAnimationFrame(tick);
      };
      tick();
    } catch (err) {
      btn.disabled = true;
      btn.textContent = "🎤 mic unavailable";
      Game.toast("No mic? No problem — use the button 💨", 2800);
    }
  };
};

/* ---------- the finale ---------- */
function showLetter(stage) {
  if (Game._3d) { Game._3d.dispose(); Game._3d = null; }

  const card = el(`<section class="glass enter reveal" style="max-width:680px">
    <div class="center">
      <div class="kicker" style="--c:#8E7BF0">and now… the real reason</div>
      <h1 class="reveal-title">Happy Birthday,<br><em>${CONFIG.name}</em> 🎂</h1>
    </div>
    <div class="letter" id="letter"></div>
    <div class="signoff" id="sig">${CONFIG.letterSignoff}</div>
    <div class="cta-row" style="margin-top:22px">
      <button class="btn solid" id="again">More confetti</button>
      <button class="btn ghost" id="replay">Start the journey over</button>
    </div>
  </section>`);
  stage.innerHTML = "";
  stage.appendChild(card);
  Game.rain(9);

  const box = card.querySelector("#letter"), sig = card.querySelector("#sig");
  const text = CONFIG.letter.join("\n\n");
  let i = 0;
  const type = () => {
    box.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(type, CONFIG.typeSpeed);
    else { sig.style.transition = "opacity 1s"; sig.style.opacity = "1"; }
  };
  type();
  box.onclick = () => { i = text.length; box.textContent = text; sig.style.opacity = "1"; };

  card.querySelector("#again").onclick = () => { Game.burst(130); Game.melody(); };
  card.querySelector("#replay").onclick = () => {
    try { localStorage.removeItem(Game.KEY); } catch (e) {}
    Game.done = new Set();
    Game.go("globe");
  };
}
