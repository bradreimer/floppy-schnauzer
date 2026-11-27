import { describe, expect, it } from "vitest";

import { PARALLAX_CLOUDS, PIPE_SPEED, WING_FPS } from "../game/config";
import { createInitialState, type GameState, updatePhysics } from "../game/physics";
import type { TextureName } from "../engine/textures";
import { buildFrameSprites, wingFrame } from "./parallax";

function run(state: GameState, frames: number, dt: number): GameState {
  let next = state;
  // Keep the schnauzer mid-air, so the round doesn't end on the floor.
  for (let i = 0; i < frames; i++) next = updatePhysics({ ...next, birdY: 300, birdVelY: 0 }, dt);
  return next;
}

const leftmostX = (state: GameState, texture: TextureName) =>
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

describe("wing animation", () => {
  it("cycles through the four frames over time", () => {
    const step = 1 / WING_FPS;
    expect([0, 1, 2, 3, 4].map(i => wingFrame(i * step + step / 2))).toEqual([0, 1, 2, 3, 0]);
  });

  it("flaps with no change in score", () => {
    // Regression test for #8: the old frame was score % 4, so it only changed on a point.
    const u0At = (roundTime: number) =>
      buildFrameSprites({ ...createInitialState(), roundTime }).find(s => s.texture === "schnauzer")
        ?.u0;
    expect(u0At(0)).toBe(0);
    expect(u0At(1.5 / WING_FPS)).toBe(0.25);
  });
});
