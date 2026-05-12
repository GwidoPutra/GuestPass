using GuestPass.Api.DTOs;

namespace GuestPass.Api.Services;

public interface IAuthService
{
    Task<string?> RegisterAsync(RegisterRequest request);
    Task<object?> LoginAsync(LoginRequest request);
}
