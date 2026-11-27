# Current status

## Current milestone

Version 0.3, **Fair and smooth**. Version 0.2 merged in
[#11](https://github.com/bradreimer/floppy-schnauzer/pull/11). The six known defects from the code
review were fixed in [#12](https://github.com/bradreimer/floppy-schnauzer/pull/12), each with a
regression test. See [roadmap.md](roadmap.md).

**What was checked on 2026-11-27:** `./scripts/check.sh` passes, with 29 Vitest tests. In
headless Chromium, the game runs a round with no WebGPU validation errors, and 167 frames create 1
GPU buffer instead of 2,833. **Not checked yet:** headless Chromium shows a black WebGPU canvas, so
the new parallax speeds, the wing animation, the unstretched schnauzer, and the floor line haven't
been seen in a real browser. The audio fix hasn't been heard on an iPhone.

## Completed

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

- Play a round in a real browser at 60 Hz and 120 Hz, and on an iPhone, to close out version 0.3.
