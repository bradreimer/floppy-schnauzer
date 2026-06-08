import { VIRTUAL_WIDTH, GRAVITY, PIPE_SPEED, PIPE_GAP, VIRTUAL_HEIGHT } from "./config";

export interface GameState {
  birdX: number;
  birdY: number;
  birdVelY: number;
  pipes: { x: number; top: number }[];
  score: number;
  bestScore: number;
  gameOver: boolean;
}

export function createInitialState(): GameState {
  return {
    birdX: 100,
    birdY: 350,
    birdVelY: 0,
    pipes: spawnInitialPipes(),
    score: 0,
    bestScore: 0,
    gameOver: false
  };
}

function spawnInitialPipes() {
  const arr = [];
  let x = VIRTUAL_WIDTH + 50; // just off the right edge of the world
  for (let i = 0; i < 4; i++) {
    arr.push({ x, top: randomTop() });
    x += 220;
  }
  return arr;
}

function randomTop() {
  return 80 + Math.random() * (700 - 80 - PIPE_GAP);
}

export function updateGame(state: GameState, dt: number): GameState {
  if (state.gameOver) return state;

  let { birdY, birdVelY, pipes, score, bestScore } = state;

  birdVelY += GRAVITY * dt
  birdY += birdVelY * dt

  // Move pipes to the left
  pipes = pipes.map(p => ({ ...p, x: p.x - PIPE_SPEED * dt }));

  // Recycle pipes that have gone off screen and update score
  if (pipes[0].x + 70 < 0) {
    pipes.shift();
    pipes.push({
      x: pipes[pipes.length - 1].x + 220,
      top: randomTop()
    });
    score++;
    bestScore = Math.max(bestScore, score);
  }

  // Check for collisions with ground/ceiling
  if (birdY > VIRTUAL_HEIGHT - 40 || birdY < 0) {
    return { ...state, birdY, birdVelY, pipes, score, bestScore, gameOver: true };
  }

  // Check for collisions with pipes
  const birdRect = { x: state.birdX - 20, y: birdY - 20, w: 40, h: 40 };

  // Note: this is AABB collision which isn't pixel-perfect, but it's good enough for a simple game like this
  for (const p of pipes) {
    const topRect = { x: p.x, y: 0, w: 70, h: p.top };
    const bottomRect = {
      x: p.x,
      y: p.top + PIPE_GAP,
      w: 70,
      h: 700 - (p.top + PIPE_GAP)
    };

    if (intersect(birdRect, topRect) || intersect(birdRect, bottomRect)) {
      return { ...state, birdY, birdVelY, pipes, score, bestScore, gameOver: true };
    }
  }

  return { ...state, birdY, birdVelY, pipes, score, bestScore };
}

function intersect(a: any, b: any) {
  return !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);
}
