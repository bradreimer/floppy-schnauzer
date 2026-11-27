import { AudioSystem } from "./audio";
import { setupInput } from "./input";
import { buildFrameSprites } from "./parallax";
import { createInitialState, updatePhysics, GameState } from "./physics";
import { createSpritePipeline, SpritePipeline } from "./sprites";
import { loadTextures } from "./textures";
import { JUMP_VELOCITY } from "./config";

export class Game {
  state: GameState;
  device: GPUDevice;
  context: GPUCanvasContext;
  format: GPUTextureFormat;
  canvas: HTMLCanvasElement;
  overlay: HTMLDivElement;

  pipeline!: SpritePipeline;
  audio!: AudioSystem;
  textures!: Record<string, GPUTexture>;

  lastTime: number | null = null;
  running = false;

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

    this.state = { ...createInitialState(), bestScore: 0 };
  }

  async init(): Promise<void> {
    this.pipeline = await createSpritePipeline(this.device, this.format);
    this.textures = await loadTextures(this.device);
    this.audio = new AudioSystem();

    setupInput(this.canvas, () => {
      if (!this.running) {
        this.state = {
          ...createInitialState(),
          bestScore: this.state.bestScore
        };
        this.running = true;
      }

      this.state = { ...this.state, birdVelY: JUMP_VELOCITY };
      this.audio.play("jump");
    });

    this.overlay.textContent = "Tap to start / jump";
  }

  update(dt: number): void {
    if (!this.running) return;

    const prevScore = this.state.score;

    this.state = updatePhysics(this.state, dt);

    if (this.state.score > this.state.bestScore) {
      this.state.bestScore = this.state.score;
    }

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

  render(): void {
    const sprites = buildFrameSprites(this.state);
    this.pipeline.renderFrame(this.context, sprites, this.textures);
  }
}
