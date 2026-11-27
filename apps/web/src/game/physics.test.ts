import { afterEach, describe, expect, it, vi } from "vitest";

import {
  BIRD_HITBOX,
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

  // The art's top and bottom edges, for a schnauzer whose sprite is at y.
  const artTop = (y: number) => y + BIRD_HITBOX.y;
  const artBottom = (y: number) => y + BIRD_HITBOX.y + BIRD_HITBOX.h;

  it("ends the game when the top of the art passes the ceiling", () => {
    // Regression test for #13: the sprite frame passes the ceiling 17 px before the art does.
    const frameAboveArtBelow = -BIRD_HITBOX.y + 1;
    expect(artTop(frameAboveArtBelow)).toBe(1);
    expect(updatePhysics(state({ birdY: frameAboveArtBelow }), 0).gameOver).toBe(false);
    expect(updatePhysics(state({ birdY: -BIRD_HITBOX.y - 1 }), 0).gameOver).toBe(true);
  });

  it("ends the game when the paws, the bottom of the art, pass the floor", () => {
    // Regression test for #13: the 64 × 64 frame reached the floor 16 px before the paws did.
    const pawsAboveFloor = FLOOR_Y - BIRD_HITBOX.y - BIRD_HITBOX.h - 1;
    expect(artBottom(pawsAboveFloor)).toBe(FLOOR_Y - 1);
    expect(updatePhysics(state({ birdY: pawsAboveFloor }), 0).gameOver).toBe(false);
    expect(updatePhysics(state({ birdY: pawsAboveFloor + 2 }), 0).gameOver).toBe(true);
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

  describe("pipe collisions, with the schnauzer's sprite at y = 300 and a pipe overlapping it", () => {
    const y = 300;
    const withGap = (top: number, bottom = top + PIPE_GAP) =>
      updatePhysics(state({ birdY: y, pipes: [farPipe({ x: 90, top, bottom })] }), 0).gameOver;

    it("lets the schnauzer fly through the gap", () => {
      expect(withGap(200)).toBe(false);
    });

    it("ends the game when the art touches the top pipe, not when the empty frame does", () => {
      // Regression test for #13: the old 64 × 64 box hit a pipe ending 16 px above the art.
      expect(withGap(artTop(y) - 1)).toBe(false);
      expect(withGap(artTop(y) + 1)).toBe(true);
    });

    it("ends the game when the art touches the bottom pipe, not when the empty frame does", () => {
      expect(withGap(0, artBottom(y) + 1)).toBe(false);
      expect(withGap(0, artBottom(y) - 1)).toBe(true);
    });
  });
});
