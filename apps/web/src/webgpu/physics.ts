import {
  FLOOR_Y,
  GRAVITY,
  PIPE_GAP,
  PIPE_SPAWN_INTERVAL,
  PIPE_SPEED,
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

  score: number;
  bestScore: number;

  gameOver: boolean;
}

// ------------------------------------------------------------
// Initial game state
// ------------------------------------------------------------
export function createInitialState(): GameState {
  return {
    birdX: 100,
    birdY: VIRTUAL_HEIGHT / 2,
    birdVelY: 0,

    pipes: [],
    timeSinceLastPipe: 0,

    score: 0,
    bestScore: 0,

    gameOver: false
  };
}

// ------------------------------------------------------------
// Main physics update
// ------------------------------------------------------------
export function updatePhysics(state: GameState, dt: number): GameState {
  let {
    birdX,
    birdY,
    birdVelY,
    pipes,
    timeSinceLastPipe,
    score,
    bestScore,
    gameOver
  } = state;

  if (gameOver) {
    return state;
  }

  // ------------------------------------------------------------
  // Bird physics
  // ------------------------------------------------------------
  birdVelY += GRAVITY * dt;
  birdY += birdVelY * dt;

  // Floor / ceiling
  if (birdY < 0 || birdY > FLOOR_Y) {
    gameOver = true;
  }

  // ------------------------------------------------------------
  // Pipe movement
  // ------------------------------------------------------------
  pipes = pipes.map((p: Pipe): Pipe => ({
    ...p,
    x: p.x - PIPE_SPEED * dt
  }));

  // Remove off-screen pipes
  if (pipes.length > 0) {
    const first = pipes[0];
    if (first && first.x + 70 < 0) {
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

    const topHeight =
      Math.random() * (VIRTUAL_HEIGHT - PIPE_GAP - 200) + 50;

    pipes.push({
      x: lastX + 220,
      top: topHeight,
      bottom: topHeight + PIPE_GAP,
      scored: false
    });
  }

  // ------------------------------------------------------------
  // Scoring
  // ------------------------------------------------------------
  for (const p of pipes as Pipe[]) {
    if (!p.scored && p.x + 70 < birdX) {
      score += 1;
      p.scored = true;
      bestScore = Math.max(bestScore, score);
    }
  }

  // ------------------------------------------------------------
  // Collision detection
  // ------------------------------------------------------------
  const birdWidth = 64;
  const birdHeight = 64;
  const pipeWidth = 70;

  for (const p of pipes) {
    const pipeLeft = p.x;
    const pipeRight = p.x + pipeWidth;

    const birdLeft = birdX;
    const birdRight = birdX + birdWidth;

    // Horizontal overlap
    if (birdRight > pipeLeft && birdLeft < pipeRight) {
      // Vertical collision (outside the gap)
      if (birdY < p.top || birdY + birdHeight > p.bottom) {
        console.log("COLLISION TRIGGERED");
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
    score,
    bestScore,
    gameOver
  };
}
