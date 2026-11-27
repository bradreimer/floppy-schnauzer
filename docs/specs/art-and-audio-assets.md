# Art and audio assets

Tracking issue: [#4](https://github.com/bradreimer/floppy-schnauzer/issues/4).

## Purpose

This spec lists every sprite and sound the game ships, with its file name, size, and use, so the
maintainer can regenerate or replace an asset without guessing what the game expects. It replaces
`frontend/expected-assets.md`, whose file names no longer matched the files.

## User story

As the maintainer, I want one list of every sprite and sound, with its file name, size, and the
prompt that made it, so that I can regenerate or replace an asset without guessing what the game
expects.

## Goals

- Every file in `apps/web/src/assets/` is in the table below, and every row has a file. A test in
  `tests/organization/` checks both ways.
- Each row says how the game uses the asset, so an unused asset is easy to spot.

## Non-goals

- Making new art or sound.
- Choosing an art style. The prompts record the style the current art was made with.

## Requirements

### The asset table

The first column is the path inside `apps/web/src/assets/`. Sizes are the file's own size in
pixels. "Drawn at" is the size on the 400 × 700 virtual screen.

| File | Size | Transparent | Drawn at | Use |
| --- | --- | --- | --- | --- |
| `schnauzer.png` | 256 × 64 | Yes | 64 × 64 | The player: 4 frames of 64 × 64, side by side |
| `pipe-top.png` | 70 × 179 | Yes | 70 × top of gap | The top part of a pipe, stretched to the gap |
| `pipe-bottom.png` | 70 × 179 | Yes | 70 × below the gap | The bottom part of a pipe, stretched to the floor |
| `sky.png` | 400 × 700 | No | 400 × 700 | The back parallax layer |
| `clouds.png` | 400 × 650 | Yes | 400 × 650 | The second parallax layer |
| `hills.png` | 400 × 550 | Yes | 400 × 550 | The third parallax layer |
| `ground.png` | 5856 × 704 | No | 400 × 80 | The front parallax layer |
| `logo.png` | 624 × 416 | No | 320 × 213 | The start screen's title card: white art on a solid dark background, drawn with rounded corners |
| `audio/jump.wav` | 0.1 s, 44.1 kHz, mono | | | Plays on each flap |
| `audio/score.wav` | 0.1 s, 44.1 kHz, mono | | | Plays when the score goes up |
| `audio/hit.wav` | 0.1 s, 44.1 kHz, mono | | | Plays at game over |

### Prompts

These prompts made the first versions of the sprites. Use them to regenerate an asset in the same
style.

| File | Prompt |
| --- | --- |
| `schnauzer.png` | "64×64 pixel art schnauzer in side view, flying pose, 4-frame animation, transparent background" |
| `pipe-top.png` | "Flappy-Bird-style green pipe top segment, 70px wide, seamless vertical tiling, transparent background" |
| `pipe-bottom.png` | "Flappy-Bird-style green pipe bottom segment, 70px wide, seamless vertical tiling, transparent background" |
| `sky.png` | "400×700 sky gradient background, soft blue tones, no transparency" |
| `clouds.png` | "400×650 parallax cloud layer, soft white clouds, transparent background" |
| `hills.png` | "400×550 rolling green hills, simple parallax style, transparent background" |
| `ground.png` | "400×80 ground texture with grass top and dirt below, no transparency" |

### Adding or changing an asset

- Name the file in lowercase with hyphens.
- Add or update its row in the asset table in the same commit.
- Import it in the module that uses it, so Vite fingerprints it in the build.

## Acceptance criteria

- The organization test for assets passes: the table and the folder match.
- Every asset the code imports is in the table with a use other than "Not used".

## Open questions

1. `ground.png` is 5856 × 704 and about 4 MB, but it's drawn at 400 × 80. Should it be resized to
   400 × 80, or 800 × 160 for sharp screens? That would cut the download by almost all of its
   size.
2. Answered by [#17](https://github.com/bradreimer/floppy-schnauzer/issues/17): `logo.png` is the
   start screen's title card. `score-panel.png` was removed, because its placeholder numbers were
   part of the art; the [screens spec](screens.md) draws the panel in code instead.
3. The prompts for `logo.png` and the sounds weren't recorded.
