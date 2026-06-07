export async function loadTextures(device: GPUDevice) {
  async function load(url: string) {
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

  return {
    sky: await load("/assets/backgrounds/sky.png"),
    clouds: await load("/assets/backgrounds/clouds.png"),
    hills: await load("/assets/backgrounds/hills.png"),
    ground: await load("/assets/backgrounds/ground.png"),
    pipeTop: await load("/assets/pipes/pipe_top.png"),
    pipeBottom: await load("/assets/pipes/pipe_bottom.png"),
    schnauzer: await load("/assets/schnauzer/floppy_schnauzer_sheet.png")
  };
}
