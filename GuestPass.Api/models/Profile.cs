namespace GuestPass.Api.Models;

public class Profile
{
    public Guid Id { get; set; } = Guid.NewGuid(); // Default value agar tidak null
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Fullname { get; set; } = string.Empty; // TAMBAHKAN INI
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "panitia";
    public bool IsApproved { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}