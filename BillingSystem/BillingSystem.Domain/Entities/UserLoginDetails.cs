using System;
using System.ComponentModel.DataAnnotations;

namespace BillingSystem.Domain.Entities
{
    public class UserLoginDetails
    {
        [Key]
        public Guid LoginId { get; set; }

        public Guid? UserId { get; set; }
        public int? UserNo { get; set; }

        public DateTime? LoginTime { get; set; }
        public DateTime? LogoutTime { get; set; }

        public bool IsActiveSession { get; set; } = true;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}
