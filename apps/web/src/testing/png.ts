import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { inflateSync } from "node:zlib";

/** A decoded image: its size, and one byte array per row with `channels` bytes per pixel. */
export interface DecodedPng {
  width: number;
  height: number;
  channels: 3 | 4;
  rows: Uint8Array[];
}

/**
 * Decodes an 8-bit RGB or RGBA PNG without interlacing, the formats of the game's art. Tests use it
 * to check numbers in the code against the pixels of an asset.
 */
export function decodePng(file: Buffer): DecodedPng {
  let offset = 8;
  let width = 0;
  let height = 0;
  let channels: 3 | 4 = 4;
  const data: Buffer[] = [];
  while (offset < file.length) {
    const length = file.readUInt32BE(offset);
    const type = file.toString("ascii", offset + 4, offset + 8);
    const chunk = file.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = chunk.readUInt32BE(0);
      height = chunk.readUInt32BE(4);
      if (chunk[8] !== 8 || (chunk[9] !== 2 && chunk[9] !== 6) || chunk[12] !== 0) {
        throw new Error("Expected an 8-bit RGB or RGBA PNG without interlacing");
      }
      channels = chunk[9] === 6 ? 4 : 3;
    }
    if (type === "IDAT") data.push(chunk);
    offset += 12 + length;
  }

  const raw = inflateSync(Buffer.concat(data));
  const bpp = channels;
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
  return { width, height, channels, rows };
}

/** Reads and decodes a PNG in apps/web/src/assets. */
export function readAsset(name: string): DecodedPng {
  return decodePng(readFileSync(fileURLToPath(new URL(`../assets/${name}`, import.meta.url))));
}
