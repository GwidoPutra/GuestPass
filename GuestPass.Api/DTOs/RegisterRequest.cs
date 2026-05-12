using System.ComponentModel.DataAnnotations;

namespace GuestPass.Api.DTOs;

public class RegisterRequest
{
    [Required(ErrorMessage = "Username wajib diisi.")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Username harus 3-50 karakter.")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email wajib diisi.")]
    [EmailAddress(ErrorMessage = "Format email tidak valid.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password wajib diisi.")]
    [MinLength(6, ErrorMessage = "Password minimal 6 karakter.")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Nama lengkap wajib diisi.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Nama lengkap harus 2-100 karakter.")]
    public string FullName { get; set; } = string.Empty;
}
