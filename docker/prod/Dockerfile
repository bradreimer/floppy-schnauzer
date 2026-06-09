# ============================
# 1. Build Frontend (Vite)
# ============================
FROM node:20 AS frontend-build
WORKDIR /app

# Copy only root workspace files first (best cache behavior)
COPY package.json package-lock.json ./

# Copy only frontend package.json first (cache npm ci)
COPY frontend/package.json frontend/package.json

# Install only the frontend workspace deps
RUN npm ci --workspace=frontend

# Now copy the full frontend source
COPY frontend ./frontend

# Build the frontend
RUN npm run build --workspace=frontend


# ============================
# 2. Build Backend (.NET)
# ============================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src

# Copy backend source
COPY backend ./backend

# Copy built frontend output into backend wwwroot
COPY --from=frontend-build /app/frontend/dist ./backend/FloppySchnauzer.Api/wwwroot

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
