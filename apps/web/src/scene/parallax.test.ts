import { describe, expect, it } from "vitest";

import { PARALLAX_CLOUDS, PIPE_SPEED } from "../game/config";
import { createInitialState, type GameState, updatePhysics } from "../game/physics";
import { buildFrameSprites } from "./parallax";

function run(state: GameState, frames: number, dt: number): GameState {
  let next = state;
  // Keep the schnauzer mid-air, so the round doesn't end on the floor.
  for (let i = 0; i < frames; i++) next = updatePhysics({ ...next, birdY: 300, birdVelY: 0 }, dt);
  return next;
}

const leftmostX = (state: GameState, texture: string) =>
  Math.min(
    ...buildFrameSprites(state)
      .filter(s => s.texture === texture)
      .map(s => s.x)
  );

describe("parallax scrolling", () => {
  it("scrolls the same distance in 1 s at 60 Hz and at 120 Hz", () => {
    // Regression test for #5: the old code scrolled a fixed amount per frame.
    const at60 = run(createInitialState(), 60, 1 / 60);
    const at120 = run(createInitialState(), 120, 1 / 120);
    expect(at60.scrollX).toBeCloseTo(PIPE_SPEED);
    expect(at120.scrollX).toBeCloseTo(at60.scrollX);
    expect(leftmostX(at120, "clouds")).toBeCloseTo(leftmostX(at60, "clouds"));
  });

  it("moves the clouds at their share of the pipe speed", () => {
    const start = createInitialState();
    const moved = { ...start, scrollX: 100 };
    expect(leftmostX(start, "clouds") - leftmostX(moved, "clouds")).toBeCloseTo(
      100 * PARALLAX_CLOUDS
    );
  });

  it("stops scrolling once the round is over", () => {
    const over = { ...createInitialState(), scrollX: 50, gameOver: true };
    expect(updatePhysics(over, 1).scrollX).toBe(50);
  });

  it("builds the same sprites when called twice with the same state", () => {
    const state = { ...createInitialState(), scrollX: 123 };
    expect(buildFrameSprites(state)).toEqual(buildFrameSprites(state));
  });
});
