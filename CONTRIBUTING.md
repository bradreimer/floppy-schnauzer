# Contributing to Floppy Schnauzer

Thanks for your interest in contributing. Floppy Schnauzer is a small browser game, maintained by
one person as a hobby project.

## Before you start

For larger changes, such as a new game mode, a change to the physics tuning, or a change to the
renderer, open an issue first. It saves you from writing code that goes in a direction the project
doesn't want.

For small fixes, documentation, and tests, open a pull request directly.

## Project guidelines

Seven guidelines apply to every change. Read [docs/guidelines.md](docs/guidelines.md) first.

## How work flows

Idea → spec → work item → implementation → tests → documentation update → commit → release

1. **Spec.** A change that affects what the player sees, the workflow, or cross-cutting
   architecture needs a spec in [docs/specs/](docs/specs/) first.
2. **Work item.** Implementation-sized work is tracked as a
   [GitHub Issue](https://github.com/bradreimer/floppy-schnauzer/issues). Use the User Story, Bug
   Report, or Feature Request template.
3. **Implementation.** Make small, focused commits with tests.
4. **Documentation.** Update [docs/status.md](docs/status.md) and the spec. Record a significant
   architectural decision as an ADR in [docs/adr/](docs/adr/), and lasting reference material in
   [docs/knowledge/](docs/knowledge/).

See [docs/development-workflow.md](docs/development-workflow.md) for details.

## Project organization

Every file has one correct place, and unit tests enforce it. Read
[docs/specs/project-organization.md](docs/specs/project-organization.md) before you add a file or
folder. If a test in `tests/organization/` fails, move the file or fix the document. Change the
rule only by updating the spec and the test together.

## Running the checks

You need Node.js 22 or later and the .NET 10 SDK.

```bash
./scripts/check.sh
```

## Making changes

A good pull request:

- Solves one problem.
- Makes the smallest reasonable change.
- Includes a unit test for new or changed behavior.
- Passes the formatting and linting checks.
- Doesn't bundle in an unrelated refactor.

## Pull requests

Explain what changed, why, and how you tested it:

```text
## Summary
Ends the game when the schnauzer's paws touch the ground.

## Why
The schnauzer sank 64 pixels into the ground before the game ended.

## Testing
./scripts/check.sh
```

Reference the work item in the pull request body, for example `Closes #123`.

## Commit messages

Keep them short, and describe intent:

```text
feat(game): add a medal at 10 points
fix(physics): end the game when the paws touch the ground
docs(adr): record the virtual resolution decision
```

## Reporting bugs

Include what you expected, what happened instead, the steps involved, your browser and its
version, and the commit you ran.

## License

The project is under the MIT License. By contributing, you agree that your contributions are
licensed under the same license. See [LICENSE](LICENSE).
