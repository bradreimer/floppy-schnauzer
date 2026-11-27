# ADR-004: The game rules are pure functions over a plain GameState

## Status

Accepted

## Context

Game rules that read the DOM, the GPU, or the clock can only be tested in a browser. The
physics was already written as `updatePhysics(state, dt)`, which returns a new state. This ADR
makes that the rule for all game logic.

## Decision

- The game state is a plain object, `GameState`, in `apps/web/src/game/physics.ts`.
- Each rule is a function that takes a state and a frame time `dt` in seconds, and returns a new
  state. It doesn't touch the DOM, the GPU, audio, or the clock.
- `apps/web/src/game/` holds the rules and the tuning in `config.ts`. Nothing in that folder
  imports from `engine/`, `scene/`, or `platform/`.
- `apps/web/src/app.ts` calls the rules each frame, and plays sounds or updates the screen when
  the state changes.

## Alternatives considered

- **Classes that own their state and draw themselves.** A common game pattern. Set aside because
  each class would need a GPU device to test.
- **An entity component system.** Scales to many kinds of objects. Set aside as more structure than
  a game with one schnauzer and a row of pipes needs.

## Consequences

- The rules are tested with Vitest in Node.js, with no browser.
- Randomness comes from `Math.random` today, so a test that depends on a pipe's height replaces it
  with `vi.spyOn`. Passing a random number generator into the rules would remove the need.
- A new rule that needs the time or input receives it as an argument.
