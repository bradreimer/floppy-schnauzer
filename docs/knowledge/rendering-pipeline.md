# Rendering pipeline

This document describes how one frame of Floppy Schnauzer goes from a tap to pixels on the
screen. It was read from the code on 2026-11-27. The rules themselves are in the
[gameplay spec](../specs/gameplay.md).

Think of each frame as a stage play that's reset and performed again 60 times a second. The rules
decide where everyone stands, the scene writes the cast list, and the renderer puts each actor
on stage, back row first.

## One frame

```text
requestAnimationFrame(time)                                    main.ts
  │  dt = (time − lastTime) / 1000
  ▼
Game.update(dt)                                                app.ts
  │  state = updatePhysics(state, dt)                          game/physics.ts
  │  play score.wav or hit.wav when the state says so          platform/audio.ts
  ▼
Game.render()                                                  app.ts
  │  sprites = buildFrameSprites(state)                        scene/parallax.ts
  │  pipeline.renderFrame(context, sprites, textures)          engine/sprites.ts
  ▼
ui.draw(game.screen())                                         platform/ui.ts
     describeScreen picks ready, playing, or game over         platform/screens.ts
     GameUI draws it on the 2D canvas
```

A tap reaches `setupInput` in `platform/input.ts`, which calls back into `Game`. The callback
starts a round if none is running, sets the vertical speed to the jump speed, and plays
`jump.wav`.

## Three layers on the page

`index.html` stacks three elements, all 400 × 700 virtual pixels and scaled by CSS
([ADR-003](../adr/ADR-003-a-fixed-virtual-resolution.md)). `layOutCanvases` in
`platform/layout.ts` places both canvases on the rectangle that `fitToWindow` returns, at start-up
and on every window resize. `initWebGPU` configures the WebGPU context once; a resize doesn't
change it.

| z-index | Element | Drawn by | Takes taps |
| --- | --- | --- | --- |
| 1 | `<canvas id="game">` | WebGPU | Yes |
| 2 | `<canvas id="ui">` | 2D canvas | No (`pointer-events: none`) |
| 3 | `<div id="overlay">` | Only the "WebGPU not supported" message | No |

## The scene: state to sprites

`buildFrameSprites` returns a list of sprites. Each sprite names a texture, a rectangle in
virtual pixels, a texture rectangle (`u0`, `v0`, `u1`, `v1`), and a depth `z`.

| z | What |
| --- | --- |
| 0 | Sky, repeated across the screen |
| 1 | Clouds |
| 2 | Hills |
| 3 | Ground |
| 4 | Pipes: a top and a bottom sprite for each pipe |
| 5 | The schnauzer: one 64 × 64 frame of `schnauzer.png` |

`buildFrameSprites` only reads the state. Each background layer's offset is the state's `scrollX`
times the layer's parallax share, so the same state always gives the same sprites.

## The sprite pipeline

`createSpritePipeline` in `engine/sprites.ts` builds one WebGPU render pipeline:

- One WGSL shader. The vertex stage passes the position and texture coordinate through. The
  fragment stage samples the texture.
- A linear sampler, so scaled art is smoothed.
- Alpha blending: source alpha over one minus source alpha.
- A vertex is 4 floats: x and y in clip space, then u and v.

It also creates, once, a vertex buffer with room for 64 sprites, and caches one bind group per
texture the first time the texture is drawn. The vector math lives in `engine/vertices.ts` as pure
functions, tested without a GPU.

Each frame, `renderFrame`:

1. Drops sprites whose texture hasn't loaded, and sorts the rest by `z`, back to front.
2. Writes every sprite's 6 vertices (2 triangles) into one `Float32Array`, converting virtual
   pixels to clip space, and copies it to the vertex buffer with one `writeBuffer`. If a frame has
   more sprites than the buffer holds, the buffer doubles.
3. Clears the screen to sky blue (0.4, 0.7, 1.0), sets the pipeline and vertex buffer once, and
   draws each sprite as a range of the buffer: `draw(6, 1, index * 6)`, with its texture's bind
   group.
4. Submits the command buffer.

Over 167 frames in headless Chromium on 2026-11-27, this made 1 buffer and 5 bind groups. Before
[#9](https://github.com/bradreimer/floppy-schnauzer/issues/9), it made a new buffer and bind group
for every sprite in every frame: 2,833 of each.

## Textures

`engine/textures.ts` imports each PNG through Vite, decodes it with `createImageBitmap`, and
copies it into an `rgba8unorm` texture. `loadAll` starts all 7 loads at once with `Promise.all`,
and the first frame waits until every texture has loaded. `TextureName` is the type of the names
sprites use.
