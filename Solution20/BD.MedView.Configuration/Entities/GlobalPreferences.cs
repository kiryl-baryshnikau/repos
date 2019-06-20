using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BD.MedView.Configuration
{
    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
    [Table("GlobalPreferences", Schema = "conf")]
    public class GlobalPreferences
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Index("IX_conf.GlobalPreferences_Name", 1, IsUnique = true)]
        [MaxLength(128)]
        [Required]
        public string Name { get; set; }

        [Required]
        public string Configurations { get; set; }

        [Required]
        public string Type { get; set; }

        [MaxLength(128)]
        [Required]
        public string Version { get; set; }

    }
}
