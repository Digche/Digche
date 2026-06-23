using System.Text;
using FoodOrdering.Core.Domain.Interfaces;
using FoodOrdering.Core.Infrastructure.Data;
using FoodOrdering.Core.Infrastructure.Repositories;
using FoodOrdering.Core.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ============================
// 1. Add Services
// ============================

// Controllers
builder.Services.AddControllers();

// ============================
// MediatR
// ============================
builder.Services.AddMediatR(cfg =>
{
    // اسمبلی‌های حاوی Command/Query handlers (همان لایه‌ی Application)
    cfg.RegisterServicesFromAssembly(typeof(FoodOrdering.Core.Application.Commands.AddDish.AddDishCommand).Assembly);
    // یا اگر کلاس خاصی مد نظر نیست، می‌توانید کل اسمبلی Application را ثبت کنید:
    // cfg.RegisterServicesFromAssemblyContaining<FoodOrdering.Core.Application.Common.Result>();
});

// OpenAPI (Scalar) for .NET 9
builder.Services.AddOpenApi();

// Swagger (Swashbuckle) for better UI
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "FoodOrdering Core API",
        Version = "v1",
        Description = "Core microservice for managing orders, dishes, carts, and chefs."
    });

    // Add JWT Authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// PostgreSQL DbContext
builder.Services.AddDbContext<CoreDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register Repositories
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<IChefProfileRepository, ChefProfileRepository>();
builder.Services.AddScoped<IDishRepository, DishRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();

// ============================
// جدید: ثبت IUserContext
// ============================
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserContext, UserContext>();

// JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("JWT Secret is not configured in appsettings.json");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

builder.Services.AddAuthorization();

// CORS (allow all for development)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Health Checks (built-in)
builder.Services.AddHealthChecks()
    .AddDbContextCheck<CoreDbContext>();

// ============================
// 2. Build App
// ============================

var app = builder.Build();

// ============================
// 3. Configure Pipeline
// ============================

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "FoodOrdering Core API v1"));
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health Check endpoint (standard)
app.MapHealthChecks("/health");

// ============================
// 4. Run
// ============================

app.Run();