using Microsoft.EntityFrameworkCore;
using GuestPass.Api.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace GuestPass.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // Daftar Tabel
    public DbSet<Profile> Profiles { get; set; }
    public DbSet<Event> Events { get; set; }
    public DbSet<Guest> Guests { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Otomatisasi Penamaan PostgreSQL (Lowercasing)
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            // 1. Paksa nama tabel menjadi lowercase (Events -> events)
            var tableName = entity.GetTableName();
            if (!string.IsNullOrEmpty(tableName))
            {
                entity.SetTableName(tableName.ToLower());
            }

            // 2. Paksa semua nama kolom menjadi lowercase (Id -> id, Name -> name)
            foreach (var property in entity.GetProperties())
            {
                // Mengambil nama property asal (PascalCase) dan menjadikannya lowercase
                property.SetColumnName(property.Name.ToLower());
            }
        }
   }
}