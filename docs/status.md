# Current status

## Current milestone

Version 0.4, **Polish**. The version 0.3 fixes merged in
[#12](https://github.com/bradreimer/floppy-schnauzer/pull/12) and
[#14](https://github.com/bradreimer/floppy-schnauzer/pull/14). See [roadmap.md](roadmap.md).

**What was checked on 2026-11-27:** `./scripts/check.sh` passes, with 45 Vitest tests. In
headless Chromium, the 2D UI canvas renders, so the start screen, the score, and the game-over
panel were checked in screenshots. Space starts a round, a saved best of 3 shows on the start
screen and survives a round that scored 0, and a stored value of `garbage` is ignored. **Not
checked yet:** the WebGPU canvas is black in headless Chromium, so the game world behind the
screens, and every version 0.3 visual fix, still need a real browser. The audio fix hasn't been
heard on an iPhone. The "NEW BEST!" label is covered by tests but wasn't seen in a screenshot,
because a headless round can't pass a pipe.

## Completed

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

- Play a round in a real browser at 60 Hz and 120 Hz, and on an iPhone, to close out version 0.3.
