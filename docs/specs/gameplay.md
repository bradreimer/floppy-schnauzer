# Gameplay

Tracking issue: [#3](https://github.com/bradreimer/floppy-schnauzer/issues/3).

## Purpose

This spec records the rules of the game and every tuning number, as the code implements them on
2026-11-27. It's the reference for tests and for fixes. A change to a number in
`apps/web/src/game/config.ts` changes this spec in the same commit.

Think of the game as a conveyor belt. The schnauzer stays at one spot left to right, and only
moves up and down. The pipes ride the belt from right to left. The player's only control is a
tap (or the Space key), which tosses the schnauzer upward against gravity.

```text
        x = 100                      pipes move left at 120 px/s
          │                       ◀──────────────────────────
  y = 0   ┼───────────────────────┬──────┬───────────────────  ceiling
          │                       │ top  │
          │    ┌────┐             │ pipe │
          │    │ 🐕 │ 64 × 64      ├──────┤  ▲
          │    └────┘             │      │  │ gap: 270 px
          │       tap: speed -450 │      │  ▼
          │       gravity: +1800  ├──────┤
          │                       │bottom│
  y = 620 ┼───────────────────────┴──────┴───────────────────  floor: the ground art starts here
  y = 700 ┴──────────────────────────────────────────────────  bottom of the world
```

## User story

As a player, I want the schnauzer to flap when I tap, fly between pipes, and score a point for
each pipe I pass, so that I have a quick game that's easy to learn and hard to master.

## Goals

- One input, a tap, a click, or the Space key, does everything: start, flap, and restart.
- A round lasts seconds to minutes, and the player always knows why it ended.
- The rules live in `apps/web/src/game/` as pure functions, per
  [ADR-004](../adr/ADR-004-game-rules-are-pure-functions.md), and each acceptance criterion has a
  test.

## Non-goals

- Difficulty that rises during a round. The gap and the speed are fixed.
- Leaderboards, accounts, or online play.
- Sharing the best score across browsers or devices. It's kept only in the browser it was set in.

## Requirements

### The world

- The world is 400 × 700 virtual pixels, per
  [ADR-003](../adr/ADR-003-a-fixed-virtual-resolution.md). Positions are the top-left corner of a
  sprite, with y growing downward.
- The floor is at y = 620 (`FLOOR_Y`, which is 700 minus a `GROUND_HEIGHT` of 80). The ground
  art is drawn from the floor to the bottom of the world, so the line the schnauzer hits is the
  line the player sees.

### Starting, flapping, and restarting

- Before the first tap, the game is waiting, and the overlay says "Tap to start / jump".
- A tap while waiting or after a game over starts a new round from the initial state, keeps the
  best score, and flaps.
- Pressing Space anywhere in the window does exactly what a tap does. Holding it down flaps once,
  and it doesn't scroll the page. Other keys do nothing.
- The schnauzer is 64 × 64 px (`BIRD_SIZE`). In the initial state it's at x = 100 (`BIRD_X`), y = 350, with a vertical speed of 0, no
  pipes, and a score of 0.
- A flap sets the vertical speed to −450 px/s (`JUMP_VELOCITY`) and plays `jump.wav`.
- Browsers start sound muted until a user gesture. The first sound after a tap resumes the audio
  context, so `jump.wav` plays on the first flap.

### Movement

Each frame, with the frame time `dt` in seconds:

- `dt` is the time since the last frame, capped at 0.05 s (`MAX_FRAME_TIME`) by `frameTime` in
  `apps/web/src/game/frame.ts`. A longer gap, such as a hidden tab, moves the game only 0.05 s.

- The vertical speed grows by 1800 × `dt` (`GRAVITY`, in px/s²), and then y grows by speed ×
  `dt`.
- Every pipe moves left by 120 × `dt` (`PIPE_SPEED`, in px/s).
- A pipe whose right edge is left of x = 0 is removed. Only the first pipe is checked each frame.

### Pipes

- A pipe is 70 px wide (`PIPE_WIDTH`). It has a top part from y = 0 to `top`, and a bottom part
  from `bottom` down to the floor, where `bottom` = `top` + 270 (`PIPE_GAP`).
- A new pipe spawns when more than 1.4 s (`PIPE_SPAWN_INTERVAL`) have passed since the last one.
- A new pipe's x is 220 px (`PIPE_SPACING`) right of the last pipe, or 450 when there are no
  pipes.
- `top` is a random number from 50 up to, but not including, 280.

### Scoring

- The score goes up by 1 when a pipe's right edge passes left of the schnauzer's x, once per pipe.
- The best score is the highest score in this browser. `score.wav` plays when the score goes up.
- When a round ends with a new best, the game saves it to `localStorage` under
  `floppy-schnauzer.bestScore`, and loads it at start-up. A missing value, a value that isn't a
  whole number of 0 or more, or storage that's blocked or full counts as no saved score, and the
  game plays as usual (`apps/web/src/platform/best-score.ts`).
- The score shows at the top of the screen, in 48 px white text, and in the overlay with the best
  score.

### Game over

- Collisions use the schnauzer's art, not its 64 × 64 sprite frame. The collision box
  (`BIRD_HITBOX`) is 64 × 31 px, from row 17 to row 47 of the frame: the union of the opaque
  pixels in all four frames of `schnauzer.png`.
- The round ends when the top of the art goes above y = 0, or the bottom of the art, where the
  paws are, goes below the floor at y = 620.
- The round ends when the collision box overlaps a pipe's 70 px width and isn't fully inside the
  gap.
- At game over, `hit.wav` plays, the rules stop changing the state, and the overlay says
  "Game Over – Score: N (best: M) – Tap to restart".

### The schnauzer's wings

- `schnauzer.png` holds 4 frames of 64 × 64 side by side. The scene shows frame
  `floor(roundTime × 10) % 4` (`WING_FPS`), where `roundTime` is the seconds since the round
  started, so the wings flap 10 frames a second while the round runs.
- The whole 64 × 64 frame is drawn, with no crop, so the art keeps its shape.

### The background

- Four layers scroll left behind the pipes, from back to front: sky, clouds, hills, and ground.
- Each layer is 400 px wide and repeats to fill the screen.
- `updatePhysics` adds 120 × `dt` to `scrollX` in the game state, the distance the world has moved.
  Each layer's offset is `scrollX` times its share (`PARALLAX_*` in `config.ts`), so the
  background moves the same distance each second at any refresh rate.
- The background moves only while a round runs, like the pipes. It holds still before the first
  tap and after game over.

| Layer | y | Height | Share of the pipe speed | Speed |
| --- | --- | --- | --- | --- |
| Sky | 0 | 700 | 0.1 | 12 px/s |
| Clouds | 50 | 650 | 0.25 | 30 px/s |
| Hills | 150 | 550 | 0.5 | 60 px/s |
| Ground | 620 | 80 | 1 | 120 px/s |

## Acceptance criteria

Each criterion is covered by a test in `apps/web/src/game/physics.test.ts`, unless it names
another test file.

- A new round starts with the schnauzer at y = 350, still, with no pipes and a score of 0.
- After 0.1 s with no tap, the speed is 180 px/s downward.
- A saved best score loads after a reload, and blocked storage or a bad value counts as 0
  (`apps/web/src/platform/best-score.test.ts`).
- Space flaps once per press, even when held, and other keys don't flap
  (`apps/web/src/platform/input.test.ts`).
- An upward speed moves the schnauzer up.
- Once the game is over, a frame changes nothing.
- The game ends when the top of the art passes the ceiling, and when the paws pass the floor,
  but not when only the empty part of the sprite frame does.
- Pipes move left at 120 px/s.
- After 1.4 s, a pipe spawns with a 270 px gap.
- A pipe off the left edge is removed.
- Passing a pipe scores 1 point, once.
- The art touching a pipe ends the game. Flying through the gap, or a pipe touching only the
  empty part of the sprite frame, doesn't.
- The collision box is the union of the opaque pixels in `schnauzer.png`
  (`apps/web/src/game/hitbox.test.ts`).
- A 5 s gap between frames simulates only 0.05 s (`apps/web/src/game/frame.test.ts`).
- The background scrolls the same distance in 1 s at 60 Hz and 120 Hz, and stops at game over
  (`apps/web/src/scene/parallax.test.ts`).
- The first sound resumes a suspended audio context, once (`apps/web/src/platform/audio.test.ts`).
- The wing frame changes over time with no change in score (`apps/web/src/scene/parallax.test.ts`).

## Open questions

These come from the code review on 2026-11-27. Questions 1 to 4 are tracked as Bug Reports
[#5](https://github.com/bradreimer/floppy-schnauzer/issues/5) to
[#8](https://github.com/bradreimer/floppy-schnauzer/issues/8), listed on the
[roadmap](../roadmap.md) for version 0.3.

1. Answered by [#5](https://github.com/bradreimer/floppy-schnauzer/issues/5): the background
   scrolls by `dt` and stops at game over. The speeds in the table replace per-frame steps that
   came to 120, 300, 600, and 120 px/s at 60 Hz.
2. Answered by [#6](https://github.com/bradreimer/floppy-schnauzer/issues/6): `dt` is capped at
   0.05 s.
3. Answered by [#7](https://github.com/bradreimer/floppy-schnauzer/issues/7): the paws touch the
   top of the ground art, at y = 620.
4. Answered by [#8](https://github.com/bradreimer/floppy-schnauzer/issues/8): the wings flap at 10
   frames a second.
5. The overlay and the 2D UI canvas both show the score. Should only one?
6. Answered by [#13](https://github.com/bradreimer/floppy-schnauzer/issues/13): the collision box
   matches the art, 64 × 31 px, and a test keeps it in sync with `schnauzer.png`.
