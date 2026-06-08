export interface WebGPUInitResult {
  device: GPUDevice;
  context: GPUCanvasContext;
  format: GPUTextureFormat;
}

import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, ASPECT_RATIO } from "./config";

export async function initWebGPU(canvas: HTMLCanvasElement): Promise<WebGPUInitResult> {
  if (!("gpu" in navigator)) {
    throw new Error("WebGPU not supported");
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error("Failed to get GPU adapter");

  const device = await adapter.requestDevice();
  const context = canvas.getContext("webgpu") as GPUCanvasContext;
  const format = navigator.gpu.getPreferredCanvasFormat();

  const uiCanvas = document.getElementById("ui") as HTMLCanvasElement | null;
  if (!uiCanvas) {
    console.warn("UI canvas (#ui) not found — UI overlay will not render");
  }

  const resize = () => {
    //
    // 1. Internal resolution stays fixed (virtual resolution)
    //
    canvas.width = VIRTUAL_WIDTH;
    canvas.height = VIRTUAL_HEIGHT;

    if (uiCanvas) {
      uiCanvas.width = VIRTUAL_WIDTH;
      uiCanvas.height = VIRTUAL_HEIGHT;
    }

    //
    // 2. Maintain 4:7 aspect ratio when scaling to window size
    //
    const windowRatio = window.innerWidth / window.innerHeight;
    const targetRatio = ASPECT_RATIO;

    let displayWidth: number;
    let displayHeight: number;

    if (windowRatio > targetRatio) {
      // Window is too wide → pillarbox
      displayHeight = window.innerHeight;
      displayWidth = displayHeight * targetRatio;
    } else {
      // Window is too tall → letterbox
      displayWidth = window.innerWidth;
      displayHeight = displayWidth / targetRatio;
    }

    //
    // 3. Apply CSS scaling to both canvases
    //
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    canvas.style.marginLeft = `${(window.innerWidth - displayWidth) / 2}px`;
    canvas.style.marginTop = `${(window.innerHeight - displayHeight) / 2}px`;
    canvas.style.position = "absolute";
    canvas.style.left = "0";
    canvas.style.top = "0";

    if (uiCanvas) {
      uiCanvas.style.width = canvas.style.width;
      uiCanvas.style.height = canvas.style.height;
      uiCanvas.style.marginLeft = canvas.style.marginLeft;
      uiCanvas.style.marginTop = canvas.style.marginTop;
      uiCanvas.style.position = "absolute";
      uiCanvas.style.left = "0";
      uiCanvas.style.top = "0";
      uiCanvas.style.pointerEvents = "none"; // UI should not block input
    }

    //
    // 4. Configure WebGPU context
    //
    context.configure({
      device,
      format,
      alphaMode: "opaque"
    });
  };

  resize();
  window.addEventListener("resize", resize);

  return { device, context, format };
}
