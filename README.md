# dav-app

Hobby app bootstrap. Stack: **TypeScript + React + Vite**, deployed as a static site to **GitHub Pages**, CI via **GitHub Actions**. Chosen for the lowest-friction path to a reachable hello-world: no cloud account, no runtime credentials, free, and easy to swap or extend later (server-side work can be added as a separate package or moved to AWS/Cloudflare when the app needs it).

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

- `.github/workflows/ci.yml` — lint + typecheck + tests on PR and pushes to `main`.
- `.github/workflows/deploy.yml` — builds and publishes `dist/` to GitHub Pages on every push to `main`.

Enable Pages once in **Settings → Pages → Source: GitHub Actions** after the first push.
