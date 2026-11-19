# PRALLWERK — Product Concept, Game Design Document and Work Implementation Brief

**Status:** Proposed product concept; not a validated business or cleared brand.  
**Date:** 19 November 2026  
**Market:** Germany first  
**Interface and all player-facing copy:** Native-quality German (de-DE)  
**Primary output:** A real, publicly previewable, playable mobile-first web game (PWA), not a static mockup.  
**Working name:** PRALLWERK (temporary; verify trademark/domain availability before public brand launch).  
**Genre:** Skill-based arcade physics game + lightweight roguelite progression + opt-in asynchronous city challenges.  
**Business model:** Free playable opening chapter + €3.99 one-time unlock for a defined content pack; no subscriptions or forced ads at MVP.

## 1. Product decision and business hypothesis

Build a DISTINCT ORIGINAL game inspired by the *commercial lessons* of satisfying physics-based arcade games with RPG progression. The experience must be compelling in the first 15 seconds, shareable as a short gameplay clip, replayable without purchased content, and offer a transparent personal purchase that unlocks real playable content. Add a distinctive optional German city-versus-city daily challenge, inspired by interest in StadtDuell, WITHOUT making it a social or real-time multiplayer dependency.

**Hypothesis to test:** German adults who enjoy short skill-based mobile games will play a free polished run, return for daily challenges, and some will buy an upfront, fairly priced additional chapter. The German market gap for this exact combination HAS NOT been validated. Do not present revenue, conversion, SEO demand, or market share as established facts.

**Deliberate non-goals:** No gambling, betting, real-money prizes, slot machines, randomized paid loot boxes, pay-to-win city scores, idle clicker economy, costly runtime AI, complex 3D, real-time matchmaking, compulsory account creation, or intrusive monetization. Do not clone art, code, names, level layouts, music, mechanics combination, or UI from an existing game. Build distinct visual identity and tile-interaction rules.

## 2. Primary target users (hypotheses)

- **Primary:** 20–45-year-old adult casual/indie mobile gamers in Germany. They prefer short sessions, visible skill, satisfying chaining, permanent progression, fair prices and no forced ads. May discover from Reddit, YouTube Shorts, TikTok, gaming communities or Google Search.
- **Secondary:** 18–40-year-old competitive friends who enjoy representing a city, posting a score and challenging someone to beat it, but are not necessarily willing to pay for leaderboard access.
- **Buyer motivation:** “I enjoyed that chapter; €3.99 gets me a concrete new biome, levels, a boss and a repeatable mode.” Do not rely on cosmetic purchases alone to prove willingness to pay.
- **Locale:** de-DE by default; make copy and numbers native. Support English only if it doesn't delay German quality.

## 3. Original game premise and unique experience

The player is a **Funkenlenker** (energy operator) repairing a fictional city's broken energy network. Each stage shows a compact board of crystalline machines. The player aims and launches a volley of glowing energy orbs. Orbs ricochet off walls and objects. Some tiles are connected; hitting a connector triggers visible electricity through neighboring tiles, resulting in spectacular chain reactions. Rather than a conventional numbered-brick clone, the signature mechanic is **planning circuits and chain energy**.

**Core promise:** “Ein Schuss. Eine Kettenreaktion.” (One shot. One chain reaction.)

**Three pillars:**
1. *Immediate skill:* drag to aim, release to shoot; first satisfying chain within the first 15 seconds.
2. *Meaningful depth:* simple post-run upgrades / rune choices create different combinations without a bloated inventory.
3. *Social sharing without waiting:* a fixed-seed daily challenge with a fair, normalized loadout and optional city affiliation.

## 4. Core gameplay rules: MVP must actually work

### Arena

- Mobile portrait oriented playfield, nominal 7 columns × 9 rows, scaled responsively; desktop can display it centered with contextual sidebar.
- Orb launcher fixed at bottom; player drags to preview the angle (aim guide) and releases to fire a volley.
- Each stage starts with 5 orbs and 3 shield hearts. Use deterministic collision/trajectory logic, so the same seed and same input produce the same result.
- A volley ends when all balls return, are lost, or a safe hard time/step cap is reached. Clear remaining animations cleanly without soft-lock.
- After a volley, surviving hazard tiles advance one row. If a hazardous tile crosses the warning line, lose one heart and clear that hazard. Game over when hearts reach zero.
- Each stage has a clearly described finite goal: destroy the energy core or defeat a boss before the allowed wave limit. Show progress, win/lose feedback, score, and a restart option.
- Each normal run should take roughly 1–3 minutes. The tutorial is entirely playable, not a slide show.

