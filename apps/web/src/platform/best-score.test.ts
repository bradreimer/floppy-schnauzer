import { describe, expect, it } from "vitest";

import { BEST_SCORE_KEY, loadBestScore, saveBestScore, type ScoreStorage } from "./best-score";

function memoryStorage(initial: Record<string, string> = {}): ScoreStorage {
  const items = new Map(Object.entries(initial));
  return {
    getItem: key => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value)
  };
}

const throwingStorage: ScoreStorage = {
  getItem: () => {
    throw new Error("SecurityError");
  },
  setItem: () => {
    throw new Error("QuotaExceededError");
  }
};

describe("best score storage", () => {
  it("loads the score it saved", () => {
    const storage = memoryStorage();
    saveBestScore(storage, 42);
    expect(loadBestScore(storage)).toBe(42);
  });

  it("starts at 0 when nothing is saved, or there is no storage", () => {
    expect(loadBestScore(memoryStorage())).toBe(0);
    expect(loadBestScore(null)).toBe(0);
  });

  it("ignores a value that isn't a whole number of 0 or more", () => {
    for (const bad of ["", "-3", "2.5", "abc", "1e3", " 7", "99999999999999999999"]) {
      expect(loadBestScore(memoryStorage({ [BEST_SCORE_KEY]: bad }))).toBe(0);
    }
  });

  it("keeps the game running when storage throws", () => {
    expect(loadBestScore(throwingStorage)).toBe(0);
    expect(() => saveBestScore(throwingStorage, 5)).not.toThrow();
    expect(() => saveBestScore(null, 5)).not.toThrow();
  });
});
