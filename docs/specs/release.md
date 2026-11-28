# Release

Tracking issue: [#40](https://github.com/bradreimer/floppy-schnauzer/issues/40).

## Purpose

This spec defines how a version of the game is published as a Docker image, and which image tags
mean what. Before it, every merge to `main` moved `latest`, so there was no way to pin a version or
roll back.

Think of the tags as shelves. `edge` is the workbench: whatever was merged last. A version such as
`0.6.0` is a labeled box on the shelf that never changes. `latest` points at the newest box.

```text
merge to main ──▶ publish-image.yml ──▶ :edge, :sha-<commit>       (version edge-<commit>)
push tag v0.6.0 ─▶ release.yml ───────▶ :0.6.0, :latest            (version 0.6.0)
pull request ───▶ publish-image.yml ──▶ build only, nothing pushed
```

## User story

As someone hosting the game, I want versioned images such as `0.6.0`, so that I can pin a version
and roll back.

## Goals

- `latest` moves only when the maintainer tags a release.
- A release can only come from a commit on `main` that passed CI.
- The running server says which version it is.
- Every pull request still proves the image builds.

## Non-goals

- Images for more than one CPU architecture. The image is built for amd64 only.
- Release notes. The GitHub release page and the status doc cover them by hand.

## Requirements

### Publish on main

- `.github/workflows/publish-image.yml` runs on every push to `main`, every pull request to `main`,
  and by hand.
- On a pull request it builds `docker/Dockerfile` and pushes nothing.
- On `main` it pushes `ghcr.io/bradreimer/floppy-schnauzer:edge` and `:sha-<commit>`, with the
  version `edge-` and the first 7 characters of the commit. It never pushes `latest`.

### Release from a tag

- `.github/workflows/release.yml` runs only for tags that match `v*.*.*`.
- It fails, and pushes nothing, when the tag isn't `vMAJOR.MINOR.PATCH`, when the tagged commit
  isn't on `main`, or when the CI workflow hasn't passed on that commit.
- Otherwise it pushes `:MAJOR.MINOR.PATCH` (the tag without the `v`) and `:latest`.

### The version in the image

- Both workflows pass the version to the build as `VERSION`. The Dockerfile sets
  `FLOPPY_SCHNAUZER_VERSION` from it, `dev` when it isn't passed.
- `GET /api/health` answers `{"status":"ok","version":"<version>"}`.

### How to release

1. Make sure the change is merged to `main` and CI passed on it.
2. Update [status.md](../status.md) with what the release holds.
3. Tag the merge commit and push the tag, for example `git tag v0.6.0` and `git push origin v0.6.0`.
4. Check that the Release workflow passed, and that `/api/health` on the new image reports the
   version.

## Acceptance criteria

- Organization tests fail if `release.yml` loses a safeguard (the tag pattern, the `main` check,
  the CI check, or the version), runs for branches, or if `publish-image.yml` pushes `latest`,
  stops pushing `edge` or the commit tag, or pushes from a pull request.
- `/api/health` reports the version, `dev` outside the image (an xUnit test).

## Open questions

- The first tag, `v0.6.0`, is the maintainer's to push once version 0.6 is merged.