### Tile system (MVP)

1. **Splitter** (basic crystal): 1–3 HP; disappears on destruction and awards points.
2. **Leiter** (conductor): triggers energy along directly linked neighbors when it receives enough charge; chain visibly propagates.
3. **Spiegel** (mirror): changes orb trajectory; readable indication of reflecting face.
4. **Panzer** (armored tile): requires two hits, with a damaged visual state.
5. **Boss core** (one or two scripted variations): multi-phase target with clearly telegraphed shifts. No invisible mechanics.

Avoid random paid rewards. If basic gameplay uses procedural level variation, use seeded generation and enforce that generated levels are winnable. For a small MVP, hand-author key levels and vary details with validated seed presets.

### Rune choices and scoring

- Offer one of three runes every 2 volleys in eligible campaign runs, such as **Funkenkette** (extra connected pulse), **Durchschlag** (pierce a weakened crystal), and **Doppelimpuls** (one additional orb on next volley).
- Runes have clear descriptions and visible effects; no monetized upgrades.
- Basic score: points for destroyed tiles, chains, stage completion and remaining shields. Show a breakdown after a run.
- Include satisfying impact animations, controlled screen shake toggle, spark particles, clear hit feedback and gentle sound effects. Respect reduced-motion and mute settings.
- Provide 60 FPS as the design goal on midrange mobile devices; degrade effects gracefully.

## 5. Playable content required for first public preview

**Free chapter — Alte Werkstatt:** 8 genuinely distinct playable stages, including a tutorial and at least one mini-boss. It must contain enough variety to communicate the complete core mechanic.

**Paid chapter — Neonhafen:** 12 genuinely playable additional stages, one visually distinct setting, at least one different boss encounter, and a repeatable **Endlosmodus** (single-player). Price: €3.99 one-time, inclusive of applicable displayed tax. The buy screen must list exactly what exists; do not promise future content that has not been built.

A lightweight persistent progression system lets the player unlock a few non-monetized upgrade paths by playing. Do not build crafting, fishing, a full town economy, pets or 100+ levels for V1.

**Critical:** No decorative or mock stages. A stage counts only when playable and tested. If time is limited, ship fewer well-designed stages with honest descriptions, and adjust the paywall copy accordingly; never claim 12 stages if only 3 exist.

## 6. First-session UX — exact experience

**0–5 s:** Landing opens on a premium-looking animated game scene. Headline “Ein Schuss. Eine Kettenreaktion.” Primary CTA “Jetzt kostenlos spielen”; no registration or email request.

**5–15 s:** Show playable arena. Short on-canvas hint “Ziehen, zielen, loslassen.” User fires a first shot; arrange tiles so they reliably experience a striking chain reaction.

**15–90 s:** Continue immediately with 1–2 meaningful stages. Show “Perfekte Kettenreaktion!” and short reward animation, not a modal after every hit.

**2–5 min:** Player encounters first real strategic choice: choose a rune and experience its effect.

**10–25 min:** Depending on skill and retries, player reaches the end of the free chapter and a mini-boss; can replay levels or try daily challenge. Do not interrupt with forced ads or artificial energy wait periods.

**After completing free chapter:** Congratulatory result, then honest optional purchase: “Kapitel 2: Neonhafen freischalten – 3,99 €”, 12 stages, new boss, Endlosmodus. Provide “Später” and continued free daily mode. Do not obscure pricing or simulate a discount countdown.

**Later visits:** “Weiterspielen”, last run, daily challenge and best score. Progress persists through refresh.

## 7. Daily city challenge — first-version design

