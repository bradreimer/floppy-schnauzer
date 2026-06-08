# ============================
# 1. Build Frontend (Vite)
# ============================
FROM node:20 AS frontend-build
WORKDIR /app

COPY frontend ./frontend
COPY backend ./backend

WORKDIR /app/frontend
RUN npm ci
RUN npm run build


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
