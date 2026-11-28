import { describe, expect, it } from "vitest";

import { fitToWindow } from "./layout";

describe("fitToWindow", () => {
  it("fills a window with the 4:7 shape exactly", () => {
    expect(fitToWindow(400, 700)).toEqual({ width: 400, height: 700, left: 0, top: 0 });
    expect(fitToWindow(800, 1400)).toEqual({ width: 800, height: 1400, left: 0, top: 0 });
  });

  it("puts bars on the sides of a wide window", () => {
    // 1400 × 700: the height limits the scale to 1, so 1000 px of bars split 500 and 500.
    expect(fitToWindow(1400, 700)).toEqual({ width: 400, height: 700, left: 500, top: 0 });
  });

  it("puts bars above and below a tall window", () => {
    // 400 × 1000: the width limits the scale to 1, so 300 px of bars split 150 and 150.
    expect(fitToWindow(400, 1000)).toEqual({ width: 400, height: 700, left: 0, top: 150 });
  });
});
