import { VIRTUAL_HEIGHT, VIRTUAL_WIDTH } from "../game/config";

/** The rectangle and texture coordinates of one sprite, in virtual pixels. */
export interface SpriteQuad {
  x: number;
  y: number;
  w: number;
  h: number;
  u0: number;
  v0: number;
  u1: number;
  v1: number;
}

/** Each vertex is x and y in clip space, then u and v. */
export const FLOATS_PER_VERTEX = 4;

/** Each sprite is two triangles. */
export const VERTICES_PER_SPRITE = 6;

export const FLOATS_PER_SPRITE = FLOATS_PER_VERTEX * VERTICES_PER_SPRITE;

/** Converts an x in virtual pixels to clip space, where -1 is the left edge and 1 the right. */
export function toClipX(px: number): number {
  return (px / VIRTUAL_WIDTH) * 2 - 1;
}

/** Converts a y in virtual pixels to clip space, where 1 is the top edge and -1 the bottom. */
export function toClipY(py: number): number {
  return 1 - (py / VIRTUAL_HEIGHT) * 2;
}

/**
 * Writes the vertices of each sprite into `out`, one after another, and returns the number of
 * floats written. `out` must hold at least FLOATS_PER_SPRITE floats per sprite.
 */
export function writeSpriteVertices(sprites: readonly SpriteQuad[], out: Float32Array): number {
  let i = 0;
  for (const s of sprites) {
    const x0 = toClipX(s.x);
    const y0 = toClipY(s.y);
    const x1 = toClipX(s.x + s.w);
    const y1 = toClipY(s.y + s.h);

    // Triangle 1: top-left, top-right, bottom-right. Triangle 2: top-left, bottom-right, bottom-left.
    const corners = [
      [x0, y0, s.u0, s.v0],
      [x1, y0, s.u1, s.v0],
      [x1, y1, s.u1, s.v1],
      [x0, y0, s.u0, s.v0],
      [x1, y1, s.u1, s.v1],
      [x0, y1, s.u0, s.v1]
    ];
    for (const corner of corners) {
      out.set(corner, i);
      i += FLOATS_PER_VERTEX;
    }
  }
  return i;
}
