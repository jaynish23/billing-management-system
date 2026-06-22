using System;
using System.ComponentModel.DataAnnotations;

namespace BillingSystem.Domain.Entities
{
    public class AuditTableMst
    {
        [Key]
        public Guid AuditId { get; set; }

        [MaxLength(100)]
        public string? TableName { get; set; }

        [MaxLength(50)]
        public string? RecordNo { get; set; }

        [MaxLength(20)]
        public string? ActionType { get; set; } // INSERT / UPDATE / DELETE

        public string? OldValue { get; set; } // NVARCHAR(MAX) equivalent
        public string? NewValue { get; set; } // NVARCHAR(MAX) equivalent

        public int? UserNo { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}
