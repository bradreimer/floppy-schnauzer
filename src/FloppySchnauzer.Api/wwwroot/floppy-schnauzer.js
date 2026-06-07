const canvas = document.getElementById("game");
const overlay = document.getElementById("overlay");
if (!canvas || !overlay) {
    throw new Error("Missing required DOM elements: #game and #overlay");
}
const GAME_WIDTH = 400;
const GAME_HEIGHT = 700;
let device;
let context;
let format;
let pipeline;
let uniformBuffer;
let uniformBindGroup;
let renderPassDesc;
let audioCtx = null;
let birdX = 100;
let birdY = GAME_HEIGHT / 2;
let birdVelY = 0;
const GRAVITY = 1500;
const JUMP_VELOCITY = -450;
const PIPE_WIDTH = 70;
const PIPE_GAP = 170;
const PIPE_SPEED = 180;
let pipes = [];
let score = 0;
let bestScore = 0;
let running = false;
let lastTime = null;
let scrollSky = 0;
let scrollClouds = 0;
let scrollHills = 0;
let scrollGround = 0;
let rects = [];
async function initWebGPU() {
    if (!navigator.gpu) {
        overlay.textContent = "WebGPU not supported";
        throw new Error("WebGPU not supported");
    }
    const adapter = await navigator.gpu.requestAdapter();
    device = await adapter.requestDevice();
    context = canvas.getContext("webgpu");
    format = navigator.gpu.getPreferredCanvasFormat();
    resizeCanvas();
    context.configure({ device, format, alphaMode: "opaque" });
    const shaderModule = device.createShaderModule({
        code: `
      struct VertexIn {
        @location(0) pos : vec2<f32>,
        @location(1) color : vec4<f32>,
      };

      struct VertexOut {
        @builtin(position) pos : vec4<f32>,
        @location(0) color : vec4<f32>,
      };

      struct Globals {
        resolution : vec2<f32>,
      };
      @group(0) @binding(0) var<uniform> globals : Globals;

      @vertex
      fn vs_main(input : VertexIn) -> VertexOut {
        var out : VertexOut;
        let zeroToOne = input.pos / globals.resolution;
        let zeroToTwo = zeroToOne * 2.0;
        let clip = vec2<f32>(zeroToTwo.x - 1.0, 1.0 - zeroToTwo.y);
        out.pos = vec4<f32>(clip, 0.0, 1.0);
        out.color = input.color;
        return out;
      }

      @fragment
      fn fs_main(input : VertexOut) -> @location(0) vec4<f32> {
        return input.color;
      }
    `
    });
    pipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: {
            module: shaderModule,
            entryPoint: "vs_main",
            buffers: [
                {
                    arrayStride: 6 * 4,
                    attributes: [
                        { shaderLocation: 0, offset: 0, format: "float32x2" },
                        { shaderLocation: 1, offset: 8, format: "float32x4" }
                    ]
                }
            ]
        },
        fragment: {
            module: shaderModule,
            entryPoint: "fs_main",
            targets: [{ format }]
        },
        primitive: { topology: "triangle-list" }
    });
    uniformBuffer = device.createBuffer({
        size: 8,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    uniformBindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: uniformBuffer } }]
    });
    renderPassDesc = {
        colorAttachments: [
            {
                view: undefined,
                clearValue: { r: 0.08, g: 0.08, b: 0.12, a: 1.0 },
                loadOp: "clear",
                storeOp: "store"
            }
        ]
    };
    device.queue.writeBuffer(uniformBuffer, 0, new Float32Array([GAME_WIDTH, GAME_HEIGHT]));
}
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
}
window.addEventListener("resize", () => {
    resizeCanvas();
    if (context && device) {
        context.configure({ device, format, alphaMode: "opaque" });
    }
});
function ensureAudio() {
    if (!audioCtx) {
        const MaybeAudioContext = window.AudioContext ||
            window.webkitAudioContext;
        if (!MaybeAudioContext) {
            return;
        }
        audioCtx = new MaybeAudioContext();
    }
}
function tone(freq, durSeconds, gain = 0.03) {
    if (!audioCtx) {
        return;
    }
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    g.gain.value = gain;
    osc.connect(g);
    g.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + durSeconds);
}
function playJump() {
    tone(420, 0.07);
}
function playScore() {
    tone(740, 0.05);
}
function playHit() {
    tone(160, 0.15, 0.05);
}
function resetGame() {
    birdY = GAME_HEIGHT / 2;
    birdVelY = 0;
    pipes = [];
    score = 0;
    spawnInitialPipes();
    running = true;
    overlay.textContent = `Score: ${score} (best: ${bestScore})`;
}
function spawnInitialPipes() {
    let x = 400;
    for (let i = 0; i < 4; i += 1) {
        addPipe(x);
        x += 220;
    }
}
function addPipe(x) {
    const minTop = 80;
    const maxTop = GAME_HEIGHT - 80 - PIPE_GAP;
    const topHeight = minTop + Math.random() * (maxTop - minTop);
    pipes.push({ x, topHeight });
}
function rectIntersect(a, b) {
    return !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);
}
function gameOver() {
    running = false;
    playHit();
    overlay.textContent = `Game Over - Score: ${score} (best: ${bestScore}) - Tap to restart`;
}
function update(dt) {
    if (!running) {
        return;
    }
    birdVelY += GRAVITY * dt;
    birdY += birdVelY * dt;
    for (const p of pipes) {
        p.x -= PIPE_SPEED * dt;
    }
    if (pipes.length && pipes[0].x + PIPE_WIDTH < 0) {
        pipes.shift();
        addPipe(pipes[pipes.length - 1].x + 220);
        score += 1;
        if (score > bestScore) {
            bestScore = score;
        }
        overlay.textContent = `Score: ${score} (best: ${bestScore})`;
        playScore();
    }
    if (birdY > GAME_HEIGHT - 40 || birdY < 0) {
        gameOver();
    }
    const birdRect = { x: birdX - 20, y: birdY - 20, w: 40, h: 40 };
    for (const p of pipes) {
        const topRect = { x: p.x, y: 0, w: PIPE_WIDTH, h: p.topHeight };
        const bottomRect = {
            x: p.x,
            y: p.topHeight + PIPE_GAP,
            w: PIPE_WIDTH,
            h: GAME_HEIGHT - (p.topHeight + PIPE_GAP)
        };
        if (rectIntersect(birdRect, topRect) || rectIntersect(birdRect, bottomRect)) {
            gameOver();
            break;
        }
    }
    scrollSky = (scrollSky + 10 * dt) % GAME_WIDTH;
    scrollClouds = (scrollClouds + 20 * dt) % GAME_WIDTH;
    scrollHills = (scrollHills + 40 * dt) % GAME_WIDTH;
    scrollGround = (scrollGround + PIPE_SPEED * dt) % GAME_WIDTH;
}
function pushRect(x, y, w, h, color) {
    rects.push({ x, y, w, h, color });
}
function drawParallax() {
    pushRect(0, 0, GAME_WIDTH, GAME_HEIGHT, [0.35, 0.56, 0.88, 1.0]);
    const cloudsOffset = scrollClouds;
    for (let x = -GAME_WIDTH; x < GAME_WIDTH * 2; x += 120) {
        pushRect(x - cloudsOffset, 120 + ((x / 120) % 2) * 20, 80, 18, [0.92, 0.95, 1.0, 0.45]);
    }
    const hillsOffset = scrollHills;
    for (let x = -GAME_WIDTH; x < GAME_WIDTH * 2; x += 140) {
        pushRect(x - hillsOffset, GAME_HEIGHT - 210, 120, 80, [0.2, 0.58, 0.25, 1.0]);
    }
    const groundOffset = scrollGround;
    for (let x = -GAME_WIDTH; x < GAME_WIDTH * 2; x += 50) {
        pushRect(x - groundOffset, GAME_HEIGHT - 40, 44, 40, [0.52, 0.33, 0.16, 1.0]);
    }
}
function buildVertexBuffer() {
    const vertexCount = rects.length * 6;
    const data = new Float32Array(vertexCount * 6);
    let offset = 0;
    for (const r of rects) {
        const x1 = r.x;
        const y1 = r.y;
        const x2 = r.x + r.w;
        const y2 = r.y + r.h;
        const c = r.color;
        const verts = [
            [x1, y1],
            [x2, y1],
            [x2, y2],
            [x1, y1],
            [x2, y2],
            [x1, y2]
        ];
        for (const v of verts) {
            data[offset++] = v[0];
            data[offset++] = v[1];
            data[offset++] = c[0];
            data[offset++] = c[1];
            data[offset++] = c[2];
            data[offset++] = c[3];
        }
    }
    const buffer = device.createBuffer({
        size: data.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });
    device.queue.writeBuffer(buffer, 0, data);
    return { buffer, vertexCount };
}
function render() {
    rects = [];
    drawParallax();
    for (const p of pipes) {
        pushRect(p.x, 0, PIPE_WIDTH, p.topHeight, [0.12, 0.7, 0.2, 1.0]);
        pushRect(p.x, p.topHeight + PIPE_GAP, PIPE_WIDTH, GAME_HEIGHT - (p.topHeight + PIPE_GAP), [0.12, 0.7, 0.2, 1.0]);
    }
    pushRect(birdX - 20, birdY - 20, 40, 40, [0.95, 0.95, 0.1, 1.0]);
    pushRect(birdX + 10, birdY - 8, 8, 8, [0.08, 0.08, 0.08, 1.0]);
    const { buffer, vertexCount } = buildVertexBuffer();
    const encoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();
    renderPassDesc.colorAttachments[0].view = textureView;
    const pass = encoder.beginRenderPass(renderPassDesc);
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, uniformBindGroup);
    pass.setVertexBuffer(0, buffer);
    pass.draw(vertexCount, 1, 0, 0);
    pass.end();
    device.queue.submit([encoder.finish()]);
}
function jump() {
    if (!running) {
        resetGame();
    }
    birdVelY = JUMP_VELOCITY;
    playJump();
}
window.addEventListener("pointerdown", async (e) => {
    e.preventDefault();
    ensureAudio();
    if (audioCtx && audioCtx.state === "suspended") {
        await audioCtx.resume();
    }
    jump();
}, { passive: false });
function loop(timestamp) {
    if (lastTime === null) {
        lastTime = timestamp;
    }
    const dt = Math.min((timestamp - lastTime) / 1000, 0.033);
    lastTime = timestamp;
    update(dt);
    render();
    requestAnimationFrame(loop);
}
(async () => {
    await initWebGPU();
    spawnInitialPipes();
    overlay.textContent = "Tap to start / jump";
    requestAnimationFrame(loop);
})();
