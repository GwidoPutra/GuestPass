using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GuestPass.Api.Data;
using GuestPass.Api.Models;

namespace GuestPass.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProfileController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/Profile (Ambil Semua Data)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Profile>>> GetProfiles()
    {
        return await _context.Profiles.ToListAsync();
    }

    // POST: api/Profile (Tambah Data / Register)
    [HttpPost]
    public async Task<ActionResult<Profile>> PostProfile(Profile profile)
    {
        profile.Id = Guid.NewGuid();
        profile.CreatedAt = DateTime.UtcNow;
        _context.Profiles.Add(profile);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProfiles), new { id = profile.Id }, profile);
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
}