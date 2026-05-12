namespace GuestPass.Api.Services;

public interface IEmailService
{
    Task SendQRCodeEmailAsync(string toEmail, string guestName, string eventName, string qrCodeToken, DateTimeOffset eventDate, string eventLocation);
}
