import type { GameState } from "../game/physics";

/** What the UI canvas shows. See docs/specs/screens.md. */
export type Screen =
  | { kind: "ready"; best: number }
  | { kind: "playing"; score: number }
  | { kind: "over"; score: number; best: number; newBest: boolean };

/** Where the game is between rounds, beside the GameState that the rules own. */
export interface RoundStatus {
  /** True once the first round has started. */
  started: boolean;
  /** The best score when the current or last round began. */
  bestAtRoundStart: number;
}

export function describeScreen(state: GameState, round: RoundStatus): Screen {
  if (!round.started) return { kind: "ready", best: state.bestScore };
  if (!state.gameOver) return { kind: "playing", score: state.score };
  return {
    kind: "over",
    score: state.score,
    best: state.bestScore,
    newBest: state.bestScore > round.bestAtRoundStart
  };
}
