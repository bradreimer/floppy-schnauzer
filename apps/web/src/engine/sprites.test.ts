import { describe, expect, it } from "vitest";

import type { Sprite } from "./sprites";
import { TEXTURE_URLS } from "./textures";

describe("Sprite.texture", () => {
  it("accepts only the names in TEXTURE_URLS", () => {
    const valid: Sprite["texture"][] = ["pipeTop", "pipeBottom", "schnauzer"];
    // npm run typecheck fails if this line stops being an error, so a typo can't type-check.
    // @ts-expect-error "pipetop" isn't a texture name: the T is lowercase.
    const typo: Sprite["texture"] = "pipetop";

    expect(valid.every(name => name in TEXTURE_URLS)).toBe(true);
    expect(typo in TEXTURE_URLS).toBe(false);
  });
});
