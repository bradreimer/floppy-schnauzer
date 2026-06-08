import {
  SCROLL_CLOUDS_SPEED,
  SCROLL_GROUND_SPEED,
  SCROLL_HILLS_SPEED,
  SCROLL_SKY_SPEED,
  VIRTUAL_HEIGHT,
  VIRTUAL_WIDTH
} from "./config";
import { GameState } from "./physics";
import { Sprite } from "./sprites";

// Parallax scroll offsets
let scrollSky = 0;
let scrollClouds = 0;
let scrollHills = 0;
let scrollGround = 0;

// Virtual resolution tile widths
const SKY_W = 400;
const CLOUD_W = 400;
const HILLS_W = 400;
const GROUND_W = 400;

export function buildFrameSprites(state: GameState): Sprite[] {
  const sprites: Sprite[] = [];

  // Parallax speeds (pixels per second)
  scrollSky += SCROLL_SKY_SPEED;
  scrollClouds += SCROLL_CLOUDS_SPEED;
  scrollHills += SCROLL_HILLS_SPEED;
  scrollGround += SCROLL_GROUND_SPEED;

  // Background layers (z = 0 → back, higher = front)
  pushTiled(sprites, "sky", scrollSky, 0, 700, 0, SKY_W);
  pushTiled(sprites, "clouds", scrollClouds, 50, 650, 1, CLOUD_W);
  pushTiled(sprites, "hills", scrollHills, 150, 550, 2, HILLS_W);
  pushTiled(sprites, "ground", scrollGround, 620, 80, 3, GROUND_W);

  // Bird animation frame
  const frame = state.score % 4;
  const u0 = frame / 4;
  const u1 = (frame + 1) / 4;

  // ------------------------------------------------------------
  // BIRD — aligned 1:1 with physics (top-left origin)
  // ------------------------------------------------------------
  const birdSprite = {
    texture: "schnauzer",
    x: state.birdX, // physics uses top-left; rendering matches
    y: state.birdY,
    w: 64,
    h: 64,
    u0,
    v0: 0,
    u1,
    v1: 0.5,
    z: 5
  };
  sprites.push(birdSprite);

  // ------------------------------------------------------------
  // PIPES — perfectly aligned with physics
  // ------------------------------------------------------------
  for (const p of state.pipes) {
    // TOP PIPE: from y=0 → p.top
    const topSprite = {
      texture: "pipeTop",
      x: p.x,
      y: 0,
      w: 70,
      h: p.top,
      u0: 0,
      v0: 0,
      u1: 1,
      v1: 1,
      z: 4
    };
    sprites.push(topSprite);

    // BOTTOM PIPE: from y=p.bottom → VIRTUAL_HEIGHT
    const bottomSprite = {
      texture: "pipeBottom",
      x: p.x,
      y: p.bottom,
      w: 70,
      h: VIRTUAL_HEIGHT - p.bottom,
      u0: 0,
      v0: 0,
      u1: 1,
      v1: 1,
      z: 4
    };
    sprites.push(bottomSprite);
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
