using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BD.MedView.Facility
{
    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
    [Table("KeyTypes", Schema = "fas")]
    public class KeyType
    {
        public KeyType()
        {
            Providers = new HashSet<Provider>();
        }
        [Key]
        public int Id { get; set; }
        [MaxLength(150)]
        [Index("IX_fas.KeyType_Name", 1, IsUnique = true)]
        public string Name { get; set; }

        public virtual ICollection<Provider> Providers { get; set; }
    }
}