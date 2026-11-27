export function setupInput(canvas: HTMLCanvasElement, onJump: () => void) {
  canvas.addEventListener("pointerdown", e => {
    e.preventDefault();
    onJump();
  });
}