- Feature name: **Stadtduell**. It is asynchronous, opt-in and FREE for everyone.
- The daily board is identical for all players using a server-defined seed; rune/loadout is normalized, so ownership of a paid chapter never improves scores.
- The user chooses a German city (e.g. Berlin, Frankfurt, Hamburg, München, Köln, Stuttgart, Leipzig, Dresden, Düsseldorf, Bremen, etc.) or skips affiliation. Use ordinary city names; no official coats of arms or licensed logos.
- Submit each player's best verified daily run only once per day (better runs can replace older scores). Show personal rankings and a city overview with participant counts. No fake users, scores or testimonials.
- Cities with very few valid players should show “Zu wenige Teilnehmer für eine belastbare Rangliste” rather than misleading dominance. A simple city comparison can use median scores with a visible minimum sample threshold (e.g. 5 players) and the number of participants displayed.
- Lock affiliation for the current weekly season; users can change at the next season boundary. Do not use GPS or precise location: choice is voluntary.
- Nickname only for public display; sanitize/filter input. No chat, direct messages or public user profiles in MVP.
- **Anti-cheat:** Share a deterministic, pure TypeScript scoring/simulation engine between client and Worker where feasible; send seed + input sequence; server recomputes results. Add rate limiting, one player/day constraints, reasonable upper bounds and abuse logs. If strong score verification is not actually implemented, explicitly mark the public city rankings as experimental and do not market them as cheat-proof.
- Share action produces a short text/link containing the daily challenge and user's personal score, not private data. The game page works when opened through a shared link.

## 8. Monetization and economics

### V1 offer

- Free: entire free chapter, replay, daily challenge, city affiliation, personal scores.
- **€3.99 one-time:** paid chapter Neonhafen with its actual levels/boss plus Endless Mode. Keep all competitive daily challenge advantages equal.
- No subscription at launch; no forced ads, betting, paid random boxes or virtual-currency cashouts.
- No €0.99 standalone consumable in V1. Micro-payments near €1 are disproportionately affected by fixed processing fees; test only after retention and repeat purchases support them.
- Future *candidate* expansions (not to build in V1): €2.99 chapter pack, €1.99 cosmetics with clear appearance-only benefits. Do not promise future expansions on the launch paywall.

### Purchase flow

- The player can complete the free game without login.
- Stripe Checkout initiated server-side (test mode first). Display gross EUR price, contents and payment status clearly. Expose wallet methods such as Apple Pay/Google Pay only if actually supported/enabled by the Stripe account/device.
- Do NOT unlock content based only on a client-side return URL. Fulfill only on verified Stripe webhook; handle duplicate webhook events idempotently.
- Keep purchase entitlement server-side and implement recovery through email magic link/one-time code. Never store payment card data.
- Show clear failed/cancelled/pending states and a support/refund contact path.
- If payment credentials are unavailable, implement the real server and webhook integration scaffold and a *clearly labelled developer-only test mode*. Do not show fake successful purchases or make any live charge.
- German legal review needed before charging consumers: Impressum, Datenschutzerklärung, pricing/tax display, digital-content purchase terms, EU consumer rights and any required express consent/confirmation for beginning delivery before the withdrawal period expires. No subscriptions means no subscription cancellation workflow in V1.

### Revenue discipline

For orientation only: on a €3.99 German-consumer purchase with 19% VAT and standard EEA card fee of 1.5% + €0.25, approximate remaining money is €3.04 **before** acquisition, hosting, refunds, and development. Rates vary with payment method, tax status and location. At 3% purchase conversion, this yields roughly €0.09 contribution per acquired visitor before those costs; buying generic €0.20 clicks would not be sustainable on the first purchase alone. Do not assume Google Ads profitability; prove retention, repeats and organic acquisition first.

## 9. German product copy (real examples; adapt for polish)

- Landing headline: “Ein Schuss. Eine Kettenreaktion.”
- Landing subtitle: “Lenke Energie, sprenge Kristalle und meistere jede Runde.”
- Main CTA: “Jetzt kostenlos spielen”
- Hint: “Ziehen, zielen, loslassen”
- Success: “Kettenreaktion!”
- Between stages: “Neue Fähigkeit wählen”
- Retry: “Nochmal versuchen”
- Daily: “Tages-Challenge” / “Für deine Stadt antreten”
- Purchase title: “Kapitel 2: Neonhafen”
- Purchase CTA: “Für 3,99 € freischalten”
- Transparent benefit: “12 neue Level · 1 Boss · Endlosmodus” (only if really delivered)
- Decline: “Später”
- Trust: “Kein Abo. Keine Lootboxen. Kein Echtgeld-Gewinnspiel.”
- Legal footer: “Impressum · Datenschutz · Nutzungsbedingungen · Kontakt”

