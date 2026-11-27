import { describe, expect, it } from "vitest";

import { loadAll, TEXTURE_URLS } from "./textures";

describe("loadAll", () => {
  it("starts every load before any finishes, and returns each texture by name", async () => {
    // Regression test for #20: the loads used to run one after another.
    const events: string[] = [];
    const releases: (() => void)[] = [];
    const load = (url: string) =>
      new Promise<string>(resolve => {
        events.push(`start ${url}`);
        releases.push(() => {
          events.push(`finish ${url}`);
          resolve(`texture for ${url}`);
        });
      });

    const loading = loadAll(load);
    await Promise.resolve();
    const count = Object.keys(TEXTURE_URLS).length;
    expect(events).toHaveLength(count);
    expect(events.every(e => e.startsWith("start"))).toBe(true);

    releases.forEach(release => release());
    const textures = await loading;
    expect(textures.ground).toBe(`texture for ${TEXTURE_URLS.ground}`);
    expect(Object.keys(textures)).toHaveLength(count);
  });
});
