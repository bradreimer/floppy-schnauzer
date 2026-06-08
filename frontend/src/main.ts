import { Game } from "./webgpu/game";
import { initWebGPU } from "./webgpu/renderer";
import { drawUI } from "./webgpu/ui";

async function start() {
  const canvas = document.getElementById("game") as HTMLCanvasElement | null;
  const uiCanvas = document.getElementById("ui") as HTMLCanvasElement | null;
  const overlay = document.getElementById("overlay") as HTMLDivElement | null;

  if (!canvas || !uiCanvas || !overlay) {
    console.error("Missing canvas, UI canvas, or overlay element");
    return;
  }

  try {
    // Initialize WebGPU
    const { device, context, format } = await initWebGPU(canvas);

    // Create the game instance
    const game = new Game(device, context, format, canvas, overlay);

    // Initialize game assets
    await game.init();

    // Main loop
    function frame() {
      game.update();
      game.render();

      // Draw UI overlay (score, etc.)
      drawUI(game.state, uiCanvas);

      requestAnimationFrame(frame);
    }

    frame();
  } catch (err) {
    console.error(err);
    overlay.textContent = "WebGPU not supported on this device/browser.";
  }
}

start();
