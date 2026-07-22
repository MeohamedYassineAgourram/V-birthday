/* Startup: brand, sound, nav, resume, dev shortcut. */
(() => {
  document.getElementById("brand").innerHTML =
    `${CONFIG.name.toLowerCase()}<em>.io</em>`;
  document.title = `生日快乐 ${CONFIG.name} 🎂`;

  const btn = document.getElementById("soundBtn");
  btn.onclick = () => {
    Game.muted = !Game.muted;
    btn.textContent = Game.muted ? "🔇" : "🔊";
    if (!Game.muted) { Game.audio(); Game.sfx("good"); }
  };

  document.querySelectorAll("#pillnav button").forEach(b => {
    b.onclick = () => {
      const nav = b.dataset.nav;
      if (nav === "hero") return Game.go("hero");
      if (nav === "stops") return Game.go(STOPS[Math.min(Game.lit, STOPS.length - 1)].id);
      if (nav === "gift") {
        if (Game.lit >= STOPS.length - 1) Game.go("cake");
        else Game.toast(`${STOPS.length - 1 - Game.lit} stops to go before the gift 🎁`, 2400);
      }
    };
  });

  // DEV ONLY: ?dev=valorant jumps straight to a stop, for testing
  const dev = new URLSearchParams(location.search).get("dev");
  if (dev && Game.order.includes(dev)) {
    Game.lit = Math.max(0, Game.order.indexOf(dev) - 1);
    return Game.go(dev);
  }

  // resume where she left off
  let start = "hero";
  try {
    const saved = JSON.parse(localStorage.getItem(Game.KEY) || "null");
    if (saved && Game.order.includes(saved.scene)) {
      Game.lit = Math.min(saved.lit || 0, STOPS.length);
      if (saved.scene !== "hero") {
        start = saved.scene;
        setTimeout(() => Game.toast("picking up where you left off ✨", 2400), 900);
      }
    }
  } catch (e) {}

  if (start === "hero") setTimeout(() => Game.toast("tip: turn the sound on 🔊", 3000), 2000);

  Game.go(start);

  // DEV ONLY (for you): Shift+N skips ahead
  addEventListener("keydown", e => {
    if (e.shiftKey && e.key.toLowerCase() === "n") {
      const i = Game.order.indexOf(Game.current);
      Game.lit = Math.max(Game.lit, i);
      Game.go(Game.order[Math.min(i + 1, Game.order.length - 1)]);
    }
  });
})();
