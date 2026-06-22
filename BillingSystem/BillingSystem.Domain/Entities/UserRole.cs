using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BillingSystem.Domain.Entities
{
    [Table("UserRoles")]
    public class UserRole
    {
        [Key]
        public Guid UserRoleId { get; set; } = Guid.NewGuid();

        public int UserNo { get; set; }

        public int RoleNo { get; set; }

        public bool IsActive { get; set; } = true;

        [ForeignKey("UserNo")]
        public User? User { get; set; }
    }
}
