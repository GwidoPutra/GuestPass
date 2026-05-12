namespace GuestPass.Api.DTOs;

public class GuestResponse
{
    public Guid Id { get; set; }
    public Guid? EventId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string QRCodeToken { get; set; } = string.Empty;
    public bool IsCheckedIn { get; set; }
    public DateTimeOffset? CheckedInAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
