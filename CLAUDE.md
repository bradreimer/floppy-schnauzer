# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this project is

Floppy Schnauzer is a small browser game. You tap to make a caped schnauzer flap between pipes,
and you score a point for each pipe you pass. The game draws with WebGPU. An ASP.NET Core server
serves the built game from one Docker container.

```
Tap ─▶ Input ─▶ Game rules (pure) ─▶ Scene (sprites) ─▶ WebGPU renderer ─▶ Canvas
                      ▲                                                       │
                      └──────────────── next frame (requestAnimationFrame) ◀──┘
```

The full picture is in
[docs/knowledge/rendering-pipeline.md](docs/knowledge/rendering-pipeline.md).

## Project guidelines

Seven guidelines apply to every change. The full text, with the method for each, is in
[docs/guidelines.md](docs/guidelines.md).

1. **Be plain.** Every document and design states its intention and its methodology. Name the
   mechanism, use numbers, and say what isn't known yet.
2. **Stay organized.** The project is always in a cleanly organized state. Stop and reorganize
   when the layout stops fitting, as its own work item.
3. **Protect secrets.** Secrets come from environment variables, starting with `.env`. Never
   commit, log, or send a secret to the browser.
4. **TypeScript and WebGPU game, C# server.** The game is TypeScript in `apps/web`. The server is
   .NET in `apps/server`.
5. **One Docker container.** The server serves the built game, so they ship as one image.
6. **Fair on every screen.** The world is a fixed 400 × 700 virtual resolution, scaled to fit, and
   the rules don't depend on the frame rate.
7. **Tested, formatted, linted.** New functionality comes with a unit test. Every check-in passes
   `./scripts/check.sh`.

## Spec-driven, work-item-driven development

This workflow is required. Follow it before you write code for any meaningful change:

1. Check [docs/specs/](docs/specs/) for a spec that covers the behavior. If none exists for a
   player-facing or cross-cutting change, write one first. The template is in
   [docs/specs/README.md](docs/specs/README.md).
2. Check [GitHub Issues](https://github.com/bradreimer/floppy-schnauzer/issues) for an
   implementation-sized work item. If none exists, create one with the template that matches:
   - **User Story** for a scoped, player-facing capability.
   - **Bug Report** for a defect.
   - **Feature Request** for an idea that isn't scoped yet.

   The issue number is the work item ID. Reference it in the commit body, for example
   `Closes #123`.
3. Implement in small, focused commits with tests.
4. Update [docs/status.md](docs/status.md) and the relevant spec as progress changes.
5. Record each significant architectural decision as an ADR in [docs/adr/](docs/adr/).
6. Record what you learned that others need later as a knowledge document in
   [docs/knowledge/](docs/knowledge/).

## Where things go

Project organization is strict, and tests enforce it. The rules are in
[docs/specs/project-organization.md](docs/specs/project-organization.md).

| Content | Location | Rule |
| --- | --- | --- |
| Work items | GitHub Issues | Never a Markdown file in `docs/` |
| Architectural decisions | `docs/adr/ADR-NNN-short-title.md` | Numbered in order, fixed sections, listed in the index |
| Behavioral specs | `docs/specs/short-title.md` | Fixed sections, linked to a tracking issue, listed in the index |
| Reference knowledge | `docs/knowledge/short-title.md` | Listed in the index; images in `docs/knowledge/images/` |
| Planning and progress | `docs/roadmap.md` and `docs/status.md` | No other loose files in `docs/` |
| Server | `apps/server/` | A .NET solution; each project in `src/` has a test project in `tests/` |
| Game | `apps/web/` | A TypeScript, WebGPU, and Vite project |
| Art and sound | `apps/web/src/assets/` | Every file is listed in the art and audio assets spec |
| Secrets | `.env` (never committed) | `.env.example` lists the variables, with secret values empty |
| Docker files | `docker/` | Dockerfile and compose file |
| Scripts | `scripts/` | Shell scripts for checks and maintenance |
| Organization tests | `tests/organization/` | Pure rules in `rules.mjs`, with their own tests |

Inside `apps/web/src`, each folder has one job:

| Folder | Holds | Must not |
| --- | --- | --- |
| `game/` | The rules and tuning, as pure functions over `GameState` | Touch the DOM, the GPU, or audio |
| `scene/` | The step that turns a `GameState` into sprites | Change the game state |
| `engine/` | WebGPU: device setup, the sprite pipeline, and textures | Know the game rules |
| `platform/` | Browser APIs: input, audio, and the 2D UI canvas | Hold game rules |
| `testing/` | Helpers that only tests import, such as the PNG decoder | Be imported by game code |
| `app.ts` | The wiring between the folders | Hold logic that a folder could own |

Don't add a new top-level file or folder, or a new folder under `docs/`, without updating the
project organization spec and its tests in the same change.

When documents disagree, the order of authority is: ADRs, then specs, then knowledge documents.

## Working conventions

- Prefer small, composable changes over rewrites.
- Keep the game rules in `apps/web/src/game/` as pure functions, so they can be tested with plain
  data and no browser.
- Scale every movement by the frame time `dt`, so the game plays the same at 60 Hz and 120 Hz.
- Put tuning numbers in `apps/web/src/game/config.ts`, and keep the
  [gameplay spec](docs/specs/gameplay.md) in sync with them.
- One logical change per commit. Commit messages describe intent, for example
  `feat(game): add a medal at 10 points` or `fix(physics): end the game when the paws touch the ground`.

## Validation before you consider work done

```bash
./scripts/check.sh
```

This runs the organization tests, the .NET checks in `apps/server`, and the game checks in
`apps/web`, as [docs/specs/quality-gates.md](docs/specs/quality-gates.md) requires. CI runs the
same script on every push and pull request.

## Key docs map

- [docs/guidelines.md](docs/guidelines.md): the seven project guidelines.
- [docs/README.md](docs/README.md): the map of the documentation.
- [docs/roadmap.md](docs/roadmap.md) and [docs/status.md](docs/status.md): planning and current
  state.
- [docs/development-workflow.md](docs/development-workflow.md): idea to release, step by step.
- [docs/adr/](docs/adr/): architectural decisions.
- [docs/specs/](docs/specs/): behavioral specs.
- [docs/knowledge/](docs/knowledge/): reference knowledge.
- [CONTRIBUTING.md](CONTRIBUTING.md): contribution conventions.
