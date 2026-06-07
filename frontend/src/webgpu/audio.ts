export class AudioSystem {
  private ctx: AudioContext;
  private buffers: Record<string, AudioBuffer> = {};

  constructor() {
    this.ctx = new AudioContext();
    this.load("jump", "/assets/audio/jump.wav");
    this.load("score", "/assets/audio/score.wav");
    this.load("hit", "/assets/audio/hit.wav");
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
