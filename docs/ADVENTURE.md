# Workshop adventure 0.4

The release descends from the bilingual branch, then the 180-stage release at `5e2eaa5`. The first two boards preserve familiar aim angles. Each remaining board has an explicit arrangement of machines and shield conditions. The six positions in a chapter introduce, explore, challenge, combine, vary and then test its theme.

| Chapter | Final stage | Encounter |
|---|---:|---|
| Old Workshop | 6 · Switch Ring | Strip three relays. The exposed core accepts banked and transmitted hits. |
| Mirror Court | 12 · Periscope | An offset core and staggered mirrors require a bank or a cable pulse. |
| Foundry | 18 · Walking Kiln | Break two plates. At half strength the kiln shields itself for the volley, then moves across the roof. |
| Powder Garden | 24 · Bloom Clock | Capsules have a 119-unit blast radius in place of 86. Clear four petals to open the clock. |
| Glass Archive | 30 · Astrolabe | Four pivot mirrors turn between volleys around a bank-protected core. |
| Switchyard Quay | 36 · Floodgate | The relays release the shield. At half strength every one-way valve reverses. |
| Prism Hall | 42 · Kaleidoscope | Reversing valves and rotating mirrors change the entrance to a three-relay puzzle. |
| Iron Chamber | 48 · Cave-in | Five armor plates form the lock. Destroyed plates become timed radial blasts. |
| Copper Grid | 54 · Commutator | At half strength relays return to their sockets and recharge. Clear a second pair. |
| Night Depot | 60 · Switching Star | Inverting gates guard four crystals between two sets of moving mirror angles. |
| High Voltage Works | 66 · Tesla Choir | A new circuit contact primes the relay itself to discharge into nearby capsules. |
| Control Room | 72 · Clockwork Heart | Break both armor plates. At half strength the valves invert and two revived conductors guard the second phase. |

Each boss signals its transition before the next shot. Halftime prevents excess damage from skipping phase two. Each silhouette uses a different number of moving arms which open on victory. The other eight finales use special board rules.

## Runes and replays

Three choices appear after volleys 2, 4, 6 and so on if a stage from 3 onward is still active. One rune lasts two volleys. Overcharge doubles pulse damage and boosts blast damage. With no remaining charge or relay, the fifth orb carries the charge into core hits. Ricochet doubles the next damaging hit after a wall, mirror or valve reflection. Piercing lets each orb continue through the first plate or crystal for four damage. On a field cleared of both, it bores through an exposed core once for two damage. The picker explains the effect available on the current board.

The engine advances at 120 Hz. The UI records quantized angles and rune IDs in input order. The offline authoring routes store angles as keyboard steps of 0.045 radians. Run `npm test` with Node 24. Run `node scripts/solve-campaign.mjs` when changing geometry or rules to regenerate routes and their attainable target scores. The acceptance suite separately compares whole replay states and checks for a shot where each rune individually leads on core damage.

## Save migration

Storage key v1 stays byte-for-byte intact. A valid v2 profile takes precedence. Migration archives all recorded legacy completions, best scores and prior seals using the frozen 180-board thresholds. Options shows the archive. New mastery and scores start empty, including for the tutorial pair. The sound switch, volume, language, motion and contrast preferences carry over. An explicit language override in the URL takes precedence.

Access follows the furthest legacy checkpoint, including the next unlock implied by recorded clears. For a 1-based chapter and a zero-based old slot, the new stage is six times the number of preceding chapters plus one plus the ceiling of five times the old slot divided by fourteen. The first three tutorial checkpoints retain at least their original access. Rounding toward the later stage avoids making a player repeat a chapter. Old stages 15, 16, 90 and 180 grant access through 6, 7, 36 and 72 respectively. Reopening v2 never awards another clear. If a v2 payload is unreadable, the loader keeps a timestamped backup before recovering from v1.

## Testing and scope

The browser workflow captures 0.3 directly from its pinned release commit. On 0.4 it exercises all twelve finales using keyboard shots, two languages, mouse/touch tutorial runs, pause, restart, defeat, victory, unlocking, rune selection, practice isolation and historical save continuity. Screenshots and frame samples are published in the gameplay-evidence artifact. Five responsive viewports cover portrait, landscape and desktop. The runner measures animation-frame intervals, not GPU frame time on a physical phone.

Remaining work includes first-time-player balancing, physical Safari and Android checks, persistent upgrades, and the later premium and city-challenge milestones. The local simulation verifier is suitable for regression tests. A server verification service is still needed for public competition.
