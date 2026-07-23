/* Startup: sound, resume, dev shortcuts. Start on the globe. */
(() => {
  document.title = "The Hidden Horizon";

  const btn = document.getElementById("soundBtn");
  btn.onclick = () => {
    Game.muted = !Game.muted;
    btn.textContent = Game.muted ? "🔇" : "🔊";
    if (!Game.muted) { Game.audio(); Game.sfx("good"); }
  };

  // DEV ONLY: ?dev=japan jumps straight to a scene
  const dev = new URLSearchParams(location.search).get("dev");
  if (dev && Game.order.includes(dev)) {
    // unlock everything up to the requested realm for testing
    const i = COUNTRIES.findIndex(c => c.id === dev);
    if (i > 0) COUNTRIES.slice(0, i).forEach(c => Game.done.add(c.id));
    if (dev === "france") COUNTRIES.slice(0, 4).forEach(c => Game.done.add(c.id));
    return Game.go(dev);
  }

  // resume progress
  try {
    const saved = JSON.parse(localStorage.getItem(Game.KEY) || "null");
    if (saved && Array.isArray(saved.done)) {
      saved.done.forEach(id => byId(id) && Game.done.add(id));
    }
  } catch (e) {}

  // returning visitors with progress land on the journey board; first-timers see the globe
  Game.go(Game.lit > 0 && Game.lit < COUNTRIES.length ? "journey" : "globe");

  // DEV ONLY: Shift+N clears the current mission
  addEventListener("keydown", e => {
    if (e.shiftKey && e.key.toLowerCase() === "n" && Game.active) Game.win();
  });
})();
