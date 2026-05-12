using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GuestPass.Api.Models;

[Table("profiles")]
public class Profile
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }

    [Column("username")]
    public string Username { get; set; } = string.Empty;

    [Column("email")]
    public string Email { get; set; } = string.Empty;

    [Column("passwordhash")]
    public string PasswordHash { get; set; } = string.Empty;

    [Column("fullname")]
    public string FullName { get; set; } = string.Empty;

    [Column("role")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public string? Role { get; set; }

    [Column("isapproved")]
    public bool IsApproved { get; set; } = false;

    [Column("createdat")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public DateTimeOffset CreatedAt { get; set; }

    // Navigation property
    public ICollection<Event> Events { get; set; } = new List<Event>();
}
