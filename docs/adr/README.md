# Architecture decision records

An architecture decision record (ADR) captures one significant architectural choice: what was
decided, why, and what follows from it. Write an ADR when a choice affects the direction of the
project or would be expensive to reverse.

## Rules

- One decision per file, named `ADR-NNN-short-title.md`, with a three-digit number and a
  lowercase, hyphenated title.
- Numbers run in order with no gaps. The next ADR takes the next number.
- The first line is `# ADR-NNN: Title`, and the number matches the file name.
- Every ADR has these sections, in this order: Status, Context, Decision, Alternatives
  considered, Consequences.
- Status is one of `Proposed`, `Accepted`, `Deprecated`, or `Superseded by ADR-NNN`.
- Don't rewrite an accepted ADR to change the decision. Write a new ADR and mark the old one
  superseded.
- List every ADR in the index below.

## Template

```markdown
# ADR-NNN: Title

## Status

Proposed

## Context

What situation forces a decision?

## Decision

What did we decide?

## Alternatives considered

What else did we weigh, and why did we set it aside?

## Consequences

What becomes easier or harder because of this decision?
```

## Index

| ADR | Decision | Status |
| --- | --- | --- |
| [ADR-001-technology-stack.md](ADR-001-technology-stack.md) | TypeScript and WebGPU for the game, C# for the server | Accepted |
| [ADR-002-one-container-serves-the-built-game.md](ADR-002-one-container-serves-the-built-game.md) | One Docker image holds the server and the built game | Accepted |
| [ADR-003-a-fixed-virtual-resolution.md](ADR-003-a-fixed-virtual-resolution.md) | The world is 400 × 700 virtual pixels, scaled to fit the window | Accepted |
| [ADR-004-game-rules-are-pure-functions.md](ADR-004-game-rules-are-pure-functions.md) | The game rules are pure functions over a plain `GameState` | Accepted |
