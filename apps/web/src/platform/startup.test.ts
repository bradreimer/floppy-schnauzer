import { describe, expect, it } from "vitest";

import { WebGPUUnavailableError } from "../engine/renderer";
import { LOAD_FAILED, startupMessage, WEBGPU_UNAVAILABLE } from "./startup";

describe("startupMessage", () => {
  it("says WebGPU isn't supported only when WebGPU is the problem", () => {
    expect(startupMessage(new WebGPUUnavailableError("Failed to get GPU adapter"))).toBe(
      WEBGPU_UNAVAILABLE
    );
  });

  it("asks for a reload for any other failure", () => {
    // Regression test for #39: every failure used to say WebGPU wasn't supported.
    expect(startupMessage(new Error("Failed to decode image"))).toBe(LOAD_FAILED);
    expect(startupMessage("something odd")).toBe(LOAD_FAILED);
  });
});
