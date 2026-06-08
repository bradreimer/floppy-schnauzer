// frontend/src/game/textures.ts

import sky from "../assets/bg-layer-1.png";
import clouds from "../assets/bg-layer-2.png";
import hills from "../assets/bg-layer-2.png";
import ground from "../assets/ground.png";
import pipeBottom from "../assets/pipe-bottom.png";
import pipeTop from "../assets/pipe-top.png";
import schnauzer from "../assets/schnauzer-idle.png";

async function loadTexture(device: GPUDevice, url: string) {
  const img = new Image();
  img.src = url;

  await img.decode();
  const bmp = await createImageBitmap(img);

  const tex = device.createTexture({
    size: [bmp.width, bmp.height, 1],
    format: "rgba8unorm",
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT
  });

  device.queue.copyExternalImageToTexture(
    { source: bmp },
    { texture: tex },
    [bmp.width, bmp.height]
  );

  return tex;
}

export async function loadTextures(device: GPUDevice) {
  return {
    sky: await loadTexture(device, sky),
    clouds: await loadTexture(device, clouds),
    hills: await loadTexture(device, hills),
    ground: await loadTexture(device, ground),

    pipeTop: await loadTexture(device, pipeTop),
    pipeBottom: await loadTexture(device, pipeBottom),

    schnauzer: await loadTexture(device, schnauzer)
  };
}
