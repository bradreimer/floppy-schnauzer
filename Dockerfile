# ============================
# 1. Build Frontend (Vite)
# ============================
FROM node:20 AS frontend-build
WORKDIR /app

# Copy frontend
COPY frontend ./frontend

# Copy backend so Vite can write into backend/wwwroot
COPY backend ./backend

# Install frontend deps
WORKDIR /app/frontend
RUN npm ci

# Build — Vite writes directly into ../backend/FloppySchnauzer.Api/wwwroot
RUN npm run build


# ============================
# 2. Build Backend (.NET)
# ============================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src

# Copy backend including the Vite-built wwwroot
COPY --from=frontend-build /app/backend ./backend

# Publish backend
WORKDIR /src/backend/FloppySchnauzer.Api
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
