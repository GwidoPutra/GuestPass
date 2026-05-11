using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using GuestPass.Api.Data;
using GuestPass.Api.Models;
using System.Security.Claims; 

namespace GuestPass.Api.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController] // untuk validasi model otomatis
public class EventController : ControllerBase
{
    private readonly AppDbContext _context;

    public EventController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/Event
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Event>>> GetEvents()
    {
        // Filter agar panitia hanya melihat event buatannya sendiri
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return await _context.Events
            .Where(e => e.CreatedBy == userId)
            .ToListAsync();
    }

    // GET: api/Event/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Event>> GetEvent(Guid id)
    {
        var @event = await _context.Events.FindAsync(id);

        if (@event == null) return NotFound();

        // Proteksi supaya tidak bisa mengintip event orang lain lewat ID
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (@event.CreatedBy != userId) return Forbid();

        return @event;
    }

    // POST: api/Event
    [HttpPost]
    public async Task<ActionResult<Event>> PostEvent(Event @event)
    {
        // Ambil ID user dari token JWT secara otomatis
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        @event.CreatedBy = Guid.Parse(userId); // Set pemilik event
        
        _context.Events.Add(@event);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEvent), new { id = @event.Id }, @event);
    }

    // PUT: api/Event/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> PutEvent(Guid id, Event updatedEvent)
    {
        var @event = await _context.Events.FindAsync(id);
        if (@event == null) return NotFound();

        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (@event.CreatedBy != userId) return Forbid();

        @event.Name = updatedEvent.Name;
        @event.Location = updatedEvent.Location;
        @event.Date = updatedEvent.Date;

        await _context.SaveChangesAsync();
        return Ok(@event);
    }

    // DELETE: api/Event/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEvent(Guid id)
    {
        var @event = await _context.Events.FindAsync(id);
        if (@event == null) return NotFound();

        // Proteksi supaya tidak bisa menghapus event milik orang lain
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (@event.CreatedBy != userId) return Forbid();

        _context.Events.Remove(@event);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}