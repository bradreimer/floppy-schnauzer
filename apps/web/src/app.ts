import { createSpritePipeline, type SpritePipeline } from "./engine/sprites";
import { loadTextures, type TextureName } from "./engine/textures";
import { advance, createRound, pressFlap, type Round, type RoundEvent } from "./game/round";
import { AudioSystem } from "./platform/audio";
import { browserStorage, loadBestScore, saveBestScore } from "./platform/best-score";
import { setupInput } from "./platform/input";
import { describeScreen, type Screen } from "./platform/screens";
import { buildFrameSprites } from "./scene/parallax";

/**
 * Wires the pure round rules to the browser: input calls pressFlap, each frame calls advance, and
 * the events they return become sounds and a saved best score. See ADR-004.
 */
export class Game {
  private round: Round = createRound(loadBestScore(browserStorage()));
  private pipeline!: SpritePipeline;
  private textures!: Record<TextureName, GPUTexture>;
  private audio!: AudioSystem;

  constructor(
    private readonly device: GPUDevice,
    private readonly context: GPUCanvasContext,
    private readonly format: GPUTextureFormat,
    private readonly canvas: HTMLCanvasElement
  ) {}

  async init(): Promise<void> {
    this.pipeline = createSpritePipeline(this.device, this.format);
    this.textures = await loadTextures(this.device);
    this.audio = new AudioSystem();

    setupInput(this.canvas, () => {
      const step = pressFlap(this.round);
      this.round = step.round;
      this.apply(step.events);
    });
  }

  update(dt: number): void {
    const step = advance(this.round, dt);
    this.round = step.round;
    this.apply(step.events);
  }

  /** What the UI canvas should show this frame. */
  screen(): Screen {
    return describeScreen(this.round);
  }

  render(): void {
    const sprites = buildFrameSprites(this.round.game);
    this.pipeline.renderFrame(this.context, sprites, this.textures);
  }

  private apply(events: RoundEvent[]): void {
    for (const event of events) {
      if (event === "saveBest") saveBestScore(browserStorage(), this.round.game.bestScore);
      else this.audio.play(event);
    }
  }
}
