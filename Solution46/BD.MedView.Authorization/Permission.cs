using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BD.MedView.Authorization
{
    [Table("Permissions", Schema="auth")]
    public class Permission
    {
        public Permission()
        {
            Roles = new HashSet<Role>();
        }

        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        [Index("IX_auth.Permission_ResourceId_Name", 2, IsUnique = true)]
        public string Name { get; set; }

        [Index("IX_auth.Permission_ResourceId_Name", 1, IsUnique = true)]
        [ForeignKey(nameof(Resource))]
        public int ResourceId { get; set; }

        public virtual Resource Resource { get; set; }

        public virtual ICollection<Role> Roles { get; set; }
    }
}