using Microsoft.EntityFrameworkCore;
using GuestPass.Api.Models;

namespace GuestPass.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Profile> Profiles { get; set; }
    public DbSet<Event> Events { get; set; }
    public DbSet<Guest> Guests { get; set; }
    public DbSet<EventMoment> EventMoments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Profile configuration
        modelBuilder.Entity<Profile>(entity =>
        {
            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.Role)
                .HasColumnType("text")
                .HasDefaultValueSql("'panitia'")
                .ValueGeneratedOnAdd();

            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.Username).IsUnique();
        });

        // Event configuration
        modelBuilder.Entity<Event>(entity =>
        {
            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");

            // Relasi: Event dimiliki oleh Profile (owner)
            entity.HasOne(e => e.Owner)
                .WithMany(p => p.Events)
                .HasForeignKey(e => e.CreatedBy)
                .OnDelete(DeleteBehavior.SetNull);

            // Relasi: Event memiliki banyak Guest
            entity.HasMany(e => e.Guests)
                .WithOne(g => g.Event)
                .HasForeignKey(g => g.EventId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Guest configuration
        modelBuilder.Entity<Guest>(entity =>
        {
            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");

            entity.HasIndex(e => e.QRCodeToken).IsUnique();
        });

        // EventMoment configuration
        modelBuilder.Entity<EventMoment>(entity =>
        {
            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");

            entity.HasOne(e => e.Event)
                .WithMany()
                .HasForeignKey(e => e.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Profile)
                .WithMany()
                .HasForeignKey(e => e.ProfileId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Guest)
                .WithMany()
                .HasForeignKey(e => e.GuestId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
