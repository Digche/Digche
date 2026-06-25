# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY FoodOrdering.Core.API/FoodOrdering.Core.API.csproj FoodOrdering.Core.API/
COPY FoodOrdering.Core.Application/FoodOrdering.Core.Application.csproj FoodOrdering.Core.Application/
COPY FoodOrdering.Core.Domain/FoodOrdering.Core.Domain.csproj FoodOrdering.Core.Domain/
COPY FoodOrdering.Core.Infrastructure/FoodOrdering.Core.Infrastructure.csproj FoodOrdering.Core.Infrastructure/
COPY FoodOrdering.Core.Tests/FoodOrdering.Core.Tests.csproj FoodOrdering.Core.Tests/

RUN dotnet restore "FoodOrdering.Core.API/FoodOrdering.Core.API.csproj"

# Copy all source code
COPY . .

# Build and publish the API project
WORKDIR /src/FoodOrdering.Core.API
RUN dotnet publish "FoodOrdering.Core.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Copy published output from build stage
COPY --from=build /app/publish .

# Set environment variable for ASP.NET Core to listen on port 80
ENV ASPNETCORE_URLS=http://+:80

ENTRYPOINT ["dotnet", "FoodOrdering.Core.API.dll"]