import hitPlaceholder from "../assets/audio/hit.wav";
import jumpPlaceholder from "../assets/audio/jump.wav";
import scorePlaceholder from "../assets/audio/score.wav";

export class AudioSystem {
  private ctx: AudioContext;
  private buffers: Record<string, AudioBuffer> = {};

  constructor() {
    this.ctx = new AudioContext();

    const isDev = import.meta.env.DEV;

    this.load("jump", isDev ? jumpPlaceholder : "/assets/audio/jump.wav");
    this.load("score", isDev ? scorePlaceholder : "/assets/audio/score.wav");
    this.load("hit", isDev ? hitPlaceholder : "/assets/audio/hit.wav");
  }

  private async load(name: string, url: string) {
    const res = await fetch(url);
    const arr = await res.arrayBuffer();
    this.buffers[name] = await this.ctx.decodeAudioData(arr);
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
