import { JUMP_VELOCITY } from "./config";
import { createInitialState, type GameState, updatePhysics } from "./physics";

/**
 * Where the player is: on the start screen, in a round, or after one. See
 * docs/specs/screens.md for what each phase shows.
 */
export type Phase = "ready" | "playing" | "over";

/** The whole game between frames: the phase, the physics state, and the best a round began with. */
export interface Round {
  phase: Phase;
  game: GameState;
  /** The best score when the current or last round began, to tell whether it set a new best. */
  bestAtRoundStart: number;
}

/**
 * Something the rules ask the browser to do. The rules stay pure, and app.ts plays the sound or
 * saves the score.
 */
export type RoundEvent = "jump" | "score" | "hit" | "saveBest";

export interface RoundStep {
  round: Round;
  events: RoundEvent[];
}

/** The start screen, with the best score saved from earlier visits. */
export function createRound(savedBest: number): Round {
  return {
    phase: "ready",
    game: { ...createInitialState(), bestScore: savedBest },
    bestAtRoundStart: savedBest
  };
}

/**
 * A tap, click, or Space press. On the start screen or after a round, it starts a new round, keeping
 * the best score. In every case, it flaps.
 */
export function pressFlap(round: Round): RoundStep {
  let next = round;
  if (round.phase !== "playing") {
    const best = round.game.bestScore;
    next = {
      phase: "playing",
      game: { ...createInitialState(), bestScore: best },
      bestAtRoundStart: best
    };
  }
  return {
    round: { ...next, game: { ...next.game, birdVelY: JUMP_VELOCITY } },
    events: ["jump"]
  };
}

/**
 * Advances a round by dt seconds. Outside a round, nothing moves. When the round ends, it asks for
 * the hit sound, and for the best score to be saved if the round beat it.
 */
export function advance(round: Round, dt: number, random: () => number = Math.random): RoundStep {
  if (round.phase !== "playing") return { round, events: [] };

  const game = updatePhysics(round.game, dt, random);
  const events: RoundEvent[] = [];
  if (game.score > round.game.score) events.push("score");

  if (!game.gameOver) return { round: { ...round, game }, events };

  events.push("hit");
  if (game.bestScore > round.bestAtRoundStart) events.push("saveBest");
  return { round: { ...round, phase: "over", game }, events };
}
