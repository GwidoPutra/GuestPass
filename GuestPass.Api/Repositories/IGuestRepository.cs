using GuestPass.Api.DTOs;

namespace GuestPass.Api.Repositories;

public interface IGuestRepository
{
    Task<IEnumerable<GuestResponse>> GetAllAsync();
    Task<IEnumerable<GuestResponse>> GetAllByEventAsync(Guid eventId);
    Task<GuestResponse?> GetByIdAsync(Guid id);
}
