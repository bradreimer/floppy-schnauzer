# ============================
# 1. Build Frontend (Vite + TS)
# ============================
FROM node:20 AS frontend-build
WORKDIR /app/frontend

# Install dependencies
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

# Copy source
COPY frontend/ ./

# Build to /app/frontend/dist
RUN npm run build


# ============================
# 2. Build Backend (.NET 10)
# ============================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src

# Copy backend project
COPY backend/FloppySchnauzer.Api ./FloppySchnauzer.Api

# Copy frontend build output into backend's wwwroot/dist
COPY --from=frontend-build /app/frontend/dist ./FloppySchnauzer.Api/wwwroot/dist

# Publish backend
WORKDIR /src/FloppySchnauzer.Api
RUN dotnet publish -c Release -o /app/publish


# ============================
# 3. Final Runtime Image
# ============================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

COPY --from=backend-build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "FloppySchnauzer.Api.dll"]
