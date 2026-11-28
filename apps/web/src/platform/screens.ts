import { canRestart, type Round } from "../game/round";

/** What the UI canvas shows. See docs/specs/screens.md. */
export type Screen =
  | { kind: "ready"; best: number }
  | { kind: "playing"; score: number }
  | { kind: "over"; score: number; best: number; newBest: boolean; canRestart: boolean };

export function describeScreen(round: Round): Screen {
  const { phase, game, bestAtRoundStart } = round;
  if (phase === "ready") return { kind: "ready", best: game.bestScore };
  if (phase === "playing") return { kind: "playing", score: game.score };
  return {
    kind: "over",
    score: game.score,
    best: game.bestScore,
    newBest: game.bestScore > bestAtRoundStart,
    canRestart: canRestart(round)
  };
}
