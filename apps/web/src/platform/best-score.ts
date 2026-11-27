/** The parts of Storage the game uses, so a test can pass a fake one. */
export type ScoreStorage = Pick<Storage, "getItem" | "setItem">;

export const BEST_SCORE_KEY = "floppy-schnauzer.bestScore";

/** Returns window.localStorage, or null when the browser blocks it, as some private windows do. */
export function browserStorage(): ScoreStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Reads the saved best score. A missing, unreadable, or invalid value counts as 0, so the game
 * always starts, even when storage is blocked or holds something unexpected.
 */
export function loadBestScore(storage: ScoreStorage | null): number {
  try {
    const text = storage?.getItem(BEST_SCORE_KEY);
    if (text == null || !/^\d+$/.test(text)) return 0;
    const value = Number(text);
    return Number.isSafeInteger(value) ? value : 0;
  } catch {
    return 0;
  }
}

/** Saves the best score. A failed write, such as full or blocked storage, is ignored. */
export function saveBestScore(storage: ScoreStorage | null, score: number): void {
  try {
    storage?.setItem(BEST_SCORE_KEY, String(score));
  } catch {
    // The best score just isn't kept for the next visit.
  }
}
