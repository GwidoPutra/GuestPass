using System.ComponentModel.DataAnnotations;

namespace GuestPass.Api.DTOs;

public class CreateGuestRequest
{
    [Required(ErrorMessage = "Event ID wajib diisi.")]
    public Guid EventId { get; set; }

    [Required(ErrorMessage = "Nama tamu wajib diisi.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Nama harus 2-100 karakter.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email wajib diisi.")]
    [EmailAddress(ErrorMessage = "Format email tidak valid.")]
    public string Email { get; set; } = string.Empty;
}
