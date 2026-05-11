using Microsoft.AspNetCore.Mvc;
using GuestPass.Api.Data;
using GuestPass.Api.Models;
using GuestPass.Api.DTOs;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace GuestPass.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest registerDto)
        {
            if (await _context.Profiles.AnyAsync(u => u.Email == registerDto.Email))
                return BadRequest("Email sudah terdaftar!");

            var user = new Profile
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                FullName = registerDto.FullName,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                IsApproved = false
                // Role, Id, dan CreatedAt TIDAK boleh diisi di sini
            };

            try
            {
                _context.Profiles.Add(user);
                await _context.SaveChangesAsync();
                return Ok("User berhasil dibuat");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var user = await _context.Profiles.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
                return Unauthorized("User tidak ditemukan.");

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return Unauthorized("Password salah.");

            if (!user.IsApproved)
                return Unauthorized("Akun belum di-approve.");

            var token = GenerateJwtToken(user);
            return Ok(new { token = token, role = user.Role });
        }

        private string GenerateJwtToken(Profile user)
        {
            var jwtSettings = _config.GetSection("Jwt");
            var keyStr = jwtSettings["Key"] ?? "KunciRahasiaDefaultYangSangatPanjang123!";
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
                expires: DateTime.Now.AddDays(1),
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}