import hit from "../assets/audio/hit.wav";
import jump from "../assets/audio/jump.wav";
import score from "../assets/audio/score.wav";

/** The parts of AudioContext the game uses, so a test can pass a fake one. */
export type AudioContextLike = Pick<
  AudioContext,
  "state" | "resume" | "decodeAudioData" | "createBufferSource" | "destination"
>;

export class AudioSystem {
  private buffers: Record<string, AudioBuffer> = {};

  constructor(
    private readonly ctx: AudioContextLike = new AudioContext(),
    private readonly fetchFn: typeof fetch = (input, init) => fetch(input, init)
  ) {
    void this.load("jump", jump);
    void this.load("score", score);
    void this.load("hit", hit);
  }

  private async load(name: string, url: string) {
    try {
      const res = await this.fetchFn(url);
      if (!res.ok) {
        console.error(`AudioSystem: failed to load "${name}" from ${url}: HTTP ${res.status}`);
        return;
      }
      this.buffers[name] = await this.ctx.decodeAudioData(await res.arrayBuffer());
    } catch (err) {
      console.error(`AudioSystem: failed to load "${name}" from ${url}`, err);
    }
  }

  /**
   * Plays a loaded sound. Browsers start an AudioContext made before a user gesture as
   * "suspended", so the first call, which comes from a tap, resumes it.
   */
  play(name: string) {
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }

    const buf = this.buffers[name];
    if (!buf) return;

    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.connect(this.ctx.destination);
    src.start();
  }
}
