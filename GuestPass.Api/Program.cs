using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using GuestPass.Api.Data;
using GuestPass.Api.Middleware;
using GuestPass.Api.Repositories;
using GuestPass.Api.Services;
using Npgsql;
using Serilog;
using System.Text;

// Konfigurasi Serilog
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft.AspNetCore", Serilog.Events.LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.File("Logs/log-.txt", rollingInterval: RollingInterval.Day, retainedFileCountLimit: 7)
    .CreateLogger();

try
{
    Log.Information("Starting GuestPass API");

    var builder = WebApplication.CreateBuilder(args);

    // Gunakan Serilog sebagai logger
    builder.Host.UseSerilog();

    // JWT Settings
    var jwtSettings = builder.Configuration.GetSection("Jwt");
    var key = Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? "KunciRahasiaDefaultMinimal32Karakter");

    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddHttpClient();

    // Swagger dengan JWT Bearer support
    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "GuestPass API",
            Version = "v1",
            Description = "API untuk manajemen tamu event dengan QR Code check-in"
        });

        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Masukkan token JWT. Contoh: eyJhbGciOiJIUzI1NiIs..."
        });

        options.AddSecurityRequirement(new OpenApiSecurityRequirement
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

    // CORS Policy
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowAll",
            policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
    });

    // Authentication & Authorization
    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            ClockSkew = TimeSpan.Zero
        };
    });

    builder.Services.AddAuthorization();

    // Database Connection
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
    var dataSource = dataSourceBuilder.Build();

    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(dataSource));

    // Health Checks
    builder.Services.AddHealthChecks()
        .AddNpgSql(connectionString ?? "", name: "postgresql");

    // Dependency Injection - Repositories
    builder.Services.AddScoped<IEventRepository, EventRepository>();
    builder.Services.AddScoped<IGuestRepository, GuestRepository>();
    builder.Services.AddScoped<IProfileRepository, ProfileRepository>();

    // Dependency Injection - Services
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<IEventService, EventService>();
    builder.Services.AddScoped<IGuestService, GuestService>();
    builder.Services.AddScoped<IProfileService, ProfileService>();
    builder.Services.AddScoped<IEmailService, EmailService>();

    var app = builder.Build();

    // Auto-migrate database
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Drop old migration history if it contains outdated entries
        try
        {
            dbContext.Database.ExecuteSqlRaw(
                "DROP TABLE IF EXISTS \"__EFMigrationsHistory\" CASCADE;");
        }
        catch { /* table might not exist */ }

        dbContext.Database.Migrate();
    }

    app.UseMiddleware<GlobalExceptionMiddleware>();

    // Swagger (aktif di semua environment untuk dokumentasi)
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "GuestPass API v1");
        c.RoutePrefix = "swagger";
    });

    app.UseCors("AllowAll");
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();
    app.MapHealthChecks("/health");

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
