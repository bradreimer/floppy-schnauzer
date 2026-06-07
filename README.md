# Floppy Schnauzer

A WebGPU + ASP.NET Core game starring a caped, goofy schnauzer, plus a Firefly MCP server for asset generation.

## Structure

- `src/FloppySchnauzer.Api` — ASP.NET Core app serving the game
- `src/FloppySchnauzer.Api/wwwroot` — WebGPU client + assets
- `firefly-mcp` — Node-based MCP server wrapping Adobe Firefly

## Running the game

```bash
cd src/FloppySchnauzer.Api
dotnet run
# or with Docker:
# docker build -t floppy-schnauzer .
# docker run --rm -p 8080:8080 floppy-schnauzer