## 10. Art direction and UX design system

**Brand mood:** premium futuristic workshop, mysterious energy machinery, energetic but not childish; own art direction. Avoid the visual layout, pixel font, or exact asset style of Bricks Breaker RPG.

- Visual medium: crisp stylized 2D vectors/sprites with tactile depth, subtle textures and vibrant energy trails; no generic stock gaming templates.
- Palette guidelines: ink navy `#0C1220`, elevated panel `#1A2639`, electric mint `#65E3CF`, spark amber `#FFC56E`, intense coral `#FF6D74`, text `#F3F7FB`. These are starting tokens, not accessibility exemptions.
- Typography: readable sans such as Manrope/Inter/Space Grotesk supporting German glyphs and ß. Restrict decorative game typography to short headers.
- Portrait-first landscape-safe layout: 390×844 primary, 340×740 narrow, 768×1024 tablet, 1363×768 desktop, plus modern phones with browser bottom bars and safe areas.
- HUD top: title/level, shields, score, pause/mute. Main arena center. Bottom: large accessible aim/action area with 44px+ controls. Keep game canvas clear and avoid blocking balls with UI.
- Menus: `Spielen`, `Kapitel`, `Stadtduell`, `Shop`, `Einstellungen`. These tabs must actually work if displayed.
- Accessibility: color + icon cues (not color alone), legible text, optional reduced motion, keyboard+mouse for desktop, pause, mute, high contrast, clear tap targets.
- Audio: original or properly licensed short spark, bounce, success and menu sounds; mute default decision should respect browser audio policies and user settings. Never use nonlicensed source-game music or art.

### Screen list (minimum)

1. **Landing/Home:** title, one strong animated gameplay visual, free Play CTA, game progress, transparent premium info.
2. **Tutorial/Gameplay:** responsive arena and touch aiming, visible ball physics, HUD, pause/restart.
3. **Result & Upgrades:** score, earned energy, chosen rune, retry/next.
4. **Chapter Map:** genuine level unlocking, chapter 1 free, chapter 2 purchase.
5. **Daily Challenge:** same-seed stage, personal best, optional city picker, honest public rankings.
6. **Shop/Purchase:** specific features/price and honest Stripe purchase flow.
7. **Settings / Help / Purchase Restore:** sound, reduced motion, how-to, restore paid access, contact, legal links.

### Text wireframe (mobile)

```text
┌────────────────────────────────┐
│ PRALLWERK       ⚡ Level 04  ☰ │
│ ♥ ♥ ♥             Score 1,420  │
│                                │
│        ◇   ◆—◆      ▣          │
│      ◇   /  ⚡ ↘  ◇           │
│          ◯  ↗  ◇              │
│                                │
│           ·  ·  ·              │
│             ↖ aim             │
│            ◉◉◉◉◉              │
│                                │
│    FUNKENKETTE   |    ×2       │
└────────────────────────────────┘
```

## 11. Architecture for a deployable web version

**Suggested stack (can substitute a better equivalent if justified):**

- Frontend: Vite + React + TypeScript for site/UI, **Phaser 3** for polished playable arcade canvas; responsive CSS. Keep game/simulation state separable from visual renderer.
- Pure deterministic TypeScript engine for simulation, collisions, score and seeded random generation; unit-test independently. Prioritize smooth mobile performance.
- Cloudflare Workers for production web app, static assets and API; Cloudflare D1 for player aliases, entitlement records and verified daily scores; optional R2 for assets if actually needed. Do not require Workers AI or paid runtime AI for gameplay.
- Stripe Checkout + verified webhook for one-time payment. Secrets only in Workers secret store, never in client bundle. Include `.env.example` without keys and Wrangler config/migrations.
- Anonymous guest session and local progress first; optional email identification only for purchase restoration. Use minimal personal data and no third-party tracking before required consent.
- PWA manifest, service worker caching for core UI/approved assets if reliable; don't claim offline purchases or fully offline play unless tested. Browser must work without installing.
- Version content as data (chapter/level JSON + content version) and create a clean pipeline for adding future levels.

