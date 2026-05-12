using GuestPass.Api.Data;
using GuestPass.Api.DTOs;
using GuestPass.Api.Models;
using GuestPass.Api.Repositories;
using Microsoft.EntityFrameworkCore;

namespace GuestPass.Api.Services;

public class EventService : IEventService
{
    private readonly AppDbContext _context;
    private readonly IEventRepository _repository;
    private readonly ILogger<EventService> _logger;

    public EventService(AppDbContext context, IEventRepository repository, ILogger<EventService> logger)
    {
        _context = context;
        _repository = repository;
        _logger = logger;
    }

    public async Task<IEnumerable<EventResponse>> GetEventsByOwnerAsync(Guid ownerId)
    {
        _logger.LogInformation("Mengambil daftar event untuk owner {OwnerId}", ownerId);
        return await _repository.GetAllByOwnerAsync(ownerId);
    }

    public async Task<EventResponse?> GetEventByIdAsync(Guid id, Guid ownerId)
    {
        var eventResponse = await _repository.GetByIdAsync(id);
        if (eventResponse == null) return null;
        if (eventResponse.CreatedBy != ownerId) return null;
        return eventResponse;
    }

    public async Task<EventResponse> CreateEventAsync(CreateEventRequest request, Guid ownerId)
    {
        var newEvent = new Event
        {
            Name = request.Name,
            Location = request.Location,
            Date = request.Date,
            CreatedBy = ownerId
        };

        _context.Events.Add(newEvent);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Event {EventId} berhasil dibuat oleh {OwnerId}", newEvent.Id, ownerId);

        return new EventResponse
        {
            Id = newEvent.Id,
            Name = newEvent.Name,
            Location = newEvent.Location,
            Date = newEvent.Date,
            CreatedBy = newEvent.CreatedBy,
            CreatedAt = newEvent.CreatedAt
        };
    }

    public async Task<EventResponse?> UpdateEventAsync(Guid id, UpdateEventRequest request, Guid ownerId)
    {
        var existingEvent = await _context.Events.FindAsync(id);
        if (existingEvent == null) return null;
        if (existingEvent.CreatedBy != ownerId) return null;

        existingEvent.Name = request.Name;
        existingEvent.Location = request.Location;
        existingEvent.Date = request.Date;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Event {EventId} berhasil diperbarui", id);

        return new EventResponse
        {
            Id = existingEvent.Id,
            Name = existingEvent.Name,
            Location = existingEvent.Location,
            Date = existingEvent.Date,
            CreatedBy = existingEvent.CreatedBy,
            CreatedAt = existingEvent.CreatedAt
        };
    }

    public async Task<bool> DeleteEventAsync(Guid id, Guid ownerId)
    {
        var existingEvent = await _context.Events.FindAsync(id);
        if (existingEvent == null) return false;
        if (existingEvent.CreatedBy != ownerId) return false;

        // Hapus juga semua guest terkait
        var guests = await _context.Guests.Where(g => g.EventId == id).ToListAsync();
        _context.Guests.RemoveRange(guests);
        _context.Events.Remove(existingEvent);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Event {EventId} dan {GuestCount} tamu berhasil dihapus", id, guests.Count);

        return true;
    }
}
