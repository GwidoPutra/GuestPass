using GuestPass.Api.DTOs;

namespace GuestPass.Api.Services;

public interface IEventService
{
    Task<IEnumerable<EventResponse>> GetEventsByOwnerAsync(Guid ownerId);
    Task<EventResponse?> GetEventByIdAsync(Guid id, Guid ownerId);
    Task<EventResponse> CreateEventAsync(CreateEventRequest request, Guid ownerId);
    Task<EventResponse?> UpdateEventAsync(Guid id, UpdateEventRequest request, Guid ownerId);
    Task<bool> DeleteEventAsync(Guid id, Guid ownerId);
}
