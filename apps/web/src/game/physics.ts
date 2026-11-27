import {
  BIRD_SIZE,
  BIRD_X,
  FLOOR_Y,
  GRAVITY,
  PIPE_GAP,
  PIPE_SPACING,
  PIPE_SPAWN_INTERVAL,
  PIPE_SPEED,
  PIPE_WIDTH,
  VIRTUAL_HEIGHT,
  VIRTUAL_WIDTH
} from "./config";

export interface Pipe {
  x: number;
  top: number;
  bottom: number;
  scored?: boolean;
}

export interface GameState {
  birdX: number;
  birdY: number;
  birdVelY: number;

  pipes: Pipe[];

  timeSinceLastPipe: number;

  /** How far the world has scrolled left this round, in px. The scene derives the parallax from it. */
  scrollX: number;

  /** Seconds since the round started. The scene picks the wing frame from it. */
  roundTime: number;

  score: number;
  bestScore: number;

  gameOver: boolean;
}

// ------------------------------------------------------------
// Initial game state
// ------------------------------------------------------------
export function createInitialState(): GameState {
  return {
    birdX: BIRD_X,
    birdY: VIRTUAL_HEIGHT / 2,
    birdVelY: 0,

    pipes: [],
    timeSinceLastPipe: 0,

    scrollX: 0,
    roundTime: 0,

    score: 0,
    bestScore: 0,

    gameOver: false
  };
}

// ------------------------------------------------------------
// Main physics update
// ------------------------------------------------------------
export function updatePhysics(state: GameState, dt: number): GameState {
  const { birdX } = state;
  let { birdY, birdVelY, pipes, timeSinceLastPipe, score, bestScore, gameOver } = state;

  if (gameOver) {
    return state;
  }

  // ------------------------------------------------------------
  // Bird physics
  // ------------------------------------------------------------
  birdVelY += GRAVITY * dt;
  birdY += birdVelY * dt;

  // Ceiling: the top edge. Floor: the bottom edge, where the paws are.
  if (birdY < 0 || birdY + BIRD_SIZE > FLOOR_Y) {
    gameOver = true;
  }

  // ------------------------------------------------------------
  // Pipe movement
  // ------------------------------------------------------------
  const scrollX = state.scrollX + PIPE_SPEED * dt;
  const roundTime = state.roundTime + dt;

  pipes = pipes.map((p: Pipe): Pipe => ({
    ...p,
    x: p.x - PIPE_SPEED * dt
  }));

  // Remove off-screen pipes
  if (pipes.length > 0) {
    const first = pipes[0];
    if (first && first.x + PIPE_WIDTH < 0) {
      pipes.shift();
    }
  }

  // ------------------------------------------------------------
  // Pipe spawning
  // ------------------------------------------------------------
  timeSinceLastPipe += dt;

  if (timeSinceLastPipe > PIPE_SPAWN_INTERVAL) {
    timeSinceLastPipe = 0;

    const lastPipe = pipes[pipes.length - 1];
    const lastX = lastPipe?.x ?? VIRTUAL_WIDTH + 50;

    const topHeight = Math.random() * (VIRTUAL_HEIGHT - PIPE_GAP - 200) + 50;

    pipes.push({
      x: lastX + PIPE_SPACING,
      top: topHeight,
      bottom: topHeight + PIPE_GAP,
      scored: false
    });
  }

  // ------------------------------------------------------------
  // Scoring
  // ------------------------------------------------------------
  for (const p of pipes) {
    if (!p.scored && p.x + PIPE_WIDTH < birdX) {
      score += 1;
      p.scored = true;
      bestScore = Math.max(bestScore, score);
    }
  }

  // ------------------------------------------------------------
  // Collision detection
  // ------------------------------------------------------------
  for (const p of pipes) {
    const pipeLeft = p.x;
    const pipeRight = p.x + PIPE_WIDTH;

    const birdLeft = birdX;
    const birdRight = birdX + BIRD_SIZE;

    // Horizontal overlap
    if (birdRight > pipeLeft && birdLeft < pipeRight) {
      // Vertical collision (outside the gap)
      if (birdY < p.top || birdY + BIRD_SIZE > p.bottom) {
        gameOver = true;
      }
    }
  }

  // ------------------------------------------------------------
  // Return updated state
  // ------------------------------------------------------------
  return {
    ...state,
    birdX,
    birdY,
    birdVelY,
    pipes,
    timeSinceLastPipe,
    scrollX,
    roundTime,
    score,
    bestScore,
    gameOver
  };
}
