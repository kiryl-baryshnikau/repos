using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BD.MedView.Facility
{
    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
    [Table("Providers", Schema = "fas")]
    public class Provider
    {
        [Key]
        public int Id { get; set; }
        [MaxLength(150)]
        [Index("IX_fas.Provider_Name", 1, IsUnique = true)]
        public string Name { get; set; }

        [ForeignKey(nameof(KeyType))]
        public int KeyTypeId { get; set; }
        public virtual KeyType KeyType { get; set; }
    }
}