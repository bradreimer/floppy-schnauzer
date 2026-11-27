# Web app development

This document describes how to run, test, and change the game in `apps/web`. It was written with
the quality gates ([#2](https://github.com/bradreimer/floppy-schnauzer/issues/2)) on
2026-11-27. The checks themselves are defined in the
[quality gates spec](../specs/quality-gates.md).

## Commands

Run these in `apps/web`, after `npm install`:

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the Vite dev server at `http://localhost:5173`, with hot reload |
| `npm test` | Runs the Vitest tests once, in Node.js |
| `npx vitest` | Runs the tests again on each save |
| `npm run lint` | Runs ESLint with the type-aware typescript-eslint rules |
| `npm run typecheck` | Runs the TypeScript compiler, with no output files |
| `npm run format` | Rewrites files with Prettier |
| `npm run format:check` | Checks the formatting without changing files |
| `npm run build` | Builds the game into `apps/web/dist` |

## Playing on another device

The dev server listens on `localhost` by default. To open it from a phone on the same network:

```bash
VITE_HOST=0.0.0.0 VITE_HMR_HOST=my-machine.local npm run dev
```

WebGPU needs a secure context. A browser treats `localhost` as secure, but not a plain
`http://` address on your network. On a phone, use a browser setting that marks the address as
secure, or serve the dev server over HTTPS.

## Settings that matter

- `tsconfig.json` turns on `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and
  `verbatimModuleSyntax`. With `verbatimModuleSyntax`, import a type with `import type`.
- `tsconfig.json` lists `@webgpu/types` in `types`, which gives `navigator.gpu` and the `GPU*`
  types.
- ESLint's type-aware rules reject a promise that isn't awaited. Write `void promise` when you
  mean to let it run.
- Prettier settings are in `.prettierrc`: double quotes, semicolons, no trailing commas, and a
  line width of 100.

## Writing a test

Tests sit next to the code, named `*.test.ts`. A rule in `src/game/` takes a `GameState` and
returns a new one, so a test builds a state, calls the rule, and checks the result. For a rule
that uses `Math.random`, replace it in the test:

```ts
vi.spyOn(Math, "random").mockReturnValue(0);
```

Restore it after each test with `vi.restoreAllMocks()` in `afterEach`.
