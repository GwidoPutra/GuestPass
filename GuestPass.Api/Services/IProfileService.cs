using GuestPass.Api.DTOs;

namespace GuestPass.Api.Services;

public interface IProfileService
{
    Task<IEnumerable<ProfileResponse>> GetAllProfilesAsync();
    Task<ProfileResponse?> GetProfileByIdAsync(Guid id);
    Task<ProfileResponse?> ToggleApprovalAsync(Guid id);
    Task<bool> DeleteProfileAsync(Guid id);
}
