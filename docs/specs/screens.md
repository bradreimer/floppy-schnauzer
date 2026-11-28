# Screens

Tracking issue: [#17](https://github.com/bradreimer/floppy-schnauzer/issues/17).

## Purpose

This spec defines what the 2D UI canvas shows over the game: a start screen with the logo, the
score while you play, and a game-over panel with your score and best. The rules of play are in the
[gameplay spec](gameplay.md).

Think of the UI canvas as a sheet of glass in front of the stage. The game draws the world behind
it with WebGPU; the glass shows the words, and one of three cards at a time.

```text
   page load                 tap / Space                round ends
 ┌───────────┐            ┌───────────┐            ┌─────────────┐
 │   READY   │ ─────────▶ │  PLAYING  │ ─────────▶ │  GAME OVER  │
 │ logo card │            │   score   │            │ score panel │
 └───────────┘            └───────────┘ ◀───────── └─────────────┘
                                          tap / Space
```

## User story

As a player, I want a start screen with the game's logo and a clear game-over panel with my score
and best, so that the game looks finished and I always know what to do next.

## Goals

- Each screen says what the next press does.
- The score shows in one place at a time.
- What each screen shows comes from a pure function of the game state, so it's tested without a
  browser.

## Non-goals

- Animations between screens, medals, or a settings menu.
- New art. The decisions below use the art that exists.

## Requirements

### Where the screens are drawn

- `describeScreen` in `apps/web/src/platform/screens.ts` turns the round (`game/round.ts`: the
  phase and the game state) into one of three screen descriptions: ready, playing, or game over.
- `GameUI` in `apps/web/src/platform/ui.ts` draws the description on the `<canvas id="ui">`, at the
  400 × 700 virtual resolution, once per frame.
- The `#overlay` element shows only the "WebGPU not supported on this device/browser." message.

### Ready

Shown from page load until the first tap or Space press.

- The logo card: the part of `logo.png` that holds the art, plus a 24 px margin (`LOGO_CROP`:
  568 × 111 px from x = 28, y = 153), scaled to 360 × 70 px, centered, from y = 165, with 14 px
  rounded corners. `logo.png` has a solid dark background and no transparency, so it's drawn as a
  card; the maintainer chose this on 2026-11-27, then asked for the card to be cropped close to
  the art. A test checks that the crop holds all of the art with at least 20 px of margin.
- "Tap or press Space to start", centered at y = 480.
- "Best: N" under the prompt, only when a saved best score is above 0.

### Playing

- The score, in 48 px bold white text with a dark outline, centered at y = 80.

### Game over

- A rounded panel, 320 × 210 px, centered, from y = 190, with 24 px corners, a blue-to-purple
  gradient, and a light blue border. It's drawn in code in the style of `score-panel.png`. That
  image had placeholder numbers baked in, so it was removed. The maintainer chose this on
  2026-11-27.
- Inside the panel: "SCORE", the score in large cyan text, and "BEST: N".
- "NEW BEST!" in gold inside the panel when the round set a new best score.
- "Tap or press Space to play again", centered below the panel, once a press would restart: 0.5 s
  after the round ends. Until then the panel shows alone.

## Acceptance criteria

Each criterion is covered by a test in `apps/web/src/platform/screens.test.ts` or
`apps/web/src/platform/ui.test.ts`.

- Before the first press, the screen is ready, with the saved best.
- During a round, the screen is playing, with the score.
- After a round, the screen is game over, with the score and best, and "NEW BEST!" only when the
  round beat the best it started with.
- Each screen draws its text, and the playing screen draws the score once.
- The game-over screen offers a restart only once the restart delay has passed.

The look of each screen is checked with a screenshot from headless Chromium, where the 2D canvas
renders.

## Open questions

None.
