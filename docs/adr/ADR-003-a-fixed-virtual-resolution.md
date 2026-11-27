# ADR-003: The world is 400 × 700 virtual pixels, scaled to fit the window

## Status

Accepted

## Context

Players use phones, tablets, and desktops with different window shapes and pixel densities. If
the world grew with the window, a wide screen would show more pipes ahead, and the game wouldn't
be fair.

## Decision

- Every position, size, and speed in the game is in virtual pixels, in a world 400 wide and 700
  tall (`VIRTUAL_WIDTH` and `VIRTUAL_HEIGHT` in `apps/web/src/game/config.ts`).
- Both canvases always render at 400 × 700. CSS scales them to the largest size that fits the
  window with the same 4:7 shape, and centers them.
- The renderer converts virtual pixels to clip space in one place, in
  `apps/web/src/engine/sprites.ts`.

## Alternatives considered

- **Render at the window size.** Sharper on large screens. Set aside because every rule would need
  to scale, and art made for 400 × 700 would stretch.
- **Render at the device pixel ratio, with a virtual camera.** Sharp and fair. Set aside for now as
  more work than the game needs. It's a candidate if pixel art looks blurry on large screens.

## Consequences

- Rules, tests, and art all use the same numbers.
- On a large screen the image is scaled up, so it can look soft.
- A window with a different shape shows black bars.
