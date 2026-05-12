using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GuestPass.Api.DTOs;
using GuestPass.Api.Services;
using System.Security.Claims;

namespace GuestPass.Api.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class GuestController : ControllerBase
{
    private readonly IGuestService _guestService;

    public GuestController(IGuestService guestService)
    {
        _guestService = guestService;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Mengambil daftar tamu berdasarkan event ID.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetGuests([FromQuery] Guid eventId)
    {
        var guests = await _guestService.GetGuestsByEventAsync(eventId, GetUserId());
        return Ok(guests);
    }

    /// <summary>
    /// Mengambil detail tamu berdasarkan ID.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetGuest(Guid id)
    {
        var result = await _guestService.GetGuestByIdAsync(id, GetUserId());
        if (result == null) return NotFound(new { message = "Tamu tidak ditemukan." });
        return Ok(result);
    }

    /// <summary>
    /// Menambahkan tamu baru ke event. QR code dibuat otomatis.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> PostGuest([FromBody] CreateGuestRequest request)
    {
        var result = await _guestService.CreateGuestAsync(request, GetUserId());
        if (result == null) return NotFound(new { message = "Event tidak ditemukan atau bukan milik Anda." });
        return CreatedAtAction(nameof(GetGuest), new { id = result.Id }, result);
    }

    /// <summary>
    /// Check-in tamu. Tidak bisa dilakukan dua kali.
    /// </summary>
    [HttpPut("{id}/checkin")]
    public async Task<IActionResult> CheckInGuest(Guid id)
    {
        var result = await _guestService.CheckInGuestAsync(id, GetUserId());
        if (result == null) return NotFound(new { message = "Tamu tidak ditemukan atau bukan milik Anda." });
        return Ok(result);
    }

    /// <summary>
    /// Menghapus tamu dari event.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGuest(Guid id)
    {
        var success = await _guestService.DeleteGuestAsync(id, GetUserId());
        if (!success) return NotFound(new { message = "Tamu tidak ditemukan atau bukan milik Anda." });
        return NoContent();
    }
}
