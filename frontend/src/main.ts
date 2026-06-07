import { initWebGPU } from "./webgpu/renderer";
import { Game } from "./webgpu/game";

async function start() {
  const canvas = document.getElementById("game") as HTMLCanvasElement | null;
  const overlay = document.getElementById("overlay") as HTMLDivElement | null;

  if (!canvas || !overlay) {
    console.error("Missing canvas or overlay element");
    return;
  }

  try {
    const { device, context, format } = await initWebGPU(canvas);
    const game = new Game(device, context, format, canvas, overlay);
    await game.init();
    game.start();
  } catch (err) {
    console.error(err);
    if (overlay) {
      overlay.textContent = "WebGPU not supported on this device/browser.";
    }
  }
}

start();
