export interface WebGPUInitResult {
  device: GPUDevice;
  context: GPUCanvasContext;
  format: GPUTextureFormat;
}

export async function initWebGPU(canvas: HTMLCanvasElement): Promise<WebGPUInitResult> {
  if (!("gpu" in navigator)) {
    throw new Error("WebGPU not supported");
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error("Failed to get GPU adapter");

  const device = await adapter.requestDevice();
  const context = canvas.getContext("webgpu") as GPUCanvasContext;
  const format = navigator.gpu.getPreferredCanvasFormat();

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    const max = device.limits.maxTextureDimension2D;

    const targetWidth = Math.floor(window.innerWidth * dpr);
    const targetHeight = Math.floor(window.innerHeight * dpr);

    canvas.width = Math.min(targetWidth, max);
    canvas.height = Math.min(targetHeight, max);

    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

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
