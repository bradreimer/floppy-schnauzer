# Specs

A spec states what a capability must do, before anyone builds it. Write a spec when a change
affects what the player sees, workflow design, or cross-cutting architecture.

## Rules

- One capability per file, named `short-title.md` in lowercase with hyphens.
- The first line is `# Title`. The next paragraph is a `Tracking issue:` line that links to the
  GitHub Issue that tracks the implementation.
- Every spec has these sections, in this order: Purpose, User story, Goals, Non-goals,
  Requirements, Acceptance criteria, Open questions.
- A spec with no tracking issue is dead weight. Open the issue that implements it, or remove the
  spec.
- Keep a spec in sync with what's implemented.
- List every spec in the index below.

## New ideas belong in GitHub Issues

An idea that isn't scoped yet belongs in a
[GitHub Issue](https://github.com/bradreimer/floppy-schnauzer/issues) with the Feature Request
template, not in a new file here. Write a spec only when there's a concrete capability to scope
for implementation.

## Template

```markdown
# Title

Tracking issue: [#123](https://github.com/bradreimer/floppy-schnauzer/issues/123).

## Purpose

Why does this capability exist?

## User story

As a <person>, I want <capability>, so that <benefit>.

## Goals

## Non-goals

## Requirements

## Acceptance criteria

## Open questions

None.
```

## Index

| Spec | Capability |
| --- | --- |
| [project-organization.md](project-organization.md) | Where every file belongs, and the tests that enforce it |
| [quality-gates.md](quality-gates.md) | The checks every check-in must pass, and how they're run |
| [gameplay.md](gameplay.md) | Flap, pipes, scoring, game over, and the tuning numbers |
| [art-and-audio-assets.md](art-and-audio-assets.md) | Every sprite and sound, with its size and use |
