# Gameplay

Tracking issue: [#3](https://github.com/bradreimer/floppy-schnauzer/issues/3).

## Purpose

This spec records the rules of the game and every tuning number, as the code implements them on
2026-11-27. It's the reference for tests and for fixes. A change to a number in
`apps/web/src/game/config.ts` changes this spec in the same commit.

Think of the game as a conveyor belt. The schnauzer stays at one spot left to right, and only
moves up and down. The pipes ride the belt from right to left. The player's only control is a
tap, which tosses the schnauzer upward against gravity.

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
  y = 660 ┼───────────────────────┴──────┴───────────────────  floor
  y = 700 ┴──────────────────────────────────────────────────  bottom of the world
```

## User story

As a player, I want the schnauzer to flap when I tap, fly between pipes, and score a point for
each pipe I pass, so that I have a quick game that's easy to learn and hard to master.

## Goals

- One input, a tap or click, does everything: start, flap, and restart.
- A round lasts seconds to minutes, and the player always knows why it ended.
- The rules live in `apps/web/src/game/` as pure functions, per
  [ADR-004](../adr/ADR-004-game-rules-are-pure-functions.md), and each acceptance criterion has a
  test.

## Non-goals

- Difficulty that rises during a round. The gap and the speed are fixed.
- Leaderboards, accounts, or online play.
- Keeping the best score between visits. It's on the [roadmap](../roadmap.md) for version 0.4.

## Requirements

### The world

- The world is 400 × 700 virtual pixels, per
  [ADR-003](../adr/ADR-003-a-fixed-virtual-resolution.md). Positions are the top-left corner of a
  sprite, with y growing downward.
- The floor is at y = 660 (`FLOOR_Y`, which is 700 minus a `GROUND_HEIGHT` of 40).

### Starting, flapping, and restarting

- Before the first tap, the game is waiting, and the overlay says "Tap to start / jump".
- A tap while waiting or after a game over starts a new round from the initial state, keeps the
  best score, and flaps.
- In the initial state the schnauzer is at x = 100, y = 350, with a vertical speed of 0, no
  pipes, and a score of 0.
- A flap sets the vertical speed to −450 px/s (`JUMP_VELOCITY`) and plays `jump.wav`.

### Movement

Each frame, with the frame time `dt` in seconds:

- `dt` is the time since the last frame, capped at 0.05 s (`MAX_FRAME_TIME`) by `frameTime` in
  `apps/web/src/game/frame.ts`. A longer gap, such as a hidden tab, moves the game only 0.05 s.

- The vertical speed grows by 1800 × `dt` (`GRAVITY`, in px/s²), and then y grows by speed ×
  `dt`.
- Every pipe moves left by 120 × `dt` (`PIPE_SPEED`, in px/s).
- A pipe whose right edge is left of x = 0 is removed. Only the first pipe is checked each frame.

### Pipes

- A pipe is 70 px wide. It has a top part from y = 0 to `top`, and a bottom part from `bottom` to
  700, where `bottom` = `top` + 270 (`PIPE_GAP`).
- A new pipe spawns when more than 1.4 s (`PIPE_SPAWN_INTERVAL`) have passed since the last one.
- A new pipe's x is 220 px right of the last pipe, or 450 when there are no pipes.
- `top` is a random number from 50 up to, but not including, 280.

### Scoring

- The score goes up by 1 when a pipe's right edge passes left of the schnauzer's x, once per pipe.
- The best score is the highest score this visit. `score.wav` plays when the score goes up.
- The score shows at the top of the screen, in 48 px white text, and in the overlay with the best
  score.

### Game over

- The round ends when the schnauzer's top edge goes above y = 0 or below y = 660.
- The round ends when the schnauzer's 64 × 64 box overlaps a pipe's 70 px width and isn't fully
  inside the gap.
- At game over, `hit.wav` plays, the rules stop changing the state, and the overlay says
  "Game Over – Score: N (best: M) – Tap to restart".

### The background

- Four layers scroll left behind the pipes, from back to front: sky, clouds, hills, and ground.
- Each layer is 400 px wide and repeats to fill the screen.

| Layer | y | Height | Scroll per frame |
| --- | --- | --- | --- |
| Sky | 0 | 700 | 2 px |
| Clouds | 50 | 650 | 5 px |
| Hills | 150 | 550 | 10 px |
| Ground | 620 | 80 | 2 px |

## Acceptance criteria

Each criterion is covered by a test in `apps/web/src/game/physics.test.ts`, unless it names
another test file.

- A new round starts with the schnauzer at y = 350, still, with no pipes and a score of 0.
- After 0.1 s with no tap, the speed is 180 px/s downward.
- An upward speed moves the schnauzer up.
- Once the game is over, a frame changes nothing.
- The game ends above the ceiling and below the floor.
- Pipes move left at 120 px/s.
- After 1.4 s, a pipe spawns with a 270 px gap.
- A pipe off the left edge is removed.
- Passing a pipe scores 1 point, once.
- Overlapping a pipe outside the gap ends the game, and flying through the gap doesn't.
- A 5 s gap between frames simulates only 0.05 s (`apps/web/src/game/frame.test.ts`).

## Open questions

These come from the code review on 2026-11-27. Questions 1 to 4 are tracked as Bug Reports
[#5](https://github.com/bradreimer/floppy-schnauzer/issues/5) to
[#8](https://github.com/bradreimer/floppy-schnauzer/issues/8), listed on the
[roadmap](../roadmap.md) for version 0.3.

1. The background scrolls a fixed amount per frame, not per second, so it's twice as fast at
   120 Hz, and it keeps scrolling after game over. Should it stop at game over?
2. Answered by [#6](https://github.com/bradreimer/floppy-schnauzer/issues/6): `dt` is capped at
   0.05 s.
3. The floor check uses the schnauzer's top edge, so it sinks 64 px into the ground. The ground art
   is drawn from y = 620, but the floor is at 660. Which line should the paws touch?
4. The wing animation frame is `score % 4`, so the wings move only when you score. How many
   frames per second should the wings flap?
5. The overlay and the 2D UI canvas both show the score. Should only one?
