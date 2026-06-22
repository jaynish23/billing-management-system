using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BillingSystem.Domain.Entities
{
    public class UserMasterPage
    {
        [Key]
        public Guid MasterPageId { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MasterPageNo { get; set; }

        [MaxLength(100)]
        public string? MasterPageName_en { get; set; }
        [MaxLength(100)]
        public string? MasterPageName_hi { get; set; }
        [MaxLength(100)]
        public string? MasterPageName_guj { get; set; }

        [MaxLength(200)]
        public string? RouteUrl { get; set; }

        public bool IsActive { get; set; } = true;

        public int? nRecordedBy { get; set; }
        
        public DateTime dCreatedOnDate { get; set; } = DateTime.UtcNow;
    }
}
