import { describe, expect, it } from "vitest";

import { MAX_FRAME_TIME } from "./config";
import { frameTime } from "./frame";

describe("frameTime", () => {
  it("returns the time between two frames in seconds", () => {
    expect(frameTime(1016, 1000)).toBeCloseTo(0.016);
  });

  it("caps a long pause, such as a hidden tab, at the maximum frame time", () => {
    expect(frameTime(6000, 1000)).toBe(MAX_FRAME_TIME);
  });

  it("never returns a negative time", () => {
    expect(frameTime(1000, 1016)).toBe(0);
  });
});
