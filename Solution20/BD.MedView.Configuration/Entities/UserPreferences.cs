using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BD.MedView.Configuration
{
    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
    [Table("UserPreferences", Schema = "conf")]
    public class UserPreferences
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(128)]
        [Index("IX_conf.UserPreferences_User", 1, IsUnique = true)]
        public string User { get; set; }

        [Required]
        public int SessionTimeout { get; set; }

        [Required]
        public Configurations Configurations { get; set; }

        [Required]
        public bool MaskData { get; set; }

        [Obsolete("Moved to BD.MedView.Runtime.LastActiveRoute.Value")]
        public string LastActiveRoute { get; set; }

    }
}
