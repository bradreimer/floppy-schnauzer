# ADR-002: One Docker image holds the server and the built game

## Status

Accepted

## Context

The game is static files after `vite build`. The server answers API routes such as
`/api/health`. They could ship as two images, or as one.

## Decision

One image. `docker/Dockerfile` has three stages:

1. Build the game with Node.js 22. The output is `apps/web/dist`.
2. Publish the server with the .NET 10 SDK.
3. Copy the server and the game's `dist` folder into the server's `wwwroot`, on the ASP.NET Core
   runtime image, running as its non-root user on port 8080.

The Vite build writes only to `apps/web/dist`. It never writes into the server's source folder.

## Alternatives considered

- **Two images, with a static file server for the game.** Each part can scale on its own. Set
  aside because the game needs no scaling, and two images double the deployment work.
- **Vite writing straight into the server's `wwwroot`.** Saves a copy step. Set aside because a
  web build then changes the server's source tree, and the Docker stages depend on each other's
  folders.

## Consequences

- The game and the API share one origin, so the game needs no CORS settings.
- The image is about the size of the ASP.NET Core runtime plus the game's assets.
- `docker/compose.yml` runs the image locally with the settings in `.env`.
- Docker checks the container's health every 30 s ([#37](https://github.com/bradreimer/floppy-schnauzer/issues/37)). The runtime image has no `curl`
  or `wget`, so `dotnet FloppySchnauzer.Api.dll healthcheck` requests `/api/health` from inside
  the container and exits 0 or 1. `docker ps` shows `healthy` or `unhealthy`.
