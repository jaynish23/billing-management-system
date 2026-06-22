using System;
using System.ComponentModel.DataAnnotations;

namespace BillingSystem.Application.DTOs
{
    public class LedgerTransactionDto
    {
        public int TransactionId { get; set; }

        [Required]
        public DateTime TransactionDate { get; set; }

        [Required]
        public int MillNo { get; set; }

        [Required]
        public int DukanNo { get; set; }

        [Required]
        public int MarkoNo { get; set; }

        [Required]
        public decimal Quantity { get; set; }

        [MaxLength(500)]
        public string? Vigat { get; set; }

        public bool IsActive { get; set; } = true;
        
        // Output fields
        public string? MillName { get; set; }
        public string? DukanName { get; set; }
        public string? MarkoName { get; set; }

        public string InputLanguage { get; set; } = "en"; // "en", "hi", "guj"
    }
}
