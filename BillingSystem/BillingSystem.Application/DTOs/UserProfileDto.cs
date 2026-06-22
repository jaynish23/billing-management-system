using System;

namespace BillingSystem.Application.DTOs
{
    public class UserProfileDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string PreferredLanguage { get; set; } = "en";
        public string RoleName { get; set; } = "Broker";
        public DateTime CreatedDate { get; set; }
        public string? UserImagePath { get; set; }
    }

    public class UpdateProfileDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string PreferredLanguage { get; set; } = "en";
    }
}
