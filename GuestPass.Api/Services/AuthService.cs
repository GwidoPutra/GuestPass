using GuestPass.Api.Data;
using GuestPass.Api.DTOs;
using GuestPass.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace GuestPass.Api.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthService> _logger;

    public AuthService(AppDbContext context, IConfiguration config, ILogger<AuthService> logger)
    {
        _context = context;
        _config = config;
        _logger = logger;
    }

    public async Task<string?> RegisterAsync(RegisterRequest request)
    {
        if (await _context.Profiles.AnyAsync(u => u.Email == request.Email))
            throw new InvalidOperationException("Email sudah terdaftar.");

        if (await _context.Profiles.AnyAsync(u => u.Username == request.Username))
            throw new InvalidOperationException("Username sudah digunakan.");

        var user = new Profile
        {
            Username = request.Username,
            Email = request.Email,
            FullName = request.FullName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsApproved = false
        };

        _context.Profiles.Add(user);
        await _context.SaveChangesAsync();

        _logger.LogInformation("User baru terdaftar: {Email}", request.Email);
        return "User berhasil didaftarkan. Menunggu persetujuan admin.";
    }

    public async Task<object?> LoginAsync(LoginRequest request)
    {
        var user = await _context.Profiles.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
            throw new UnauthorizedAccessException("Email atau password salah.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Email atau password salah.");

        if (!user.IsApproved)
            throw new UnauthorizedAccessException("Akun belum disetujui oleh admin.");

        var token = GenerateJwtToken(user);

        _logger.LogInformation("User {Email} berhasil login", request.Email);

        return new { token, role = user.Role };
    }

    private string GenerateJwtToken(Profile user)
    {
        var jwtSettings = _config.GetSection("Jwt");
        var keyStr = jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key not configured.");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyStr));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role ?? "panitia")
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(1),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
