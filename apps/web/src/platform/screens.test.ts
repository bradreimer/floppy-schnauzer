import { describe, expect, it } from "vitest";

import { createInitialState, type GameState } from "../game/physics";
import type { Phase, Round } from "../game/round";
import { describeScreen } from "./screens";

const round = (
  phase: Phase,
  game: Partial<GameState> = {},
  bestAtRoundStart = 0,
  sinceOver = 0
): Round => ({
  phase,
  game: { ...createInitialState(), ...game },
  bestAtRoundStart,
  sinceOver
});

describe("describeScreen", () => {
  it("shows the ready screen, with the saved best, before the first round", () => {
    expect(describeScreen(round("ready", { bestScore: 7 }))).toEqual({ kind: "ready", best: 7 });
  });

  it("shows the score during a round", () => {
    expect(describeScreen(round("playing", { score: 3 }))).toEqual({ kind: "playing", score: 3 });
  });

  it("shows a new best only when the round beat the best it started with", () => {
    expect(describeScreen(round("over", { score: 9, bestScore: 9, gameOver: true }, 7))).toEqual({
      kind: "over",
      score: 9,
      best: 9,
      newBest: true,
      canRestart: false
    });
    const tied = round("over", { score: 7, bestScore: 7, gameOver: true }, 7);
    expect(describeScreen(tied)).toMatchObject({ newBest: false });
  });

  it("offers a restart only once the restart delay has passed", () => {
    const over = (sinceOver: number) =>
      describeScreen(round("over", { gameOver: true }, 0, sinceOver));
    expect(over(0.1)).toMatchObject({ canRestart: false });
    expect(over(0.5)).toMatchObject({ canRestart: true });
  });
});
