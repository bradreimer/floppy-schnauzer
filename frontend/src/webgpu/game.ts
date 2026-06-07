import { AudioSystem } from "./audio";
import { setupInput } from "./input";
import { buildFrameSprites } from "./parallax";
import { updateGame, GameState, createInitialState } from "./physics";
import { createSpritePipeline, SpritePipeline } from "./sprites";
import { loadTextures } from "./textures";

export class Game {
  private device: GPUDevice;
  private context: GPUCanvasContext;
  private format: GPUTextureFormat;
  private canvas: HTMLCanvasElement;
  private overlay: HTMLDivElement;

  private pipeline!: SpritePipeline;
  private audio!: AudioSystem;
  private textures!: Awaited<ReturnType<typeof loadTextures>>;
  private state: GameState;
  private lastTime: number | null = null;
  private running = false;

  constructor(
    device: GPUDevice,
    context: GPUCanvasContext,
    format: GPUTextureFormat,
    canvas: HTMLCanvasElement,
    overlay: HTMLDivElement
  ) {
    this.device = device;
    this.context = context;
    this.format = format;
    this.canvas = canvas;
    this.overlay = overlay;
    this.state = createInitialState();
  }

  async init() {
    this.pipeline = await createSpritePipeline(this.device, this.format, this.canvas);
    this.textures = await loadTextures(this.device);
    this.audio = new AudioSystem();

    setupInput(this.canvas, () => {
      if (!this.running) {
        this.state = createInitialState();
        this.running = true;
      }
      this.state = { ...this.state, birdVelY: -450 };
      this.audio.play("jump");
    });

    this.overlay.textContent = "Tap to start / jump";
  }

  start() {
    const loop = (time: number) => {
      if (this.lastTime == null) this.lastTime = time;
      const dt = Math.min((time - this.lastTime) / 1000, 0.033);
      this.lastTime = time;

      if (this.running) {
        const prevScore = this.state.score;
        this.state = updateGame(this.state, dt);
        if (this.state.score > prevScore) {
          this.audio.play("score");
        }
        if (this.state.gameOver && this.running) {
          this.running = false;
          this.audio.play("hit");
          this.overlay.textContent = `Game Over – Score: ${this.state.score} (best: ${this.state.bestScore}) – Tap to restart`;
        } else {
          this.overlay.textContent = `Score: ${this.state.score} (best: ${this.state.bestScore})`;
        }
      }

      const sprites = buildFrameSprites(this.state, this.textures);
      this.pipeline.renderFrame(this.context, sprites, this.textures);

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}
