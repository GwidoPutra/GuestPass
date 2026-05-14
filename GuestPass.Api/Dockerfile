# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY GuestPass.Api.csproj .
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

# Buat folder untuk logs
RUN mkdir -p /app/Logs

ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "GuestPass.Api.dll"]
