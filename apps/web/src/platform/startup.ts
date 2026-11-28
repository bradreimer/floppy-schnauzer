import { WebGPUUnavailableError } from "../engine/renderer";

export const WEBGPU_UNAVAILABLE = "WebGPU not supported on this device/browser.";
export const LOAD_FAILED = "The game couldn't load. Reload to try again.";

/**
 * The message the overlay shows when start-up fails. Only a missing WebGPU says so; anything else,
 * such as an image that didn't load, asks for a reload.
 */
export function startupMessage(error: unknown): string {
  return error instanceof WebGPUUnavailableError ? WEBGPU_UNAVAILABLE : LOAD_FAILED;
}
