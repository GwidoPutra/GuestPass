using Microsoft.AspNetCore.Mvc;
using GuestPass.Api.Data;
using GuestPass.Api.Models;
using GuestPass.Api.DTOs;
using BCrypt.Net;
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
        public IActionResult Register(RegisterRequest request)
        {
            // Gunakan 'Profiles' dan 'Email' (PascalCase)
            if (_context.Profiles.Any(u => u.Email == request.Email))
                return BadRequest("Email sudah terdaftar.");

            var newProfile = new Profile
            {
                Username = request.Username,
                Email = request.Email,
                Fullname = request.Fullname,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = "Panitia"
            };

            _context.Profiles.Add(newProfile);
            _context.SaveChanges();

            return Ok("Registrasi berhasil.");
        }

        [HttpPost("login")]
        public IActionResult Login(LoginRequest request)
        {
            var user = _context.Profiles.FirstOrDefault(u => u.Email == request.Email);
            if (user == null)
                return Unauthorized("User tidak ditemukan di DB.");

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return Unauthorized("Password salah. Hash di DB: " + user.PasswordHash);

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
                new Claim(ClaimTypes.Role, user.Role)
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