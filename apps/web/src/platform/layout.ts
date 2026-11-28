import { VIRTUAL_HEIGHT, VIRTUAL_WIDTH } from "../game/config";

/** Where a canvas goes on the page, in CSS pixels. */
export interface CanvasLayout {
  width: number;
  height: number;
  left: number;
  top: number;
}

/**
 * Returns the largest rectangle with the virtual world's 4:7 shape that fits the window, centered.
 * A window that's too wide gets bars on the sides; one that's too tall gets bars above and below.
 * See ADR-003.
 */
export function fitToWindow(windowWidth: number, windowHeight: number): CanvasLayout {
  const scale = Math.min(windowWidth / VIRTUAL_WIDTH, windowHeight / VIRTUAL_HEIGHT);
  const width = VIRTUAL_WIDTH * scale;
  const height = VIRTUAL_HEIGHT * scale;
  return { width, height, left: (windowWidth - width) / 2, top: (windowHeight - height) / 2 };
}

/**
 * Renders every canvas at the virtual resolution, and places them all on the same rectangle, so
 * the UI canvas lines up with the game canvas. Call it once and on every window resize.
 */
export function layOutCanvases(canvases: HTMLCanvasElement[], view: Window = window): void {
  const layout = fitToWindow(view.innerWidth, view.innerHeight);
  for (const canvas of canvases) {
    canvas.width = VIRTUAL_WIDTH;
    canvas.height = VIRTUAL_HEIGHT;
    Object.assign(canvas.style, {
      position: "absolute",
      width: `${layout.width}px`,
      height: `${layout.height}px`,
      left: `${layout.left}px`,
      top: `${layout.top}px`
    });
  }
}
