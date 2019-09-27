using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BD.MedView.Facility
{
    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
    [Table("Elements", Schema = "fas")]
    public abstract class Element
    {
        public Element()
        {
            Children = new HashSet<Element>();
            Synonyms = new HashSet<Synonym>();
        }

        [Key]
        public int Id { get; set; }

        [MaxLength(150)]
        [Index("IX_fas.Element_Name_ParentId", 1, IsUnique = true)]
        public string Name { get; set; }

        [ForeignKey(nameof(Parent))]
        [Index("IX_fas.Element_Name_ParentId", 2, IsUnique = true)]
        public int? ParentId { get; set; }
        public virtual Element Parent { get; set; }

        public virtual ICollection<Element> Children { get; set; }
        public virtual ICollection<Synonym> Synonyms { get; set; }
    }
}