import { AudioSystem } from "./platform/audio";
import { browserStorage, loadBestScore, saveBestScore } from "./platform/best-score";
import { setupInput } from "./platform/input";
import { describeScreen, type Screen } from "./platform/screens";
import { buildFrameSprites } from "./scene/parallax";
import { createInitialState, updatePhysics, type GameState } from "./game/physics";
import { createSpritePipeline, type SpritePipeline } from "./engine/sprites";
import { loadTextures } from "./engine/textures";
import { JUMP_VELOCITY } from "./game/config";

export class Game {
  state: GameState;
  device: GPUDevice;
  context: GPUCanvasContext;
  format: GPUTextureFormat;
  canvas: HTMLCanvasElement;

  pipeline!: SpritePipeline;
  audio!: AudioSystem;
  textures!: Record<string, GPUTexture>;

  lastTime: number | null = null;
  running = false;
  /** True once the first round has started, so the start screen gives way to the game. */
  started = false;
  /** The best score when the current round began, to tell whether the round set a new best. */
  bestAtRoundStart = 0;

  constructor(
    device: GPUDevice,
    context: GPUCanvasContext,
    format: GPUTextureFormat,
    canvas: HTMLCanvasElement
  ) {
    this.device = device;
    this.context = context;
    this.format = format;
    this.canvas = canvas;

    this.state = { ...createInitialState(), bestScore: loadBestScore(browserStorage()) };
  }

  async init(): Promise<void> {
    this.pipeline = createSpritePipeline(this.device, this.format);
    this.textures = await loadTextures(this.device);
    this.audio = new AudioSystem();

    setupInput(this.canvas, () => {
      if (!this.running) {
        this.state = {
          ...createInitialState(),
          bestScore: this.state.bestScore
        };
        this.running = true;
        this.started = true;
        this.bestAtRoundStart = this.state.bestScore;
      }

      this.state = { ...this.state, birdVelY: JUMP_VELOCITY };
      this.audio.play("jump");
    });
  }

  update(dt: number): void {
    if (!this.running) return;

    const prevScore = this.state.score;

    this.state = updatePhysics(this.state, dt);

    if (this.state.score > prevScore) {
      this.audio.play("score");
    }

    if (this.state.gameOver && this.running) {
      this.running = false;
      this.audio.play("hit");
      if (this.state.bestScore > this.bestAtRoundStart) {
        saveBestScore(browserStorage(), this.state.bestScore);
      }
    }
  }

  /** What the UI canvas should show this frame. */
  screen(): Screen {
    return describeScreen(this.state, {
      started: this.started,
      bestAtRoundStart: this.bestAtRoundStart
    });
  }

  render(): void {
    const sprites = buildFrameSprites(this.state);
    this.pipeline.renderFrame(this.context, sprites, this.textures);
  }
}
