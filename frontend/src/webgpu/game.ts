import { AudioSystem } from "./audio";
import { setupInput } from "./input";
import { buildFrameSprites } from "./parallax";
import { createInitialState, updatePhysics } from "./physics";
import { createSpritePipeline } from "./sprites";
import { loadTextures } from "./textures";
import { JUMP_VELOCITY } from "./config";

export class Game {
  state;
  device;
  context;
  format;
  canvas;
  overlay;
  pipeline;
  audio;
  textures;
  lastTime = null;
  running = false;

  constructor(device, context, format, canvas, overlay) {
    this.device = device;
    this.context = context;
    this.format = format;
    this.canvas = canvas;
    this.overlay = overlay;

    // Add bestScore tracking
    this.state = { ...createInitialState(), bestScore: 0 };
  }

  async init() {
    this.pipeline = await createSpritePipeline(this.device, this.format);
    this.textures = await loadTextures(this.device);
    this.audio = new AudioSystem();

    setupInput(this.canvas, () => {
      if (!this.running) {
        this.state = { ...createInitialState(), bestScore: this.state.bestScore };
        this.running = true;
      }

      this.state = { ...this.state, birdVelY: JUMP_VELOCITY };
      this.audio.play("jump");
    });

    this.overlay.textContent = "Tap to start / jump";
  }

  update(dt) {
    if (!this.running) return;

    const prevScore = this.state.score;

    this.state = updatePhysics(this.state, dt);

    // Update best score
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

  render() {
    const sprites = buildFrameSprites(this.state);
    this.pipeline.renderFrame(this.context, sprites, this.textures);
  }
}
