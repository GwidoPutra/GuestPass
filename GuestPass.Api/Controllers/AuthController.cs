using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GuestPass.Api.Data;
using GuestPass.Api.Models;
using GuestPass.Api.DTOs;

namespace GuestPass.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    // POST: api/Auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register(Profile profile)
    {
        if (await _context.Profiles.AnyAsync(u => u.Email == profile.Email))
            return BadRequest("Email sudah terdaftar.");

        profile.Id = Guid.NewGuid();
        profile.CreatedAt = DateTime.UtcNow;
        
        _context.Profiles.Add(profile);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Registrasi berhasil!", data = profile });
    }

    // POST: api/Auth/login (Simulasi sederhana)
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Profiles
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.PasswordHash == request.Password);

        if (user == null) return Unauthorized("Email atau Password salah.");

        return Ok(new { message = "Login berhasil!", user });
    }
}

public record LoginRequest(string Email, string Password);