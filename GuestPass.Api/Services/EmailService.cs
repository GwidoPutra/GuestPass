using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using QRCoder;

namespace GuestPass.Api.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendQRCodeEmailAsync(string toEmail, string guestName, string eventName, string qrCodeToken)
    {
        var emailSettings = _configuration.GetSection("Email");
        var smtpHost = emailSettings["SmtpHost"] ?? "smtp.gmail.com";
        var smtpPort = int.Parse(emailSettings["SmtpPort"] ?? "587");
        var senderEmail = emailSettings["SenderEmail"] ?? "";
        var senderName = emailSettings["SenderName"] ?? "GuestPass";
        var password = emailSettings["Password"] ?? "";

        // Generate QR code image
        using var qrGenerator = new QRCodeGenerator();
        using var qrCodeData = qrGenerator.CreateQrCode(qrCodeToken, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new PngByteQRCode(qrCodeData);
        var qrCodeBytes = qrCode.GetGraphic(10);

        // Build email
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(senderName, senderEmail));
        message.To.Add(new MailboxAddress(guestName, toEmail));
        message.Subject = $"Undangan Event: {eventName} - QR Code Check-in Anda";

        var builder = new BodyBuilder();
        builder.HtmlBody = $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
                <h2 style='color: #333;'>Halo, {guestName}!</h2>
                <p>Anda telah terdaftar sebagai tamu di event <strong>{eventName}</strong>.</p>
                <p>Berikut adalah QR Code untuk check-in Anda pada hari acara:</p>
                <div style='text-align: center; margin: 20px 0;'>
                    <img src='cid:qrcode' alt='QR Code' style='width: 250px; height: 250px;' />
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

        var qrImage = builder.LinkedResources.Add("qrcode.png", qrCodeBytes, new ContentType("image", "png"));
        qrImage.ContentId = "qrcode";

        message.Body = builder.ToMessageBody();

        // Send email
        try
        {
            using var client = new SmtpClient();
            await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(senderEmail, password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Email QR code berhasil dikirim ke {Email} untuk event {Event}", toEmail, eventName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Gagal mengirim email ke {Email}", toEmail);
            throw;
        }
    }
}
