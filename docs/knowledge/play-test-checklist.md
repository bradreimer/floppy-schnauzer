# Play-test checklist

This checklist lists what to check by hand, on a real browser and a real iPhone, before a release.
Unit tests and headless Chromium can't see these things: in headless Chromium the WebGPU canvas
is black, and no sound plays. Each check names the spec or work item it comes from. Written for
[#24](https://github.com/bradreimer/floppy-schnauzer/issues/24) on 2026-11-28, from the specs at
that date. Not run yet.

## How to run it

1. Build and start the game: `docker compose -f docker/compose.yml --env-file .env up --build`
   from the repository root, or `npm run dev` in `apps/web`.
2. Open it on two devices:
   - **Desktop:** a current Chrome or Edge. If you have a 120 Hz monitor, use it for the frame
     rate checks.
   - **iPhone:** Safari, with the ring/silent switch off so sound can play. The dev server's
     `http://` address on your network isn't a secure context, so use the Docker image behind
     HTTPS, or another way to serve HTTPS.
3. Work down the table. Mark each line Pass or Fail, with the device.
4. Record the result in [status.md](../status.md), and open a Bug Report for each failure.

Think of it as a pre-flight walk-around: the instruments (tests) say the plane is fine, and this
is the look at the wings with your own eyes.

## Checks

| # | Check | How | Expected | From |
| --- | --- | --- | --- | --- |
| 1 | Start screen | Load the page | The logo card, 360 × 70, with "Floppy Schnauzer" readable; "Tap or press Space to start" below it | [screens](../specs/screens.md) |
| 2 | The world draws | Look behind the start screen | Sky, clouds, hills, ground, and the schnauzer, not black | [rendering](rendering-pipeline.md) |
| 3 | Schnauzer shape | Look at the schnauzer | Its proportions match `schnauzer.png`; it isn't stretched taller | [#8](https://github.com/bradreimer/floppy-schnauzer/issues/8) |
| 4 | Wings flap | Start a round | The wings cycle about 10 times a second without scoring | [#8](https://github.com/bradreimer/floppy-schnauzer/issues/8) |
| 5 | Space key (desktop) | Press Space; hold Space | Starts and flaps; holding flaps once; the page doesn't scroll | [#15](https://github.com/bradreimer/floppy-schnauzer/issues/15) |
| 6 | Sound on iPhone | Tap to start | The jump sound plays on the first tap, and the score and hit sounds play later | [#10](https://github.com/bradreimer/floppy-schnauzer/issues/10) |
| 7 | Parallax depth | Watch the background during a round | The ground moves with the pipes; hills, clouds, and sky move slower in that order | [#5](https://github.com/bradreimer/floppy-schnauzer/issues/5) |
| 8 | Same speed at 60 Hz and 120 Hz | Play on both refresh rates, or switch the monitor's rate | A pipe takes about 3.3 s to cross the screen on both | [#5](https://github.com/bradreimer/floppy-schnauzer/issues/5), [gameplay](../specs/gameplay.md) |
| 9 | Background stops at game over | Lose a round | The pipes and every background layer stop | [#5](https://github.com/bradreimer/floppy-schnauzer/issues/5) |
| 10 | Ground line | Let the schnauzer fall | The round ends as the paws touch the top of the ground art, not after it sinks | [#7](https://github.com/bradreimer/floppy-schnauzer/issues/7) |
| 11 | Close calls | Fly just under a top pipe and just over a bottom pipe | The round ends only when the visible schnauzer touches a pipe | [#13](https://github.com/bradreimer/floppy-schnauzer/issues/13) |
| 12 | Hidden tab | Start a round, switch tabs for 5 s, come back | The round goes on from about where it was; it doesn't end at once | [#6](https://github.com/bradreimer/floppy-schnauzer/issues/6) |
| 13 | Game-over panel | Lose a round | The panel shows SCORE, the score, and BEST; "Tap or press Space to play again" below | [screens](../specs/screens.md) |
| 14 | New best | Beat your best score | "NEW BEST!" shows in gold in the panel | [#16](https://github.com/bradreimer/floppy-schnauzer/issues/16), [#17](https://github.com/bradreimer/floppy-schnauzer/issues/17) |
| 15 | Best score kept | Reload the page | "Best: N" on the start screen shows the best from before | [#16](https://github.com/bradreimer/floppy-schnauzer/issues/16) |
| 16 | Window shapes | Make the desktop window wide, then tall; rotate the iPhone | The game keeps its 4:7 shape with bars at the sides or top, and the screens line up with the game | [#23](https://github.com/bradreimer/floppy-schnauzer/issues/23), [ADR-003](../adr/ADR-003-a-fixed-virtual-resolution.md) |
| 17 | No errors | Open the desktop browser's console during a round | No errors or warnings from the game | [#20](https://github.com/bradreimer/floppy-schnauzer/issues/20) |

## What isn't known yet

- Whether WebGPU is on by default in the iPhone's Safari version. If it isn't, check 2 shows
  "WebGPU not supported on this device/browser." and the rest can't run there.
- The time in check 8 comes from the numbers: the pipes move 120 px/s, and cross 400 px of screen
  plus their 70 px width, which takes about 3.9 s from edge to edge, or about 3.3 s for the 400 px
  of screen alone.
