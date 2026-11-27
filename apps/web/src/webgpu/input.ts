export function setupInput(canvas: HTMLCanvasElement, onJump: () => void) {
  canvas.addEventListener("pointerdown", async e => {
    e.preventDefault();
    onJump();
  });
}
