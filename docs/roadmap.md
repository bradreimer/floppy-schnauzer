# Roadmap

This document states what gets built and in what order. Each version has a scope and a gate: the
next version starts only when the gate of the version before it is met. Items with no issue
number aren't scoped yet. They become GitHub Issues when work on their version starts.

## Versions

| Version | Name | Scope | Gate to pass |
| --- | --- | --- | --- |
| 0.1 | Playable | Tap to flap, pipes, scoring, game over, parallax, sounds, and one Docker image | Done: the game plays in Chrome |
| 0.2 | Organized | The project layout, docs, and checks from [#1](https://github.com/bradreimer/floppy-schnauzer/issues/1) and [#2](https://github.com/bradreimer/floppy-schnauzer/issues/2), and the specs from [#3](https://github.com/bradreimer/floppy-schnauzer/issues/3) and [#4](https://github.com/bradreimer/floppy-schnauzer/issues/4) | `./scripts/check.sh` passes in CI |
| 0.3 | Fair and smooth | Fix the known defects in the [gameplay spec](specs/gameplay.md#open-questions) | Each fix has a regression test, and the game plays the same at 60 Hz and 120 Hz |
| 0.4 | Polish | Use the logo and score panel art, remember the best score between visits, and add the Space key | Not set yet |

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
