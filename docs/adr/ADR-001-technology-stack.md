# ADR-001: TypeScript and WebGPU for the game, C# for the server

## Status

Accepted

## Context

Floppy Schnauzer is a 2D browser game with a small server. The maintainer wants to learn WebGPU,
and works in C# and TypeScript. This ADR records the stack that the code already used before the
decision was written down on 2026-11-27.

## Decision

| Layer | Choice | Why |
| --- | --- | --- |
| Game | TypeScript, built with Vite | Types catch mistakes in the rules, and Vite gives a fast dev server |
| Drawing | WebGPU, with one sprite pipeline written in WGSL | The maintainer's chosen graphics API |
| Score text | A 2D canvas over the WebGPU canvas | Text is simple in 2D canvas and hard in WebGPU |
| Sound | The Web Audio API, with WAV files | Low latency for short effects |
| Game tests | Vitest | Runs on the same Vite configuration as the game |
| Game format and lint | Prettier and type-aware typescript-eslint | The standard pair for TypeScript |
| Server | ASP.NET Core minimal APIs on .NET 10 | The maintainer's chosen backend stack |
| Server tests | xUnit, with `WebApplicationFactory` | The default test framework for .NET |
| Server format and lint | `dotnet format`, .NET analyzers, and StyleCop, with warnings as errors | Ship with the SDK, and StyleCop adds consistent style |

## Alternatives considered

- **WebGL 2.** Runs in more browsers today. Set aside because learning WebGPU is a goal.
- **A game engine, such as Phaser.** Less code to write. Set aside because the renderer is part of
  the point of the project.
- **A Node.js server.** One language everywhere. Set aside because the maintainer wants a C#
  server.

## Consequences

- The game runs only in browsers with WebGPU. Others see a plain message.
- The repository has two apps: `apps/web` (a Vite project) and `apps/server` (a .NET solution).
- `./scripts/check.sh` runs both toolchains, so a contributor needs Node.js 22 and the .NET 10 SDK.
