namespace GuestPass.Api.Models;

public class Profile
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "panitia";
    public bool IsApproved { get; set; }
    public DateTime CreatedAt { get; set; }
}