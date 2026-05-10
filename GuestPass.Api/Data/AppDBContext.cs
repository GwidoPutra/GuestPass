using Microsoft.EntityFrameworkCore;
using GuestPass.Api.Models;

namespace GuestPass.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Profile> Profiles { get; set; }
    public DbSet<Event> Events { get; set; }
    public DbSet<Guest> Guests { get; set; }
}