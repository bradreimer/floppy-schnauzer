// frontend/src/game/textures.ts

import skyPlaceholder from "../assets/bg-layer-1.png";
import cloudsPlaceholder from "../assets/bg-layer-2.png";
import hillsPlaceholder from "../assets/bg-layer-2.png";
import groundPlaceholder from "../assets/ground.png";
import pipeBottomPlaceholder from "../assets/pipe-bottom.png";
import pipeTopPlaceholder from "../assets/pipe-top.png";
import schnauzerPlaceholder from "../assets/schnauzer-idle.png";

async function loadTexture(device: GPUDevice, url: string, fallback: string) {
  const img = new Image();

  // If running under Vite dev server, use fallback
  const isDev = import.meta.env.DEV;
  img.src = isDev ? fallback : url;

  try {
    await img.decode();
  } catch {
    // If decode fails, force fallback
    img.src = fallback;
    await img.decode();
  }

  const bmp = await createImageBitmap(img);

  const tex = device.createTexture({
    size: [bmp.width, bmp.height, 1],
    format: "rgba8unorm",
    usage:
      GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
  });

  device.queue.copyExternalImageToTexture({ source: bmp }, { texture: tex }, [
    bmp.width,
    bmp.height
  ]);

  return tex;
}

export async function loadTextures(device: GPUDevice) {
  return {
    sky: await loadTexture(device, "/assets/backgrounds/sky.png", skyPlaceholder),
    clouds: await loadTexture(device, "/assets/backgrounds/clouds.png", cloudsPlaceholder),
    hills: await loadTexture(device, "/assets/backgrounds/hills.png", hillsPlaceholder),
    ground: await loadTexture(device, "/assets/backgrounds/ground.png", groundPlaceholder),
    pipeTop: await loadTexture(device, "/assets/pipes/pipe_top.png", pipeTopPlaceholder),
    pipeBottom: await loadTexture(device, "/assets/pipes/pipe_bottom.png", pipeBottomPlaceholder),
    schnauzer: await loadTexture(
      device,
      "/assets/schnauzer/floppy_schnauzer_sheet.png",
      schnauzerPlaceholder
    )
  };
}
