# PRALLWERK

Original German-language arcade physics game. **Slice 1: playable proof**, not the full commercial product.

**Play:** https://prallwerk.smarbiz.sbs/  
**Cloudflare fallback:** https://prallwerk-preview.hsdf7rb.workers.dev/

Two genuinely playable, handcrafted levels: **Erstes Leuchten** and **Über Bande**. Five-orb volleys, wall and mirror ricochets, delayed conductor chains, armor damage, finite wave limits, advancing hazards, shields, win/loss, score breakdown, restart, chapter selection, local unlocks/best scores, optional synthesized audio, pause, reduced effects and contrast controls.

No shop, payments, leaderboard, fake players, external art, analytics, or runtime AI. The page is explicitly marked as a non-indexed preview.

## Run locally

Requires Node.js 24 or later. No package installation or external dependencies are needed.

```sh
npm run dev
# http://localhost:3000
npm run check
```

Drag anywhere in the arena to aim; release to launch. Desktop: Left/Right aim, Space/Enter fire, Escape pauses. The large fire button is an alternative to dragging. Completing Level 01 unlocks Level 02. Saves persist **completed levels, best scores and settings** in this browser; an interrupted volley restarts on refresh.

## Architecture

- `src/engine.ts`: deterministic pure TypeScript simulation, fixed 120 Hz step; no DOM, random values or clocks. Rounded angle input logs support deterministic replay. This is not yet server-side score verification.
- `src/levels.ts`: two versioned handcrafted level definitions, tiles and explicit circuit connections.
- `src/app.ts`: original Canvas 2D renderer, pointer/keyboard controls, German UI, local save, Web Audio and settings.
- `public/`: original UI, stylesheet and vector identity. The QA iframe is local-only and absent from the deployed Worker asset allowlist.
- `scripts/build.mjs`: Node's built-in TypeScript erasure; produces static browser modules and a self-contained Cloudflare Worker at `dist/server/index.js`. This performs syntax transformation, not static TypeScript type checking.
- `wrangler.jsonc`: reproducible Cloudflare deployment configuration. No runtime secrets or database bindings are required for this slice.

Canvas 2D replaces the suggested React/Phaser stack for this compact proof: it keeps simulation completely separate, removes framework startup/download overhead, and gives full control over the original vector art. The small Worker serves the six static assets with explicit content types, a restrictive CSP and noindex headers. Nothing is embedded from third-party gaming sites.

## Deploy

```sh
npm run check
npx wrangler deploy
```

Use an already-authorized Cloudflare account with Workers access and the `smarbiz.sbs` zone for the configured custom domain. This does not set up recurring deployment or create paid resources. CI runs build/tests only; it does not contain deployment credentials.

`GET /api/health` reports the preview version and truthful level count. Other API routes do not exist in this slice. In particular, checkout and leaderboard routes return 404 rather than simulated success.

## Evidence and next steps

See [QA results](docs/QA.md), [unfinished milestones](docs/ROADMAP.md), and the [supplied product brief](docs/PRODUCT_BRIEF.md). Native iPhone Safari/Android Chrome and midrange-device performance remain unverified. This is not a production-ready or commercially cleared release.
