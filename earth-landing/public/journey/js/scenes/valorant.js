/* Stop 2 — Seoul tactical range.
   An original first-person training interface with arcade shooting mechanics. */
Game.games.valorant = (stage, c) => {
  const TARGET = CONFIG.rangeTargets || 15;
  const TINT = (c && c.tint) || "#7FA8C4";

  const wrap = el(`<section class="range-mission enter" style="--range-tint:${TINT}">
    <div class="range-screen" id="range" aria-label="Seoul tactical training range">
      <div class="range-backdrop" style="background-image:url('img/loc/korea.jpg')"></div>
      <div class="range-scanlines" aria-hidden="true"></div>
      <div class="range-vignette" aria-hidden="true"></div>

      <header class="range-topbar" aria-label="Training match status">
        <div class="range-map" aria-hidden="true"><i></i><b>A</b><span></span></div>
        <div class="range-squad" aria-label="Squad online">
          <span class="squad-unit active">V</span><span class="squad-unit">K</span><span class="squad-unit">M</span><span class="squad-unit">C</span><span class="squad-unit">F</span>
        </div>
        <div class="range-score"><b id="kills">0</b><span>—</span><strong id="clock">0:00</strong><span>—</span><b>${TARGET}</b></div>
        <div class="range-feed" id="feed" aria-live="polite"><p><b>VIVIANE</b><i></i><span>TRAINING BOT</span></p></div>
      </header>

      <div class="range-site-label"><span>SEOUL TRAINING SITE</span><strong>PRECISION PROTOCOL</strong></div>
      <div class="range-horizon" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="range-floor" aria-hidden="true"></div>
      <div class="range-crosshair" id="crosshair" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <div class="range-hit" id="hitNotice" aria-live="polite"></div>

      <div class="range-rifle" aria-hidden="true"><i class="rifle-stock"></i><i class="rifle-body"></i><i class="rifle-barrel"></i><i class="rifle-sight"></i></div>

      <footer class="range-bottom-hud">
        <div class="range-vitals"><span class="shield">◇</span><b>100</b><small>health</small></div>
        <div class="range-ability" aria-label="Training kit">
          <i></i><i></i><i class="ready"></i><i></i>
        </div>
        <div class="range-accuracy"><span>accuracy</span><b id="acc">100%</b><span>headshots</span><b id="hs">0</b></div>
        <div class="range-ammo"><b id="ammo">24</b><span>/ 72</span><small>calibration rounds</small></div>
      </footer>
    </div>
    <p class="range-instruction">Hit the training drones. The upper zone counts as a precision hit.</p>
  </section>`);
  stage.appendChild(wrap);

  const range = wrap.querySelector("#range");
  const $ = id => wrap.querySelector("#" + id);
  const feed = $("feed");
  const hitNotice = $("hitNotice");
  let kills = 0;
  let shots = 0;
  let heads = 0;
  let ammo = 24;
  let done = false;
  let live = null;
  let timer = null;
  const startedAt = Date.now();

  const updateHud = () => {
    $("kills").textContent = kills;
    $("acc").textContent = shots ? Math.round(kills / shots * 100) + "%" : "100%";
    $("hs").textContent = heads;
    $("ammo").textContent = ammo;
  };

  const updateClock = () => {
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    $("clock").textContent = `0:${String(Math.min(elapsed, 99)).padStart(2, "0")}`;
  };

  const fireRound = () => {
    ammo = ammo <= 1 ? 24 : ammo - 1;
    range.classList.remove("is-firing");
    void range.offsetWidth;
    range.classList.add("is-firing");
    updateHud();
  };

  const addFeed = head => {
    const line = el(`<p class="new"><b>VIVIANE</b><i class="${head ? "precision" : ""}"></i><span>${head ? "PRECISION DRONE" : "TRAINING BOT"}</span></p>`);
    feed.prepend(line);
    while (feed.children.length > 3) feed.lastElementChild.remove();
    setTimeout(() => line.classList.remove("new"), 520);
  };

  const announceHit = (text, head) => {
    hitNotice.textContent = text;
    hitNotice.className = `range-hit show ${head ? "precision" : ""}`;
    clearTimeout(announceHit.timeout);
    announceHit.timeout = setTimeout(() => { hitNotice.className = "range-hit"; }, 520);
  };

  const spawn = () => {
    if (done) return;
    clearTimeout(timer);
    if (live) live.remove();

    const x = 12 + Math.random() * 76;
    const y = 29 + Math.random() * 44;
    const size = 54 + Math.random() * 26;
    const target = el(`<button class="range-target" type="button" aria-label="Training drone" style="left:${x}%;top:${y}%;--size:${size}px">
      <i class="drone-head"></i><i class="drone-core"></i><i class="drone-body"></i>
    </button>`);

    target.onpointerdown = event => {
      event.preventDefault();
      event.stopPropagation();
      if (done || target.classList.contains("hit")) return;

      const rect = target.getBoundingClientRect();
      const head = event.clientY - rect.top < rect.height * 0.3;
      shots += 1;
      kills += 1;
      if (head) heads += 1;
      fireRound();
      target.classList.add("hit");
      Game.sfx(head ? "hit" : "shot");
      announceHit(head ? "PRECISION" : "ELIMINATED", head);
      addFeed(head);

      if (kills >= TARGET) return finish();
      setTimeout(spawn, 170);
    };

    range.appendChild(target);
    live = target;
    timer = setTimeout(spawn, 1750);
  };

  range.onpointermove = event => {
    const rect = range.getBoundingClientRect();
    range.style.setProperty("--aim-x", `${event.clientX - rect.left}px`);
    range.style.setProperty("--aim-y", `${event.clientY - rect.top}px`);
  };
  range.onpointerleave = () => range.classList.remove("aiming");
  range.onpointerenter = () => range.classList.add("aiming");
  range.onpointerdown = () => {
    if (done) return;
    shots += 1;
    fireRound();
    Game.sfx("shot");
  };

  const finish = () => {
    done = true;
    clearTimeout(timer);
    clearInterval(clock);
    if (live) live.remove();
    const accuracy = shots ? Math.round(kills / shots * 100) : 100;
    range.appendChild(el(`<div class="range-ace"><span>RANGE</span> CLEARED</div>`));
    Game.burst(80);
    setTimeout(() => {
      Game.toast(`${accuracy}% accuracy · ${heads} precision hits`, 2600);
      Game.win();
    }, 1350);
  };

  const observer = new MutationObserver(() => {
    if (!wrap.isConnected) {
      clearTimeout(timer);
      clearInterval(clock);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  const clock = setInterval(updateClock, 1000);
  updateHud();
  updateClock();
  spawn();
};
