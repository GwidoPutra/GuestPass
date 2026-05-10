namespace GuestPass.Api.Models;

public class Event
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public Guid OwnerId { get; set; }
    public DateTime CreatedAt { get; set; }
}