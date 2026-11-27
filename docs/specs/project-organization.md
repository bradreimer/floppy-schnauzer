# Project organization

Tracking issue: [#1](https://github.com/bradreimer/floppy-schnauzer/issues/1).

## Purpose

Floppy Schnauzer is maintained in bursts by one person, with help from coding agents. A
predictable layout means that anyone, person or agent, can find the intent behind a change and
knows where a new file goes. Rules that live only in prose drift, so unit tests enforce these
rules. The rules match the ones used in fibotrail, adapted for a game.

## User story

As the maintainer, I want every kind of content to have one correct home, checked by tests, so
that the repository stays organized without me policing it.

## Goals

- Every change starts from written intent: a spec for behavior and a work item for the work.
- Each kind of document has one home and one format.
- A misplaced file or a malformed document fails a test, locally and in CI.
- The instructions for coding agents state the same rules that the tests enforce.

## Non-goals

- Checking the quality of what a document says. Tests check structure, not judgment.
- Checking GitHub Issues. Work items are tracked in GitHub, outside the repository.
- Testing the folder rules inside `apps/web/src`. They're stated in `CLAUDE.md` and checked in
  review.

## Requirements

### Work items

- Work items are GitHub Issues. No ticket files exist in the repository.
- Three issue templates exist in `.github/ISSUE_TEMPLATE/`: `user_story.md`, `bug_report.md`, and
  `feature_request.md`.
- Each template has front matter with a name and a label, and the sections its kind requires. The
  User Story and Bug Report templates include Related spec, Acceptance criteria, and Testing
  requirements.

### Repository root

- Required: `.editorconfig`, `.env.example`, `.github/`, `.gitignore`, `.nvmrc`, `CLAUDE.md`,
  `CONTRIBUTING.md`, `README.md`, `apps/`, `docker/`, `docs/`, `package.json`, `scripts/`, and
  `tests/`.
- Allowed when needed: `.dockerignore`, `LICENSE`, and `package-lock.json`.
- Nothing else is tracked at the root.
- `apps/` holds exactly `server` (the .NET solution) and `web` (the game).

### Inside the apps

- `apps/server/src/` holds one folder per C# project, and `apps/server/tests/` holds its test
  project, as the [quality gates spec](quality-gates.md) requires.
- `apps/web/src/` holds `game/`, `scene/`, `engine/`, `platform/`, and `assets/`, with the jobs
  that `CLAUDE.md` lists.
- Every file in `apps/web/src/assets/` is listed in the
  [art and audio assets spec](art-and-audio-assets.md), and every file listed there exists.

### Secrets

- `.env` is never tracked, and `.gitignore` ignores it.
- `.env.example` lists variables as `NAME=value` lines. A variable whose name contains `KEY`,
  `SECRET`, `TOKEN`, or `PASSWORD` has an empty value.

### The README

- `README.md` has the level-2 sections Play, Develop, Run in Docker, and Configuration, in that
  order.
- It documents, in code format, every variable in `.env.example`, including commented ones.

### The docs folder

- `docs/` holds exactly five files and three folders: `README.md`, `development-workflow.md`,
  `guidelines.md`, `roadmap.md`, `status.md`, `adr/`, `specs/`, and `knowledge/`.
- `docs/status.md` has the sections Current milestone, Completed, In progress, and Next.
- `docs/guidelines.md` has seven numbered guidelines. Each states its rule, its method, and where
  it's enforced.

### ADRs

- `docs/adr/` holds `README.md` and ADR files only, with no subfolders.
- An ADR file is named `ADR-NNN-short-title.md`. Numbers start at 001 and run in order with no
  gaps and no duplicates.
- The first line is `# ADR-NNN: Title`, with the same number as the file name.
- The sections are exactly Status, Context, Decision, Alternatives considered, and Consequences,
  in that order.
- The status is `Proposed`, `Accepted`, `Deprecated`, or `Superseded by ADR-NNN`, where the
  superseding ADR exists.
- The index in `docs/adr/README.md` links to every ADR and shows its current status.

### Specs

- `docs/specs/` holds `README.md` and spec files only, with no subfolders.
- A spec file has a lowercase, hyphenated name.
- A spec starts with a `# Title` line, followed by a `Tracking issue:` line that links to an issue
  in this repository.
- The sections are exactly Purpose, User story, Goals, Non-goals, Requirements, Acceptance
  criteria, and Open questions, in that order.
- The index in `docs/specs/README.md` links to every spec.

### Knowledge

- `docs/knowledge/` holds `README.md`, knowledge documents with lowercase, hyphenated names, and
  an `images/` folder when one is needed.
- Images have lowercase, hyphenated names and are SVG, PNG, JPEG, or WebP files.
- At least one knowledge document uses each image.
- The index in `docs/knowledge/README.md` links to every knowledge document.

### Links

- Every relative link and image reference in a Markdown file points to a file that exists.

### Instructions

- `CLAUDE.md` and `.github/copilot-instructions.md` exist and name each home: `docs/specs/`,
  `docs/adr/`, `docs/knowledge/`, `docs/status.md`, `docs/guidelines.md`, GitHub Issues, and
  `scripts/check.sh`.
- `scripts/check.sh` runs the tests, and the CI workflow runs `scripts/check.sh`.

### Tests

- The organization tests live in `tests/organization/` and run with `npm test` at the root, on
  Node.js's built-in test runner, with no packages to install.
- The rules are pure functions in `tests/organization/rules.mjs`, with their own unit tests in
  `rules.test.mjs`, so a rule can be tested against good and bad examples.
- `repository.test.mjs` applies the rules to the files that Git tracks.
- A change to a rule updates this spec and its test in the same change.

## Acceptance criteria

- `npm test` passes on a clean checkout.
- Adding a stray file to the root or to `docs/` fails a test that names the file.
- An ADR or spec with a missing section, a wrong name, or a missing index entry fails a test that
  names the document and the problem.
- A broken relative link in any Markdown file fails a test.
- An asset that isn't in the asset table, or a table row with no file, fails a test that names it.
- CI runs the same tests on every push and pull request.

## Open questions

- Should the project have a license? Without a `LICENSE` file, the code is all rights reserved,
  which matches the copyright header in the C# files. The maintainer decides.
