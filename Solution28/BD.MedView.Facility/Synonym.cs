using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BD.MedView.Facility
{
    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
    [Table("Synonyms", Schema = "fas")]
    public class Synonym
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        [Index("IX_fas.Synonym_ElementId_ProviderId_Name", 3, IsUnique = true)]
        public string Name { get; set; }

        [ForeignKey(nameof(Provider))]
        [Index("IX_fas.Synonym_ElementId_ProviderId_Name", 2, IsUnique = true)]
        public int ProviderId { get; set; }
        public virtual Provider Provider { get; set; }

        [ForeignKey(nameof(Element))]
        [Index("IX_fas.Synonym_ElementId_ProviderId_Name", 1, IsUnique = true)]
        public int ElementId { get; set; }
        public virtual Element Element { get; set; }

        [MaxLength(150)]
        public string Key { get; set; }
    }
}