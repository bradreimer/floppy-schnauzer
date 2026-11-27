import { MAX_FRAME_TIME } from "./config";

/**
 * Returns the time to simulate for one frame, in seconds, from two requestAnimationFrame
 * timestamps in milliseconds. The result is never negative and never above MAX_FRAME_TIME, so a
 * paused tab doesn't move the game several seconds at once.
 */
export function frameTime(now: number, last: number): number {
  const seconds = (now - last) / 1000;
  return Math.min(Math.max(seconds, 0), MAX_FRAME_TIME);
}
