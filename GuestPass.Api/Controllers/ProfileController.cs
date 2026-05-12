using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GuestPass.Api.Services;

namespace GuestPass.Api.Controllers;

/// <summary>
/// Controller untuk mengelola akun panitia.
/// GET: semua authenticated user bisa akses.
/// PUT/DELETE: hanya superadmin yang bisa mengubah/menghapus.
/// </summary>
[Authorize]
[Route("api/[controller]")]
[ApiController]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;

    public ProfileController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    /// <summary>
    /// Mengambil semua profil panitia.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetProfiles()
    {
        var profiles = await _profileService.GetAllProfilesAsync();
        return Ok(profiles);
    }

    /// <summary>
    /// Mengambil detail profil berdasarkan ID.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProfile(Guid id)
    {
        var profile = await _profileService.GetProfileByIdAsync(id);
        if (profile == null) return NotFound(new { message = "Profil tidak ditemukan." });
        return Ok(profile);
    }

    /// <summary>
    /// Menghapus akun panitia. Hanya superadmin.
    /// </summary>
    [Authorize(Roles = "superadmin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProfile(Guid id)
    {
        var success = await _profileService.DeleteProfileAsync(id);
        if (!success) return NotFound(new { message = "Profil tidak ditemukan." });
        return NoContent();
    }

    /// <summary>
    /// Toggle status persetujuan akun panitia. Hanya superadmin.
    /// </summary>
    [Authorize(Roles = "superadmin")]
    [HttpPut("{id}/approve")]
    public async Task<IActionResult> ToggleApproval(Guid id)
    {
        var result = await _profileService.ToggleApprovalAsync(id);
        if (result == null) return NotFound(new { message = "Profil tidak ditemukan." });
        return Ok(result);
    }
}
