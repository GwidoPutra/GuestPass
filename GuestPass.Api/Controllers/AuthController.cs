using Microsoft.AspNetCore.Mvc;
using GuestPass.Data;
using GuestPass.Models;
using GuestPass.DTOs;
using BCrypt.Net;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace GuestPass.Controllers
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
            // Cek apakah email sudah ada
            if (_context.profiles.Any(u => u.email == request.Email))
                return BadRequest("Email sudah terdaftar.");

            var newProfile = new Profile
            {
                username = request.Username,
                email = request.Email,
                fullname = request.Fullname,
                passwordhash = BCrypt.Net.BCrypt.HashPassword(request.Password), // Hash password!
                role = "Panitia"
            };

            _context.profiles.Add(newProfile);
            _context.SaveChanges();

            return Ok("Registrasi berhasil.");
        }

        [HttpPost("login")]
        public IActionResult Login(LoginRequest request)
        {
            var user = _context.profiles.FirstOrDefault(u => u.email == request.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.passwordhash))
                return Unauthorized("Email atau password salah.");

            var token = GenerateJwtToken(user);
            return Ok(new { token = token, role = user.role });
        }

        private string GenerateJwtToken(Profile user)
        {
            var jwtSettings = _config.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]));
            
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.id.ToString()),
                new Claim(ClaimTypes.Email, user.email),
                new Claim(ClaimTypes.Role, user.role)
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