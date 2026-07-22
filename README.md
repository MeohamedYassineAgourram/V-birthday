# Vivian's Journey

A birthday gift: a low-poly island floating in an open sky, with five missions.
Each mission opens into its own world with its own colour, light and weather.

## Run it

```bash
python3 -m http.server 8777    # then open http://localhost:8777
```

Opening `index.html` directly works too — classic scripts, no modules, no build step.

## The world

The landing page *is* the map: a detailed glTF floating island (a house with a blue roof,
a waterfall, pines, drifting rock debris) turning slowly in a warm sunset sky. You **drag
to orbit** it. Five waypoints glow on the island; each has a signpost anchored to it in
HTML, tracked to its 3D position every frame.

The model ships at `models/island.glb` (~15 MB). The original was 163 MB — see *The model*
below.

Clicking a waypoint drops you into that mission's own world. Every world has its own sky,
type colour, surface tint and weather, all driven off `[data-world]` on `<body>`:

| World | Sky | Weather |
|---|---|---|
| Map | warm sunset | drifting clouds + sun bloom |
| GATHER | bright afternoon | drifting clouds |
| PUZZLE | lilac dusk | falling petals |
| BATTLE | deep night | starfield |
| RUNES | dark green | rising embers |
| WISH | golden hour | light rays |

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
- Signpost labels are laid out as a set each frame, not independently: the summit sits at
  the island's centre, so anything directly behind it projects to nearly the same point
  and the labels collide unless they're resolved together.
- **Sound** is synthesized via Web Audio — no audio files. Starts muted.
- **Mic** only measures loudness in the low-frequency band. Nothing is recorded or
  sent, and there's always a click-to-blow button if permission is denied.
- **Progress** saves to `localStorage` as a set of completed missions.

## Dev shortcuts

- `?dev=valorant` (or any mission id) jumps straight in
- `Shift+N` clears the current mission

## The model

`models/island.glb` is an optimized copy of a 163 MB Sketchfab model. The pipeline
(scratch, not committed) that produced it:

1. drop tangents (no normal maps survive the downscale) — ~10 MB
2. dedup + weld + prune
3. **simplify** to ~45% of triangles (712k → 365k) — visually identical
4. **compress** all 76 textures to 512px WebP (122 MB → ~3 MB)
5. **quantize** positions/normals/uvs — decoded natively by three.js, no worker

Result: 163 MB → 15 MB, loads in ~1s. Quantize (not Draco) on purpose — Draco needs a
Web Worker + WASM decoder that hung silently in testing; quantization decodes on the main
thread with zero extra dependencies. The 163 MB source is gitignored.

three.js and the loaders are ES modules now, loaded via an import map; a small bootstrap
in `index.html` exposes `THREE` and `GLTFLoader` as globals, then loads the rest of the
app (classic scripts) in order.

## Files

```
index.html          the shell: sky layer, floating chrome
styles.css          the whole design system
js/config.js        ← the only file with anything personal in it
js/core.js          missions, router, progress, sound, confetti
js/world3d.js       loads island.glb, waypoints, projection callbacks
vendor/             three.module.js, GLTFLoader, BufferGeometryUtils (ESM)
models/island.glb   the optimized 3D island
js/cake3d.js        the summit cake
js/scenes/*.js      one file per mission
img/sq/             face-focused square crops (memory tiles, range targets, portraits)
docs/images/        the original images
```
