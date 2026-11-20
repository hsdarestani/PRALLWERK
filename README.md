# PRALLWERK

A 72-stage, twelve-chapter physics arcade campaign starting in the Old Workshop. Drag to aim a five-orb volley. Hit conductors to send energy down connected cables and break the core before the machines breach the line.

[Deutsch](https://prallwerk.smarbiz.sbs/?lang=de) · [English](https://prallwerk.smarbiz.sbs/?lang=en)

## Play

Release the pointer to fire. With the keyboard, aim with Left/Right and fire with Space or Enter. Escape pauses. The fire button switches between normal and triple speed while a volley is in flight. The dotted guide simulates the lead orb through up to two collisions. The other four orbs follow at intervals and can encounter a changed board.

Each victory unlocks the next stage. The chapter selector previews six boards at a time. Shielded cores require clearing the specified number of conductors, armor plates, capsules or crystals. Each board has an attainable mastery target. Records, unlocked stages, audio, volume, effects, contrast and language persist in this browser. Refresh starts a new attempt. Switching languages keeps the current shot running. German is the initial language unless a supported query or saved preference selects English.

## Development

Use Node 24 or newer. The shipping game has zero package dependencies.

```sh
npm run dev
npm run check
```

The development server listens on port 3000. The test command builds the deployable Worker and runs the Node test suite. It uses Node's TypeScript syntax erasure. The browser workflow runs Chromium through Python Playwright and captures comparisons with the pinned baseline.

## Code and artwork

- `src/engine.ts` handles deterministic 120 Hz physics, scoring and event emission. Level IDs, connection graphs and hit points live in `src/levels.ts`.
- `src/trajectory.ts` simulates an isolated copy of a volley for aiming. `src/render.ts` draws the arena, cables, orbs and effects. `src/audio.ts` synthesizes audio on demand.
- `src/app.ts` binds input, UI, dialogs and progression. `src/locale.ts` and `src/save.ts` own bilingual copy and compatible local saves.
- `scripts/workshop-art.py` is the Blender source for the original workshop sculpture. The game ships its optimized WebP render. Canvas geometry, icons and sounds are original.
- `scripts/build.mjs` bundles the static game and Worker. `wrangler.jsonc` identifies the preview. `GET /api/health` reports its release version and stage count.

## Verification and scope

[Browser workflow](.github/workflows/browser.yml) · [Original baseline QA](docs/QA.md) · [Milestone status](docs/ROADMAP.md) · [Product brief](docs/PRODUCT_BRIEF.md)

The gameplay-evidence workflow artifact contains before/after screenshots, both languages and frame samples from the CI runner. Physical iPhone and Android performance and first-time player enjoyment still need external playtesting. The public preview provides 72 free stages with local records. Paid content and online challenges are later milestones.

## Campaign content

Two tutorial boards preserve the original trajectories and scores. Each of the following 70 boards has its own fixed layout. Charges explode after 42 ticks, pivot mirrors rotate between volleys, and valves admit orbs in one direction. Four chapter finales have two phases. After every second surviving volley from stage 3 onward, choose a rune for the next two volleys. The choice is part of the deterministic replay.

Stage links with `?practice=36` start unranked play on a specified board. Practice victories leave campaign progress and medals untouched. A normal campaign victory records the score locally.

[Chapter guide, finale rules and save migration](docs/ADVENTURE.md)
