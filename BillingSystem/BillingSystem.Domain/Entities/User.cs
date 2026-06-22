using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BillingSystem.Domain.Entities
{
    [Table("Usermst")]
    public class User
    {
        [Key]
        public Guid Uuserid { get; set; } = Guid.NewGuid();

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserNo { get; set; }

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string vfirstname { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string vlastname { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string vemailid { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string vpassword { get; set; } = string.Empty;

        [Required]
        [MaxLength(15)]
        public string MobileNumber { get; set; } = string.Empty;

        [MaxLength(5)]
        public string PreferredLanguage { get; set; } = "en";

        [MaxLength(500)]
        public string? UserImagePath { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}
