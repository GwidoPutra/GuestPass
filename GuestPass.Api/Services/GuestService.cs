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
    private readonly IEmailService _emailService;
    private readonly ILogger<GuestService> _logger;
    private const string SuperAdminRole = "superadmin";

    public GuestService(AppDbContext context, IGuestRepository repository, IEmailService emailService, ILogger<GuestService> logger)
    {
        _context = context;
        _repository = repository;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<IEnumerable<GuestResponse>> GetAllGuestsAsync()
    {
        _logger.LogInformation("SuperAdmin mengambil semua tamu");
        return await _repository.GetAllAsync();
    }

    public async Task<IEnumerable<GuestResponse>> GetGuestsByEventAsync(Guid eventId, Guid ownerId, string role)
    {
        // SuperAdmin bisa akses semua event
        if (role != SuperAdminRole)
        {
            var eventEntity = await _context.Events.FindAsync(eventId);
            if (eventEntity == null || eventEntity.CreatedBy != ownerId)
                return Enumerable.Empty<GuestResponse>();
        }

        _logger.LogInformation("Mengambil daftar tamu untuk event {EventId}", eventId);
        return await _repository.GetAllByEventAsync(eventId);
    }

    public async Task<GuestResponse?> GetGuestByIdAsync(Guid id, Guid ownerId, string role)
    {
        var guest = await _repository.GetByIdAsync(id);
        if (guest == null) return null;

        // SuperAdmin bisa akses semua guest
        if (role != SuperAdminRole)
        {
            var eventEntity = await _context.Events.FindAsync(guest.EventId);
            if (eventEntity == null || eventEntity.CreatedBy != ownerId) return null;
        }

        return guest;
    }

    public async Task<GuestResponse?> CreateGuestAsync(CreateGuestRequest request, Guid ownerId, string role)
    {
        // SuperAdmin bisa tambah guest ke event manapun
        var eventEntity = await _context.Events.FindAsync(request.EventId);
        if (eventEntity == null) return null;

        if (role != SuperAdminRole && eventEntity.CreatedBy != ownerId)
            return null;

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

        // Kirim email QR code ke tamu (fire-and-forget, tidak blocking response)
        _ = Task.Run(async () =>
        {
            try
            {
                await _emailService.SendQRCodeEmailAsync(guest.Email, guest.Name, eventEntity.Name, guest.QRCodeToken, eventEntity.Date, eventEntity.Location);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Gagal mengirim email QR code ke {Email}, tamu tetap tersimpan", guest.Email);
            }
        });

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

    public async Task<GuestResponse?> CheckInGuestAsync(Guid id, Guid ownerId, string role)
    {
        var guest = await _context.Guests.FindAsync(id);
        if (guest == null) return null;

        // SuperAdmin bisa check-in guest manapun
        if (role != SuperAdminRole)
        {
            var eventEntity = await _context.Events.FindAsync(guest.EventId);
            if (eventEntity == null || eventEntity.CreatedBy != ownerId) return null;
        }

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

    public async Task<bool> DeleteGuestAsync(Guid id, Guid ownerId, string role)
    {
        var guest = await _context.Guests.FindAsync(id);
        if (guest == null) return false;

        // SuperAdmin bisa hapus guest manapun
        if (role != SuperAdminRole)
        {
            var eventEntity = await _context.Events.FindAsync(guest.EventId);
            if (eventEntity == null || eventEntity.CreatedBy != ownerId) return false;
        }

        _context.Guests.Remove(guest);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Tamu {GuestId} berhasil dihapus", id);
        return true;
    }

    public async Task<GuestResponse?> CheckInByTokenAsync(string token)
    {
        var guestResponse = await _repository.GetByTokenAsync(token);
        if (guestResponse == null) return null;

        var guest = await _context.Guests.FindAsync(guestResponse.Id);
        if (guest == null) return null;

        if (guest.IsCheckedIn)
            throw new InvalidOperationException("Tamu sudah di-check-in sebelumnya.");

        guest.IsCheckedIn = true;
        guest.CheckedInAt = DateTimeOffset.UtcNow;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Tamu {GuestId} berhasil check-in via token", guest.Id);

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
}
