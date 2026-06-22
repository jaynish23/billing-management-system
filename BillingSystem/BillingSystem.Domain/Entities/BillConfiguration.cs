using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BillingSystem.Domain.Entities
{
    [Table("BillConfiguration")]
    public class BillConfiguration
    {
        [Key]
        public Guid BillConfigurationId { get; set; } = Guid.NewGuid();

        [Required]
        public int UserNo { get; set; }

        [ForeignKey("UserNo")]
        public virtual User? User { get; set; }

        [Required]
        [MaxLength(50)]
        public string GSTNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string BankAccountNumber { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? PANNumber { get; set; }

        [MaxLength(500)]
        public string? LeftImagePath { get; set; }

        [MaxLength(500)]
        public string? RightImagePath { get; set; }

        [MaxLength(500)]
        public string? QRCodeImagePath { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? ModifiedDate { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
