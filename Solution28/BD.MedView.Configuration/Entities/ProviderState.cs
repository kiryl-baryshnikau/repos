using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace BD.MedView.Configuration
{
    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
    [Table("ProviderStates", Schema = "conf")]
    public class ProviderState
    {
        public ProviderState() => WidgetStates = new HashSet<WidgetState>();

        [Key]
        public int Id { get; set; }

        [MaxLength(128)]
        [Index("IX_conf.ProviderStates_Designation", 1, IsUnique = true)]
        public string Designation { get; set; }
        
        [MaxLength(128)]
        [Index("IX_conf.ProviderStates_StateId", 1, IsUnique = true)]
        public string StateId { get; set; }
        
        [Index("IX_conf.ProviderStates_StandardId", 1, IsUnique = true)]
        public int? StandardId { get; set; }
        
        public virtual ICollection<WidgetState> WidgetStates { get; set; }

    }

}
