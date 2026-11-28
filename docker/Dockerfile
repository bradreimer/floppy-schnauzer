# syntax=docker/dockerfile:1

# Build from the repository root:
#   docker build -f docker/Dockerfile -t floppy-schnauzer .

# Stage 1 builds the web app with Node.js. Its output is plain files.
FROM node:22-slim AS web
WORKDIR /web

# Install first, so a change to the code doesn't download the packages again.
COPY apps/web/package.json apps/web/package-lock.json ./
RUN npm ci

COPY apps/web/ ./
RUN npm run build

# Stage 2 builds the server with the .NET SDK.
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /source

# Restore first, so a change to the code doesn't download the packages again.
COPY .editorconfig apps/server/global.json apps/server/Directory.Build.props apps/server/stylecop.json ./
COPY apps/server/src/FloppySchnauzer.Api/FloppySchnauzer.Api.csproj src/FloppySchnauzer.Api/
RUN dotnet restore src/FloppySchnauzer.Api

COPY apps/server/src/ src/
RUN dotnet publish src/FloppySchnauzer.Api -c Release --no-restore -o /app

# Stage 3 is the image that runs. It holds the ASP.NET Core runtime only.
FROM mcr.microsoft.com/dotnet/aspnet:10.0

# Inside the container, the server listens on port 8080.
ENV ASPNETCORE_HTTP_PORTS=8080 \
    DOTNET_EnableDiagnostics=0

WORKDIR /app
COPY --from=build /app ./
COPY --from=web /web/dist/ ./wwwroot/

# The base image provides this non-root user.
USER $APP_UID
EXPOSE 8080

# The image has no curl or wget, so the server checks itself: it requests /api/health and exits 0
# when the answer is ok. "docker ps" shows the result as healthy or unhealthy.
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD ["dotnet", "/app/FloppySchnauzer.Api.dll", "healthcheck"]

ENTRYPOINT ["dotnet", "FloppySchnauzer.Api.dll"]
