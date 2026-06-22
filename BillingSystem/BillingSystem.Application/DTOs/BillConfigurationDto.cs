using System;

namespace BillingSystem.Application.DTOs
{
    public class BillConfigurationDto
    {
        public Guid BillConfigurationId { get; set; }
        public int UserNo { get; set; }
        public string GSTNumber { get; set; } = string.Empty;
        public string BankAccountNumber { get; set; } = string.Empty;
        public string? PANNumber { get; set; }
        public string? LeftImagePath { get; set; }
        public string? RightImagePath { get; set; }
        public string? QRCodeImagePath { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public bool IsActive { get; set; }
    }
}
