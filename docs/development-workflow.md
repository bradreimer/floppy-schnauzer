# Development workflow

This document describes the steps from an idea to a release. The rules behind the steps are in
[guidelines.md](guidelines.md).

## Flow

Idea → spec → work item → implementation → tests → documentation update → commit → release

## Before you start work

- Check [specs/](specs/README.md) for a spec that covers the change. Write one first if the change
  affects what the player sees, the workflow, or cross-cutting architecture.
- Check [GitHub Issues](https://github.com/bradreimer/floppy-schnauzer/issues) for a matching work
  item, or open one with the template that fits:
  - **User Story** (`.github/ISSUE_TEMPLATE/user_story.md`) for a scoped capability.
  - **Bug Report** (`.github/ISSUE_TEMPLATE/bug_report.md`) for a defect.
  - **Feature Request** (`.github/ISSUE_TEMPLATE/feature_request.md`) for an idea that isn't
    scoped yet.
- Update [status.md](status.md) if the change affects the current milestone or priorities.

## While you work

- Record a significant architectural decision as an ADR in [adr/](adr/README.md).
- Record findings that others need later, such as how a browser handles WebGPU, as a knowledge
  document in [knowledge/](knowledge/README.md).
- Put each file where [specs/project-organization.md](specs/project-organization.md) says it
  belongs.
- Change a tuning number in `apps/web/src/game/config.ts` and the
  [gameplay spec](specs/gameplay.md) in the same commit.

## Commits

Make small, focused commits with one logical change each:

```text
feat(game): add a medal at 10 points
fix(physics): end the game when the paws touch the ground
```

Reference the work item in the commit body, for example `Closes #123`.

## Testing

New functionality comes with a unit test, and every check-in passes the formatting and linting
checks. Before you commit:

```bash
./scripts/check.sh
```

The checks are defined in [specs/quality-gates.md](specs/quality-gates.md).

## Releases

A merge to `main` pushes the Docker image as `edge` and `sha-<commit>`. Pushing a tag such as
`v0.6.0` publishes that version and moves `latest`, after checking that the commit is on `main`
and passed CI. A release needs its work items completed, tests passing, and documentation updated.
The steps are in the [release spec](specs/release.md).
