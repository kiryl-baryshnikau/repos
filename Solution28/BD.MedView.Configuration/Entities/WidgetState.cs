using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BD.MedView.Configuration
{
    [Table("WidgetStates", Schema = "conf")]
    public class WidgetState
    {
        public WidgetState()
        {
            ProviderStates = new HashSet<ProviderState>();
        }
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        [Index("IX_conf.WidgetStates_Type", 1, IsUnique = true)]

        public string Type { get; set; }

        [MaxLength(128)]
        public string Name { get; set; }

        public virtual ICollection<ProviderState> ProviderStates { get; set; }

    }
   
}
