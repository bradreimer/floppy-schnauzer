import { describe, expect, it, vi } from "vitest";

import { type AudioContextLike, AudioSystem } from "./audio";

function fakeContext(state: AudioContextState) {
  const source = { buffer: null, connect: vi.fn(), start: vi.fn() };
  const ctx = {
    state,
    destination: {},
    resume: vi.fn(() => {
      ctx.state = "running";
      return Promise.resolve();
    }),
    decodeAudioData: vi.fn(() => Promise.resolve({} as AudioBuffer)),
    createBufferSource: vi.fn(() => source)
  };
  return { ctx, source };
}

const okFetch = () =>
  Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)) } as Response);

async function loaded(ctx: unknown) {
  const audio = new AudioSystem(ctx as AudioContextLike, okFetch);
  await vi.waitFor(() =>
    expect((ctx as AudioContextLike).decodeAudioData).toHaveBeenCalledTimes(3)
  );
  await Promise.resolve();
  return audio;
}

describe("AudioSystem", () => {
  it("resumes a suspended context on the first play, once", async () => {
    // Regression test for #10: the context stayed suspended, so sound could stay muted.
    const { ctx, source } = fakeContext("suspended");
    const audio = await loaded(ctx);

    audio.play("jump");
    audio.play("jump");

    expect(ctx.resume).toHaveBeenCalledTimes(1);
    expect(source.start).toHaveBeenCalledTimes(2);
  });

  it("doesn't resume a context that is already running", async () => {
    const { ctx } = fakeContext("running");
    const audio = await loaded(ctx);

    audio.play("jump");

    expect(ctx.resume).not.toHaveBeenCalled();
  });

  it("logs the HTTP status when a sound fails to load", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { ctx } = fakeContext("running");
    const notFound = () => Promise.resolve({ ok: false, status: 404 } as Response);

    new AudioSystem(ctx as unknown as AudioContextLike, notFound);

    await vi.waitFor(() => expect(error).toHaveBeenCalledTimes(3));
    expect(String(error.mock.calls[0]?.[0])).toContain("HTTP 404");
    error.mockRestore();
  });
});
