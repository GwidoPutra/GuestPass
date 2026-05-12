using System.ComponentModel.DataAnnotations;

namespace GuestPass.Api.DTOs;

public class CheckInByTokenRequest
{
    [Required(ErrorMessage = "Token QR code wajib diisi.")]
    public string Token { get; set; } = string.Empty;
}
