using GuestPass.Api.Data;
using GuestPass.Api.DTOs;
using GuestPass.Api.Models;
using GuestPass.Api.Repositories;
using Microsoft.EntityFrameworkCore;

namespace GuestPass.Api.Services;

public class GuestService : IGuestService
{
    private readonly AppDbContext _context;
    private readonly IGuestRepository _repository;
    private readonly ILogger<GuestService> _logger;

    public GuestService(AppDbContext context, IGuestRepository repository, ILogger<GuestService> logger)
    {
        _context = context;
        _repository = repository;
        _logger = logger;
    }

    public async Task<IEnumerable<GuestResponse>> GetGuestsByEventAsync(Guid eventId, Guid ownerId)
    {
        // Validasi ownership event
        var eventEntity = await _context.Events.FindAsync(eventId);
        if (eventEntity == null || eventEntity.CreatedBy != ownerId)
            return Enumerable.Empty<GuestResponse>();

        _logger.LogInformation("Mengambil daftar tamu untuk event {EventId}", eventId);
        return await _repository.GetAllByEventAsync(eventId);
    }

    public async Task<GuestResponse?> GetGuestByIdAsync(Guid id, Guid ownerId)
    {
        var guest = await _repository.GetByIdAsync(id);
        if (guest == null) return null;

        // Validasi ownership event
        var eventEntity = await _context.Events.FindAsync(guest.EventId);
        if (eventEntity == null || eventEntity.CreatedBy != ownerId) return null;

        return guest;
    }

    public async Task<GuestResponse?> CreateGuestAsync(CreateGuestRequest request, Guid ownerId)
    {
        // Validasi ownership event
        var eventEntity = await _context.Events.FindAsync(request.EventId);
        if (eventEntity == null || eventEntity.CreatedBy != ownerId) return null;

        var guest = new Guest
        {
            EventId = request.EventId,
            Name = request.Name,
            Email = request.Email,
            QRCodeToken = "GP-" + Guid.NewGuid().ToString()[..8].ToUpper()
        };

        _context.Guests.Add(guest);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Tamu {GuestId} berhasil ditambahkan ke event {EventId}", guest.Id, request.EventId);

        return new GuestResponse
        {
            Id = guest.Id,
            EventId = guest.EventId,
            Name = guest.Name,
            Email = guest.Email,
            QRCodeToken = guest.QRCodeToken,
            IsCheckedIn = guest.IsCheckedIn,
            CheckedInAt = guest.CheckedInAt,
            CreatedAt = guest.CreatedAt
        };
    }

    public async Task<GuestResponse?> CheckInGuestAsync(Guid id, Guid ownerId)
    {
        var guest = await _context.Guests.FindAsync(id);
        if (guest == null) return null;

        // Validasi ownership event
        var eventEntity = await _context.Events.FindAsync(guest.EventId);
        if (eventEntity == null || eventEntity.CreatedBy != ownerId) return null;

        if (guest.IsCheckedIn)
            throw new InvalidOperationException("Tamu sudah di-check-in sebelumnya.");

        guest.IsCheckedIn = true;
        guest.CheckedInAt = DateTimeOffset.UtcNow;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Tamu {GuestId} berhasil check-in", id);

        return new GuestResponse
        {
            Id = guest.Id,
            EventId = guest.EventId,
            Name = guest.Name,
            Email = guest.Email,
            QRCodeToken = guest.QRCodeToken,
            IsCheckedIn = guest.IsCheckedIn,
            CheckedInAt = guest.CheckedInAt,
            CreatedAt = guest.CreatedAt
        };
    }

    public async Task<bool> DeleteGuestAsync(Guid id, Guid ownerId)
    {
        var guest = await _context.Guests.FindAsync(id);
        if (guest == null) return false;

        // Validasi ownership event
        var eventEntity = await _context.Events.FindAsync(guest.EventId);
        if (eventEntity == null || eventEntity.CreatedBy != ownerId) return false;

        _context.Guests.Remove(guest);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Tamu {GuestId} berhasil dihapus", id);
        return true;
    }
}
