using System;
using System.Threading.Tasks;
using BillingSystem.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace BillingSystem.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            bool enableEmailService = true;
            var configValue = _configuration["EmailSettings:EnableEmailService"];
            if (!string.IsNullOrEmpty(configValue) && bool.TryParse(configValue, out var parsed))
            {
                enableEmailService = parsed;
            }

            if (!enableEmailService)
            {
                Console.WriteLine($"[Email Service] Email sending is disabled in settings. Skipping email to {toEmail}.");
                return;
            }

            var smtpHost = _configuration["EmailSettings:SmtpHost"];
            var smtpPortStr = _configuration["EmailSettings:SmtpPort"];
            var senderEmail = _configuration["EmailSettings:SenderEmail"];
            var senderPassword = _configuration["EmailSettings:SenderPassword"];

            if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(senderEmail) || string.IsNullOrEmpty(senderPassword))
            {
                Console.WriteLine("[Email Service] SMTP configuration or credentials are not configured. Skipping email.");
                return;
            }

            int.TryParse(smtpPortStr, out var smtpPort);
            if (smtpPort == 0) smtpPort = 587;

            try
            {
                using var smtpClient = new System.Net.Mail.SmtpClient(smtpHost)
                {
                    Port = smtpPort,
                    UseDefaultCredentials = false,
                    Credentials = new System.Net.NetworkCredential(senderEmail, senderPassword),
                    EnableSsl = true,
                };

                using var mailMessage = new System.Net.Mail.MailMessage
                {
                    From = new System.Net.Mail.MailAddress(senderEmail, "Registration Service"),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = false,
                };

                mailMessage.To.Add(toEmail);

                await smtpClient.SendMailAsync(mailMessage);
                Console.WriteLine($"[Email Service] Sent OTP to {toEmail} successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Email Service] Failed to send email to {toEmail}. Error: {ex.Message}");
            }
        }
    }
}
