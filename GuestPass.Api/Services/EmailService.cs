using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using QRCoder;

namespace GuestPass.Api.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly IHttpClientFactory _httpClientFactory;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger, IHttpClientFactory httpClientFactory)
    {
        _configuration = configuration;
        _logger = logger;
        _httpClientFactory = httpClientFactory;
    }

    public async Task SendQRCodeEmailAsync(string toEmail, string guestName, string eventName, string qrCodeToken, DateTimeOffset eventDate, string eventLocation)
    {
        var emailSettings = _configuration.GetSection("Email");
        var apiKey = emailSettings["ResendApiKey"] ?? "";
        var senderEmail = emailSettings["SenderEmail"] ?? "onboarding@resend.dev";
        var senderName = emailSettings["SenderName"] ?? "GuestPass";

        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogWarning("Resend API key belum dikonfigurasi, email tidak dikirim");
            return;
        }

        // Generate QR code image
        using var qrGenerator = new QRCodeGenerator();
        using var qrCodeData = qrGenerator.CreateQrCode(qrCodeToken, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new PngByteQRCode(qrCodeData);
        var qrCodeBytes = qrCode.GetGraphic(10);
        var qrCodeBase64 = Convert.ToBase64String(qrCodeBytes);

        // Format event date and time
        var formattedDate = eventDate.ToString("dddd, dd MMMM yyyy", new System.Globalization.CultureInfo("id-ID"));
        var formattedTime = eventDate.ToString("HH:mm") + " WIB";

        // Build HTML body
        var htmlBody = $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
                <h2 style='color: #333;'>Halo, {guestName}!</h2>
                <p>Anda telah terdaftar sebagai tamu di event <strong>{eventName}</strong>.</p>
                
                <div style='background-color: #f8f9fa; border-left: 4px solid #4a90d9; padding: 15px; margin: 20px 0; border-radius: 4px;'>
                    <h3 style='margin: 0 0 10px 0; color: #333;'>Detail Acara</h3>
                    <table style='width: 100%; font-size: 14px; color: #555;'>
                        <tr>
                            <td style='padding: 5px 0; width: 80px;'><strong>Tanggal</strong></td>
                            <td style='padding: 5px 0;'>: {formattedDate}</td>
                        </tr>
                        <tr>
                            <td style='padding: 5px 0;'><strong>Waktu</strong></td>
                            <td style='padding: 5px 0;'>: {formattedTime}</td>
                        </tr>
                        <tr>
                            <td style='padding: 5px 0;'><strong>Tempat</strong></td>
                            <td style='padding: 5px 0;'>: {eventLocation}</td>
                        </tr>
                    </table>
                </div>

                <p>Berikut adalah QR Code untuk check-in Anda pada hari acara:</p>
                <div style='text-align: center; margin: 20px 0;'>
                    <img src='data:image/png;base64,{qrCodeBase64}' alt='QR Code' style='width: 250px; height: 250px;' />
                </div>
                <p style='text-align: center; font-size: 14px; color: #666;'>
                    Kode: <strong>{qrCodeToken}</strong>
                </p>
                <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;' />
                <p style='font-size: 12px; color: #999;'>
                    Tunjukkan QR code ini kepada panitia saat check-in di lokasi event.
                    Email ini dikirim otomatis oleh sistem GuestPass.
                </p>
            </div>";

        // Send via Resend API
        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        var payload = new
        {
            from = $"{senderName} <{senderEmail}>",
            to = new[] { toEmail },
            subject = $"Undangan Event: {eventName} - QR Code Check-in Anda",
            html = htmlBody
        };

        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        try
        {
            var response = await client.PostAsync("https://api.resend.com/emails", content);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Email QR code berhasil dikirim ke {Email} untuk event {Event}", toEmail, eventName);
            }
            else
            {
                _logger.LogError("Gagal mengirim email ke {Email}. Status: {Status}, Response: {Response}", toEmail, response.StatusCode, responseBody);
                throw new Exception($"Resend API error: {response.StatusCode} - {responseBody}");
            }
        }
        catch (Exception ex) when (ex is not Exception { Message: var m } || !m.StartsWith("Resend API error"))
        {
            _logger.LogError(ex, "Gagal mengirim email ke {Email}", toEmail);
            throw;
        }
    }
}
