using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BD.MedView.Authorization
{
    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
    [Table("Realms", Schema = "auth")]
    public class Realm
    {
        public Realm()
        {
            Children = new HashSet<Realm>();
            Roles = new HashSet<Role>();
            Claims = new HashSet<RealmClaim>();
        }

        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        [Index("IX_auth.Realms_Name_ParentId", 1, IsUnique = true)]
        public string Name { get; set; }

        [Index("IX_auth.Realms_Name_ParentId", 2, IsUnique = true)]
        [ForeignKey(nameof(Parent))]
        public int? ParentId { get; set; }

        public virtual Realm Parent { get; set; }

        public virtual ICollection<Realm> Children { get; set; }
        public virtual ICollection<Role> Roles { get; set; }
        public virtual ICollection<RealmClaim> Claims { get; set; }
    }
}