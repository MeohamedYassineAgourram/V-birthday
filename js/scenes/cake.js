/* Stop 6 — the cake, in 3D. Blow into the mic to put the candles out. */
Game.scenes.cake = (stage) => {
  const card = el(`<section class="panel center enter">
    <div class="head" style="text-align:left">
      <div class="n" style="background:#E86AA0">06</div>
      <div class="t">
        <h2>Make a wish</h2>
        <p id="prompt">Six candles. Blow into your microphone to put them out.</p>
      </div>
    </div>

    <div class="scene" id="cake3d" style="height:min(44vh,400px);margin:0"></div>
    <div id="fallback"></div>

    <div class="meter"><i id="bar"></i></div>
    <div class="row">
      <button class="btn dark" id="mic">🎤 Turn on the microphone</button>
      <button class="btn" id="manual">…or click to blow 💨</button>
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

  /* 3D cake, or a flat fallback if WebGL is unavailable */
  Game._3d = typeof Hero3D !== "undefined" ? Hero3D.create(sceneEl, "cake") : null;
  let fallbackLit = 6;
  if (!Game._3d) {
    sceneEl.style.display = "none";
    card.querySelector("#fallback").innerHTML =
      `<div style="font-size:clamp(48px,13vw,96px);line-height:1.1" id="fbCake">🕯️🕯️🕯️🕯️🕯️🕯️<br>🎂</div>`;
  }

  const litLeft = () => Game._3d ? Game._3d.litCount() : fallbackLit;

  const puff = () => {
    if (finished) return;
    let left;
    if (Game._3d) {
      left = Game._3d.blowOut();
    } else {
      fallbackLit = Math.max(0, fallbackLit - 1);
      left = fallbackLit;
      card.querySelector("#fbCake").innerHTML = "🕯️".repeat(left) + "💨".repeat(6 - left) + "<br>🎂";
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
    Game.lit = STOPS.length;
    Game.renderCandles();
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
        let sum = 0;                                    // low band ≈ breath, not speech
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

  const card = el(`<section class="panel enter" style="max-width:720px">
    <div class="center">
      <div class="win-photo"><img src="img/sq/hero.jpg" alt=""></div>
      <div class="eyebrow">🎉 all six candles out</div>
      <h2 style="margin-bottom:22px">生日快乐, ${CONFIG.name}!</h2>
    </div>
    <div class="letter" id="letter"></div>
    <div class="signoff" id="sig">${CONFIG.letterSignoff}</div>
    <div class="row" style="margin-top:22px">
      <button class="btn dark" id="again">🎉 more confetti</button>
      <button class="btn" id="replay">↺ play again</button>
    </div>
  </section>`);
  stage.innerHTML = "";
  stage.appendChild(card);

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
    Game.lit = 0;
    Game.go("hero");
  };
}
