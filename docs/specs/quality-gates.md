# Quality gates

Tracking issue: [#2](https://github.com/bradreimer/floppy-schnauzer/issues/2).

## Purpose

This spec defines the checks that every check-in must pass, and how they're run. The checks are
how the maintainer's quality expectations are applied without a manual review of every line.

## User story

As the maintainer, I want one command and one CI job to tell me whether a change meets my quality
expectations, so that nothing unformatted, unlinted, or untested reaches `main`.

## Goals

- One command, `./scripts/check.sh`, runs every check.
- CI runs the same command on every push and pull request, and a failure blocks the merge.
- New functionality can't be added without a unit test that exercises it.
- Formatting is decided by tools, not by opinion.

## Non-goals

- A code coverage percentage target. Coverage is reported, not gated.
- Tests that draw with a real GPU. The renderer is checked by playing the game.
- Checking the quality of prose. Review does that.

## Requirements

### One command

- `./scripts/check.sh` uses `set -euo pipefail`, so it stops at the first failing check.
- A check verifies and reports. It doesn't rewrite files, so the script gives the same result
  locally and in CI.
- The CI workflow runs `./scripts/check.sh` and nothing else that decides pass or fail. It uses
  the Node.js version in `.nvmrc` and the .NET SDK in `apps/server/global.json`.

### Organization and text

- The organization tests: `npm test` at the repository root.
- Text formatting, checked by an organization test: every text file ends with one newline, uses
  LF line endings, and has no trailing spaces. `.editorconfig` states the same rules for editors.

### Server checks, in `apps/server`

- `dotnet format --verify-no-changes` for formatting and analyzer rules.
- `dotnet build` with warnings treated as errors. `Directory.Build.props` turns on nullable
  reference types, the .NET analyzers, StyleCop, and XML documentation.
- `dotnet test` for the xUnit tests.
- Every C# project in `apps/server/src` has a test project of the same name with a `.Tests` suffix
  in `apps/server/tests`.

### Web checks, in `apps/web`

The script installs the packages with `npm ci` first, so the versions are the ones in
`apps/web/package-lock.json`. Then it runs:

- `npm run format:check` for Prettier.
- `npm run lint` for ESLint, with the type-aware rules of typescript-eslint.
- `npm run typecheck` for the TypeScript compiler, in strict mode.
- `npm test` for Vitest.
- `npm run build`, so a change that breaks the production build fails before it merges.

### Tests for new functionality

- A change that adds or changes behavior includes a unit test that fails without the change.
- A bug fix includes a regression test.
- The pull request description says which tests cover the change.

## Acceptance criteria

- `./scripts/check.sh` passes on a clean checkout of `main`.
- A file with trailing spaces or CRLF line endings fails a test that names the file.
- Removing a required step from `./scripts/check.sh` fails a test that names the step.
- A C# project without a matching test project fails a test that names the project.
- CI fails a push or pull request when `./scripts/check.sh` fails.

## Open questions

None.
