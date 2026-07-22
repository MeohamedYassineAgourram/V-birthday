/* Startup: sound, map button, resume, dev shortcut. */
(() => {
  document.title = `奇幻旅程 · ${CONFIG.name}'s Journey`;

  const btn = document.getElementById("soundBtn");
  btn.onclick = () => {
    Game.muted = !Game.muted;
    btn.textContent = Game.muted ? "🔇" : "🔊";
    if (!Game.muted) { Game.audio(); Game.sfx("good"); }
  };

  document.getElementById("toWorld").onclick = () => Game.go("world");

  // DEV ONLY: ?dev=valorant jumps straight to a mission
  const dev = new URLSearchParams(location.search).get("dev");
  if (dev && Game.order.includes(dev)) {
    if (dev === "cake") STOPS.forEach(s => s.id !== "cake" && Game.done.add(s.id));
    return Game.go(dev);
  }

  // resume where she left off
  try {
    const saved = JSON.parse(localStorage.getItem(Game.KEY) || "null");
    if (saved && Array.isArray(saved.done)) {
      saved.done.forEach(id => STOPS.some(s => s.id === id) && Game.done.add(id));
      if (Game.lit) setTimeout(() => Game.toast(`${Game.lit} of ${STOPS.length} seals recovered ✦`, 2600), 900);
    }
  } catch (e) {}

  if (!Game.lit) setTimeout(() => Game.toast("tip: turn the sound on 🔊", 3000), 2200);

  Game.go("world");

  // DEV ONLY: Shift+N clears the current mission
  addEventListener("keydown", e => {
    if (e.shiftKey && e.key.toLowerCase() === "n" && Game.current !== "world") {
      Game.win(Game.current);
    }
  });
})();
