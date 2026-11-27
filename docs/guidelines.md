# Project guidelines

These seven guidelines apply to every change. Each one states the rule, the method used to follow
it, and where it's enforced. If a guideline and another document disagree, fix the other document.

## 1. State intention and methodology plainly

**Rule.** Every document and design says what it's for and how it works. No vague concepts.

**Method.**

- Open with the purpose: what the document decides, specifies, or describes, and for whom.
- Name the mechanism. Write "`updatePhysics` adds `GRAVITY * dt` to the vertical speed", not "the
  game applies physics".
- Use numbers, names, and examples where an adjective would otherwise go.
- Say what isn't known yet, and what will settle it.

**Enforced by.** The fixed sections of ADRs and specs, which a test checks, and review. A reviewer
rejects a document that a newcomer couldn't act on.

## 2. Keep the project cleanly organized at all times

**Rule.** Every file has one correct place. When the organization stops fitting, stop and
reorganize before adding more.

**Method.**

- Follow [specs/project-organization.md](specs/project-organization.md).
- When a new kind of file has no home, update that spec and its tests first, then add the file.
- A reorganization is its own work item and its own commit, separate from feature work.

**Enforced by.** The tests in `tests/organization/`, run by `./scripts/check.sh` and CI.

## 3. Handle secrets through the environment, starting with `.env`

**Rule.** No secret is ever committed, logged, or sent to the browser.

**Method.**

- Settings and secrets reach the server as environment variables. Docker Compose loads them from
  a `.env` file.
- `.env` is ignored by Git. `.env.example` is committed and lists every variable with secret
  values left empty.
- The game runs in the browser, so it never holds a secret. Anything secret stays on the server.

**Enforced by.** Tests that fail if `.env` is tracked, if `.gitignore` stops ignoring it, or if
`.env.example` holds a secret value.

## 4. Use TypeScript and WebGPU for the game, and C# for the server

**Rule.** The game is TypeScript that draws with WebGPU. The server is .NET (C#).

**Method.** The game is a Vite project in `apps/web`. The server is an ASP.NET Core app in
`apps/server` that serves the built game as static files and owns every API route.

**Enforced by.** [ADR-001](adr/ADR-001-technology-stack.md).

## 5. Ship the game and the server as one Docker container

**Rule.** One image holds the server and the built game.

**Method.** `docker/Dockerfile` builds the game with Node.js, builds the server with the .NET
SDK, and copies both into an image that holds only the ASP.NET Core runtime.

**Enforced by.** [ADR-002](adr/ADR-002-one-container-serves-the-built-game.md).

## 6. Play fair on every screen and refresh rate

**Rule.** The game plays the same on a phone, a tablet, and a desktop, at 60 Hz or 120 Hz.

**Method.**

- The world is a fixed 400 × 700 virtual resolution. The canvas scales to fit the window, with
  bars on the sides or top when the shape differs.
- Every movement is scaled by the frame time `dt`, in seconds.
- Input is a pointer event, so a tap, a click, and a pen all work.

**Enforced by.** [ADR-003](adr/ADR-003-a-fixed-virtual-resolution.md), the
[gameplay spec](specs/gameplay.md), and its tests.

## 7. Validate new functionality with unit tests, and pass formatting and linting

**Rule.** New functionality comes with a unit test. Every check-in passes the formatting and
linting checks.

**Method.**

- `./scripts/check.sh` runs every formatter check, linter, and test. Run it before each commit.
- CI runs the same script on every push and pull request, and a failing check blocks the merge.
- A bug fix comes with a regression test.

**Enforced by.** [specs/quality-gates.md](specs/quality-gates.md), CI, and tests that fail if the
check script drops a required step.
