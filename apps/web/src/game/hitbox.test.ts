import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";

import { BIRD_HITBOX, BIRD_SIZE } from "./config";

/** Decodes an 8-bit RGBA PNG, without interlacing, into rows of RGBA bytes. */
function decodeRgbaPng(file: Buffer): { width: number; height: number; rows: Uint8Array[] } {
  let offset = 8;
  let width = 0;
  let height = 0;
  const data: Buffer[] = [];
  while (offset < file.length) {
    const length = file.readUInt32BE(offset);
    const type = file.toString("ascii", offset + 4, offset + 8);
    const chunk = file.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = chunk.readUInt32BE(0);
      height = chunk.readUInt32BE(4);
      if (chunk[8] !== 8 || chunk[9] !== 6 || chunk[12] !== 0) {
        throw new Error("Expected an 8-bit RGBA PNG without interlacing");
      }
    }
    if (type === "IDAT") data.push(chunk);
    offset += 12 + length;
  }

  const raw = inflateSync(Buffer.concat(data));
  const bpp = 4;
  const stride = width * bpp;
  const rows: Uint8Array[] = [];
  let previous = new Uint8Array(stride);
  for (let y = 0; y < height; y++) {
    const start = y * (stride + 1);
    const filter = raw[start];
    const row = Uint8Array.from(raw.subarray(start + 1, start + 1 + stride));
    for (let x = 0; x < stride; x++) {
      const left = x >= bpp ? (row[x - bpp] ?? 0) : 0;
      const up = previous[x] ?? 0;
      const upLeft = x >= bpp ? (previous[x - bpp] ?? 0) : 0;
      let predictor = 0;
      if (filter === 1) predictor = left;
      else if (filter === 2) predictor = up;
      else if (filter === 3) predictor = Math.floor((left + up) / 2);
      else if (filter === 4) {
        const p = left + up - upLeft;
        const [pa, pb, pc] = [Math.abs(p - left), Math.abs(p - up), Math.abs(p - upLeft)];
        predictor = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
      }
      row[x] = ((row[x] ?? 0) + predictor) & 0xff;
    }
    rows.push(row);
    previous = row;
  }
  return { width, height, rows };
}

describe("BIRD_HITBOX", () => {
  it("is the union of the opaque pixels in every frame of schnauzer.png", () => {
    const path = fileURLToPath(new URL("../assets/schnauzer.png", import.meta.url));
    const { width, height, rows } = decodeRgbaPng(readFileSync(path));
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
