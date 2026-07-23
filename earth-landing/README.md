# The Hidden Horizon

The unified Next.js application for Viviane's birthday adventure.

The landing page at `/` is an original CSS-painted imaginary world. Its **Begin the
journey** action opens `/journey`, an interactive five-era route that preserves the
original game mechanics while changing the setting to time travel:

1. **Tidebreak Isles** — memory pairs
2. **Sunstone Ruins** — precision beacons
3. **The Singing Dunes** — falling time-shards
4. **The Waterfall Archives** — rune sequencing
5. **The Moonlit Sanctuary** — the birthday finale

## Run

From the repository root:

```bash
./launch.sh
```

Open [http://localhost:3003](http://localhost:3003), and stop it with:

```bash
./close.sh
```

For local development in this directory:

```bash
npm install
npm run dev
```

## Notes

- The landing and era landscapes are CSS-built original artwork; no reference imagery
  is used as a site asset.
- The journey is served from `public/journey/` inside the same Next.js app.
- The project is intended to run only on port `3003`.
