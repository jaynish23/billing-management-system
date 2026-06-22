using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BillingSystem.Domain.Entities
{
    public class UserDistrict
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int DistrictNo { get; set; }

        [MaxLength(50)]
        public string? DistrictCode { get; set; }

        public int? StateNo { get; set; }
        
        [ForeignKey("StateNo")]
        public virtual UserState? UserState { get; set; }

        [MaxLength(100)]
        public string? DistrictName_en { get; set; }
        [MaxLength(255)]
        public string? DistrictDescription_en { get; set; }

        [MaxLength(100)]
        public string? DistrictName_hi { get; set; }
        [MaxLength(255)]
        public string? DistrictDescription_hi { get; set; }

        [MaxLength(100)]
        public string? DistrictName_guj { get; set; }
        [MaxLength(255)]
        public string? DistrictDescription_guj { get; set; }

        public bool IsActive { get; set; } = true;

        public int? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public int? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
