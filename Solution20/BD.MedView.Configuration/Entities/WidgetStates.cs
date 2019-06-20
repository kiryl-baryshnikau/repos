using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BD.MedView.Configuration
{
    [Table("WidgetStates", Schema = "conf")]
    public class WidgetStates
    {
        public WidgetStates()
        {
            ProviderStates = new HashSet<ProviderStates>();
        }
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        [Index("IX_conf.WidgetStates_Type", 1, IsUnique = true)]

        public string Type { get; set; }

        [MaxLength(128)]
        public string Name { get; set; }

        public virtual ICollection<ProviderStates> ProviderStates { get; set; }

    }
   
}
