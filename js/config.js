/* ============================================================
   EVERYTHING PERSONAL LIVES HERE.
   Edit this file only — the rest of the game reads from it.
   ============================================================ */
const CONFIG = {

  // --- who ---
  name:        "Vivian",
  chineseName: "",        // optional — shown on the title card. "" hides it.

  // --- the letter at the very end. Each string is its own paragraph. ---
  letter: [
    "Happy Birthday, Vivian!",
    "生日快乐！"
  ],
  letterSignoff: "— ___YOUR_NAME___",   // <- the only thing left to fill in

  // --- tuning ---
  chocobiTarget: 12,     // Chocobi to catch in stop 1
  rangeTargets:  15,     // kills needed in The Range
  spikeSeconds:  45,     // countdown on the spike
  defuseSeconds: 7,      // how long defusing takes (half-defuse at the midpoint)
  typeSpeed:     34      // letter typewriter, ms per character
};
