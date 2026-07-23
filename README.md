# The Challenge — a journey around the world

An elegant, Apple/Vision-Pro-style birthday surprise. It never mentions the birthday
until the very end — that's the reward.

## The flow

1. **The globe** — a dark starfield, a slowly turning 3D Earth, one question:
   *"Do you accept the challenge?"* One button. The only way is forward.
2. **The journey board** — a glassmorphic deck of five country cards (a filmstrip below).
   Clear them in order; each unlocks the next.
3. **Five missions, five countries** — a cinematic zoom-wipe flies you into each one, played
   over that country's photography:
   | Stop | Country | Mission |
   |---|---|---|
   | 1 | 🇯🇵 Japan · Mt. Fuji | Memory match |
   | 2 | 🇰🇷 South Korea · Seoul | Valorant-style flick range |
   | 3 | 🇲🇦 Morocco · the Sahara | Catch the falling stars |
   | 4 | 🇨🇳 China · Shanghai | Restore the scrambled runes |
   | 5 | 🇫🇷 France · Paris | The finale |
4. **Paris** — blow out five candles (one per country) into the mic, and the real reason
   is finally revealed: **Happy Birthday**, with the letter.

## Run it

```bash
python3 -m http.server 8777   # open http://localhost:8777
```

Classic scripts loaded via an ES-module bootstrap (three.js + GLTFLoader are modules);
no build step.

## Fill in the personal bits

Everything personal is in **`js/config.js`** — `name`, the `letter[]`, and `letterSignoff`
(the one placeholder left: `— ___YOUR_NAME___`).

## Notes

- **No fail states.** Every mission can only be completed, faster or slower.
- **3D** is three.js r149 (MIT, vendored). The Earth is an optimized glTF (22 MB → 0.5 MB;
  its spec/gloss material is converted to metallic-roughness at build time so three renders
  the texture). The cake is procedural.
- **Sound** is synthesized (Web Audio, no files). **Mic** only measures loudness locally.
- **Progress** saves to `localStorage`; returning mid-journey lands on the board.
- `?dev=korea` (or any country/`journey`/`globe`) jumps straight in and unlocks up to there.
  `Shift+N` clears the current mission.

## Layout

```
index.html            shell: starfield, per-country backdrop, warp overlay, chrome
styles.css            the dark elegant design system
js/config.js          ← the only file with anything personal
js/core.js            COUNTRIES model, router, travel-transition, sound, confetti
js/globe3d.js         the landing Earth
js/cake3d.js          the finale cake
js/scenes/globe.js    "accept the challenge"
js/scenes/journey.js  the country-card deck
js/scenes/*.js        one minigame per country
models/earth.glb      optimized globe
img/loc/              country backdrops + card portraits
img/sq/               Shin-chan crops (memory tiles, range targets)
```
