# Knowledge

Knowledge documents are reference material: how things are, what we learned, and facts the
project depends on. Examples are how a frame is drawn, and how to run the game while you develop
it.

A knowledge document describes. It doesn't decide and it doesn't promise:

- If it records why a choice was made, it's an [ADR](../adr/README.md).
- If it states what a capability must do, it's a [spec](../specs/README.md).
- If it's work to do, it's a [GitHub Issue](https://github.com/bradreimer/floppy-schnauzer/issues).

## Rules

- One topic per file, named `short-title.md` in lowercase with hyphens.
- Images live in `images/`. Every image is used by at least one document.
- Say where the knowledge came from and when, so a reader can judge how current it is.
- List every document in the index below.

## Index

| Document | What it covers | Source |
| --- | --- | --- |
| [rendering-pipeline.md](rendering-pipeline.md) | How one frame goes from a tap to pixels: the loop, the rules, the scene, and the WebGPU sprite pipeline | Read from the code on 2026-11-27 |
| [web-app-development.md](web-app-development.md) | How to run, test, and change the game, and the Vite and TypeScript settings that matter | Written with the quality gates, #2, on 2026-11-27 |
