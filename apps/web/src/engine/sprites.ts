import type { TextureName } from "./textures";
import {
  FLOATS_PER_SPRITE,
  FLOATS_PER_VERTEX,
  type SpriteQuad,
  VERTICES_PER_SPRITE,
  writeSpriteVertices
} from "./vertices";

export interface Sprite extends SpriteQuad {
  /** A key of TEXTURE_URLS, so a misspelled name fails the type check. */
  texture: TextureName;
  z?: number;
}

/** Room for this many sprites before the vertex buffer has to grow. A frame uses about 20. */
const INITIAL_SPRITE_CAPACITY = 64;

export interface SpritePipeline {
  renderFrame(
    _context: GPUCanvasContext,
    _sprites: Sprite[],
    _textures: Record<TextureName, GPUTexture>
  ): void;
}

export function createSpritePipeline(device: GPUDevice, format: GPUTextureFormat): SpritePipeline {
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
          arrayStride: FLOATS_PER_VERTEX * Float32Array.BYTES_PER_ELEMENT,
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
      targets: [
        {
          format,
          blend: {
            color: {
              srcFactor: "src-alpha",
              dstFactor: "one-minus-src-alpha"
            },
            alpha: {
              srcFactor: "one",
              dstFactor: "one-minus-src-alpha"
            }
          }
        }
      ]
    },
    primitive: { topology: "triangle-list" }
  });

  // Created once and reused every frame. The buffer doubles when a frame has more sprites.
  let capacity = INITIAL_SPRITE_CAPACITY;
  let vertices = new Float32Array(capacity * FLOATS_PER_SPRITE);
  let vertexBuffer = createVertexBuffer(capacity);
  const bindGroups = new WeakMap<GPUTexture, GPUBindGroup>();

  function createVertexBuffer(sprites: number): GPUBuffer {
    return device.createBuffer({
      size: sprites * FLOATS_PER_SPRITE * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });
  }

  function ensureCapacity(sprites: number) {
    if (sprites <= capacity) return;
    while (capacity < sprites) capacity *= 2;
    vertexBuffer.destroy();
    vertexBuffer = createVertexBuffer(capacity);
    vertices = new Float32Array(capacity * FLOATS_PER_SPRITE);
  }

  function bindGroupFor(texture: GPUTexture): GPUBindGroup {
    let group = bindGroups.get(texture);
    if (!group) {
      group = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: sampler },
          { binding: 1, resource: texture.createView() }
        ]
      });
      bindGroups.set(texture, group);
    }
    return group;
  }

  return {
    renderFrame(context, sprites, textures) {
      // Back to front. Every texture name has a loaded texture, so no sprite is skipped.
      const drawn = sprites
        .map(sprite => ({ sprite, texture: textures[sprite.texture] }))
        .sort((a, b) => (a.sprite.z ?? 0) - (b.sprite.z ?? 0));

      ensureCapacity(drawn.length);
      const floats = writeSpriteVertices(
        drawn.map(d => d.sprite),
        vertices
      );
      device.queue.writeBuffer(vertexBuffer, 0, vertices, 0, floats);

      const encoder = device.createCommandEncoder();
      const pass = encoder.beginRenderPass({
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            clearValue: { r: 0.4, g: 0.7, b: 1.0, a: 1 }, // sky blue
            loadOp: "clear",
            storeOp: "store"
          }
        ]
      });

      pass.setPipeline(pipeline);
      pass.setVertexBuffer(0, vertexBuffer);
      drawn.forEach((d, index) => {
        pass.setBindGroup(0, bindGroupFor(d.texture));
        pass.draw(VERTICES_PER_SPRITE, 1, index * VERTICES_PER_SPRITE);
      });

      pass.end();
      device.queue.submit([encoder.finish()]);
    }
  };
}
