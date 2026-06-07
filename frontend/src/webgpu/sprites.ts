export interface Sprite {
  texture: string;
  x: number;
  y: number;
  w: number;
  h: number;
  u0: number;
  v0: number;
  u1: number;
  v1: number;
}

export interface SpritePipeline {
  renderFrame(
    context: GPUCanvasContext,
    sprites: Sprite[],
    textures: Record<string, GPUTexture>
  ): void;
}

export async function createSpritePipeline(
  device: GPUDevice,
  format: GPUTextureFormat,
  canvas: HTMLCanvasElement
): Promise<SpritePipeline> {
  const shader = device.createShaderModule({
    code: `
      struct VertexIn {
        @location(0) pos: vec2<f32>,
        @location(1) uv: vec2<f32>,
      };

      struct VertexOut {
        @builtin(position) pos: vec4<f32>,
        @location(0) uv: vec2<f32>,
      };

      @group(0) @binding(0) var samp: sampler;
      @group(0) @binding(1) var tex: texture_2d<f32>;

      @vertex
      fn vs_main(input: VertexIn) -> VertexOut {
        var out: VertexOut;
        out.pos = vec4<f32>(input.pos, 0.0, 1.0);
        out.uv = input.uv;
        return out;
      }

      @fragment
      fn fs_main(input: VertexOut) -> @location(0) vec4<f32> {
        return textureSample(tex, samp, input.uv);
      }
    `
  });

  const sampler = device.createSampler({
    magFilter: "linear",
    minFilter: "linear"
  });

  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: {
      module: shader,
      entryPoint: "vs_main",
      buffers: [
        {
          arrayStride: 16,
          attributes: [
            { shaderLocation: 0, offset: 0, format: "float32x2" },
            { shaderLocation: 1, offset: 8, format: "float32x2" }
          ]
        }
      ]
    },
    fragment: {
      module: shader,
      entryPoint: "fs_main",
      targets: [{ format }]
    },
    primitive: { topology: "triangle-list" }
  });

  return {
    renderFrame(context, sprites, textures) {
      const encoder = device.createCommandEncoder();
      const pass = encoder.beginRenderPass({
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            loadOp: "clear",
            storeOp: "store"
          }
        ]
      });

      for (const sprite of sprites) {
        const tex = textures[sprite.texture];
        const bindGroup = device.createBindGroup({
          layout: pipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: sampler },
            { binding: 1, resource: tex.createView() }
          ]
        });

        const verts = new Float32Array([
          sprite.x,
          sprite.y,
          sprite.u0,
          sprite.v0,
          sprite.x + sprite.w,
          sprite.y,
          sprite.u1,
          sprite.v0,
          sprite.x + sprite.w,
          sprite.y + sprite.h,
          sprite.u1,
          sprite.v1,
          sprite.x,
          sprite.y,
          sprite.u0,
          sprite.v0,
          sprite.x + sprite.w,
          sprite.y + sprite.h,
          sprite.u1,
          sprite.v1,
          sprite.x,
          sprite.y + sprite.h,
          sprite.u0,
          sprite.v1
        ]);

        const buffer = device.createBuffer({
          size: verts.byteLength,
          usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });
        device.queue.writeBuffer(buffer, 0, verts);

        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.setVertexBuffer(0, buffer);
        pass.draw(6);
      }

      pass.end();
      device.queue.submit([encoder.finish()]);
    }
  };
}
