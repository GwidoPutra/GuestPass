using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GuestPass.Api.DTOs;
using GuestPass.Api.Services;
using System.Security.Claims;

namespace GuestPass.Api.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class EventController : ControllerBase
{
    private readonly IEventService _eventService;

    public EventController(IEventService eventService)
    {
        _eventService = eventService;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Mengambil semua event milik user yang sedang login.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetEvents()
    {
        var events = await _eventService.GetEventsByOwnerAsync(GetUserId());
        return Ok(events);
    }

    /// <summary>
    /// Mengambil detail event berdasarkan ID.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetEvent(Guid id)
    {
        var result = await _eventService.GetEventByIdAsync(id, GetUserId());
        if (result == null) return NotFound(new { message = "Event tidak ditemukan." });
        return Ok(result);
    }

    /// <summary>
    /// Membuat event baru.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> PostEvent([FromBody] CreateEventRequest request)
    {
        var result = await _eventService.CreateEventAsync(request, GetUserId());
        return CreatedAtAction(nameof(GetEvent), new { id = result.Id }, result);
    }

    /// <summary>
    /// Memperbarui event yang sudah ada.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> PutEvent(Guid id, [FromBody] UpdateEventRequest request)
    {
        var result = await _eventService.UpdateEventAsync(id, request, GetUserId());
        if (result == null) return NotFound(new { message = "Event tidak ditemukan atau bukan milik Anda." });
        return Ok(result);
    }

    /// <summary>
    /// Menghapus event beserta seluruh data tamu.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEvent(Guid id)
    {
        var success = await _eventService.DeleteEventAsync(id, GetUserId());
        if (!success) return NotFound(new { message = "Event tidak ditemukan atau bukan milik Anda." });
        return NoContent();
    }
}
