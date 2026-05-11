using System.ComponentModel.DataAnnotations;

namespace GuestPass.Api.Models;

public class Event
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public string Name { get; set; } = string.Empty;
    
    public string Description { get; set; } = string.Empty;
    
    public DateTime EventDate { get; set; }
    
    public string Location { get; set; } = string.Empty;

    // Relasi ke Pembuat (Profile)
    public Guid CreatedBy { get; set; } 
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}