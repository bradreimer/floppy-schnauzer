import { VIRTUAL_HEIGHT, VIRTUAL_WIDTH } from "./config";
import { GameState } from "./physics";

export function drawUI(state: GameState, uiCanvas: HTMLCanvasElement) {
  const ctx = uiCanvas.getContext("2d")!;
  ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

  // Score text
  ctx.font = "48px sans-serif";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(state.score.toString(), VIRTUAL_WIDTH / 2, 80);
}
