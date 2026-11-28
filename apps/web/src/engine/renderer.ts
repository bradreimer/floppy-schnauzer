/**
 * Thrown when this browser or device can't run WebGPU: no navigator.gpu, no adapter, or no WebGPU
 * canvas context. main.ts tells the player so, instead of a generic loading error.
 */
export class WebGPUUnavailableError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = "WebGPUUnavailableError";
  }
}

export interface WebGPUInitResult {
  device: GPUDevice;
  context: GPUCanvasContext;
  format: GPUTextureFormat;
}

/**
 * Gets a GPU device and configures the canvas for WebGPU, once. The canvas's size and layout on
 * the page are set by platform/layout.ts, and never change the WebGPU configuration.
 */
export async function initWebGPU(canvas: HTMLCanvasElement): Promise<WebGPUInitResult> {
  if (!("gpu" in navigator)) {
    throw new WebGPUUnavailableError("WebGPU not supported");
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new WebGPUUnavailableError("Failed to get GPU adapter");

  const device = await adapter.requestDevice();
  const context = canvas.getContext("webgpu");
  if (!context) throw new WebGPUUnavailableError("Failed to get a WebGPU canvas context");
  const format = navigator.gpu.getPreferredCanvasFormat();

  context.configure({ device, format, alphaMode: "premultiplied" });

  return { device, context, format };
}
