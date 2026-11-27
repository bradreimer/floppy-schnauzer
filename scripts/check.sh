#!/usr/bin/env bash
# Runs every check that must pass before a change is done.
# The checks are defined in docs/specs/quality-gates.md.

set -euo pipefail

cd "$(dirname "$0")/.."

(
  cd apps/server
  echo "==> Server: restore"
  dotnet restore
  echo "==> Server: formatting and analyzer rules"
  dotnet format --verify-no-changes --no-restore
  echo "==> Server: build, with warnings as errors"
  dotnet build --no-restore -warnaserror
  echo "==> Server: tests"
  dotnet test --no-build
)

(
  cd apps/web
  echo "==> Web: install"
  npm ci
  echo "==> Web: formatting"
  npm run format:check
  echo "==> Web: lint"
  npm run lint
  echo "==> Web: types"
  npm run typecheck
  echo "==> Web: tests"
  npm test
  echo "==> Web: build"
  npm run build
)

echo "==> All checks passed"
