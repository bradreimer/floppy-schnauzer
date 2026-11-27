/** Returns true for a key press that should flap: Space, not held down. */
export function isFlapKey(event: Pick<KeyboardEvent, "code" | "repeat">): boolean {
  return event.code === "Space" && !event.repeat;
}

/**
 * Calls onJump for a pointer press on the canvas, and for a Space key press anywhere in the window.
 * A tap and Space do exactly the same thing: start, flap, or restart.
 */
export function setupInput(
  canvas: EventTarget,
  onJump: () => void,
  keyTarget: EventTarget = window
): void {
  canvas.addEventListener("pointerdown", e => {
    e.preventDefault();
    onJump();
  });

  keyTarget.addEventListener("keydown", e => {
    if (!isFlapKey(e as KeyboardEvent)) return;
    // Space would otherwise scroll the page.
    e.preventDefault();
    onJump();
  });
}
