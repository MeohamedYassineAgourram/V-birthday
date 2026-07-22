# 奇幻旅程 · Fantasy Journey

A birthday gift: an explorable 3D island with five missions, in the style of an
illustrated indie-game poster.

## Run it

```bash
python3 -m http.server 8777    # then open http://localhost:8777
```

Opening `index.html` directly works too — classic scripts, no modules, no build step.

## The world

The hub is a real 3D diorama (three.js): a floating terraced island with a summit,
a windmill, a castle, a caped traveller and a black cat. You **drag to orbit** it.
Five waypoints glow on the terrain; each has a wooden signpost anchored to it in HTML,
tracked to its 3D position every frame.

| 印 | Mission | What it is |
|---|---|---|
| 拾遗 | **GATHER** | Catch falling Chocobi, dodge green peppers (canvas) |
| 解谜 | **PUZZLE** | Six-pair memory game built from her photos |
| 战斗 | **BATTLE** | Valorant flick range — headshots on the top third, ends on ACE |
| 符文 | **RUNES** | Reorder four lines so the incantation runs |
| 心愿 | **WISH** | The summit: a 3D cake blown out by microphone, then the letter |

The four trials can be done **in any order**. The summit stays sealed until all four
seals are recovered.

## Fill in the personal bits

Everything personal is in **`js/config.js`** — nothing else contains her name.

- `name`, `chineseName` — title card, page title, the RUNES output
- `letter[]`, `letterSignoff` — the letter at the end
- `chocobiTarget`, `rangeTargets` — difficulty

## Design notes

- **No fail states anywhere.** No lives, no game over, no timers that punish. Green
  peppers cost one Chocobi (floored at zero), missed shots only cost accuracy,
  mismatched cards cost nothing. Worst case she takes longer.
- **RUNES runs a real mini-interpreter.** All 24 orderings produce the actual error or
  output they would produce; exactly one wins.
- **3D** is three.js r149 (MIT), vendored in `vendor/` so it works offline. Both the
  world and the cake fall back gracefully if WebGL is missing.
- Props are placed with `surfaceY()` against the island's domed cap — the ground is a
  curved surface, so anything placed at a flat height sinks into the terrain.
- **Sound** is synthesized via Web Audio — no audio files. Starts muted.
- **Mic** only measures loudness in the low-frequency band. Nothing is recorded or
  sent, and there's always a click-to-blow button if permission is denied.
- **Progress** saves to `localStorage` as a set of completed missions.

## Dev shortcuts

- `?dev=valorant` (or any mission id) jumps straight in
- `Shift+N` clears the current mission

## Files

```
index.html          the parchment shell: frame, seals, emblem footer
styles.css          the whole design system
js/config.js        ← the only file with anything personal in it
js/core.js          missions, router, progress, sound, confetti
js/world3d.js       the 3D island, waypoints, projection callbacks
js/cake3d.js        the summit cake
js/scenes/*.js      one file per mission
img/                web-sized art + face-focused square crops
docs/images/        the original images
```
