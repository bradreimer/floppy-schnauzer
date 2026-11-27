# Current status

## Current milestone

Version 0.2, **Organized**. The project adopts the layout, documentation, and checks used in
fibotrail. See [roadmap.md](roadmap.md).

**What isn't checked yet:** `./scripts/check.sh` passes locally. The Docker image hasn't been
built since the Dockerfile moved to `docker/`, and the game hasn't been played since the source
folders were split.

## Completed

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

- Build and run the Docker image, and play the game in a browser, to close out version 0.2.
- Open a Bug Report for each known defect in the [roadmap](roadmap.md#version-03-fair-and-smooth),
  and fix them with regression tests.
