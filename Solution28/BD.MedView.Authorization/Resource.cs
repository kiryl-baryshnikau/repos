using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BD.MedView.Authorization
{
    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
    [Table("Resources", Schema = "auth")]
    public class Resource
    {
        public Resource()
        {
            Permissions = new HashSet<Permission>();
        }

        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        [Index("IX_auth.Resource_Name", 1, IsUnique = true)]
        public string Name { get; set; }

        public virtual ICollection<Permission> Permissions { get; set; }
    }
}