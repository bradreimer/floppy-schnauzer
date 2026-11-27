import { describe, expect, it } from "vitest";

import {
  FLOATS_PER_SPRITE,
  FLOATS_PER_VERTEX,
  type SpriteQuad,
  toClipX,
  toClipY,
  writeSpriteVertices
} from "./vertices";

const quad = (overrides: Partial<SpriteQuad> = {}): SpriteQuad => ({
  x: 0,
  y: 0,
  w: 400,
  h: 700,
  u0: 0,
  v0: 0,
  u1: 1,
  v1: 1,
  ...overrides
});

function vertex(out: Float32Array, index: number): number[] {
  return Array.from(out.subarray(index * FLOATS_PER_VERTEX, (index + 1) * FLOATS_PER_VERTEX));
}

describe("clip space", () => {
  it("maps the virtual screen's corners to the corners of clip space", () => {
    expect(toClipX(0)).toBe(-1);
    expect(toClipX(400)).toBe(1);
    expect(toClipY(0)).toBe(1);
    expect(toClipY(700)).toBe(-1);
  });
});

describe("writeSpriteVertices", () => {
  it("writes a full-screen sprite as two triangles covering clip space", () => {
    const out = new Float32Array(FLOATS_PER_SPRITE);
    expect(writeSpriteVertices([quad()], out)).toBe(FLOATS_PER_SPRITE);
    expect(vertex(out, 0)).toEqual([-1, 1, 0, 0]);
    expect(vertex(out, 1)).toEqual([1, 1, 1, 0]);
    expect(vertex(out, 2)).toEqual([1, -1, 1, 1]);
    expect(vertex(out, 3)).toEqual([-1, 1, 0, 0]);
    expect(vertex(out, 4)).toEqual([1, -1, 1, 1]);
    expect(vertex(out, 5)).toEqual([-1, -1, 0, 1]);
  });

  it("writes each sprite after the one before it, into one shared array", () => {
    const out = new Float32Array(FLOATS_PER_SPRITE * 3);
    const count = writeSpriteVertices([quad(), quad(), quad({ x: 200, u0: 0.25 })], out);
    expect(count).toBe(FLOATS_PER_SPRITE * 3);
    expect(vertex(out, 12)).toEqual([0, 1, 0.25, 0]);
  });
});
