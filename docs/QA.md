# PRALLWERK Slice 1 QA — 19 November 2026

Status: **playable proof verified**, not full-product acceptance.

## Content and deployment

- Exactly **2 free playable stages, 0 paid stages, 0 bosses**, 0 rune choices.
- Public Cloudflare Worker: `prallwerk-preview`.
- Custom domain: https://prallwerk.smarbiz.sbs/ — opened successfully in Chromium and played.
- Fallback: https://prallwerk-preview.hsdf7rb.workers.dev/ — routing enabled; custom domain was the browser-verified route.
- Final Worker deployment ID: `0a50566ce962435fb20fc7d3b9561841`.
- All visual assets are original Canvas/SVG/CSS geometry. Sound is synthesized with Web Audio.
- No runtime environment variables, payment credentials, D1 bindings or database migrations for this slice.

## Automated checks

`npm run check` builds the exact deployable Worker and runs **18 passing tests**:

1. Level 01 winnable in two central volleys, 1,700 points.
2. Level 02 winnable in three 0.9-radian volleys, with mirror interactions, conductor pulses and 2,150 points.
3. Identical input logs produce identical simulation and score.
4. Rendering-event drainage cannot change simulation outcomes.
5. Tutorial chain starts within one simulated second of the first centered shot.
6. Pulses follow impact by 12 simulation ticks and propagate visibly in order.
7. Wave-limit defeat and fresh-state restart.
8. Hazard breach removes shield and clears the hazard.
9. Mirror reflection changes direction and conserves orb speed.
10. Armor requires two hits, with an intermediate damaged state.
11. A deliberately horizontal trapped volley ends safely at the hard cap.
12. Non-finite inputs and duplicate fire rejected.
13. Level definitions remain immutable through replay.
14. A sweep of 51 angles on each of two stages terminates without non-finite coordinates or out-of-bounds x positions.
15. Worker serves all six real assets with correct MIME types.
16. Health endpoint truthfully reports two preview stages.
17. Unimplemented checkout, leaderboard, QA and missing routes return 404; unsupported writes return 405.
18. Content security, noindex, anti-sniffing, anti-framing and HEAD behavior.

No third-party libraries are needed. The build strips TypeScript syntax; a static typecheck is not yet configured.

## Browser gameplay and UI

Test browser: Chromium in the provided browser environment.

- Landing play button starts a real controllable run.
- Mouse drag/release fires a five-orb volley and creates a visible five-machine tutorial chain.
- Keyboard Left/Right and Space fire working bank shots.
- **Both stages completed end-to-end through the UI:** Level 01, 1,700 points; Level 02, 2,150 points. Result breakdown matches tile, chain and shield/salve subtotals.
- Chapter map unlocks Level 02 and displays both real completed levels.
- Refresh preserves both completions and best scores (1,700 / 2,150).
- Drag input on the narrow layout and pause/resume verified. Restart and chapter navigation return to usable game state.
- Motion-effects and high-contrast toggles change state and persist across refresh. Mute defaults off for sound. Audible output is not certified.
- Help and privacy dialogs open and close. Dialog focus is constrained by native `<dialog>`; keyboard Escape resumes.
- Public domain served the interactive game; actual orb flight and chain reaction captured after deployment.
- No application-origin errors observed in the inspected console. The environment emitted browser-extension metadata errors, which are not application exceptions.

## Responsive checks

The same application was rendered in real browser iframes with the following viewport sizes. This is layout QA, **not physical-device or mobile touch emulation**. Desktop scrollbar allocation can reduce document client width by 15 px. Comparisons below use document `scrollWidth` versus `clientWidth`.

| Requested viewport | Horizontal overflow | Main fire control | Notes |
| --- | --- | --- | --- |
| 340 × 740 | None after correction | Visible and usable | Fixed a 5 px navigation overflow; vertical scroll exposes footer. |
| 390 × 844 | None | Visible and usable | Drag aiming and pause/resume exercised. |
| 768 × 1024 | None | Visible and usable | Two-column tablet layout; narrower headline typography adjusted. |
| 1363 × 768 | None | Visible and usable | Three columns; arena scales for short displays; minor vertical page scroll. |

Screenshots supplied with the delivery include the **live public chain reaction** and the mobile arena. They are gameplay captures, not generated concept art. The local QA wrapper is excluded from the production Worker asset allowlist because deployment intentionally rejects framing.

## Not verified / unfinished

- Native iPhone Safari, Android Chrome, true touch hardware, phone browser bars and landscape safe areas.
- A measured sustained 60 FPS on a midrange phone; this remains a design target, not a passed benchmark.
- Full screen-reader usability and independent contrast audit.
- Real audible output, offline transitions, service-worker caching, installation and poor-network tests.
- Full eight-stage campaign, runes, bosses, paid content, Stripe/webhooks/restore, city challenges, server verification and commercial legal readiness.

No live or test purchase was attempted. No API score verification, public leaderboard, analytics, database or migration was implemented or claimed.
