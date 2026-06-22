using System.ComponentModel.DataAnnotations;

namespace BillingSystem.Application.DTOs
{
    public class MarkoDto
    {
        public int MarkoNo { get; set; }

        [Required]
        [MaxLength(150)]
        public string? MarkoName { get; set; } 

        [Required]
        public int MillNo { get; set; }

        public bool IsActive { get; set; } = true;
        
        // Output field
        public string? MillName { get; set; }

        public string InputLanguage { get; set; } = "en"; // "en", "hi", "guj"
    }
}
