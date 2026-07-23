# Earth — Cinematic Landing

A premium, fullscreen (`100dvh`) space landing page inspired by high-end sustainability
sites (Leonardo DiCaprio Foundation style). Original implementation, using my own Earth model.

**Stack:** Next.js (App Router) · React Three Fiber · @react-three/drei ·
@react-three/postprocessing · GSAP · Tailwind CSS.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
# or: npm run build && npm run start
```

Drop your Earth model at `public/models/earth.glb` and a cinematic still at
`public/img/thumb.jpg` (both already included).

## What's on the page

- **Deep-space background** — thousands of stars (`drei <Stars>`), fog, and a faint
  procedural nebula (an inward-facing sphere shader — no flat image).
- **A very large Earth** on the right, extending off-screen with South America centered,
  realistic lighting, a Fresnel **atmosphere** shell (blue edge glow), soft **bloom**,
  slow rotation, and smooth **inertial** mouse parallax.
- **Glowing UI markers** pinned over the Amazon — pulsing rings with a center dot, that
  enlarge on hover and occlude behind the globe.
- **A floating dark-glass card** on the left — thumbnail, `CASE 35`, title, description,
  and a `WATCH VIDEO` button. Slides in from the left with GSAP.

No navigation, no timeline, no footer — exactly one viewport.

## Structure

```
app/
  layout.jsx        metadata + globals
  page.jsx          composition: <Scene/> (ssr:false) + <ContentCard/> + vignette
  globals.css       resets, marker + entrance keyframes, Tailwind
components/
  Scene.jsx         the R3F <Canvas>, camera, Suspense, responsive earth offset
  Lighting.jsx      key + front fill + cool blue rim + ambient/hemisphere
  Starfield.jsx     drei <Stars> + procedural nebula shader
  Earth.jsx         loads /models/earth.glb, memoized, normalized, publishes mesh ref
  Atmosphere.jsx    two additive Fresnel shells (outer halo + inner rim)
  Markers.jsx       drei <Html> markers on the sphere, occluded by the Earth
  Parallax.jsx      offset + spin group; inertial mouse rotation + camera parallax
  Effects.jsx       EffectComposer: Bloom + Vignette
  ContentCard.jsx   the glass panel; GSAP slide-in + subtle pointer parallax
  earth-context.js  shares the Earth mesh ref with the markers
```

## Performance

- `dynamic(..., { ssr:false })` for the WebGL scene; `<Suspense>` + `useGLTF.preload`.
- Memoized geometries/materials; a single `useFrame` render loop; `dpr={[1,2]}` +
  `<AdaptiveDpr>`; the Earth model is an optimized glTF (~0.5 MB).
- Marker entrance and pulse are pure CSS (deterministic, independent of load timing);
  GSAP drives the card entrance.

## Responsive

- **Desktop** — Earth dominates the right; card floats left at ~8%.
- **Tablet** — Earth scales down; card overlaps the limb.
- **Mobile** — Earth shifts upward and fills the frame; the card overlays, centered-low.
