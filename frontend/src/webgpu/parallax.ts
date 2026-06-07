import { GameState } from "./physics";
import { Sprite } from "./sprites";

let scrollSky = 0;
let scrollClouds = 0;
let scrollHills = 0;
let scrollGround = 0;

export function buildFrameSprites(
  state: GameState,
  textures: Record<string, GPUTexture>
): Sprite[] {
  const sprites: Sprite[] = [];

  scrollSky += 10;
  scrollClouds += 20;
  scrollHills += 40;
  scrollGround += 180;

  pushTiled(sprites, "sky", scrollSky, 0, 700);
  pushTiled(sprites, "clouds", scrollClouds, 50, 650);
  pushTiled(sprites, "hills", scrollHills, 150, 550);
  pushTiled(sprites, "ground", scrollGround, 620, 80);

  const frame = state.score % 4;
  const u0 = frame / 4;
  const u1 = (frame + 1) / 4;

  sprites.push({
    texture: "schnauzer",
    x: state.birdX - 32,
    y: state.birdY - 32,
    w: 64,
    h: 64,
    u0,
    v0: 0,
    u1,
    v1: 0.5
  });

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
      v1: 1
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
      v1: 1
    });
  }

  return sprites;
}

function pushTiled(sprites: Sprite[], texture: string, scroll: number, y: number, h: number) {
  const w = 1024;
  const offset = -(scroll % w);

  for (let x = offset - w; x < 400 + w; x += w) {
    sprites.push({
      texture,
      x,
      y,
      w,
      h,
      u0: 0,
      v0: 0,
      u1: 1,
      v1: 1
    });
  }
}
