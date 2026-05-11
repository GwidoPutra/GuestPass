using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GuestPass.Api.Models;

[Table("event_moments")]
public class EventMoment
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }

    [Column("event_id")]
    public Guid? EventId { get; set; }

    [Column("profile_id")]
    public Guid? ProfileId { get; set; }

    [Column("guest_id")]
    public Guid? GuestId { get; set; }

    [Column("content")]
    public string? Content { get; set; }

    [Column("image_url")]
    public string? ImageUrl { get; set; }

    [Column("created_at")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public DateTimeOffset CreatedAt { get; set; }
}