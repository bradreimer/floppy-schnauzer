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
    throw new Error("WebGPU not supported");
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error("Failed to get GPU adapter");

  const device = await adapter.requestDevice();
  const context = canvas.getContext("webgpu");
  if (!context) throw new Error("Failed to get a WebGPU canvas context");
  const format = navigator.gpu.getPreferredCanvasFormat();

  context.configure({ device, format, alphaMode: "premultiplied" });

  return { device, context, format };
}
