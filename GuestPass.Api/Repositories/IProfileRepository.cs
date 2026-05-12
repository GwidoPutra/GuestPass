using GuestPass.Api.DTOs;

namespace GuestPass.Api.Repositories;

public interface IProfileRepository
{
    Task<IEnumerable<ProfileResponse>> GetAllAsync();
    Task<ProfileResponse?> GetByIdAsync(Guid id);
}
