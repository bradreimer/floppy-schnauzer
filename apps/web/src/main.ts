import { Game } from "./app";
import { initWebGPU } from "./engine/renderer";
import { frameTime } from "./game/frame";
import { drawUI } from "./platform/ui";

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

    // Main loop. frameTime caps the step, so a hidden tab doesn't jump the game ahead.
    let lastTime = performance.now();

    function frame(time: number) {
      const dt = frameTime(time, lastTime);
      lastTime = time;

      // Update game state and render
      game.update(dt);
      game.render();

      // Draw UI overlay (score, etc.)
      if (uiCanvas) {
        drawUI(game.state, uiCanvas);
      }

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  } catch (err) {
    console.error(err);
    overlay.textContent = "WebGPU not supported on this device/browser.";
  }
}

void start();
