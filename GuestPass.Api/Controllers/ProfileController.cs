using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using GuestPass.Api.Data;
using GuestPass.Api.DTOs;

namespace GuestPass.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProfileController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/Profile (Ambil Semua Data tanpa PasswordHash)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProfileResponse>>> GetProfiles()
    {
        var profiles = await _context.Profiles
            .Select(p => new ProfileResponse
            {
                Id = p.Id,
                Username = p.Username,
                Email = p.Email,
                FullName = p.FullName,
                Role = p.Role,
                IsApproved = p.IsApproved,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync();

        return Ok(profiles);
    }

    // GET: api/Profile/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<ProfileResponse>> GetProfile(Guid id)
    {
        var profile = await _context.Profiles.FindAsync(id);
        if (profile == null) return NotFound();

        return Ok(new ProfileResponse
        {
            Id = profile.Id,
            Username = profile.Username,
            Email = profile.Email,
            FullName = profile.FullName,
            Role = profile.Role,
            IsApproved = profile.IsApproved,
            CreatedAt = profile.CreatedAt
        });
    }

    // DELETE: api/Profile/{id} (Hapus Data)
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProfile(Guid id)
    {
        var profile = await _context.Profiles.FindAsync(id);
        if (profile == null) return NotFound();

        _context.Profiles.Remove(profile);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PUT: api/Profile/{id}/approve (Toggle approval status)
    [HttpPut("{id}/approve")]
    public async Task<IActionResult> ToggleApproval(Guid id)
    {
        var profile = await _context.Profiles.FindAsync(id);
        if (profile == null) return NotFound();

        profile.IsApproved = !profile.IsApproved;
        await _context.SaveChangesAsync();

        return Ok(new ProfileResponse
        {
            Id = profile.Id,
            Username = profile.Username,
            Email = profile.Email,
            FullName = profile.FullName,
            Role = profile.Role,
            IsApproved = profile.IsApproved,
            CreatedAt = profile.CreatedAt
        });
    }
}
