namespace BillingSystem.Application.DTOs.Auth
{
    public class AuthResponseDto
    {
        public string Status { get; set; } = string.Empty;
        public string? Token { get; set; }
        public string? Message { get; set; }
        public UserResponseDto? User { get; set; }
    }

    public class UserResponseDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? UserImagePath { get; set; }
    }
}
