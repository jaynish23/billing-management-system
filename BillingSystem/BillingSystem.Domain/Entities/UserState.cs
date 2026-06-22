using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BillingSystem.Domain.Entities
{
    public class UserState
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int StateNo { get; set; }

        [MaxLength(50)]
        public string? StateCode { get; set; }

        [MaxLength(100)]
        public string? StateName_en { get; set; }
        [MaxLength(255)]
        public string? StateDescription_en { get; set; }

        [MaxLength(100)]
        public string? StateName_hi { get; set; }
        [MaxLength(255)]
        public string? StateDescription_hi { get; set; }

        [MaxLength(100)]
        public string? StateName_guj { get; set; }
        [MaxLength(255)]
        public string? StateDescription_guj { get; set; }

        public bool IsActive { get; set; } = true;

        public int? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public int? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
