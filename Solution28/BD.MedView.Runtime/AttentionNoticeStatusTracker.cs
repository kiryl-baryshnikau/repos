using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BD.MedView.Runtime
{
    [Table("AttentionNoticeStatusTrackers", Schema = "rnt")]
    public class AttentionNoticeStatusTracker
    {
        [Key]
        [ForeignKey(nameof(AttentionNoticeStatus))]
        public int Id { get; set; }

        public DateTime ValidThrough { get; set; }

        public virtual AttentionNoticeStatus AttentionNoticeStatus { get; set; }
    }
}