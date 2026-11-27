import { afterEach, describe, expect, it, vi } from "vitest";

import {
  BIRD_SIZE,
  FLOOR_Y,
  GRAVITY,
  PIPE_GAP,
  PIPE_SPAWN_INTERVAL,
  PIPE_SPEED,
  VIRTUAL_HEIGHT
} from "./config";
import { createInitialState, type GameState, type Pipe, updatePhysics } from "./physics";

// A pipe far to the right, so it neither scores nor collides.
const farPipe = (overrides: Partial<Pipe> = {}): Pipe => ({
  x: 1000,
  top: 100,
  bottom: 100 + PIPE_GAP,
  scored: false,
  ...overrides
});

const state = (overrides: Partial<GameState> = {}): GameState => ({
  ...createInitialState(),
  ...overrides
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createInitialState", () => {
  it("starts the schnauzer mid-screen, still, with no pipes and no score", () => {
    const initial = createInitialState();
    expect(initial.birdY).toBe(VIRTUAL_HEIGHT / 2);
    expect(initial.birdVelY).toBe(0);
    expect(initial.pipes).toEqual([]);
    expect(initial.score).toBe(0);
    expect(initial.gameOver).toBe(false);
  });
});

describe("updatePhysics", () => {
  it("pulls the schnauzer down by gravity", () => {
    const next = updatePhysics(state(), 0.1);
    expect(next.birdVelY).toBeCloseTo(GRAVITY * 0.1);
    expect(next.birdY).toBeCloseTo(VIRTUAL_HEIGHT / 2 + GRAVITY * 0.1 * 0.1);
  });

  it("moves an upward velocity up the screen", () => {
    const next = updatePhysics(state({ birdVelY: -450 }), 0.01);
    expect(next.birdY).toBeLessThan(VIRTUAL_HEIGHT / 2);
  });

  it("changes nothing once the game is over", () => {
    const over = state({ gameOver: true });
    expect(updatePhysics(over, 1)).toBe(over);
  });

  it("ends the game above the ceiling", () => {
    expect(updatePhysics(state({ birdY: -1, birdVelY: -10 }), 0.01).gameOver).toBe(true);
  });

  it("ends the game when the paws touch the ground, while the top is still above it", () => {
    // Regression test for #7: the old check used the top edge, so this kept playing.
    const pawsBelowFloor = state({ birdY: FLOOR_Y - BIRD_SIZE + 1 });
    expect(updatePhysics(pawsBelowFloor, 0.001).gameOver).toBe(true);
  });

  it("keeps playing while the paws are above the ground", () => {
    expect(updatePhysics(state({ birdY: FLOOR_Y - BIRD_SIZE - 10 }), 0.001).gameOver).toBe(false);
  });

  it("moves pipes left at the pipe speed", () => {
    const next = updatePhysics(state({ pipes: [farPipe()] }), 0.5);
    expect(next.pipes[0]?.x).toBeCloseTo(1000 - PIPE_SPEED * 0.5);
  });

  it("spawns a pipe with the configured gap after the spawn interval", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const next = updatePhysics(state({ timeSinceLastPipe: PIPE_SPAWN_INTERVAL }), 0.01);
    expect(next.pipes).toHaveLength(1);
    expect(next.timeSinceLastPipe).toBe(0);
    const pipe = next.pipes[0];
    expect(pipe && pipe.bottom - pipe.top).toBe(PIPE_GAP);
  });

  it("removes a pipe once it is off the left edge", () => {
    const next = updatePhysics(state({ pipes: [farPipe({ x: -71, scored: true })] }), 0.01);
    expect(next.pipes).toHaveLength(0);
  });

  it("scores once for each pipe the schnauzer passes", () => {
    // The pipe's right edge (x + 70) is just left of the schnauzer at x = 100.
    const passed = state({ pipes: [farPipe({ x: 29 })] });
    const once = updatePhysics(passed, 0.001);
    expect(once.score).toBe(1);
    expect(once.bestScore).toBe(1);

    const twice = updatePhysics(once, 0.001);
    expect(twice.score).toBe(1);
  });

  it("ends the game when the schnauzer hits a pipe outside the gap", () => {
    // The pipe overlaps the schnauzer, and the gap starts below it.
    const blocked = state({ pipes: [farPipe({ x: 90, top: 500, bottom: 500 + PIPE_GAP })] });
    expect(updatePhysics(blocked, 0.001).gameOver).toBe(true);
  });

  it("lets the schnauzer fly through the gap", () => {
    const clear = state({ pipes: [farPipe({ x: 90, top: 200, bottom: 200 + PIPE_GAP })] });
    expect(updatePhysics(clear, 0.001).gameOver).toBe(false);
  });
});
