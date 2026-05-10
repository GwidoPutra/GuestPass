using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GuestPass.Api.Data;
using GuestPass.Api.Models;

namespace GuestPass.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
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
        return await _context.Events.ToListAsync();
    }

    // GET: api/Event/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Event>> GetEvent(Guid id)
    {
        var @event = await _context.Events.FindAsync(id);
        if (@event == null) return NotFound();
        return @event;
    }

    // POST: api/Event
    [HttpPost]
    public async Task<ActionResult<Event>> PostEvent(Event @event)
    {
        @event.Id = Guid.NewGuid();
        @event.CreatedAt = DateTime.UtcNow;
        
        _context.Events.Add(@event);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEvent), new { id = @event.Id }, @event);
    }

    // DELETE: api/Event/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEvent(Guid id)
    {
        var @event = await _context.Events.FindAsync(id);
        if (@event == null) return NotFound();

        _context.Events.Remove(@event);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}