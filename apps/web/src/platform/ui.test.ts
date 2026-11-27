import { describe, expect, it } from "vitest";

import { GameUI, type UiContext } from "./ui";

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