### Suggested data entities

`guest_player(id, created_at, last_seen_at, city_id_nullable, city_lock_week_nullable)`  
`player_progress(player_id, chapter_id, level_id, stars, upgrade_state_json, version)`  
`purchase_entitlement(id, player_id, stripe_session_id_unique, stripe_customer_id, product_id, granted_at)`  
`daily_run(id, player_id, challenge_date, seed, input_log, verified_score, verified_at)`  
`daily_city_score(date, city_id, participant_count, median_score)` (derived/materialized)  
`analytics_event(id, player_id_or_session, event_type, properties_minimal, created_at)` if privacy basis exists.

No raw payment cards, no GPS coordinates, no real-world cash account. Retain only what is necessary and document deletion/retention behavior.

### Endpoint outline

`GET /api/content` — versioned chapters / stage definitions  
`POST /api/guest` — anonymous identity/session  
`POST /api/progress` — safe validated progress  
`GET /api/daily` — seed and challenge definition  
`POST /api/daily/submit` — verified shot replay -> score  
`GET /api/leaderboard?date=...` — honest rankings  
`POST /api/checkout` — create Stripe session for defined content pack  
`POST /api/stripe/webhook` — verified idempotent fulfillment  
`POST /api/purchase/restore` — request email verification, then restore server entitlement  
`GET /api/me` — progress and entitled content

Protect state-changing routes against abuse. Only expose player-owned records. Validate all server inputs and rate-limit expensive actions.

## 12. Analytics, launch tests and commercial gates

Track: `landing_view`, `play_click`, `first_aim`, `first_shot`, `first_chain`, `stage_complete`, `run_failed`, `session_end`, `chapter_free_complete`, `paywall_view`, `checkout_start`, `purchase_success_verified`, `purchase_cancel`, `daily_attempt`, `city_selected`, `share_click`, `day1_return`, `day7_return` (the last two via aggregate cohort analysis).

Define user metrics rigorously. D1 retention = unique users who played the next calendar day / unique first-time players on day 0. Paid conversion = verified purchasers / eligible distinct free players in the cohort. Organic/source attribution only where privacy-compliant.

**Directional hypotheses, not industry benchmarks or guarantees:**
- At least 70% of actual game starters complete the first shot.
- The first chain reaction should trigger within 15 seconds for most first-time users; check telemetry and observation.
- At least 30% of starters should finish the free chapter in the first week.
- A viable paid-conversion target must be chosen from actual observed acquisition cost and 30-day net value, not a fixed optimistic 10% assumption.
- Target 300–500 honest German testers first; evaluate changes with enough sample size, then only scale ads if the economics hold.

Unit economics formula: `Contribution per acquisition = (purchase_probability × net_revenue_per_purchaser_30d) − cost_per_acquired_user`. Account for VAT, payment fees, refunds, operating expenses and creative costs. A €0.99 purchase alone is not a sufficient monetization strategy.

**Organic acquisition plan:** capture 10–15-second clips of real chain reactions; invite transparent beta feedback in relevant communities after checking community self-promotion rules; share dev logs and respond to criticism. Do not spam or fabricate testimonials. Create shareable challenge deep links and referral tracking only when privacy-compliant.

**Paid acquisition:** later, run a limited, accurately described Google Ads test using German landing copy and transparent “In-App-Käufe möglich” disclosure where required. Do not buy substantial traffic before retention and first-purchase metrics exist. No social casino branding or gambling imitation.

## 13. QA and acceptance gates: never call a static mockup finished

### Functionality

- [ ] Landing CTA launches actual controllable game within seconds.
- [ ] Drag aiming and release work on iPhone Safari, Android Chrome, desktop mouse (and keyboard fallback).
- [ ] Orbs really bounce; connected tiles visibly create deterministic chains; damage, hazards, win/loss and restart are correct.
- [ ] At least 8 free stages are playable end-to-end, including boss/tutorial; all paid levels listed in the offer exist and are playable if advertised.
- [ ] Rune choices alter play in visible and understandable ways.
- [ ] Progress survives reload and navigation, and does not overwrite purchased entitlement.
- [ ] Daily challenge uses identical seed/rules and accurately verified scores; no fake users or rankings.
- [ ] Shop/checkout not merely decorative; purchase test-mode and webhook verification work; no free unlock via URL tampering.
- [ ] Payment access can be restored after losing local storage; cancelled purchases do not unlock anything.
- [ ] No prominent controls do nothing. Error and empty states are usable.

