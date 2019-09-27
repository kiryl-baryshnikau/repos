using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BD.MedView.Runtime
{
    [Table("AttentionNoticeStatuses", Schema = "rnt")]
    public class AttentionNoticeStatus
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        [Index("IX_rtx.AttentionNoticeStatuses_Key", 1, IsUnique = true)]
        public string Key { get; set; }

        [Required]
        public int FacilityId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Status { get; set; }

        [MaxLength(250)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedDateTime { get; set; }
    }
}
