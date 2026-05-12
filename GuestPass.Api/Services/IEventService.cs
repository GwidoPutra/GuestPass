using GuestPass.Api.DTOs;

namespace GuestPass.Api.Services;

public interface IEventService
{
    Task<IEnumerable<EventResponse>> GetAllEventsAsync();
    Task<IEnumerable<EventResponse>> GetEventsByOwnerAsync(Guid ownerId);
    Task<EventResponse?> GetEventByIdAsync(Guid id, Guid ownerId, string role);
    Task<EventResponse> CreateEventAsync(CreateEventRequest request, Guid ownerId);
    Task<EventResponse?> UpdateEventAsync(Guid id, UpdateEventRequest request, Guid ownerId, string role);
    Task<bool> DeleteEventAsync(Guid id, Guid ownerId, string role);
}
