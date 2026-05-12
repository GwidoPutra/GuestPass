using GuestPass.Api.DTOs;

namespace GuestPass.Api.Services;

public interface IGuestService
{
    Task<IEnumerable<GuestResponse>> GetGuestsByEventAsync(Guid eventId, Guid ownerId);
    Task<GuestResponse?> GetGuestByIdAsync(Guid id, Guid ownerId);
    Task<GuestResponse?> CreateGuestAsync(CreateGuestRequest request, Guid ownerId);
    Task<GuestResponse?> CheckInGuestAsync(Guid id, Guid ownerId);
    Task<bool> DeleteGuestAsync(Guid id, Guid ownerId);
}
