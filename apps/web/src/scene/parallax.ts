import {
  BIRD_SIZE,
  FLOOR_Y,
  GROUND_HEIGHT,
  PARALLAX_CLOUDS,
  PARALLAX_GROUND,
  PARALLAX_HILLS,
  PARALLAX_SKY,
  PIPE_WIDTH,
  WING_FPS,
  WING_FRAMES,
  VIRTUAL_WIDTH
} from "../game/config";
import type { GameState } from "../game/physics";
import type { Sprite } from "../engine/sprites";
import type { TextureName } from "../engine/textures";

// Every background tile is as wide as the virtual screen.
const TILE_W = 400;

/** Returns which of the wing frames in schnauzer.png to show, from the seconds since the round began. */
export function wingFrame(roundTime: number): number {
  return Math.floor(roundTime * WING_FPS) % WING_FRAMES;
}

/** Builds the sprites for one frame from the game state. It reads the state and changes nothing. */
export function buildFrameSprites(state: GameState): Sprite[] {
  const sprites: Sprite[] = [];

  // Background layers (z = 0 → back, higher = front)
  const scroll = state.scrollX;
  pushTiled(sprites, "sky", scroll * PARALLAX_SKY, 0, 700, 0, TILE_W);
  pushTiled(sprites, "clouds", scroll * PARALLAX_CLOUDS, 50, 650, 1, TILE_W);
  pushTiled(sprites, "hills", scroll * PARALLAX_HILLS, 150, 550, 2, TILE_W);
  pushTiled(sprites, "ground", scroll * PARALLAX_GROUND, FLOOR_Y, GROUND_HEIGHT, 3, TILE_W);

  // Bird animation frame
  const frame = wingFrame(state.roundTime);
  const u0 = frame / WING_FRAMES;
  const u1 = (frame + 1) / WING_FRAMES;

  // ------------------------------------------------------------
  // BIRD — aligned 1:1 with physics (top-left origin)
  // ------------------------------------------------------------
  const birdSprite: Sprite = {
    texture: "schnauzer",
    x: state.birdX, // physics uses top-left; rendering matches
    y: state.birdY,
    w: BIRD_SIZE,
    h: BIRD_SIZE,
    u0,
    v0: 0,
    u1,
    v1: 1,
    z: 5
  };
  sprites.push(birdSprite);

  // ------------------------------------------------------------
  // PIPES — perfectly aligned with physics
  // ------------------------------------------------------------
  for (const p of state.pipes) {
    // TOP PIPE: from y=0 → p.top
    const topSprite: Sprite = {
      texture: "pipeTop",
      x: p.x,
      y: 0,
      w: PIPE_WIDTH,
      h: p.top,
      u0: 0,
      v0: 0,
      u1: 1,
      v1: 1,
      z: 4
    };
    sprites.push(topSprite);

    // BOTTOM PIPE: from y=p.bottom down to the ground
    const bottomSprite: Sprite = {
      texture: "pipeBottom",
      x: p.x,
      y: p.bottom,
      w: PIPE_WIDTH,
      h: FLOOR_Y - p.bottom,
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
  texture: TextureName,
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