### Quality

- [ ] Test widths 340, 390, 768, 1363 pixels, portrait and desktop; no clipped controls or horizontal overflow.
- [ ] Gameplay visually appealing with actual in-game particles/lighting and consistent original assets; not default buttons or generic placeholders.
- [ ] Asset loads, performance, collision edge cases, pause/resume, offline transitions and slow network tested.
- [ ] Functional tests for deterministic stage seeds, score calculations, stage progression, save/restore, paywall and idempotent Stripe webhook.
- [ ] Full German copy, proper umlauts, understandable prices and clear purchase language.
- [ ] Security/privacy/legal checklist noted and no unsupported claims about legal readiness.

## 14. Milestones — build in thin vertical slices, no false success claims

**Slice 1 — playable proof:** Cloudflare preview with a polished arena, real aiming, physics, one conductor chain, two handcrafted stages, responsive UI and source repo. No shop or fake leaderboard.

**Slice 2 — game MVP:** 8 free stages, progression, upgrade choices, at least one boss, audio, settings, mobile QA and local save.

**Slice 3 — paid product:** 12 premium stages and boss, truthful purchase offer, Stripe test checkout + verified webhook, entitlement recovery and e2e tests.

**Slice 4 — social and deployment:** fixed-seed daily stage, optional city selection, reliable score verification/leaderboard, share links, PWA, basic analytics, legal pages with verified business details, staging and deployment.

Do not claim “complete”, “live payments” or “production-ready” until the corresponding slice has passed. If external keys, business identity or domain are unavailable, publish only an explicitly marked preview and report blockers; never invent credentials, entity details, domain, bank information, legal notices or URLs.

## 15. What Work must return

1. Repository/branch/commit or PR link, or an explicit explanation if no repository was supplied or connected.
2. Public preview URL only if genuinely deployed; otherwise local run command and exact deployment blocker.
3. A short screen recording or screenshots of real gameplay and purchase screen, if capture tools are available.
4. Exact count of playable free and paid levels, verified screens, and functional QA results across requested widths.
5. Stripe test/live status (never call test mode real money), environment variable checklist and migration status.
6. Open issues, known limitations and next prioritized milestone. No fabricated scoreboards, metrics, purchases, log evidence or performance tests.

## 16. Paste-ready instructions to Work

> Build PRALLWERK from this product specification as a genuine German-language, mobile-first, browser-playable web game. Prioritize the delightful playable core and coherent original design over breadth. Implement in vertical slices, test each one, and publish a Cloudflare preview when possible. Do not clone Bricks Breaker RPG assets or layouts. No fake buttons, fake paid content, fake player counts or deceptive payments. Use German UI throughout, real persistent progress, deterministic physics/game logic, and a verified Stripe one-time purchase if credentials are available. If credentials or repository/domain information are unavailable, do not invent them: deploy a preview where authorized and report exact blockers. Hand back commit/preview/QA evidence and list unfinished slices separately.

## 17. External context (not implementation dependencies)

- Bricks Breaker RPG current game description: https://play.google.com/store/apps/details?id=com.WhimBearStudios.BricksBreakerRPG
- Developer on Reddit discussing organic launch: https://www.reddit.com/r/godot/comments/1p2q50l/why_i_think_my_game_release_was_a_success_bricks/
- Stripe Germany pricing: https://stripe.com/en-de/pricing
- Cloudflare Workers web app architecture: https://developers.cloudflare.com/use-cases/web-apps/
- Google Ads gambling/social-casino policy (avoid those categories): https://support.google.com/adspolicy/answer/15132179

**Caution:** Sources document other products, provider capabilities and general policies, not proof that PRALLWERK itself has demand in Germany. Trademark and legal clearance must happen before commercial launch.
