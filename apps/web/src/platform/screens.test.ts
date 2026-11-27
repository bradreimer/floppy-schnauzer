import { describe, expect, it } from "vitest";

import { createInitialState, type GameState } from "../game/physics";
import { describeScreen } from "./screens";

const state = (overrides: Partial<GameState> = {}): GameState => ({
  ...createInitialState(),
  ...overrides
});

describe("describeScreen", () => {
  it("shows the ready screen, with the saved best, before the first round", () => {
    expect(
      describeScreen(state({ bestScore: 7 }), { started: false, bestAtRoundStart: 0 })
    ).toEqual({ kind: "ready", best: 7 });
  });

  it("shows the score during a round", () => {
    expect(describeScreen(state({ score: 3 }), { started: true, bestAtRoundStart: 0 })).toEqual({
      kind: "playing",
      score: 3
    });
  });

  it("shows a new best only when the round beat the best it started with", () => {
    const over = state({ gameOver: true, score: 9, bestScore: 9 });
    expect(describeScreen(over, { started: true, bestAtRoundStart: 7 })).toEqual({
      kind: "over",
      score: 9,
      best: 9,
      newBest: true
    });
    const tied = state({ gameOver: true, score: 7, bestScore: 7 });
    expect(describeScreen(tied, { started: true, bestAtRoundStart: 7 })).toMatchObject({
      newBest: false
    });
  });
});
