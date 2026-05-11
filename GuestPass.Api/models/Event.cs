using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GuestPass.Api.Models;

[Table("events")]
public class Event
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("location")]
    public string Location { get; set; } = string.Empty;

    [Column("date")]
    public DateTimeOffset Date { get; set; }

    // Properti di C# tetap CreatedBy agar Controller tidak error, 
    // tapi mapping ke kolom database 'ownerid' sesuai schema SQL Anda.
    [Column("ownerid")]
    public Guid? CreatedBy { get; set; }

    [Column("createdat")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public DateTimeOffset CreatedAt { get; set; }
}