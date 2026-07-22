# 生日快乐 🎂

A six-stop birthday quest, Shin-chan themed, built for one person.

## Run it

```bash
python3 -m http.server 8777    # then open http://localhost:8777
```

Opening `index.html` directly works too — everything is classic scripts, no modules, no build step.

## The six stops

| # | Stop | What it is |
|---|---|---|
| 01 | **Chocobi Rain** | Catch falling biscuits, dodge green peppers (canvas) |
| 02 | **Shiro's Lost Photos** | Six-pair memory game built from her photos |
| 03 | **The Range** | Valorant flick trainer — headshots on the top third, kills/accuracy/streak HUD, ends on ACE |
| 04 | **debug.js** | Reorder four lines so the program prints 生日快乐 |
| 05 | **Defuse the Spike** | Valorant spike defuse — hold SPACE, half-defuse checkpoint at the midpoint |
| 06 | **Make a Wish** | 3D cake, blow into the mic to put out six candles, then the letter |

## Fill in the personal bits

Everything personal is in **`js/config.js`** — nothing else contains her name.

- `name`, `chineseName` — headline, brand mark, page title, the `debug.js` output
- `letter[]`, `letterSignoff` — the typed-out letter at the end
- `chocobiTarget`, `rangeTargets`, `spikeSeconds`, `defuseSeconds` — difficulty

## Design notes

- **No fail states anywhere.** No lives, no game over. Green peppers cost one Chocobi (floored at zero), missed shots only cost accuracy, mismatched cards cost nothing, and when the spike timer runs out it just resets the clock — the half-defuse survives. Worst case she takes longer.
- **`debug.js` runs a real mini-interpreter.** Every one of the 24 orderings produces the actual error or output it would produce; exactly one wins.
- **3D** is `three.js` r149 (MIT), vendored in `vendor/` so it works offline. Falls back to a CSS card stack if WebGL is missing.
- **Sound** is synthesized via Web Audio — no audio files. Starts muted.
- **Mic** only measures loudness in the low-frequency band. Nothing is recorded or sent, and there's always a click-to-blow button if permission is denied.
- **Progress** saves to `localStorage`.

## Dev shortcuts

- `?dev=spike` (or any stop id) jumps straight to a stop
- `Shift+N` skips to the next stop

## Images

`docs/images/` holds the originals; `img/` holds the web versions — full size (max 900px wide)
plus face-focused 520×520 crops in `img/sq/` used for the 3D card textures, memory tiles,
range targets and win-screen portraits.
