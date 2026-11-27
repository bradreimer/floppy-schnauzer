import { describe, expect, it } from "vitest";

import { readAsset } from "../testing/png";
import { BIRD_HITBOX, BIRD_SIZE } from "./config";

describe("BIRD_HITBOX", () => {
  it("is the union of the opaque pixels in every frame of schnauzer.png", () => {
    const { width, height, rows } = readAsset("schnauzer.png");
    expect(height).toBe(BIRD_SIZE);

    let [left, top, right, bottom] = [Infinity, Infinity, -Infinity, -Infinity];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if ((rows[y]?.[x * 4 + 3] ?? 0) === 0) continue;
        const frameX = x % BIRD_SIZE;
        left = Math.min(left, frameX);
        right = Math.max(right, frameX);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }

    expect({ x: left, y: top, w: right - left + 1, h: bottom - top + 1 }).toEqual(BIRD_HITBOX);
  });
});
