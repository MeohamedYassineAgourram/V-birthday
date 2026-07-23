# Viviane's Route

This repository now has one runnable application: the unified Next.js project in
[`earth-landing`](./earth-landing).

## Run

```bash
./launch.sh
```

Open [http://localhost:3003](http://localhost:3003).

Close the running app with:

```bash
./close.sh
```

The CSS-painted imaginary-world landing is served at `/`. Its **Begin the journey**
action opens the complete five-era birthday game at `/journey` in the same application.

## Structure

```
earth-landing/
  app/                 Next.js landing and /journey route
  app/                 Imaginary-world landing and /journey route
  public/journey/      Five interactive time-realm missions and their assets
```

The old root-level static files are retained as source material only; do not run them
separately. The supported project and port are `earth-landing` on `3003`.
