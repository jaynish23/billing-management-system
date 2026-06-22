using System;
using System.Collections.Generic;

namespace BillingSystem.Application.DTOs
{
    public class BillPdfDto
    {
        public string BillNumber { get; set; } = string.Empty;
        public string PrintDateString { get; set; } = string.Empty;
        public string GeneratedBy { get; set; } = string.Empty;

        // Broker Info
        public string BrokerName { get; set; } = string.Empty;
        public string GSTNumber { get; set; } = string.Empty;
        public string BankAccountNumber { get; set; } = string.Empty;
        public string PANNumber { get; set; } = string.Empty;
        public string? LeftImagePath { get; set; }
        public string? RightImagePath { get; set; }
        public string? QRCodeImagePath { get; set; }

        // Partner Info (Mill or Dukan details)
        public string PartnerName { get; set; } = string.Empty;
        public string PartnerOwnerName { get; set; } = string.Empty;
        public string PartnerPhone { get; set; } = string.Empty;
        public string PartnerLocation { get; set; } = string.Empty;
        public decimal TaxRate { get; set; }

        // Transactions list
        public List<BillPdfEntryDto> Entries { get; set; } = new();
    }

    public class BillPdfEntryDto
    {
        public int SrNo { get; set; }
        public string DateString { get; set; } = string.Empty;
        public string PartyOrMillName { get; set; } = string.Empty;
        public string MarkoName { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public string Vigat { get; set; } = string.Empty;
        public string AmountPlaceholder { get; set; } = "---";
    }
}
