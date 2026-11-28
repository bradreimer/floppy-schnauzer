// Loads every sprite texture onto the GPU.

import sky from "../assets/sky.png";
import clouds from "../assets/clouds.png";
import hills from "../assets/hills.png";
import ground from "../assets/ground.png";
import pipeBottom from "../assets/pipe-bottom.png";
import pipeTop from "../assets/pipe-top.png";
import schnauzer from "../assets/schnauzer.png";

/** The URL of each texture's image, by the name sprites use. */
export const TEXTURE_URLS = {
  sky,
  clouds,
  hills,
  ground,
  pipeTop,
  pipeBottom,
  schnauzer
} as const;

/** Decodes one image and copies it into a new GPU texture. */
async function loadTexture(device: GPUDevice, url: string): Promise<GPUTexture> {
  const img = new Image();
  img.src = url;

  await img.decode();
  const bmp = await createImageBitmap(img);

  const tex = device.createTexture({
    size: [bmp.width, bmp.height, 1],
    format: "rgba8unorm",
    // copyExternalImageToTexture needs RENDER_ATTACHMENT as well as COPY_DST on its destination.
    usage:
      GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
  });

  device.queue.copyExternalImageToTexture({ source: bmp }, { texture: tex }, [
    bmp.width,
    bmp.height
  ]);

  return tex;
}

export type TextureName = keyof typeof TEXTURE_URLS;

/** Starts a load for every texture at once, and resolves when all have loaded. */
export async function loadAll<T>(
  load: (url: string) => Promise<T>
): Promise<Record<TextureName, T>> {
  const names = Object.keys(TEXTURE_URLS) as TextureName[];
  const loaded = await Promise.all(names.map(name => load(TEXTURE_URLS[name])));
  return Object.fromEntries(names.map((name, i) => [name, loaded[i]])) as Record<TextureName, T>;
}

/** Loads every sprite texture onto the GPU, in parallel. */
export function loadTextures(device: GPUDevice): Promise<Record<TextureName, GPUTexture>> {
  return loadAll(url => loadTexture(device, url));
}
