/* ============================================================
   EVERYTHING PERSONAL LIVES HERE.
   Edit this file only — the rest of the game reads from it.
   ============================================================ */
const CONFIG = {

  // --- who ---
  name:        "Viviane",
  chineseName: "",        // optional — shown on the title card. "" hides it.

  // --- the letter at the very end. Each string is its own paragraph. ---
  letter: [
    "Happy Birthday, Viviane!",
    "You crossed five impossible eras, solved every mission, and found your way back through the last gate. I hope this new chapter brings you brilliant ideas, gentle adventures, and lots of reasons to smile.",
    "生日快乐！愿新的一年里，每一天都闪闪发光。"
  ],
  letterSignoff: "— Your co-pilot",

  // --- tuning ---
  chocobiTarget: 12,     // route markers to catch in the desert
  rangeTargets:  15,     // kills needed in The Range
  spikeSeconds:  45,     // countdown on the spike
  defuseSeconds: 7,      // how long defusing takes (half-defuse at the midpoint)
  typeSpeed:     34      // letter typewriter, ms per character
};
