using GuestPass.Api.Data;
using GuestPass.Api.DTOs;
using GuestPass.Api.Repositories;
using Microsoft.EntityFrameworkCore;

namespace GuestPass.Api.Services;

public class ProfileService : IProfileService
{
    private readonly AppDbContext _context;
    private readonly IProfileRepository _repository;
    private readonly ILogger<ProfileService> _logger;

    public ProfileService(AppDbContext context, IProfileRepository repository, ILogger<ProfileService> logger)
    {
        _context = context;
        _repository = repository;
        _logger = logger;
    }

    public async Task<IEnumerable<ProfileResponse>> GetAllProfilesAsync()
    {
        _logger.LogInformation("Mengambil semua profil panitia");
        return await _repository.GetAllAsync();
    }

    public async Task<ProfileResponse?> GetProfileByIdAsync(Guid id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<ProfileResponse?> ToggleApprovalAsync(Guid id)
    {
        var profile = await _context.Profiles.FindAsync(id);
        if (profile == null) return null;

        profile.IsApproved = !profile.IsApproved;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Status approval profil {ProfileId} diubah menjadi {IsApproved}", id, profile.IsApproved);

        return new ProfileResponse
        {
            Id = profile.Id,
            Username = profile.Username,
            Email = profile.Email,
            FullName = profile.FullName,
            Role = profile.Role,
            IsApproved = profile.IsApproved,
            CreatedAt = profile.CreatedAt
        };
    }

    public async Task<bool> DeleteProfileAsync(Guid id)
    {
        var profile = await _context.Profiles.FindAsync(id);
        if (profile == null) return false;

        _context.Profiles.Remove(profile);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Profil {ProfileId} berhasil dihapus", id);
        return true;
    }
}
