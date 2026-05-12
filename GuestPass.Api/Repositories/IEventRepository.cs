using GuestPass.Api.DTOs;

namespace GuestPass.Api.Repositories;

public interface IEventRepository
{
    Task<IEnumerable<EventResponse>> GetAllByOwnerAsync(Guid ownerId);
    Task<EventResponse?> GetByIdAsync(Guid id);
}
