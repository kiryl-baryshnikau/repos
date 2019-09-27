using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BD.MedView.Authorization
{
    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
    [Table("Roles", Schema = "auth")]
    public class Role
    {
        public Role()
        {
            Principals = new HashSet<Principal>();
            Permissions = new HashSet<Permission>();
        }

        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        [Index("IX_auth.Role_Name_RealmId", 1, IsUnique = true)]
        public string Name { get; set; }

        [ForeignKey(nameof(Realm))]
        [Index("IX_auth.Role_Name_RealmId", 2, IsUnique = true)]
        public int RealmId { get; set; }
        public virtual Realm Realm { get; set; }

        public virtual ICollection<Principal> Principals { get; set; }
        public virtual ICollection<Permission> Permissions { get; set; }
    }
}