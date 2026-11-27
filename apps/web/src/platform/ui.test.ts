import { describe, expect, it } from "vitest";

import { readAsset } from "../testing/png";
import { GameUI, LOGO_CROP, type UiContext } from "./ui";

/** A fake 2D context that accepts every call and records the text drawn with fillText. */
function recordingContext(): { ctx: UiContext; texts: string[] } {
  const texts: string[] = [];
  const handler: ProxyHandler<object> = {
    get: (_target, key) => {
      if (key === "fillText") return (value: string) => void texts.push(value);
      // Every other method returns the proxy, so createLinearGradient(...).addColorStop works.
      return () => proxy;
    },
    set: () => true
  };
  const proxy = new Proxy({}, handler);
  return { ctx: proxy as UiContext, texts };
}

describe("GameUI", () => {
  it("draws the start prompt, and the best only when there is one", () => {
    const { ctx, texts } = recordingContext();
    const ui = new GameUI(ctx);
    ui.draw({ kind: "ready", best: 0 });
    expect(texts).toEqual(["Tap or press Space to start"]);

    texts.length = 0;
    ui.draw({ kind: "ready", best: 12 });
    expect(texts).toEqual(["Tap or press Space to start", "Best: 12"]);
  });

  it("draws the score once while playing", () => {
    const { ctx, texts } = recordingContext();
    new GameUI(ctx).draw({ kind: "playing", score: 5 });
    expect(texts).toEqual(["5"]);
  });

  it("draws the game-over panel, with NEW BEST! only for a new best", () => {
    const { ctx, texts } = recordingContext();
    const ui = new GameUI(ctx);
    ui.draw({ kind: "over", score: 9, best: 9, newBest: true });
    expect(texts).toEqual([
      "SCORE",
      "9",
      "BEST: 9",
      "NEW BEST!",
      "Tap or press Space to play again"
    ]);

    texts.length = 0;
    ui.draw({ kind: "over", score: 3, best: 9, newBest: false });
    expect(texts).not.toContain("NEW BEST!");
  });
});

describe("LOGO_CROP", () => {
  it("holds all of logo.png's art, inside the image, with at least 20 px of margin", () => {
    const { width, height, channels, rows } = readAsset("logo.png");
    const background = Array.from(rows[0]?.subarray(0, 3) ?? []);

    let [left, top, right, bottom] = [Infinity, Infinity, -Infinity, -Infinity];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = rows[y]?.subarray(x * channels, x * channels + 3) ?? [];
        const distance = [0, 1, 2].reduce(
          (sum, i) => sum + Math.abs((pixel[i] ?? 0) - (background[i] ?? 0)),
          0
        );
        if (distance <= 60) continue;
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }

    expect(LOGO_CROP.x).toBeGreaterThanOrEqual(0);
    expect(LOGO_CROP.y).toBeGreaterThanOrEqual(0);
    expect(LOGO_CROP.x + LOGO_CROP.w).toBeLessThanOrEqual(width);
    expect(LOGO_CROP.y + LOGO_CROP.h).toBeLessThanOrEqual(height);
    expect(left - LOGO_CROP.x).toBeGreaterThanOrEqual(20);
    expect(top - LOGO_CROP.y).toBeGreaterThanOrEqual(20);
    expect(LOGO_CROP.x + LOGO_CROP.w - 1 - right).toBeGreaterThanOrEqual(20);
    expect(LOGO_CROP.y + LOGO_CROP.h - 1 - bottom).toBeGreaterThanOrEqual(20);
  });
});
