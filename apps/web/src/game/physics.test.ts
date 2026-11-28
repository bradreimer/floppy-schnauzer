import { describe, expect, it } from "vitest";

import {
  BIRD_HITBOX,
  FLOOR_Y,
  GRAVITY,
  PIPE_GAP,
  FIRST_PIPE_X,
  PIPE_SPACING,
  PIPE_SPAWN_X,
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

  it("spawns the first pipe at the start of a round, with the configured gap", () => {
    const next = updatePhysics(state(), 0.01, () => 0);
    expect(next.pipes).toHaveLength(1);
    const pipe = next.pipes[0];
    expect(pipe?.x).toBe(FIRST_PIPE_X);
    expect(pipe && pipe.bottom - pipe.top).toBe(PIPE_GAP);
  });

  it("spawns the next pipe PIPE_SPACING right of the last, once that fits at the spawn point", () => {
    const notYet = updatePhysics(
      state({ pipes: [farPipe({ x: PIPE_SPAWN_X - PIPE_SPACING + 10 })] }),
      0
    );
    expect(notYet.pipes).toHaveLength(1);
    const due = updatePhysics(state({ pipes: [farPipe({ x: PIPE_SPAWN_X - PIPE_SPACING })] }), 0);
    expect(due.pipes.map(p => p.x)).toEqual([PIPE_SPAWN_X - PIPE_SPACING, PIPE_SPAWN_X]);
  });

  it("keeps a few pipes, 220 px apart, through a 10-minute round", () => {
    // Regression test for #34: pipes spawned on a timer piled up off-screen, 99 after 10 minutes.
    let next = state();
    let most = 0;
    for (let frame = 0; frame < 10 * 60 * 60; frame++) {
      // Keep the schnauzer mid-air, and open every gap, so the round never ends.
      next = updatePhysics(
        {
          ...next,
          birdY: 300,
          birdVelY: 0,
          pipes: next.pipes.map(p => ({ ...p, top: 0, bottom: 700 }))
        },
        1 / 60
      );
      most = Math.max(most, next.pipes.length);
    }
    expect(next.gameOver).toBe(false);
    expect(most).toBeLessThanOrEqual(4);
    const xs = next.pipes.map(p => p.x);
    xs.slice(1).forEach((x, i) => expect(x - (xs[i] ?? 0)).toBeCloseTo(PIPE_SPACING));
  });

  it("places the gap's top from 50 to 280, using the random number generator it's given", () => {
    const due = state();
    expect(updatePhysics(due, 0.01, () => 0).pipes[0]?.top).toBe(50);
    expect(updatePhysics(due, 0.01, () => 0.5).pipes[0]?.top).toBe(165);
    expect(updatePhysics(due, 0.01, () => 1).pipes[0]?.top).toBe(280);
  });

  it("spawns the same pipes from the same generator", () => {
    // Regression test for #22: Math.random was called directly, so runs couldn't be repeated.
    const sequence = () => {
      let n = 0;
      return () => [0.1, 0.9, 0.4][n++ % 3] ?? 0;
    };
    const run = (random: () => number) => {
      let next = state();
      for (let i = 0; i < 300; i++)
        next = updatePhysics({ ...next, birdY: 300, birdVelY: 0 }, 0.02, random);
      return next.pipes.map(p => p.top);
    };
    const first = run(sequence());
    expect(first.length).toBeGreaterThan(1);
    expect(run(sequence())).toEqual(first);
  });

  it("removes a pipe once it is off the left edge", () => {
    const offScreen = farPipe({ x: -71, scored: true });
    const next = updatePhysics(state({ pipes: [offScreen, farPipe({ x: 300 })] }), 0.01);
    expect(next.pipes.map(p => p.x)).not.toContainEqual(expect.closeTo(-71 - 1.2));
    expect(next.pipes.every(p => p.x + 70 >= 0)).toBe(true);
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
