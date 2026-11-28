# Roadmap

This document states what gets built and in what order. Each version has a scope and a gate: the
next version starts only when the gate of the version before it is met. Items with no issue
number aren't scoped yet. They become GitHub Issues when work on their version starts.

## Versions

| Version | Name | Scope | Gate to pass |
| --- | --- | --- | --- |
| 0.1 | Playable | Tap to flap, pipes, scoring, game over, parallax, sounds, and one Docker image | Done: the game plays in Chrome |
| 0.2 | Organized | The project layout, docs, and checks from [#1](https://github.com/bradreimer/floppy-schnauzer/issues/1) and [#2](https://github.com/bradreimer/floppy-schnauzer/issues/2), and the specs from [#3](https://github.com/bradreimer/floppy-schnauzer/issues/3) and [#4](https://github.com/bradreimer/floppy-schnauzer/issues/4) | `./scripts/check.sh` passes in CI |
| 0.3 | Fair and smooth | Fix the known defects in the [gameplay spec](specs/gameplay.md#open-questions): [#5](https://github.com/bradreimer/floppy-schnauzer/issues/5) to [#10](https://github.com/bradreimer/floppy-schnauzer/issues/10), all fixed | Each fix has a regression test (done), and the game plays the same at 60 Hz and 120 Hz (not yet checked in a real browser) |
| 0.4 | Polish | A start screen with the logo and a game-over score panel ([#17](https://github.com/bradreimer/floppy-schnauzer/issues/17)), the best score kept between visits ([#16](https://github.com/bradreimer/floppy-schnauzer/issues/16)), and the Space key ([#15](https://github.com/bradreimer/floppy-schnauzer/issues/15)) | Each item has a test, and the three screens are checked in a screenshot |
| 0.5 | Lean and tidy | The work items below, in order | Each item merged with its tests, and the play-test checklist run once by the maintainer |
| 0.6 | Steady and shipped | The work items below, from the code review on 2026-11-28 | Each item merged with its tests, and a first tagged release |

## Version 0.6: steady and shipped

From the second code review, on 2026-11-28. Claude does each in order, one pull request at a
time.

| Order | Work item | What |
| --- | --- | --- |
| 1 | [#34](https://github.com/bradreimer/floppy-schnauzer/issues/34) | Bug: pipes piled up off-screen, 99 after 10 minutes. Spawn them by distance |
| 2 | [#35](https://github.com/bradreimer/floppy-schnauzer/issues/35) | Move the round flow (start, flap, restart, save the best) into pure functions |
| 3 | [#36](https://github.com/bradreimer/floppy-schnauzer/issues/36) | Ignore presses for 0.5 s after game over, so a frantic tap doesn't skip the panel |
| 4 | [#37](https://github.com/bradreimer/floppy-schnauzer/issues/37) | A Docker health check |
| 5 | [#38](https://github.com/bradreimer/floppy-schnauzer/issues/38) | Cache headers for hashed assets, and response compression |
| 6 | [#39](https://github.com/bradreimer/floppy-schnauzer/issues/39) | Page title, icon, separate start-up error messages, and unused fields |
| 7 | [#40](https://github.com/bradreimer/floppy-schnauzer/issues/40) | Tagged releases: `latest` moves only when a version is tagged |

## Version 0.5: lean and tidy

Every piece of work suggested so far, captured on 2026-11-27. Claude implements the first six
one at a time, each in its own pull request. The last three need the maintainer.

| Order | Work item | What | Who |
| --- | --- | --- | --- |
| 1 | [#19](https://github.com/bradreimer/floppy-schnauzer/issues/19) | Resize `ground.png` from 5856 × 704 (4.1 MB) to 800 × 160, and check asset sizes in a test | Claude |
| 2 | [#20](https://github.com/bradreimer/floppy-schnauzer/issues/20) | Load the 7 textures in parallel, and drop the debug log | Claude |
| 3 | [#21](https://github.com/bradreimer/floppy-schnauzer/issues/21) | Type the texture names, so a typo fails the type check | Claude |
| 4 | [#22](https://github.com/bradreimer/floppy-schnauzer/issues/22) | Pass the random number generator into the game rules | Claude |
| 5 | [#23](https://github.com/bradreimer/floppy-schnauzer/issues/23) | Pass the UI canvas to the renderer setup, and size the canvases in one place | Claude |
| 6 | [#24](https://github.com/bradreimer/floppy-schnauzer/issues/24) | Write a play-test checklist for real browsers and phones | Claude writes it; the maintainer runs it |
| 7 | [#25](https://github.com/bradreimer/floppy-schnauzer/issues/25) | Record the prompts for `logo.png` and the sounds | The maintainer |
| 8 | [#26](https://github.com/bradreimer/floppy-schnauzer/issues/26) | Decide whether the project has a license: the MIT License, chosen 2026-11-28 | Done |

## Version 0.3: fair and smooth

Think of 0.2 as fixing the kitchen's layout, and 0.3 as fixing the recipe. The known defects come
from a code review on 2026-11-27:

| Bug | Defect | Where | Effect |
| --- | --- | --- | --- |
| [#5](https://github.com/bradreimer/floppy-schnauzer/issues/5) | Parallax moves a fixed amount per frame | `apps/web/src/scene/parallax.ts` | The background scrolls twice as fast at 120 Hz, and keeps moving after game over |
| [#6](https://github.com/bradreimer/floppy-schnauzer/issues/6) | The frame time isn't capped | `apps/web/src/main.ts` | After you switch tabs and come back, one frame can move the schnauzer several seconds |
| [#7](https://github.com/bradreimer/floppy-schnauzer/issues/7) | The floor check uses the sprite's top edge | `apps/web/src/game/physics.ts` | The schnauzer sinks into the ground before the game ends |
| [#8](https://github.com/bradreimer/floppy-schnauzer/issues/8) | The wing frame is `score % 4` | `apps/web/src/scene/parallax.ts` | The wings move only when you score |
| [#9](https://github.com/bradreimer/floppy-schnauzer/issues/9) | A GPU buffer and bind group are made for each sprite, every frame | `apps/web/src/engine/sprites.ts` | Memory grows, and frames get slower over time |
| [#10](https://github.com/bradreimer/floppy-schnauzer/issues/10) | The audio context starts before a tap | `apps/web/src/platform/audio.ts` | Browsers can keep the sound muted until the context is resumed |
