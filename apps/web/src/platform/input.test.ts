import { describe, expect, it, vi } from "vitest";

import { isFlapKey, setupInput } from "./input";

// Node has EventTarget and Event, but not KeyboardEvent, so add the fields a key event has.
function keydown(code: string, repeat = false): Event {
  return Object.assign(new Event("keydown", { cancelable: true }), { code, repeat });
}

describe("isFlapKey", () => {
  it("accepts Space", () => {
    expect(isFlapKey({ code: "Space", repeat: false })).toBe(true);
  });

  it("ignores a held Space, and other keys", () => {
    expect(isFlapKey({ code: "Space", repeat: true })).toBe(false);
    expect(isFlapKey({ code: "Enter", repeat: false })).toBe(false);
    expect(isFlapKey({ code: "KeyW", repeat: false })).toBe(false);
  });
});

describe("setupInput", () => {
  function setup() {
    const canvas = new EventTarget();
    const keys = new EventTarget();
    const onJump = vi.fn();
    setupInput(canvas, onJump, keys);
    return { canvas, keys, onJump };
  }

  it("flaps on a pointer press on the canvas", () => {
    const { canvas, onJump } = setup();
    canvas.dispatchEvent(new Event("pointerdown", { cancelable: true }));
    expect(onJump).toHaveBeenCalledTimes(1);
  });

  it("flaps once for a held Space, and stops the page from scrolling", () => {
    const { keys, onJump } = setup();
    const press = keydown("Space");
    keys.dispatchEvent(press);
    keys.dispatchEvent(keydown("Space", true));
    keys.dispatchEvent(keydown("Space", true));
    expect(onJump).toHaveBeenCalledTimes(1);
    expect(press.defaultPrevented).toBe(true);
  });

  it("does nothing for other keys, and lets them through", () => {
    const { keys, onJump } = setup();
    const press = keydown("Tab");
    keys.dispatchEvent(press);
    expect(onJump).not.toHaveBeenCalled();
    expect(press.defaultPrevented).toBe(false);
  });
});
