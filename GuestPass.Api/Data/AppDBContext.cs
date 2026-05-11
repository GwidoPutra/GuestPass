using Microsoft.EntityFrameworkCore;
using GuestPass.Api.Models;

namespace GuestPass.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Profile> Profiles { get; set; }
    public DbSet<Event> Events { get; set; }
    public DbSet<Guest> Guests { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. Otomatisasi Penamaan PostgreSQL (Lowercasing)
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            var tableName = entity.GetTableName();
            if (!string.IsNullOrEmpty(tableName))
            {
                entity.SetTableName(tableName.ToLower());
            }

            foreach (var property in entity.GetProperties())
            {
                property.SetColumnName(property.Name.ToLower());
            }
        }

        // 2. Manual Mapping untuk kolom yang namanya beda di Supabase
        modelBuilder.Entity<Event>(entity =>
        {
            entity.Property(e => e.CreatedBy).HasColumnName("ownerid");
            entity.Property(e => e.EventDate).HasColumnName("date");
        });

        modelBuilder.Entity<Profile>(entity =>
        {
            entity.Property(p => p.Role)
                .HasColumnName("role")
                .HasColumnType("user_role"); 
        });

        modelBuilder.Entity<Guest>(entity =>
        {
            entity.Property(g => g.IsCheckedIn).HasColumnName("ischeckedin");
            entity.Property(g => g.QRCodeToken).HasColumnName("qrcodetoken");
            entity.Property(g => g.EventId).HasColumnName("eventid");
        });
        
    }
}