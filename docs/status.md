# Current status

## Current milestone

Version 0.5, **Lean and tidy**: the nine work items in the
[roadmap](roadmap.md#version-05-lean-and-tidy), done one pull request at a time. Version 0.4
merged in [#18](https://github.com/bradreimer/floppy-schnauzer/pull/18).

**Still not checked in a real browser:** the WebGPU canvas is black in headless Chromium, so the
version 0.3 and 0.4 visual changes, the sound on an iPhone, and the "NEW BEST!" label need the
play-test checklist from [#24](https://github.com/bradreimer/floppy-schnauzer/issues/24).

## Completed

- [#22](https://github.com/bradreimer/floppy-schnauzer/issues/22) `updatePhysics` takes its random number generator as an argument, so no test
  replaces `Math.random`.
- [#21](https://github.com/bradreimer/floppy-schnauzer/issues/21) Texture names have a type, so a misspelled name fails the type check.
- [#20](https://github.com/bradreimer/floppy-schnauzer/issues/20) The 7 textures load in parallel, and the debug log on each load is gone.
- [#19](https://github.com/bradreimer/floppy-schnauzer/issues/19) `ground.png` is 800 × 160 and 132 KB instead of 5856 × 704 and 4.1 MB, and an
  organization test checks that the asset table gives each PNG's real size.
- [#15](https://github.com/bradreimer/floppy-schnauzer/issues/15), [#16](https://github.com/bradreimer/floppy-schnauzer/issues/16), and [#17](https://github.com/bradreimer/floppy-schnauzer/issues/17) Space flaps, the best score is saved in
  `localStorage`, and the 2D UI canvas shows a start screen with the logo card, the score while
  you play, and a game-over panel drawn in code. `score-panel.png` was removed. Not in a release
  yet.
- [#13](https://github.com/bradreimer/floppy-schnauzer/issues/13) The collision box matches the
  schnauzer's art (64 × 31 px, rows 17 to 47 of the frame), so a pipe only ends the round when it
  touches what you see. A test keeps the box in sync with `schnauzer.png`.
- [#5](https://github.com/bradreimer/floppy-schnauzer/issues/5) through
  [#10](https://github.com/bradreimer/floppy-schnauzer/issues/10) The frame time is capped at
  0.05 s, the renderer reuses one vertex buffer, the paws end the round at the ground line
  (y = 620), the parallax scrolls by `dt` and stops at game over, the first tap resumes muted
  audio, and the wings flap at 10 frames a second. Not in a release yet.
- [#1](https://github.com/bradreimer/floppy-schnauzer/issues/1) The code moved to `apps/web`,
  `apps/server`, and `docker`. `apps/web/src/webgpu/` was split into `engine/`, `game/`,
  `scene/`, and `platform/`. The docs folder, the ADRs, the specs, the issue templates, and the
  organization tests in `tests/organization/` were added.
- [#2](https://github.com/bradreimer/floppy-schnauzer/issues/2) `./scripts/check.sh` runs the
  organization tests, the server checks, and the web checks, and CI runs it. The first tests
  cover the game physics (12 Vitest tests) and `/api/health` (1 xUnit test).
- [#3](https://github.com/bradreimer/floppy-schnauzer/issues/3) The
  [gameplay spec](specs/gameplay.md) records the current rules and tuning.
- [#4](https://github.com/bradreimer/floppy-schnauzer/issues/4) The
  [art and audio assets spec](specs/art-and-audio-assets.md) lists every asset, and a test keeps
  it in sync with `apps/web/src/assets/`.

## In progress

None.

## Next

- The rest of the [version 0.5 work items](roadmap.md#version-05-lean-and-tidy), in order: #23 and
  #24 by Claude, then #24's run, #25, and #26 by the maintainer.
