using System.ComponentModel.DataAnnotations;

namespace BillingSystem.Application.DTOs
{
    public class MillDto
    {
        public int MillNo { get; set; }

        [Required]
        [MaxLength(150)]
        public string? MillName { get; set; } 

        [Required]
        [MaxLength(150)]
        public string? OwnerName { get; set; } 

        [Required]
        [MaxLength(15)]
        public string? OwnerPhoneNo { get; set; }

        [MaxLength(255)]
        public string? Location { get; set; } 

        [Required]
        public int DistrictNo { get; set; }

        [Required]
        public int StateNo { get; set; }

        public decimal? MillTaxInfo { get; set; }

        public bool IsActive { get; set; } = true;
        
        // Output fields
        public string? DistrictName { get; set; }
        public string? StateName { get; set; }

        public string InputLanguage { get; set; } = "en"; // "en", "hi", "guj"
    }
}
