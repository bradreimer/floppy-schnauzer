import { describe, expect, it } from "vitest";

import { JUMP_VELOCITY, PIPE_GAP } from "./config";
import type { Pipe } from "./physics";
import { advance, createRound, pressFlap, type Round } from "./round";

// A pipe whose right edge is just left of the schnauzer, so the next frame scores it.
const passedPipe: Pipe = { x: 29, top: 100, bottom: 100 + PIPE_GAP, scored: false };

function playing(overrides: Partial<Round["game"]> = {}, bestAtRoundStart = 0): Round {
  const round = pressFlap(createRound(bestAtRoundStart)).round;
  return { ...round, game: { ...round.game, birdVelY: 0, ...overrides } };
}

describe("createRound", () => {
  it("starts on the ready screen with the saved best", () => {
    const round = createRound(7);
    expect(round.phase).toBe("ready");
    expect(round.game.bestScore).toBe(7);
  });
});

describe("pressFlap", () => {
  it("starts a round from the ready screen, and flaps", () => {
    const { round, events } = pressFlap(createRound(7));
    expect(round.phase).toBe("playing");
    expect(round.game.birdVelY).toBe(JUMP_VELOCITY);
    expect(round.bestAtRoundStart).toBe(7);
    expect(events).toEqual(["jump"]);
  });

  it("flaps during a round without restarting it", () => {
    const { round } = pressFlap(playing({ score: 3, birdY: 200 }));
    expect(round.game.score).toBe(3);
    expect(round.game.birdY).toBe(200);
    expect(round.game.birdVelY).toBe(JUMP_VELOCITY);
  });

  it("restarts after game over, keeping the best score", () => {
    const over: Round = { ...playing({ score: 5, bestScore: 9, gameOver: true }), phase: "over" };
    const { round } = pressFlap(over);
    expect(round.phase).toBe("playing");
    expect(round.game.score).toBe(0);
    expect(round.game.gameOver).toBe(false);
    expect(round.game.bestScore).toBe(9);
    expect(round.bestAtRoundStart).toBe(9);
  });
});

describe("advance", () => {
  it("does nothing outside a round", () => {
    const ready = createRound(0);
    expect(advance(ready, 1)).toEqual({ round: ready, events: [] });
  });

  it("asks for the score sound when the score goes up", () => {
    const { events } = advance(playing({ birdY: 300, pipes: [passedPipe] }), 0.001);
    expect(events).toEqual(["score"]);
  });

  it("ends the round with the hit sound, and saves only a new best", () => {
    // Below the floor, so the next frame ends the round.
    const newBest = advance(playing({ birdY: 650, score: 4, bestScore: 4 }, 3), 0.001);
    expect(newBest.round.phase).toBe("over");
    expect(newBest.events).toEqual(["hit", "saveBest"]);

    const noBest = advance(playing({ birdY: 650, score: 2, bestScore: 4 }, 4), 0.001);
    expect(noBest.events).toEqual(["hit"]);
  });
});
