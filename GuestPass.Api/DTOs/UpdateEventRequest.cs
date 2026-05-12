using System.ComponentModel.DataAnnotations;

namespace GuestPass.Api.DTOs;

public class UpdateEventRequest
{
    [Required(ErrorMessage = "Nama event wajib diisi.")]
    [StringLength(200, MinimumLength = 2, ErrorMessage = "Nama event harus 2-200 karakter.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Lokasi wajib diisi.")]
    [StringLength(300, MinimumLength = 2, ErrorMessage = "Lokasi harus 2-300 karakter.")]
    public string Location { get; set; } = string.Empty;

    [Required(ErrorMessage = "Tanggal wajib diisi.")]
    public DateTimeOffset Date { get; set; }
}
