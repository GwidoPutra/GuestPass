using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GuestPass.Api.Models;

[Table("guests")]
public class Guest
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }

    [Column("eventid")]
    public Guid? EventId { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("email")]
    public string Email { get; set; } = string.Empty;

    // Properti di C# tetap QRCodeToken agar Controller tidak error,
    // tapi mapping ke kolom database 'qrcodetoken' sesuai schema SQL Anda.
    [Column("qrcodetoken")]
    public string QRCodeToken { get; set; } = string.Empty;

    [Column("ischeckedin")]
    public bool IsCheckedIn { get; set; } = false;

    [Column("checkedinat")]
    public DateTimeOffset? CheckedInAt { get; set; }

    [Column("createdat")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public DateTimeOffset CreatedAt { get; set; }
}