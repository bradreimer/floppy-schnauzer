import hit from "../assets/audio/hit.wav";
import jump from "../assets/audio/jump.wav";
import score from "../assets/audio/score.wav";

export class AudioSystem {
  private ctx: AudioContext;
  private buffers: Record<string, AudioBuffer> = {};

  constructor() {
    this.ctx = new AudioContext();

    this.load("jump", jump);
    this.load("score", score);
    this.load("hit", hit);
  }

  private async load(name: string, url: string) {
    try {
      const res = await fetch(url);
      const arr = await res.arrayBuffer();
      this.buffers[name] = await this.ctx.decodeAudioData(arr);
    } catch (err) {
      console.error(`AudioSystem: failed to load audio "${name}" from ${url}`);
    }
  }

  play(name: string) {
    const buf = this.buffers[name];
    if (!buf) return;

    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.connect(this.ctx.destination);
    src.start();
  }
}
