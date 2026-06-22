namespace BillingSystem.Application.DTOs.Auth
{
    public class VerifyOtpDto
    {
        public string Email { get; set; } = string.Empty;
        public int Otp { get; set; }
    }
}
