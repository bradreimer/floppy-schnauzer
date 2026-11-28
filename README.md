# Floppy Schnauzer

A caped, goofy schnauzer flaps between pipes. Tap or click to flap, and score a point for each
pipe you pass. The game draws with WebGPU in the browser, and a small ASP.NET Core server serves
it from one Docker container.

| Part | Technology | Folder |
| --- | --- | --- |
| Game | TypeScript, WebGPU, and Vite | `apps/web` |
| Server | ASP.NET Core on .NET 10 | `apps/server` |
| Image | One Docker container | `docker` |

## Play

Open the game in a browser that supports WebGPU, such as a current Chrome, Edge, or Safari. Tap
or click the game, or press Space: the first press starts a round, and each press after that
flaps. When you hit a pipe, the ceiling, or the ground, the round ends. Press again to play
again.

Your best score is saved in this browser, so it's still there when you come back.

If your browser doesn't support WebGPU, the game shows "WebGPU not supported on this
device/browser." If anything else stops it from starting, it asks you to reload.

## Develop

You need Node.js 22 or later and the .NET 10 SDK.

```bash
cd apps/web
npm install
npm run dev
```

The development server runs at `http://localhost:5173`. To reach it from another device, set
`VITE_HOST=0.0.0.0` and `VITE_HMR_HOST` to your machine's name.

Before you commit, run every check from the repository root:

```bash
./scripts/check.sh
```

The workflow, from idea to commit, is in [CONTRIBUTING.md](CONTRIBUTING.md). The documentation
map is in [docs/README.md](docs/README.md).

## Run in Docker

```bash
cp .env.example .env
docker compose -f docker/compose.yml --env-file .env up --build
```

Then open `http://localhost:8080`. The server answers `GET /api/health` with
`{"status":"ok"}`.
Docker checks that endpoint every 30 s, so `docker ps` shows the container as `healthy` or
`unhealthy`.

## Configuration

Docker Compose reads these variables from `.env`. `.env.example` lists them with their defaults.

| Variable | Default | What it does |
| --- | --- | --- |
| `PORT_API` | `8080` | The port on your machine that maps to the server's port 8080 |
| `ASPNETCORE_ENVIRONMENT` | `Production` | The ASP.NET Core environment name: `Development` or `Production` |

## License

Floppy Schnauzer is under the MIT License. See [LICENSE](LICENSE).
