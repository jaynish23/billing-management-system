using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BillingSystem.Domain.Entities
{
    public class UserMarko
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MarkoNo { get; set; }

        [Required]
        [MaxLength(150)]
        public string? MarkoName_en { get; set; }

        [Required]
        [MaxLength(150)]
        public string? MarkoName_hi { get; set; }

        [Required]
        [MaxLength(150)]
        public string? MarkoName_guj { get; set; }

        [Required]
        public int MillNo { get; set; }

        [ForeignKey("MillNo")]
        public virtual UserMill? UserMill { get; set; }

        public bool IsActive { get; set; } = true;

        public int? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public int? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
