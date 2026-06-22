using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BillingSystem.Domain.Entities
{
    public class LedgerTransaction
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TransactionId { get; set; }

        [Required]
        public DateTime TransactionDate { get; set; }

        [Required]
        public int MillNo { get; set; }

        [ForeignKey("MillNo")]
        public virtual UserMill? UserMill { get; set; }

        [Required]
        public int DukanNo { get; set; }

        [ForeignKey("DukanNo")]
        public virtual UserDukan? UserDukan { get; set; }

        [Required]
        public int MarkoNo { get; set; }

        [ForeignKey("MarkoNo")]
        public virtual UserMarko? UserMarko { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Quantity { get; set; }

        [MaxLength(500)]
        public string? Vigat_en { get; set; }

        [MaxLength(500)]
        public string? Vigat_hi { get; set; }

        [MaxLength(500)]
        public string? Vigat_guj { get; set; }

        public bool IsActive { get; set; } = true;

        public int? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public int? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
