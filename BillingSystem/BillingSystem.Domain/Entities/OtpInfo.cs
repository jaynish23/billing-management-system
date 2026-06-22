using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BillingSystem.Domain.Entities
{
    [Table("OtpInfoMst")]
    public class OtpInfo
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int OtpNo { get; set; }

        public int GeneratedOtp { get; set; }

        public DateTime StartTime { get; set; }

        public DateTime EndTime { get; set; }

        public DateTime RecordedOnUtc { get; set; } = DateTime.UtcNow;

        [MaxLength(150)]
        public string RecordedBy { get; set; } = string.Empty;

        public bool IsUsed { get; set; } = false;

        [MaxLength(50)]
        public string OtpType { get; set; } = string.Empty;
    }
}
