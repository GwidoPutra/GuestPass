using Microsoft.AspNetCore.Mvc;
using GuestPass.Api.Data;
using GuestPass.Api.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace GuestPass.Api.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class GuestController : ControllerBase
{
    private readonly AppDbContext _context;

    public GuestController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/Guest?eventId={eventId}
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Guest>>> GetGuests([FromQuery] Guid eventId)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // Validasi bahwa event milik user yang login
        var eventEntity = await _context.Events.FindAsync(eventId);
        if (eventEntity == null) return NotFound("Event tidak ditemukan.");
        if (eventEntity.CreatedBy != userId) return Forbid();

        var guests = await _context.Guests
            .Where(g => g.EventId == eventId)
            .ToListAsync();

        return Ok(guests);
    }

    // GET: api/Guest/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Guest>> GetGuest(Guid id)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var guest = await _context.Guests.FindAsync(id);
        if (guest == null) return NotFound("Guest tidak ditemukan.");

        // Validasi bahwa event milik user yang login
        var eventEntity = await _context.Events.FindAsync(guest.EventId);
        if (eventEntity == null) return NotFound("Event tidak ditemukan.");
        if (eventEntity.CreatedBy != userId) return Forbid();

        return Ok(guest);
    }

    // POST: api/Guest
    [HttpPost]
    public async Task<ActionResult<Guest>> PostGuest(Guest guest)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // Validasi bahwa event milik user yang login
        var eventEntity = await _context.Events.FindAsync(guest.EventId);
        if (eventEntity == null) return NotFound("Event tidak ditemukan.");
        if (eventEntity.CreatedBy != userId) return Forbid();

        // Generate Token Unik
        guest.QRCodeToken = "GP-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper();

        _context.Guests.Add(guest);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetGuest), new { id = guest.Id }, guest);
    }

    // PUT: api/Guest/{id}/checkin
    [HttpPut("{id}/checkin")]
    public async Task<IActionResult> CheckInGuest(Guid id)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var guest = await _context.Guests.FindAsync(id);
        if (guest == null) return NotFound("Guest tidak ditemukan.");

        // Validasi bahwa event milik user yang login
        var eventEntity = await _context.Events.FindAsync(guest.EventId);
        if (eventEntity == null) return NotFound("Event tidak ditemukan.");
        if (eventEntity.CreatedBy != userId) return Forbid();

        // Cegah double check-in
        if (guest.IsCheckedIn)
            return BadRequest("Guest sudah di-check-in sebelumnya.");

        guest.IsCheckedIn = true;
        guest.CheckedInAt = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(guest);
    }

    // DELETE: api/Guest/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGuest(Guid id)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var guest = await _context.Guests.FindAsync(id);
        if (guest == null) return NotFound("Guest tidak ditemukan.");

        // Validasi bahwa event milik user yang login
        var eventEntity = await _context.Events.FindAsync(guest.EventId);
        if (eventEntity == null) return NotFound("Event tidak ditemukan.");
        if (eventEntity.CreatedBy != userId) return Forbid();

        _context.Guests.Remove(guest);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
