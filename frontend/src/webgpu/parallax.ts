import { VIRTUAL_WIDTH } from "./config";
import { GameState } from "./physics";
import { Sprite } from "./sprites";

// Parallax scroll offsets
let scrollSky = 0;
let scrollClouds = 0;
let scrollHills = 0;
let scrollGround = 0;

// Virtual resolution
const SKY_W = 400;
const CLOUD_W = 400;
const HILLS_W = 400;
const GROUND_W = 400;

export function buildFrameSprites(state: GameState): Sprite[] {
  const sprites: Sprite[] = [];

  // Parallax speeds (pixels per second)
  scrollSky += 10;
  scrollClouds += 20;
  scrollHills += 40;
  scrollGround += 180;

  // Background layers (z = 0 → back, higher = front)
  pushTiled(sprites, "sky", scrollSky, 0, 700, 0, SKY_W);
  pushTiled(sprites, "clouds", scrollClouds, 50, 650, 1, CLOUD_W);
  pushTiled(sprites, "hills", scrollHills, 150, 550, 2, HILLS_W);
  pushTiled(sprites, "ground", scrollGround, 620, 80, 3, GROUND_W);

  // Bird animation frame
  const frame = state.score % 4;
  const u0 = frame / 4;
  const u1 = (frame + 1) / 4;

  // Bird
  sprites.push({
    texture: "schnauzer",
    x: state.birdX - 32,
    y: state.birdY - 32,
    w: 64,
    h: 64,
    u0,
    v0: 0,
    u1,
    v1: 0.5,
    z: 5
  });

  // Pipes
  for (const p of state.pipes) {
    sprites.push({
      texture: "pipeTop",
      x: p.x,
      y: p.top - 512,
      w: 70,
      h: 512,
      u0: 0,
      v0: 0,
      u1: 1,
      v1: 1,
      z: 4
    });

    sprites.push({
      texture: "pipeBottom",
      x: p.x,
      y: p.top + 170,
      w: 70,
      h: 512,
      u0: 0,
      v0: 0,
      u1: 1,
      v1: 1,
      z: 4
    });
  }

  return sprites;
}

// Push a horizontally tiled parallax layer
function pushTiled(
  sprites: Sprite[],
  texture: string,
  scroll: number,
  y: number,
  h: number,
  z: number,
  tileWidth: number
) {
  const offset = -(scroll % tileWidth);

  // Draw enough tiles to cover the 400px virtual width
  for (let x = offset - tileWidth; x < VIRTUAL_WIDTH + tileWidth; x += tileWidth) {
    sprites.push({
      texture,
      x,
      y,
      w: tileWidth,
      h,
      u0: 0,
      v0: 0,
      u1: 1,
      v1: 1,
      z
    });
  }
}
