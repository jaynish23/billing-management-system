using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BillingSystem.Domain.Entities
{
    public class UserMill
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MillNo { get; set; }

        [Required]
        [MaxLength(150)]
        public string? MillName_en { get; set; }

        [Required]
        [MaxLength(150)]
        public string? MillName_hi { get; set; }

        [Required]
        [MaxLength(150)]
        public string? MillName_guj { get; set; }

        [Required]
        [MaxLength(150)]
        public string? OwnerName_en { get; set; }

        [Required]
        [MaxLength(150)]
        public string? OwnerName_hi { get; set; }

        [Required]
        [MaxLength(150)]
        public string? OwnerName_guj { get; set; }

        [Required]
        [MaxLength(15)]
        public string? OwnerPhoneNo { get; set; }

        [MaxLength(255)]
        public string? Location_en { get; set; }

        [MaxLength(255)]
        public string? Location_hi { get; set; }

        [MaxLength(255)]
        public string? Location_guj { get; set; }

        [Required]
        public int DistrictNo { get; set; }

        [ForeignKey("DistrictNo")]
        public virtual UserDistrict? UserDistrict { get; set; }

        [Required]
        public int StateNo { get; set; }

        [ForeignKey("StateNo")]
        public virtual UserState? UserState { get; set; }

        public decimal? MillTaxInfo { get; set; }

        public bool IsActive { get; set; } = true;

        public int? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public int? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
