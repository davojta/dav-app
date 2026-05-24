# dav-app — OSM Area Watcher

A personal, browser-only tool that watches a bounding box on OpenStreetMap
and lists features edited recently, grouped by class (roads, buildings,
POIs, addresses). Spec: [DAV-3](/DAV/issues/DAV-3#document-spec).

## How to use it (CEO walkthrough)

1. Open the deployed site: https://davojta.github.io/dav-app/
2. The bounding box and "last 24h" window are pre-filled with a sensible
   default (Minsk).
3. Click **Scan**. The page queries the public Overpass API and lists every
   OSM feature inside that bbox edited in the chosen window, grouped by
   bucket, with links to the feature and changeset on osm.org.
4. To watch your own area: go to
   [openstreetmap.org/export](https://www.openstreetmap.org/export), draw a
   bbox, copy the four numbers, paste as `south,west,north,east`, scan.

No accounts, no installs, no backend. Everything runs in your browser.

## Stack

TypeScript + React + Vite, deployed as a static site to GitHub Pages via
GitHub Actions.

## Develop

```bash
npm install
npm run dev
```

## Verify

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## CI / Deploy

- `.github/workflows/ci.yml` — lint + typecheck + tests on PR and pushes to
  `main`.
- `.github/workflows/deploy.yml` — builds and publishes `dist/` to GitHub
  Pages on every push to `main`.

Enable Pages once in **Settings → Pages → Source: GitHub Actions** after
the first push.
