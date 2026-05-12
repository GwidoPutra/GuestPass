using GuestPass.Api.DTOs;

namespace GuestPass.Api.Services;

public interface IGuestService
{
    Task<IEnumerable<GuestResponse>> GetAllGuestsAsync();
    Task<IEnumerable<GuestResponse>> GetGuestsByEventAsync(Guid eventId, Guid ownerId, string role);
    Task<GuestResponse?> GetGuestByIdAsync(Guid id, Guid ownerId, string role);
    Task<GuestResponse?> CreateGuestAsync(CreateGuestRequest request, Guid ownerId, string role);
    Task<GuestResponse?> CheckInGuestAsync(Guid id, Guid ownerId, string role);
    Task<GuestResponse?> CheckInByTokenAsync(string token);
    Task<bool> DeleteGuestAsync(Guid id, Guid ownerId, string role);
}
