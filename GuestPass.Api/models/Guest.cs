namespace GuestPass.Api.Models;

public class Guest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EventId { get; set; } // Relasi ke Event
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string QRCodeToken { get; set; } = string.Empty; // Kode unik untuk QR
    public bool IsCheckedIn { get; set; } = false;
    public DateTime? CheckedInAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}