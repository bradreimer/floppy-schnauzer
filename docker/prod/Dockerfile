# ============================
# 1. Build Frontend (Vite)
# ============================
FROM node:20 AS frontend-build
WORKDIR /app

# Disable Husky during Docker build
ENV HUSKY=0

# Copy workspace root files
COPY package.json package-lock.json ./

# Copy workspace packages
COPY frontend ./frontend
COPY backend ./backend

# Install only the frontend workspace
RUN npm ci --workspace=frontend

# Build the frontend workspace
RUN npm run build --workspace=frontend

# ============================
# 2. Build Backend (.NET)
# ============================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src

COPY --from=frontend-build /app/backend ./backend

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
